(function(){
  "use strict";

  const synth=window.speechSynthesis;
  const webAvailable=!!synth&&typeof window.SpeechSynthesisUtterance==="function";
  const fallback=window.LibcomlairFallbackVoice;
  const fallbackAvailable=!!(fallback&&typeof fallback.speak==="function"&&typeof fallback.prepare==="function");
  const available=webAvailable||fallbackAvailable;

  const WEB_START_TIMEOUT_MS=2600;
  const WEB_RETRY_COOLDOWN_MS=45000;

  let recognitionActive=false;
  let queued=null;
  let generation=0;
  let activeEngine="none";
  let lastWebFailureAt=0;
  let lastWebFailureReason="";
  let lastStatus={state:"idle",engine:"none",error:"",time:0};
  let lastOutcome={ok:null,reason:"",engine:"none",time:0};

  function indicator(){
    const el=document.getElementById("voiceEngineMode");
    if(!el)return;
    if(recognitionActive){el.textContent="Moteur vocal : microphone actif.";return}
    if(lastStatus.state==="queued"){el.textContent="Moteur vocal : réponse en attente de la fin du microphone.";return}
    if(lastStatus.state==="preparing-fallback"){el.textContent="Moteur vocal : préparation de la voix de secours meSpeak…";return}
    if(lastStatus.state==="probing-web"){el.textContent="Moteur vocal : essai de la voix naturelle…";return}
    if(lastStatus.state==="speaking"){
      el.textContent=activeEngine==="mespeak"?"Moteur vocal : voix de secours meSpeak active.":"Moteur vocal : voix naturelle active.";
      return;
    }
    if(lastOutcome.ok===true){
      el.textContent=lastOutcome.engine==="mespeak"?"Moteur vocal : voix de secours meSpeak validée.":"Moteur vocal : voix naturelle validée.";
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

  function voices(){
    if(!webAvailable)return [];
    try{return synth.getVoices()||[]}catch(_){return []}
  }

  function preferredFrenchVoice(){
    const list=voices();
    return list.find(v=>v.default===true&&String(v.lang||"").toLowerCase().startsWith("fr"))
      ||list.find(v=>v.localService===true&&String(v.lang||"").toLowerCase().startsWith("fr"))
      ||list.find(v=>String(v.lang||"").toLowerCase().startsWith("fr"))
      ||null;
  }

  function webCandidates(){
    const out=[{voice:null,label:"voix système française"}];
    const preferred=preferredFrenchVoice();
    if(preferred){
      out.push({
        voice:preferred,
        label:(preferred.name||"voix française")+" ["+(preferred.lang||"fr")+"]"
      });
    }
    return out;
  }

  function markWebFailed(reason){
    lastWebFailureAt=Date.now();
    lastWebFailureReason=String(reason||"web_failed");
  }

  function clearWebFailure(){
    lastWebFailureAt=0;
    lastWebFailureReason="";
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

  function runWebSequence(text,opts,myGen){
    const candidates=webCandidates();
    let index=0;
    const reasons=[];

    function next(){
      if(myGen!==generation)return;
      if(index>=candidates.length){
        const reason=reasons.filter(Boolean).join(" | ")||"web_all_candidates_failed";
        markWebFailed(reason);
        runFallback(text,opts,myGen,reason);
        return;
      }

      const candidate=candidates[index++];
      let settled=false;
      try{
        try{if(synth.speaking||synth.pending)synth.cancel()}catch(_){}
        const u=new SpeechSynthesisUtterance(text);
        window.__libcomlairVoiceUtterance=u;
        u.lang="fr-FR";
        u.rate=Number.isFinite(opts.rate)?opts.rate:0.9;
        u.volume=1;
        u.pitch=1;
        if(candidate.voice){
          u.voice=candidate.voice;
          u.lang=candidate.voice.lang||"fr-FR";
        }

        const timer=setTimeout(()=>{
          if(settled||myGen!==generation)return;
          settled=true;
          reasons.push(candidate.label+": timeout");
          try{synth.cancel()}catch(_){}
          setTimeout(next,120);
        },WEB_START_TIMEOUT_MS);

        u.onstart=()=>{
          if(settled||myGen!==generation)return;
          settled=true;
          clearTimeout(timer);
          clearWebFailure();
          activeEngine="web";
          lastOutcome={ok:true,reason:"started",engine:"web",time:Date.now()};
          emit("speaking",{voice:candidate.label,engine:"web"});
          if(typeof opts.onstart==="function")opts.onstart({voice:candidate.label,engine:"web",mode:"normal"});
        };

        u.onend=()=>{
          if(myGen!==generation||activeEngine!=="web")return;
          lastOutcome={ok:true,reason:"ended",engine:"web",time:Date.now()};
          activeEngine="none";
          emit("idle",{voice:candidate.label,engine:"web"});
          indicator();
          if(typeof opts.onend==="function")opts.onend({voice:candidate.label,engine:"web",mode:"normal"});
        };

        u.onerror=e=>{
          if(settled||myGen!==generation)return;
          settled=true;
          clearTimeout(timer);
          const reason=e&&e.error?String(e.error):"speech_error";
          reasons.push(candidate.label+": "+reason);
          try{synth.cancel()}catch(_){}
          setTimeout(next,120);
        };

        emit("probing-web",{voice:candidate.label,candidate:index,total:candidates.length});
        synth.speak(u);
      }catch(error){
        reasons.push(candidate.label+": "+(error&&error.message?error.message:String(error)));
        setTimeout(next,120);
      }
    }

    next();
  }

  function run(text,options){
    const clean=String(text||"").replace(/\s+/g," ").trim();
    if(!clean||!available)return false;
    const opts=options||{};
    const myGen=++generation;

    if(!webAvailable){
      runFallback(clean,opts,myGen,"web_unavailable");
      return true;
    }

    const cooling=lastWebFailureAt>0&&(Date.now()-lastWebFailureAt)<WEB_RETRY_COOLDOWN_MS;
    if(cooling&&!opts.forceWebProbe){
      runFallback(clean,opts,myGen,"web_retry_cooldown");
      return true;
    }

    runWebSequence(clean,opts,myGen);
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
    const list=voices();
    const fbStatus=fallbackAvailable&&typeof fallback.status==="function"?fallback.status():null;
    const retryIn=Math.max(0,WEB_RETRY_COOLDOWN_MS-(Date.now()-lastWebFailureAt));
    return {
      version:"v185",
      available,
      webAvailable,
      fallbackAvailable,
      fallbackReady:!!(fbStatus&&fbStatus.ready),
      activeEngine,
      webDisabled:false,
      webRetryCooldownMs:WEB_RETRY_COOLDOWN_MS,
      webRetryInMs:lastWebFailureAt?retryIn:0,
      lastWebFailureReason,
      recognitionActive,
      queued:!!queued,
      voiceCount:list.length,
      frenchVoiceCount:list.filter(v=>String(v.lang||"").toLowerCase().startsWith("fr")).length,
      localFrenchVoiceCount:list.filter(v=>v.localService===true&&String(v.lang||"").toLowerCase().startsWith("fr")).length,
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
        forceWebProbe:true,
        onstart:meta=>finish({ok:true,reason:"started",meta,status:status()}),
        onerror:e=>finish({ok:false,reason:e&&e.error?e.error:"voice_failed",meta:e,status:status()})
      });
      if(!ok){finish({ok:false,reason:"speak_returned_false",status:status()});return}
      setTimeout(()=>finish({ok:false,reason:"test_timeout",status:status()}),Number(timeoutMs)||30000);
    });
  }

  function test(){return speak("Assistance vocale Libcomlair activée.",{rate:0.9,forceWebProbe:true})}

  indicator();
  window.LibcomlairVoice={
    version:"v185",
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