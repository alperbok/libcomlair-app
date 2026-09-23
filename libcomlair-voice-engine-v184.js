(function(){
  "use strict";

  const synth=window.speechSynthesis;
  const webAvailable=!!synth&&typeof window.SpeechSynthesisUtterance==="function";
  const fallback=window.LibcomlairFallbackVoice;
  const fallbackAvailable=!!(fallback&&typeof fallback.speak==="function"&&typeof fallback.prepare==="function");
  const available=webAvailable||fallbackAvailable;

  let recognitionActive=false;
  let queued=null;
  let generation=0;
  let activeEngine="none";
  let webDisabled=false;
  let lastStatus={state:"idle",engine:"none",error:"",time:0};
  let lastOutcome={ok:null,reason:"",engine:"none",time:0};
  try{webDisabled=sessionStorage.getItem("libcomlair-webspeech-failed-v184")==="1"}catch(_){}

  function indicator(){
    const el=document.getElementById("voiceEngineMode");
    if(!el)return;
    if(recognitionActive){el.textContent="Moteur vocal : microphone actif.";return}
    if(lastStatus.state==="queued"){el.textContent="Moteur vocal : réponse en attente de la fin du microphone.";return}
    if(lastStatus.state==="preparing-fallback"){el.textContent="Moteur vocal : préparation de la voix de secours meSpeak…";return}
    if(lastStatus.state==="speaking"){
      el.textContent=activeEngine==="mespeak"?"Moteur vocal : voix de secours meSpeak active.":"Moteur vocal : voix normale active.";
      return;
    }
    if(lastOutcome.ok===true){
      el.textContent=lastOutcome.engine==="mespeak"?"Moteur vocal : voix de secours meSpeak validée.":"Moteur vocal : voix normale validée.";
      return;
    }
    if(lastOutcome.ok===false){el.textContent="Moteur vocal : dernière lecture en échec.";return}
    el.textContent="Moteur vocal : prêt.";
  }

  function emit(state,extra){
    lastStatus={state,engine:activeEngine,error:"",time:Date.now(),...(extra||{})};
    indicator();
    try{window.dispatchEvent(new CustomEvent("libcomlair-voice-status",{detail:{...lastStatus}}))}catch(_){}
  }

  function frenchVoice(){
    if(!webAvailable)return null;
    let voices=[];
    try{voices=synth.getVoices()||[]}catch(_){}
    return voices.find(v=>v.localService===true&&String(v.lang||"").toLowerCase().startsWith("fr"))
      ||voices.find(v=>String(v.lang||"").toLowerCase().startsWith("fr"))
      ||null;
  }

  function markWebFailed(){
    webDisabled=true;
    try{sessionStorage.setItem("libcomlair-webspeech-failed-v184","1")}catch(_){}
  }

  function cancel(){
    generation++;
    queued=null;
    try{if(webAvailable)synth.cancel()}catch(_){}
    try{if(fallbackAvailable)fallback.stop()}catch(_){}
    activeEngine="none";
    emit("idle",{reason:"cancelled"});
  }

  async function runFallback(text,opts,myGen,previousReason){
    if(!fallbackAvailable||myGen!==generation){
      if(myGen===generation){
        lastOutcome={ok:false,reason:previousReason||"fallback_unavailable",engine:"none",time:Date.now()};
        emit("error",{error:lastOutcome.reason});
        if(typeof opts.onerror==="function")opts.onerror({error:lastOutcome.reason,engine:"none"});
      }
      return;
    }
    try{
      emit("preparing-fallback",{previousReason:String(previousReason||"")});
      await fallback.prepare();
      if(myGen!==generation)return;
      await fallback.speak(text,{
        onstart:meta=>{
          if(myGen!==generation)return;
          activeEngine="mespeak";
          lastOutcome={ok:true,reason:"started",engine:"mespeak",time:Date.now()};
          emit("speaking",{voice:"meSpeak français",engine:"mespeak"});
          if(typeof opts.onstart==="function")opts.onstart({voice:"meSpeak français",engine:"mespeak",mode:"fallback",...(meta||{})});
        },
        onend:meta=>{
          if(myGen!==generation)return;
          lastOutcome={ok:true,reason:"ended",engine:"mespeak",time:Date.now()};
          activeEngine="none";
          emit("idle",{voice:"meSpeak français",engine:"mespeak"});
          indicator();
          if(typeof opts.onend==="function")opts.onend({voice:"meSpeak français",engine:"mespeak",mode:"fallback",...(meta||{})});
        },
        onerror:error=>{
          if(myGen!==generation)return;
          const reason=error&&error.message?error.message:String(error||"mespeak_failed");
          lastOutcome={ok:false,reason,engine:"mespeak",time:Date.now()};
          activeEngine="none";
          emit("error",{error:reason,engine:"mespeak"});
          if(typeof opts.onerror==="function")opts.onerror({error:reason,engine:"mespeak"});
        }
      });
    }catch(error){
      if(myGen!==generation)return;
      const reason=error&&error.message?error.message:String(error||"mespeak_failed");
      lastOutcome={ok:false,reason,engine:"mespeak",time:Date.now()};
      activeEngine="none";
      emit("error",{error:reason,engine:"mespeak"});
      if(typeof opts.onerror==="function")opts.onerror({error:reason,engine:"mespeak"});
    }
  }

  function run(text,options){
    const clean=String(text||"").replace(/\s+/g," ").trim();
    if(!clean||!available)return false;
    const opts=options||{};
    const myGen=++generation;

    if(!webAvailable||webDisabled){
      runFallback(clean,opts,myGen,webAvailable?"web_disabled":"web_unavailable");
      return true;
    }

    let settled=false;
    try{
      if(synth.speaking||synth.pending)synth.cancel();
      const u=new SpeechSynthesisUtterance(clean);
      window.__libcomlairVoiceUtterance=u;
      u.lang="fr-FR";
      u.rate=Number.isFinite(opts.rate)?opts.rate:0.9;
      u.volume=1;
      u.pitch=1;
      const v=frenchVoice();
      if(v){u.voice=v;u.lang=v.lang||"fr-FR"}
      const label=v?((v.name||"voix française")+" ["+(v.lang||"fr")+"]"):"voix française par défaut";
      const timer=setTimeout(()=>{
        if(settled||myGen!==generation)return;
        settled=true;
        try{synth.cancel()}catch(_){}
        markWebFailed();
        runFallback(clean,opts,myGen,"web_start_timeout");
      },1200);

      u.onstart=()=>{
        if(settled||myGen!==generation)return;
        settled=true;
        clearTimeout(timer);
        activeEngine="web";
        lastOutcome={ok:true,reason:"started",engine:"web",time:Date.now()};
        emit("speaking",{voice:label,engine:"web"});
        if(typeof opts.onstart==="function")opts.onstart({voice:label,engine:"web",mode:"normal"});
      };
      u.onend=()=>{
        if(myGen!==generation||activeEngine!=="web")return;
        lastOutcome={ok:true,reason:"ended",engine:"web",time:Date.now()};
        activeEngine="none";
        emit("idle",{voice:label,engine:"web"});
        indicator();
        if(typeof opts.onend==="function")opts.onend({voice:label,engine:"web",mode:"normal"});
      };
      u.onerror=e=>{
        if(settled||myGen!==generation)return;
        settled=true;
        clearTimeout(timer);
        const reason=e&&e.error?String(e.error):"speech_error";
        markWebFailed();
        runFallback(clean,opts,myGen,reason);
      };
      emit("preparing-web",{voice:label});
      synth.speak(u);
    }catch(error){
      markWebFailed();
      runFallback(clean,opts,myGen,error&&error.message?error.message:String(error));
    }
    return true;
  }

  function speak(text,options){
    const clean=String(text||"").trim();
    if(!clean||!available)return false;
    if(recognitionActive){
      queued={text:clean,options:options||{}};
      emit("queued",{});
      return true;
    }
    return run(clean,options);
  }

  function setRecognitionActive(value){
    recognitionActive=!!value;
    if(recognitionActive){
      try{if(webAvailable)synth.cancel()}catch(_){}
      try{if(fallbackAvailable)fallback.stop()}catch(_){}
      emit("listening",{});
      return;
    }
    emit("idle",{});
    if(queued){
      const q=queued;
      queued=null;
      setTimeout(()=>run(q.text,q.options),80);
    }
  }

  function status(){
    let voices=[];
    try{voices=webAvailable&&typeof synth.getVoices==="function"?synth.getVoices():[]}catch(_){}
    const fbStatus=fallbackAvailable&&typeof fallback.status==="function"?fallback.status():null;
    return {
      version:"v184",
      available,
      webAvailable,
      fallbackAvailable,
      fallbackReady:!!(fbStatus&&fbStatus.ready),
      activeEngine,
      webDisabled,
      recognitionActive,
      queued:!!queued,
      voiceCount:voices.length,
      frenchVoiceCount:voices.filter(v=>String(v.lang||"").toLowerCase().startsWith("fr")).length,
      localFrenchVoiceCount:voices.filter(v=>v.localService===true&&String(v.lang||"").toLowerCase().startsWith("fr")).length,
      lastOutcome:{...lastOutcome},
      last:{...lastStatus},
      fallbackStatus:fbStatus
    };
  }

  function testDetailed(timeoutMs){
    return new Promise(resolve=>{
      if(!available){resolve({ok:false,reason:"unavailable",status:status()});return}
      let done=false;
      const finish=x=>{if(!done){done=true;resolve(x)}};
      const ok=speak("Assistance vocale Libcomlair activée.",{
        rate:0.9,
        onstart:meta=>finish({ok:true,reason:"started",meta,status:status()}),
        onerror:e=>finish({ok:false,reason:e&&e.error?e.error:"voice_failed",meta:e,status:status()})
      });
      if(!ok){finish({ok:false,reason:"speak_returned_false",status:status()});return}
      setTimeout(()=>finish({ok:false,reason:"test_timeout",status:status()}),Number(timeoutMs)||30000);
    });
  }

  function test(){return speak("Assistance vocale Libcomlair activée.",{rate:0.9})}

  indicator();
  window.LibcomlairVoice={
    version:"v184",
    available,
    speak,
    cancel,
    test,
    testDetailed,
    setRecognitionActive,
    isRecognitionActive:()=>recognitionActive,
    status,
    prepareFallback:()=>fallbackAvailable?fallback.prepare():Promise.reject(new Error("fallback_unavailable"))
  };
})();