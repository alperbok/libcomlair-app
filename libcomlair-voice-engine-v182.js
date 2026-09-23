(function(){
  "use strict";

  const synth=window.speechSynthesis;
  const webAvailable=!!synth&&typeof window.SpeechSynthesisUtterance==="function";
  const fallbackAvailable=typeof WebAssembly==="object"&&!!(navigator.storage&&typeof navigator.storage.getDirectory==="function");
  const available=webAvailable||fallbackAvailable;
  const VOICE_ID="fr_FR-siwis-low";
  const LIBRARIES=[
    "https://esm.sh/@mintplex-labs/piper-tts-web@1.0.3?bundle",
    "https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.3/+esm"
  ];
  const RUNTIMES=[
    {
      name:"jsDelivr",
      onnxWasm:"https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/",
      piperData:"https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data",
      piperWasm:"https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm"
    },
    {
      name:"UNPKG",
      onnxWasm:"https://unpkg.com/onnxruntime-web@1.18.0/dist/",
      piperData:"https://unpkg.com/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data",
      piperWasm:"https://unpkg.com/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm"
    }
  ];

  let recognitionActive=false;
  let pendingText="";
  let pendingOptions=null;
  let generation=0;
  let voices=[];
  let lastStatus={state:"idle",error:"",time:0,voice:"",attempts:[],mode:"idle"};
  let lastMode="idle";
  let activeEngine="none";
  let webSpeechFailed=false;
  try{webSpeechFailed=sessionStorage.getItem("libcomlair-webspeech-failed-v182")==="1"}catch(_){}
  let piperSession=null;
  let piperRuntime="";
  let piperPromise=null;
  let audioContext=null;
  let currentSource=null;
  let currentAudio=null;

  function updateVoiceIndicator(){
    const el=document.getElementById("voiceEngineMode");
    if(!el)return;
    if(activeEngine==="piper"){
      el.textContent="Moteur vocal : voix de secours active.";
      return;
    }
    if(activeEngine==="web"){
      el.textContent="Moteur vocal : voix normale active.";
      return;
    }
    if(lastStatus.state==="fallback-loading"||lastStatus.state==="fallback-generating"){
      el.textContent="Moteur vocal : préparation de la voix de secours…";
      return;
    }
    if(lastStatus.state==="error"&&lastStatus.mode==="fallback"){
      el.textContent="Moteur vocal : voix normale indisponible et voix de secours en échec.";
      return;
    }
    el.textContent="Moteur vocal : hybride prêt.";
  }

  function emit(state,extra){
    const mode=(extra&&extra.mode)||lastMode||"idle";
    lastStatus={state,error:"",time:Date.now(),voice:"",attempts:[],mode,...(extra||{})};
    // Important: a voice is declared active only after a real audio start event.
    if(state==="started"&&mode==="normal")activeEngine="web";
    if(state==="fallback-started"&&mode==="fallback")activeEngine="piper";
    if(state==="error"&&mode==="fallback")activeEngine="none";
    if(mode&&mode!=="idle")lastMode=mode;
    updateVoiceIndicator();
    try{window.dispatchEvent(new CustomEvent("libcomlair-voice-status",{detail:{...lastStatus}}))}catch(_){}
  }

  function refreshVoices(){
    try{voices=webAvailable&&typeof synth.getVoices==="function"?synth.getVoices():[]}catch(_){voices=[]}
    return voices;
  }
  refreshVoices();
  if(webAvailable&&"onvoiceschanged" in synth){
    try{synth.addEventListener("voiceschanged",refreshVoices)}catch(_){}
  }

  function voiceKey(v){
    if(!v)return "default";
    return [v.voiceURI||"",v.name||"",v.lang||""].join("|");
  }

  function candidateVoices(){
    const all=refreshVoices();
    const fr=all.filter(v=>String(v.lang||"").toLowerCase().startsWith("fr"));
    const localFr=fr.filter(v=>v.localService===true);
    const defaults=all.filter(v=>v.default===true);
    const ordered=[null,...localFr,...fr,...defaults];
    const seen=new Set(),out=[];
    ordered.forEach(v=>{
      const key=voiceKey(v);
      if(seen.has(key))return;
      seen.add(key);
      out.push(v);
    });
    return out.slice(0,4);
  }

  function armAudio(){
    if(!fallbackAvailable)return false;
    try{
      const Ctx=window.AudioContext||window.webkitAudioContext;
      if(!Ctx)return false;
      if(!audioContext)audioContext=new Ctx();
      if(audioContext.state==="suspended"){
        const p=audioContext.resume();
        if(p&&typeof p.catch==="function")p.catch(()=>{});
      }
      return true;
    }catch(_){return false}
  }

  function stopFallbackAudio(){
    if(currentSource){
      try{currentSource.stop()}catch(_){}
      try{currentSource.disconnect()}catch(_){}
      currentSource=null;
    }
    if(currentAudio){
      try{currentAudio.pause()}catch(_){}
      try{currentAudio.removeAttribute("src");currentAudio.load()}catch(_){}
      currentAudio=null;
    }
  }

  function cancel(){
    generation++;
    pendingText="";
    pendingOptions=null;
    if(webAvailable){try{synth.cancel()}catch(_){}}
    stopFallbackAudio();
    emit("cancelled",{mode:lastMode});
  }

  async function loadPiperSession(){
    if(piperSession)return piperSession;
    if(piperPromise)return piperPromise;
    piperPromise=(async()=>{
      const errors=[];
      for(const libraryUrl of LIBRARIES){
        let tts=null;
        try{tts=await import(libraryUrl)}catch(error){
          errors.push("bibliothèque: "+(error&&error.message?error.message:String(error)));
          continue;
        }
        if(!tts||typeof tts.TtsSession!=="function"){
          errors.push("TtsSession indisponible");
          continue;
        }
        for(const runtime of RUNTIMES){
          try{
            if("_instance" in tts.TtsSession)tts.TtsSession._instance=null;
            emit("fallback-loading",{mode:"fallback",runtime:runtime.name});
            const session=await tts.TtsSession.create({
              voiceId:VOICE_ID,
              progress:e=>{
                const total=Number(e&&e.total||0),loaded=Number(e&&e.loaded||0);
                const progress=total>0?Math.max(0,Math.min(100,Math.round(loaded*100/total))):null;
                emit("fallback-loading",{mode:"fallback",runtime:runtime.name,progress});
              },
              logger:()=>{},
              wasmPaths:{
                onnxWasm:runtime.onnxWasm,
                piperData:runtime.piperData,
                piperWasm:runtime.piperWasm
              }
            });
            piperSession=session;
            piperRuntime=runtime.name;
            emit("fallback-ready",{mode:"fallback",runtime:piperRuntime});
            return session;
          }catch(error){
            errors.push(runtime.name+": "+(error&&error.message?error.message:String(error)));
            try{if("_instance" in tts.TtsSession)tts.TtsSession._instance=null}catch(_){}
          }
        }
      }
      throw new Error(errors.join(" | ")||"Piper indisponible");
    })().finally(()=>{piperPromise=null});
    return piperPromise;
  }

  function splitText(text,maxLen){
    const clean=String(text||"").replace(/\s+/g," ").trim();
    if(clean.length<=maxLen)return [clean];
    const sentences=clean.split(/(?<=[.!?;:])\s+/);
    const chunks=[];
    let current="";
    for(const sentence of sentences){
      if(!sentence)continue;
      if((current+" "+sentence).trim().length<=maxLen){
        current=(current+" "+sentence).trim();
        continue;
      }
      if(current){chunks.push(current);current=""}
      if(sentence.length<=maxLen){current=sentence;continue}
      const words=sentence.split(/\s+/);
      let part="";
      for(const word of words){
        if((part+" "+word).trim().length>maxLen&&part){chunks.push(part);part=word}
        else part=(part+" "+word).trim();
      }
      if(part)current=part;
    }
    if(current)chunks.push(current);
    return chunks.filter(Boolean);
  }

  async function playBlob(blob,myGeneration,onStart){
    if(myGeneration!==generation)throw new Error("cancelled");
    armAudio();
    if(audioContext){
      try{
        if(audioContext.state==="suspended")await audioContext.resume();
        const buf=await blob.arrayBuffer();
        const decoded=await audioContext.decodeAudioData(buf.slice(0));
        if(myGeneration!==generation)throw new Error("cancelled");
        await new Promise((resolve,reject)=>{
          try{
            const source=audioContext.createBufferSource();
            currentSource=source;
            source.buffer=decoded;
            source.connect(audioContext.destination);
            source.onended=()=>{if(currentSource===source)currentSource=null;resolve()};
            if(onStart)onStart();
            source.start(0);
          }catch(error){reject(error)}
        });
        return;
      }catch(error){
        if(error&&error.message==="cancelled")throw error;
      }
    }
    await new Promise((resolve,reject)=>{
      const url=URL.createObjectURL(blob);
      const a=new Audio(url);
      currentAudio=a;
      a.onplay=()=>{if(onStart)onStart()};
      a.onended=()=>{URL.revokeObjectURL(url);if(currentAudio===a)currentAudio=null;resolve()};
      a.onerror=()=>{URL.revokeObjectURL(url);if(currentAudio===a)currentAudio=null;reject(new Error("audio_playback_failed"))};
      const p=a.play();
      if(p&&typeof p.catch==="function")p.catch(error=>{URL.revokeObjectURL(url);if(currentAudio===a)currentAudio=null;reject(error)});
    });
  }

  async function fallbackSpeak(text,options,myGeneration){
    const opts=options||{};
    const chunks=splitText(text,220);
    let started=false;
    try{
      const session=await loadPiperSession();
      for(let i=0;i<chunks.length;i++){
        if(myGeneration!==generation)return;
        emit("fallback-generating",{mode:"fallback",runtime:piperRuntime,chunk:i+1,chunks:chunks.length});
        const wav=await session.predict(chunks[i]);
        if(!(wav instanceof Blob)||wav.size<1000)throw new Error("audio_fallback_invalide");
        await playBlob(wav,myGeneration,()=>{
          if(started)return;
          started=true;
          lastMode="fallback";
          const meta={voice:"Voix de secours Piper",mode:"fallback",engine:"piper",runtime:piperRuntime};
          emit("fallback-started",meta);
          if(typeof opts.onstart==="function")opts.onstart(meta);
        });
      }
      if(myGeneration!==generation)return;
      emit("fallback-ended",{mode:"fallback",engine:"piper",voice:"Voix de secours Piper",runtime:piperRuntime});
      if(typeof opts.onend==="function")opts.onend({voice:"Voix de secours Piper",mode:"fallback",engine:"piper",runtime:piperRuntime});
    }catch(error){
      if(myGeneration!==generation)return;
      const message=error&&error.message?error.message:String(error||"fallback_failed");
      emit("error",{mode:"fallback",engine:"piper",error:message});
      if(typeof opts.onerror==="function")opts.onerror({error:message,mode:"fallback",engine:"piper"});
    }
  }

  function markWebSpeechFailed(){
    webSpeechFailed=true;
    try{sessionStorage.setItem("libcomlair-webspeech-failed-v182","1")}catch(_){}
  }

  function runNormalThenFallback(text,options){
    const clean=String(text||"").trim();
    if(!clean||!available)return false;
    const opts=options||{};
    const myGeneration=++generation;
    if(!webAvailable||webSpeechFailed){
      if(fallbackAvailable){fallbackSpeak(clean,opts,myGeneration);return true}
      return false;
    }

    const candidates=candidateVoices();
    const attempts=[];
    let index=0;
    let finished=false;

    function goFallback(reason){
      if(finished||myGeneration!==generation)return;
      finished=true;
      markWebSpeechFailed();
      emit("normal-failed",{mode:"normal",error:String(reason||"all_voices_failed"),attempts:[...attempts]});
      if(fallbackAvailable){
        fallbackSpeak(clean,opts,myGeneration);
      }else{
        emit("error",{mode:"normal",error:String(reason||"all_voices_failed"),attempts:[...attempts]});
        if(typeof opts.onerror==="function")opts.onerror({error:String(reason||"all_voices_failed"),attempts:[...attempts],mode:"normal"});
      }
    }

    function tryNext(){
      if(finished||myGeneration!==generation)return;
      if(index>=candidates.length){goFallback("all_voices_failed");return}
      const voice=candidates[index++];
      const label=voice?((voice.name||"voix")+" ["+(voice.lang||"?")+"]"+(voice.localService?" local":"")):"voix par défaut";
      attempts.push(label);
      try{
        if(synth.speaking||synth.pending){try{synth.cancel()}catch(_){}}
        const u=new SpeechSynthesisUtterance(clean);
        window.__libcomlairVoiceUtterance=u;
        u.rate=Number.isFinite(opts.rate)?opts.rate:0.9;
        u.volume=1;
        u.pitch=1;
        if(voice){u.voice=voice;u.lang=voice.lang||"fr-FR"}else u.lang="fr-FR";
        let started=false;
        let timer=null;
        u.onstart=()=>{
          if(finished||myGeneration!==generation)return;
          started=true;
          finished=true;
          if(timer)clearTimeout(timer);
          lastMode="normal";
          const meta={voice:label,attempts:[...attempts],mode:"normal",engine:"web"};
          emit("started",meta);
          if(typeof opts.onstart==="function")opts.onstart(meta);
        };
        u.onend=()=>{
          if(myGeneration!==generation||!started)return;
          emit("ended",{voice:label,attempts:[...attempts],mode:"normal"});
          if(typeof opts.onend==="function")opts.onend({voice:label,attempts:[...attempts],mode:"normal"});
        };
        u.onerror=e=>{
          if(finished||myGeneration!==generation)return;
          if(timer)clearTimeout(timer);
          const error=e&&e.error?String(e.error):"speech_error";
          if(error==="not-allowed"){goFallback(error);return}
          setTimeout(tryNext,0);
        };
        synth.speak(u);
        timer=setTimeout(()=>{
          if(finished||started||myGeneration!==generation)return;
          try{
            if(synth.speaking){
              finished=true;
              lastMode="normal";
              const meta={voice:label,attempts:[...attempts],mode:"normal",engine:"web",inferred:true};
              emit("started",meta);
              if(typeof opts.onstart==="function")opts.onstart(meta);
              return;
            }
          }catch(_){}
          tryNext();
        },700);
      }catch(_){setTimeout(tryNext,0)}
    }

    tryNext();
    return true;
  }

  function speak(text,options){
    const clean=String(text||"").trim();
    if(!clean||!available)return false;
    try{if(navigator.userActivation&&navigator.userActivation.isActive)armAudio()}catch(_){}
    if(recognitionActive){
      pendingText=clean;
      pendingOptions=options||{};
      emit("queued",{text:clean.slice(0,120),mode:lastMode});
      return true;
    }
    return runNormalThenFallback(clean,options);
  }

  function flushPending(){
    if(recognitionActive||!pendingText)return;
    const text=pendingText,opts=pendingOptions||{};
    pendingText="";
    pendingOptions=null;
    runNormalThenFallback(text,opts);
  }

  function setRecognitionActive(active){
    recognitionActive=!!active;
    if(recognitionActive){
      try{if(navigator.userActivation&&navigator.userActivation.isActive)armAudio()}catch(_){}
      if(webAvailable){try{if(synth.speaking||synth.pending)synth.cancel()}catch(_){}}
      stopFallbackAudio();
      emit("listening",{recognitionActive:true,mode:lastMode});
      return;
    }
    emit("idle",{recognitionActive:false,mode:lastMode});
    flushPending();
  }

  function testDetailed(timeoutMs){
    return new Promise(resolve=>{
      if(!available){resolve({ok:false,reason:"unavailable",status:status()});return}
      let settled=false;
      const finish=x=>{if(!settled){settled=true;resolve(x)}};
      armAudio();
      const ok=speak("Assistance vocale Libcomlair activée.",{
        rate:0.9,
        onstart:meta=>finish({ok:true,reason:"started",meta,status:status()}),
        onerror:e=>finish({ok:false,reason:e&&e.error?e.error:"voice_failed",status:status()})
      });
      if(!ok){finish({ok:false,reason:"speak_returned_false",status:status()});return}
      setTimeout(()=>finish({ok:false,reason:"timeout",status:status()}),Number(timeoutMs)||90000);
    });
  }

  function test(){
    armAudio();
    return speak("Assistance vocale Libcomlair activée.",{rate:0.9});
  }

  function status(){
    return {
      available,
      webAvailable,
      fallbackAvailable,
      fallbackReady:!!piperSession,
      fallbackRuntime:piperRuntime,
      webSpeechFailed,
      mode:lastMode,
      activeEngine,
      recognitionActive,
      pendingResponse:!!pendingText,
      speaking:webAvailable?!!synth.speaking:false,
      pending:webAvailable?!!synth.pending:false,
      paused:webAvailable?!!synth.paused:false,
      voiceCount:refreshVoices().length,
      frenchVoiceCount:voices.filter(v=>String(v.lang||"").toLowerCase().startsWith("fr")).length,
      localFrenchVoiceCount:voices.filter(v=>v.localService===true&&String(v.lang||"").toLowerCase().startsWith("fr")).length,
      last:{...lastStatus}
    };
  }

  updateVoiceIndicator();

  window.LibcomlairVoice={
    version:"v182",
    available,
    speak,
    cancel,
    test,
    testDetailed,
    setRecognitionActive,
    isRecognitionActive:()=>recognitionActive,
    status,
    refreshVoices,
    armAudio,
    prepareFallback:()=>loadPiperSession()
  };
})();