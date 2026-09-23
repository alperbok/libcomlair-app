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
    if(!available)return;
    try{synth.cancel()}catch(_){}
    try{if(window.LibcomlairFallbackVoice)window.LibcomlairFallbackVoice.stop()}catch(_){}
    emit("cancelled");
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

    async function finishError(error){
      if(finished||myGeneration!==generation)return;
      const fallback=window.LibcomlairFallbackVoice;
      if(fallback&&typeof fallback.speak==="function"){
        attempts.push("Voix de secours française");
        emit("fallback-loading",{error:String(error||"all_voices_failed"),attempts:[...attempts]});
        const ok=await fallback.speak(clean,{
          onstart:()=>{
            if(finished||myGeneration!==generation)return;
            finished=true;
            emit("started",{voice:"Voix de secours française",engine:"fallback",attempts:[...attempts]});
            if(typeof opts.onstart==="function")opts.onstart({voice:"Voix de secours française",engine:"fallback",attempts:[...attempts]});
          },
          onend:()=>{
            emit("ended",{voice:"Voix de secours française",engine:"fallback",attempts:[...attempts]});
            if(typeof opts.onend==="function")opts.onend({voice:"Voix de secours française",engine:"fallback",attempts:[...attempts]});
          },
          onerror:fallbackError=>{
            if(finished||myGeneration!==generation)return;
            finished=true;
            const msg=fallbackError&&fallbackError.message?fallbackError.message:String(fallbackError||error||"all_voices_failed");
            emit("error",{error:msg,engine:"fallback",attempts:[...attempts]});
            if(typeof opts.onerror==="function")opts.onerror({error:msg,attempts:[...attempts]});
          }
        });
        if(ok)return;
      }
      if(finished||myGeneration!==generation)return;
      finished=true;
      emit("error",{error:String(error||"all_voices_failed"),attempts:[...attempts]});
      if(typeof opts.onerror==="function")opts.onerror({error:String(error||"all_voices_failed"),attempts:[...attempts]});
    }

    function tryNext(){
      if(finished||myGeneration!==generation)return;
      if(index>=candidates.length){
        void finishError("all_voices_failed");
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
          emit("started",{voice:label,attempts:[...attempts]});
          if(typeof opts.onstart==="function")opts.onstart({voice:label,attempts:[...attempts]});
        };
        u.onend=()=>{
          if(myGeneration!==generation)return;
          if(started){
            emit("ended",{voice:label,attempts:[...attempts]});
            if(typeof opts.onend==="function")opts.onend({voice:label,attempts:[...attempts]});
          }
        };
        u.onerror=e=>{
          if(finished||myGeneration!==generation)return;
          if(startTimer)clearTimeout(startTimer);
          const error=e&&e.error?String(e.error):"speech_error";
          if(error==="not-allowed"){
            void finishError(error);
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
              emit("started",{voice:label,attempts:[...attempts],inferred:true});
              if(typeof opts.onstart==="function")opts.onstart({voice:label,attempts:[...attempts],inferred:true});
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
    if(!clean||!available)return false;
    if(recognitionActive){
      pendingText=clean;
      pendingOptions=options||{};
      emit("queued",{text:clean.slice(0,120)});
      return true;
    }
    return runWithFallback(clean,options);
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
      if(!available){
        resolve({ok:false,reason:"unavailable",status:status()});
        return;
      }
      let settled=false;
      const finish=x=>{if(!settled){settled=true;resolve(x)}};
      const ok=runWithFallback("Assistance vocale Libcomlair activée.",{
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
      recognitionActive,
      pendingResponse:!!pendingText,
      speaking:available?!!synth.speaking:false,
      pending:available?!!synth.pending:false,
      paused:available?!!synth.paused:false,
      voiceCount:refreshVoices().length,
      frenchVoiceCount:voices.filter(v=>String(v.lang||"").toLowerCase().startsWith("fr")).length,
      localFrenchVoiceCount:voices.filter(v=>v.localService===true&&String(v.lang||"").toLowerCase().startsWith("fr")).length,
      fallback:window.LibcomlairFallbackVoice&&typeof window.LibcomlairFallbackVoice.status==="function"?window.LibcomlairFallbackVoice.status():null,
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
    refreshVoices
  };
})();