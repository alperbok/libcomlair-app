(function(){
  "use strict";
  const synth=window.speechSynthesis;
  const available=!!synth&&typeof window.SpeechSynthesisUtterance==="function";
  let recognitionActive=false;
  let pendingText="";
  let pendingOptions=null;
  let generation=0;
  let voices=[];
  let lastStatus={state:"idle",error:"",time:0,voice:"",attempts:[]};

  let activeEngine="none";
  let fallbackState={state:"idle",error:"",runtime:"",time:0};
  let piperSession=null;
  let piperSessionIndex=0;
  let audioContext=null;
  let currentAudioSource=null;
  let currentAudioElement=null;
  let waitingPlayback=null;

  const PIPER_VOICE_ID="fr_FR-siwis-low";
  const PIPER_PAIRS=[
    {
      library:"https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.3/+esm?libcomlair=181a",
      runtime:{
        name:"jsDelivr",
        onnxWasm:"https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/",
        piperData:"https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data",
        piperWasm:"https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm"
      }
    },
    {
      library:"https://esm.sh/@mintplex-labs/piper-tts-web@1.0.3?bundle&libcomlair=181b",
      runtime:{
        name:"esm.sh + jsDelivr",
        onnxWasm:"https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/",
        piperData:"https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data",
        piperWasm:"https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm"
      }
    },
    {
      library:"https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.3/+esm?libcomlair=181c",
      runtime:{
        name:"UNPKG",
        onnxWasm:"https://unpkg.com/onnxruntime-web@1.18.0/dist/",
        piperData:"https://unpkg.com/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data",
        piperWasm:"https://unpkg.com/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm"
      }
    }
  ];

  function updateVoiceIndicator(){
    const el=document.getElementById("voiceEngineMode");
    if(!el)return;
    if(fallbackState.state==="loading"||fallbackState.state==="generating"){
      el.textContent="Moteur vocal : préparation de la voix de secours…";
      return;
    }
    if(fallbackState.state==="waiting-gesture"){
      el.textContent="Moteur vocal : voix de secours prête — touchez l’écran pour lancer la lecture.";
      return;
    }
    if(activeEngine==="piper"){
      el.textContent="Moteur vocal : voix de secours active.";
      return;
    }
    if(activeEngine==="web"){
      el.textContent="Moteur vocal : voix normale active.";
      return;
    }
    if(fallbackState.state==="error"){
      el.textContent="Moteur vocal : voix normale indisponible et voix de secours en échec.";
      return;
    }
    el.textContent="Moteur vocal : hybride prêt.";
  }

  function setFallbackState(state,extra){
    fallbackState={state,error:"",runtime:"",time:Date.now(),...(extra||{})};
    updateVoiceIndicator();
  }

  function splitPiperText(text){
    const clean=String(text||"")
      .replace(/[^\p{L}\p{N}\s.,;:!?'"’()\-]/gu," ")
      .replace(/\s+/g," ")
      .trim();
    if(!clean)return [];
    const sentences=clean.match(/[^.!?]+[.!?]?/g)||[clean];
    const out=[];
    for(const sentence of sentences){
      let part=sentence.trim();
      while(part.length>150){
        let cut=part.lastIndexOf(" ",150);
        if(cut<60)cut=150;
        out.push(part.slice(0,cut).trim());
        part=part.slice(cut).trim();
      }
      if(part)out.push(part);
    }
    return out;
  }

  function simplifiedPiperText(text){
    try{
      return String(text||"")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .replace(/[’']/g," ")
        .replace(/[^A-Za-z0-9À-ÿ\s.,!?-]/g," ")
        .replace(/\s+/g," ")
        .trim();
    }catch(_){
      return String(text||"").replace(/\s+/g," ").trim();
    }
  }

  async function loadPiperSession(forceNext){
    if(forceNext){
      piperSession=null;
      piperSessionIndex++;
    }
    if(piperSession)return piperSession;
    if(piperSessionIndex>=PIPER_PAIRS.length)throw new Error("Aucun moteur Piper compatible n’a pu être chargé.");
    const pair=PIPER_PAIRS[piperSessionIndex];
    setFallbackState("loading",{runtime:pair.runtime.name});
    const tts=await import(pair.library);
    if(!tts||typeof tts.TtsSession!=="function")throw new Error("TtsSession indisponible.");
    piperSession=await tts.TtsSession.create({
      voiceId:PIPER_VOICE_ID,
      progress:()=>{},
      logger:()=>{},
      wasmPaths:{
        onnxWasm:pair.runtime.onnxWasm,
        piperData:pair.runtime.piperData,
        piperWasm:pair.runtime.piperWasm
      }
    });
    setFallbackState("ready",{runtime:pair.runtime.name});
    return piperSession;
  }

  async function generatePiperBlob(text){
    const errors=[];
    const firstIndex=piperSessionIndex;
    for(let pass=0;pass<PIPER_PAIRS.length;pass++){
      if(piperSessionIndex>=PIPER_PAIRS.length){
        piperSessionIndex=0;
        piperSession=null;
      }
      const idx=piperSessionIndex;
      try{
        const session=await loadPiperSession(false);
        setFallbackState("generating",{runtime:PIPER_PAIRS[idx].runtime.name});
        try{
          const wav=await session.predict(text);
          if(wav instanceof Blob&&wav.size>1000){
            setFallbackState("ready",{runtime:PIPER_PAIRS[idx].runtime.name});
            return wav;
          }
          throw new Error("Fichier audio Piper invalide.");
        }catch(firstError){
          const simplified=simplifiedPiperText(text);
          if(simplified&&simplified!==text){
            const wav=await session.predict(simplified);
            if(wav instanceof Blob&&wav.size>1000){
              setFallbackState("ready",{runtime:PIPER_PAIRS[idx].runtime.name});
              return wav;
            }
          }
          throw firstError;
        }
      }catch(error){
        errors.push((PIPER_PAIRS[idx]&&PIPER_PAIRS[idx].runtime.name||"Piper")+" : "+(error&&error.message?error.message:String(error)));
        piperSession=null;
        piperSessionIndex=idx+1;
      }
    }
    piperSessionIndex=firstIndex<PIPER_PAIRS.length?firstIndex:0;
    piperSession=null;
    throw new Error(errors.join(" | "));
  }

  function getAudioContext(){
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx)return null;
    if(!audioContext){
      try{audioContext=new Ctx()}catch(_){audioContext=null}
    }
    return audioContext;
  }

  async function playBlobWithAudioContext(blob,myGeneration,handlers){
    const ctx=getAudioContext();
    if(!ctx)throw new Error("AudioContext indisponible.");
    try{if(ctx.state!=="running")await ctx.resume()}catch(_){}
    if(ctx.state!=="running"){
      waitingPlayback={blob,myGeneration,handlers};
      setFallbackState("waiting-gesture",{runtime:fallbackState.runtime});
      return;
    }
    const bytes=await blob.arrayBuffer();
    const decoded=await ctx.decodeAudioData(bytes.slice(0));
    if(myGeneration!==generation)return;
    try{if(currentAudioSource)currentAudioSource.stop()}catch(_){}
    const source=ctx.createBufferSource();
    currentAudioSource=source;
    source.buffer=decoded;
    source.connect(ctx.destination);
    source.onended=()=>{
      if(currentAudioSource===source)currentAudioSource=null;
      if(myGeneration!==generation)return;
      if(handlers&&typeof handlers.onend==="function")handlers.onend();
    };
    activeEngine="piper";
    setFallbackState("playing",{runtime:fallbackState.runtime});
    emit("started",{engine:"piper",voice:"Voix de secours Piper",runtime:fallbackState.runtime});
    if(handlers&&typeof handlers.onstart==="function")handlers.onstart();
    source.start(0);
  }

  async function playBlobFallback(blob,myGeneration,handlers){
    try{
      await playBlobWithAudioContext(blob,myGeneration,handlers);
      return;
    }catch(_){}
    if(myGeneration!==generation)return;
    const url=URL.createObjectURL(blob);
    const a=new Audio(url);
    currentAudioElement=a;
    a.onplay=()=>{
      activeEngine="piper";
      setFallbackState("playing",{runtime:fallbackState.runtime});
      emit("started",{engine:"piper",voice:"Voix de secours Piper",runtime:fallbackState.runtime});
      if(handlers&&typeof handlers.onstart==="function")handlers.onstart();
    };
    a.onended=()=>{
      URL.revokeObjectURL(url);
      if(currentAudioElement===a)currentAudioElement=null;
      if(myGeneration!==generation)return;
      if(handlers&&typeof handlers.onend==="function")handlers.onend();
    };
    a.onerror=()=>{
      URL.revokeObjectURL(url);
      if(currentAudioElement===a)currentAudioElement=null;
      if(handlers&&typeof handlers.onerror==="function")handlers.onerror(new Error("Lecture audio Piper impossible."));
    };
    const p=a.play();
    if(p&&typeof p.catch==="function")await p.catch(error=>{throw error});
  }

  async function speakWithPiper(text,opts,myGeneration,primaryError,attempts){
    const chunks=splitPiperText(text);
    if(!chunks.length){
      const error="piper_empty_text";
      setFallbackState("error",{error});
      emit("error",{error,engine:"piper",attempts:[...(attempts||[])]});
      if(typeof opts.onerror==="function")opts.onerror({error,engine:"piper",attempts:[...(attempts||[])]});
      return;
    }
    let started=false;
    try{
      for(let i=0;i<chunks.length;i++){
        if(myGeneration!==generation)return;
        const blob=await generatePiperBlob(chunks[i]);
        if(myGeneration!==generation)return;
        await new Promise((resolve,reject)=>{
          playBlobFallback(blob,myGeneration,{
            onstart:()=>{
              if(started)return;
              started=true;
              if(typeof opts.onstart==="function")opts.onstart({
                engine:"piper",
                voice:"Voix de secours Piper",
                primaryError:String(primaryError||""),
                attempts:[...(attempts||[])]
              });
            },
            onend:resolve,
            onerror:reject
          }).catch(reject);
        });
      }
      if(myGeneration!==generation)return;
      activeEngine="piper";
      setFallbackState("ready",{runtime:fallbackState.runtime});
      emit("ended",{engine:"piper",voice:"Voix de secours Piper",attempts:[...(attempts||[])]});
      if(typeof opts.onend==="function")opts.onend({engine:"piper",voice:"Voix de secours Piper"});
    }catch(error){
      if(myGeneration!==generation)return;
      const message=error&&error.message?error.message:String(error||"piper_failed");
      setFallbackState("error",{error:message,runtime:fallbackState.runtime});
      emit("error",{error:"piper_failed",detail:message,engine:"piper",attempts:[...(attempts||[])]});
      if(typeof opts.onerror==="function")opts.onerror({
        error:"piper_failed",
        detail:message,
        engine:"piper",
        attempts:[...(attempts||[])]
      });
    }
  }

  async function unlockFallbackAudio(){
    const ctx=getAudioContext();
    if(ctx){
      try{if(ctx.state!=="running")await ctx.resume()}catch(_){}
    }
    if(waitingPlayback&&ctx&&ctx.state==="running"){
      const pending=waitingPlayback;
      waitingPlayback=null;
      if(pending.myGeneration===generation){
        playBlobWithAudioContext(pending.blob,pending.myGeneration,pending.handlers).catch(error=>{
          if(pending.handlers&&typeof pending.handlers.onerror==="function")pending.handlers.onerror(error);
        });
      }
    }
    updateVoiceIndicator();
  }

  ["pointerdown","touchstart","keydown","click"].forEach(type=>{
    document.addEventListener(type,unlockFallbackAudio,{capture:true,passive:true});
  });


  function refreshVoices(){
    try{voices=available&&typeof synth.getVoices==="function"?synth.getVoices():[]}catch(_){voices=[]}
    return voices;
  }
  refreshVoices();
  if(available&&"onvoiceschanged" in synth){
    try{synth.addEventListener("voiceschanged",refreshVoices)}catch(_){}
  }

  function emit(state,extra){
    lastStatus={state,error:"",time:Date.now(),voice:"",attempts:[],...(extra||{})};
    if(lastStatus.engine==="web")activeEngine="web";
    if(lastStatus.engine==="piper")activeEngine="piper";
    updateVoiceIndicator();
    try{window.dispatchEvent(new CustomEvent("libcomlair-voice-status",{detail:{...lastStatus}}))}catch(_){}
  }

  function voiceKey(v){
    if(!v)return "default";
    return [v.voiceURI||"",v.name||"",v.lang||""].join("|");
  }

  function candidateVoices(){
    const all=refreshVoices();
    const fr=all.filter(v=>String(v.lang||"").toLowerCase().startsWith("fr"));
    const localFr=fr.filter(v=>v.localService===true);
    const defaultVoices=all.filter(v=>v.default===true);
    const localAny=all.filter(v=>v.localService===true);
    const ordered=[null,...localFr,...fr,...defaultVoices,...localAny];
    const seen=new Set(),out=[];
    ordered.forEach(v=>{
      const key=voiceKey(v);
      if(seen.has(key))return;
      seen.add(key);
      out.push(v);
    });
    return out.slice(0,18);
  }

  function cancel(){
    generation++;
    pendingText="";
    pendingOptions=null;
    waitingPlayback=null;
    try{if(currentAudioSource)currentAudioSource.stop()}catch(_){}
    currentAudioSource=null;
    try{if(currentAudioElement){currentAudioElement.pause();currentAudioElement.currentTime=0}}catch(_){}
    currentAudioElement=null;
    if(available){try{synth.cancel()}catch(_){}}
    emit("cancelled",{engine:activeEngine});
  }

  function runWithFallback(text,options){
    const clean=String(text||"").trim();
    if(!available||!clean)return false;
    const opts=options||{};
    const myGeneration=++generation;
    const candidates=candidateVoices();
    const attempts=[];
    let index=0;
    let finished=false;

    function finishError(error){
      if(finished||myGeneration!==generation)return;
      finished=true;
      const primaryError=String(error||"all_voices_failed");
      setFallbackState("loading",{runtime:"Piper"});
      speakWithPiper(clean,opts,myGeneration,primaryError,[...attempts]);
    }

    function tryNext(){
      if(finished||myGeneration!==generation)return;
      if(index>=candidates.length){
        finishError("all_voices_failed");
        return;
      }
      const voice=candidates[index++];
      const label=voice?((voice.name||"voix")+" ["+(voice.lang||"?")+"]"+(voice.localService?" local":"")):"voix par défaut";
      attempts.push(label);

      try{
        if(synth.speaking||synth.pending){
          try{synth.cancel()}catch(_){}
        }
        const u=new SpeechSynthesisUtterance(clean);
        window.__libcomlairVoiceUtterance=u;
        u.rate=Number.isFinite(opts.rate)?opts.rate:0.9;
        u.volume=1;
        u.pitch=1;
        if(voice){
          u.voice=voice;
          u.lang=voice.lang||"fr-FR";
        }else{
          u.lang="fr-FR";
        }
        let started=false;
        let startTimer=null;
        u.onstart=()=>{
          if(finished||myGeneration!==generation)return;
          started=true;
          finished=true;
          if(startTimer)clearTimeout(startTimer);
          emit("started",{engine:"web",voice:label,attempts:[...attempts]});
          if(typeof opts.onstart==="function")opts.onstart({engine:"web",voice:label,attempts:[...attempts]});
        };
        u.onend=()=>{
          if(myGeneration!==generation)return;
          if(started){
            emit("ended",{engine:"web",voice:label,attempts:[...attempts]});
            if(typeof opts.onend==="function")opts.onend({engine:"web",voice:label,attempts:[...attempts]});
          }
        };
        u.onerror=e=>{
          if(finished||myGeneration!==generation)return;
          if(startTimer)clearTimeout(startTimer);
          const error=e&&e.error?String(e.error):"speech_error";
          if(error==="not-allowed"){
            finishError(error);
            return;
          }
          setTimeout(tryNext,0);
        };
        synth.speak(u);

        startTimer=setTimeout(()=>{
          if(finished||started||myGeneration!==generation)return;
          try{
            if(synth.speaking){
              finished=true;
              emit("started",{engine:"web",voice:label,attempts:[...attempts],inferred:true});
              if(typeof opts.onstart==="function")opts.onstart({engine:"web",voice:label,attempts:[...attempts],inferred:true});
              return;
            }
          }catch(_){}
          tryNext();
        },900);
      }catch(_){
        setTimeout(tryNext,0);
      }
    }

    tryNext();
    return true;
  }

  function speak(text,options){
    const clean=String(text||"").trim();
    if(!clean)return false;
    if(recognitionActive){
      pendingText=clean;
      pendingOptions=options||{};
      emit("queued",{text:clean.slice(0,120),engine:activeEngine});
      return true;
    }
    if(available)return runWithFallback(clean,options);
    const myGeneration=++generation;
    setFallbackState("loading",{runtime:"Piper"});
    speakWithPiper(clean,options||{},myGeneration,"web_speech_unavailable",[]);
    return true;
  }

  function flushPending(){
    if(recognitionActive||!pendingText)return;
    const text=pendingText,opts=pendingOptions||{};
    pendingText="";
    pendingOptions=null;
    runWithFallback(text,opts);
  }

  function setRecognitionActive(active){
    recognitionActive=!!active;
    if(recognitionActive){
      try{if(synth.speaking||synth.pending)synth.cancel()}catch(_){}
      emit("listening",{recognitionActive:true});
      return;
    }
    emit("idle",{recognitionActive:false});
    flushPending();
  }

  function testDetailed(timeoutMs){
    return new Promise(resolve=>{
      let settled=false;
      const finish=x=>{if(!settled){settled=true;resolve(x)}};
      const ok=speak("Assistance vocale Libcomlair activée.",{
        rate:0.9,
        onstart:meta=>finish({ok:true,reason:"started",meta,status:status()}),
        onerror:e=>finish({ok:false,reason:e&&e.error?e.error:"all_voices_failed",attempts:e&&e.attempts?e.attempts:[],status:status()})
      });
      if(!ok){
        finish({ok:false,reason:"speak_returned_false",status:status()});
        return;
      }
      setTimeout(()=>finish({ok:false,reason:"timeout",status:status()}),Number(timeoutMs)||12000);
    });
  }

  function test(){
    return runWithFallback("Assistance vocale Libcomlair activée.",{rate:0.9});
  }

  function status(){
    return {
      available,
      hybridAvailable:true,
      activeEngine,
      fallback:{...fallbackState},
      recognitionActive,
      pendingResponse:!!pendingText,
      speaking:available?!!synth.speaking:false,
      pending:available?!!synth.pending:false,
      paused:available?!!synth.paused:false,
      voiceCount:refreshVoices().length,
      frenchVoiceCount:voices.filter(v=>String(v.lang||"").toLowerCase().startsWith("fr")).length,
      localFrenchVoiceCount:voices.filter(v=>v.localService===true&&String(v.lang||"").toLowerCase().startsWith("fr")).length,
      last:{...lastStatus}
    };
  }

  window.LibcomlairVoice={
    version:"v181",
    available,
    speak,
    cancel,
    test,
    testDetailed,
    setRecognitionActive,
    isRecognitionActive:()=>recognitionActive,
    status,
    refreshVoices,
    prepareFallback:async()=>{await loadPiperSession(false);return true},
    unlockFallbackAudio,
    fallbackStatus:()=>({...fallbackState})
  };
  setTimeout(updateVoiceIndicator,0);
})();