(function(){
  "use strict";

  const renderVoice=window.LibcomlairRenderVoice;
  const renderAvailable=!!(renderVoice&&typeof renderVoice.speak==="function"&&typeof renderVoice.prepare==="function");

  const synth=window.speechSynthesis;
  const webAvailable=!!synth&&typeof window.SpeechSynthesisUtterance==="function";

  const fallback=window.LibcomlairFallbackVoice;
  const fallbackAvailable=!!(fallback&&typeof fallback.speak==="function"&&typeof fallback.prepare==="function");

  const available=renderAvailable||webAvailable||fallbackAvailable;
  const WEB_START_TIMEOUT_MS=2600;
  const RENDER_RETRY_COOLDOWN_MS=60000;
  const WEB_RETRY_COOLDOWN_MS=45000;

  let recognitionActive=false;
  let queued=null;
  let generation=0;
  let activeEngine="none";
  let lastRenderFailureAt=0;
  let lastRenderFailureReason="";
  let lastWebFailureAt=0;
  let lastWebFailureReason="";
  let lastStatus={state:"idle",engine:"none",error:"",time:0};
  let lastOutcome={ok:null,reason:"",engine:"none",time:0};

  function indicator(){
    const el=document.getElementById("voiceEngineMode");
    if(!el)return;
    if(recognitionActive){el.textContent="Moteur vocal : microphone actif.";return}
    if(lastStatus.state==="queued"){el.textContent="Moteur vocal : réponse en attente de la fin du microphone.";return}
    if(lastStatus.state==="preparing-render"){el.textContent="Moteur vocal : préparation de la voix française Render…";return}
    if(lastStatus.state==="generating-render"){el.textContent="Moteur vocal : génération de la voix sur Render…";return}
    if(lastStatus.state==="probing-web"){el.textContent="Moteur vocal : essai de la voix système…";return}
    if(lastStatus.state==="preparing-fallback"){el.textContent="Moteur vocal : préparation de la voix de secours meSpeak…";return}
    if(lastStatus.state==="speaking"){
      if(activeEngine==="render")el.textContent="Moteur vocal : voix française Render active.";
      else if(activeEngine==="mespeak")el.textContent="Moteur vocal : voix de secours meSpeak active.";
      else el.textContent="Moteur vocal : voix système active.";
      return;
    }
    if(lastOutcome.ok===true){
      if(lastOutcome.engine==="render")el.textContent="Moteur vocal : voix française Render validée.";
      else if(lastOutcome.engine==="mespeak")el.textContent="Moteur vocal : voix de secours meSpeak validée.";
      else el.textContent="Moteur vocal : voix système validée.";
      return;
    }
    if(lastOutcome.ok===false){el.textContent="Moteur vocal : dernière lecture en échec.";return}
    el.textContent=renderAvailable?"Moteur vocal : Render prêt.":"Moteur vocal : prêt.";
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
    if(preferred)out.push({voice:preferred,label:(preferred.name||"voix française")+" ["+(preferred.lang||"fr")+"]"});
    return out;
  }

  function cancel(){
    generation++;
    queued=null;
    try{if(renderAvailable)renderVoice.stop()}catch(_){}
    try{if(webAvailable)synth.cancel()}catch(_){}
    try{if(fallbackAvailable)fallback.stop()}catch(_){}
    activeEngine="none";
    emit("idle",{reason:"cancelled"});
  }

  function failFinal(opts,myGen,reason,engine){
    if(myGen!==generation)return;
    activeEngine="none";
    lastOutcome={ok:false,reason:String(reason||"voice_failed"),engine:engine||"none",time:Date.now()};
    emit("error",{error:lastOutcome.reason,engine:lastOutcome.engine});
    if(typeof opts.onerror==="function")opts.onerror({error:lastOutcome.reason,engine:lastOutcome.engine});
  }

  async function runFallback(text,opts,myGen,previousReason){
    if(!fallbackAvailable||myGen!==generation){
      failFinal(opts,myGen,previousReason||"fallback_unavailable","none");
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
        }
      });
    }catch(error){
      const reason=error&&error.message?error.message:String(error||"mespeak_failed");
      failFinal(opts,myGen,reason,"mespeak");
    }
  }

  function runWebSequence(text,opts,myGen,previousReason){
    if(!webAvailable||myGen!==generation){
      runFallback(text,opts,myGen,previousReason||"web_unavailable");
      return;
    }

    const cooling=lastWebFailureAt>0&&(Date.now()-lastWebFailureAt)<WEB_RETRY_COOLDOWN_MS;
    if(cooling&&!opts.forceWebProbe){
      runFallback(text,opts,myGen,"web_retry_cooldown");
      return;
    }

    const candidates=webCandidates();
    let index=0;
    const reasons=[];

    function next(){
      if(myGen!==generation)return;
      if(index>=candidates.length){
        const reason=reasons.filter(Boolean).join(" | ")||"web_all_candidates_failed";
        lastWebFailureAt=Date.now();
        lastWebFailureReason=reason;
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
          lastWebFailureAt=0;
          lastWebFailureReason="";
          activeEngine="web";
          lastOutcome={ok:true,reason:"started",engine:"web",time:Date.now()};
          emit("speaking",{voice:candidate.label,engine:"web"});
          if(typeof opts.onstart==="function")opts.onstart({voice:candidate.label,engine:"web",mode:"system"});
        };

        u.onend=()=>{
          if(myGen!==generation||activeEngine!=="web")return;
          lastOutcome={ok:true,reason:"ended",engine:"web",time:Date.now()};
          activeEngine="none";
          emit("idle",{voice:candidate.label,engine:"web"});
          indicator();
          if(typeof opts.onend==="function")opts.onend({voice:candidate.label,engine:"web",mode:"system"});
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

        emit("probing-web",{voice:candidate.label,candidate:index,total:candidates.length,previousReason:String(previousReason||"")});
        synth.speak(u);
      }catch(error){
        reasons.push(candidate.label+": "+(error&&error.message?error.message:String(error)));
        setTimeout(next,120);
      }
    }

    next();
  }

  async function runRender(text,opts,myGen){
    if(!renderAvailable||myGen!==generation){
      runWebSequence(text,opts,myGen,"render_unavailable");
      return;
    }

    const cooling=lastRenderFailureAt>0&&(Date.now()-lastRenderFailureAt)<RENDER_RETRY_COOLDOWN_MS;
    if(cooling&&!opts.forceRenderProbe){
      runWebSequence(text,opts,myGen,"render_retry_cooldown");
      return;
    }

    try{
      emit("preparing-render");
      await renderVoice.prepare();
      if(myGen!==generation)return;
      emit("generating-render");
      await renderVoice.speak(text,{
        onstart:meta=>{
          if(myGen!==generation)return;
          lastRenderFailureAt=0;
          lastRenderFailureReason="";
          activeEngine="render";
          lastOutcome={ok:true,reason:"started",engine:"render",time:Date.now()};
          emit("speaking",{voice:"voix française Render",engine:"render"});
          if(typeof opts.onstart==="function")opts.onstart({voice:"voix française Render",engine:"render",mode:"server",...(meta||{})});
        },
        onend:meta=>{
          if(myGen!==generation)return;
          lastOutcome={ok:true,reason:"ended",engine:"render",time:Date.now()};
          activeEngine="none";
          emit("idle",{voice:"voix française Render",engine:"render"});
          indicator();
          if(typeof opts.onend==="function")opts.onend({voice:"voix française Render",engine:"render",mode:"server",...(meta||{})});
        }
      });
    }catch(error){
      if(myGen!==generation)return;
      const reason=error&&error.message?error.message:String(error||"render_failed");
      const name=error&&error.name?String(error.name):"";
      const autoplay=/NotAllowed|gesture|user.*interact|play\(\).*failed/i.test(name+" "+reason);
      if(!autoplay){
        lastRenderFailureAt=Date.now();
        lastRenderFailureReason=reason;
      }
      if(opts.naturalOnlyUntilGesture){
        failFinal(opts,myGen,reason,"render");
        return;
      }
      runWebSequence(text,opts,myGen,reason);
    }
  }

  function run(text,options){
    const clean=String(text||"").replace(/\s+/g," ").trim();
    if(!clean||!available)return false;
    const opts=options||{};
    const myGen=++generation;

    if(renderAvailable){
      runRender(clean,opts,myGen);
      return true;
    }
    runWebSequence(clean,opts,myGen,"render_unavailable");
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
      try{if(renderAvailable)renderVoice.stop()}catch(_){}
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
    let renderStatus=null;
    let fallbackStatus=null;
    try{renderStatus=renderAvailable&&typeof renderVoice.status==="function"?renderVoice.status():null}catch(_){}
    try{fallbackStatus=fallbackAvailable&&typeof fallback.status==="function"?fallback.status():null}catch(_){}
    return {
      version:"v188",
      available,
      renderAvailable,
      renderReady:!!(renderStatus&&renderStatus.ready),
      webAvailable,
      fallbackAvailable,
      fallbackReady:!!(fallbackStatus&&fallbackStatus.ready),
      activeEngine,
      recognitionActive,
      queued:!!queued,
      voiceCount:list.length,
      frenchVoiceCount:list.filter(v=>String(v.lang||"").toLowerCase().startsWith("fr")).length,
      localFrenchVoiceCount:list.filter(v=>v.localService===true&&String(v.lang||"").toLowerCase().startsWith("fr")).length,
      lastRenderFailureReason,
      lastWebFailureReason,
      lastOutcome:{...lastOutcome},
      last:{...lastStatus},
      renderStatus,
      fallbackStatus
    };
  }

  function testDetailed(timeoutMs){
    return new Promise(resolve=>{
      if(!available){resolve({ok:false,reason:"unavailable",status:status()});return}
      let done=false;
      const finish=x=>{if(!done){done=true;resolve(x)}};
      const ok=speak("Assistance vocale Libcomlair activée.",{
        rate:0.9,
        forceRenderProbe:true,
        forceWebProbe:true,
        onstart:meta=>finish({ok:true,reason:"started",meta,status:status()}),
        onerror:e=>finish({ok:false,reason:e&&e.error?e.error:"voice_failed",meta:e,status:status()})
      });
      if(!ok){finish({ok:false,reason:"speak_returned_false",status:status()});return}
      setTimeout(()=>finish({ok:false,reason:"test_timeout",status:status()}),Number(timeoutMs)||120000);
    });
  }

  function test(){
    return speak("Assistance vocale Libcomlair activée.",{rate:0.9,forceRenderProbe:true,forceWebProbe:true});
  }

  indicator();
  window.LibcomlairVoice={
    version:"v188",
    available,
    speak,
    cancel,
    test,
    testDetailed,
    setRecognitionActive,
    isRecognitionActive:()=>recognitionActive,
    status,
    prepareRender:()=>renderAvailable?renderVoice.prepare():Promise.reject(new Error("render_unavailable")),
    prepareFallback:()=>fallbackAvailable?fallback.prepare():Promise.reject(new Error("fallback_unavailable"))
  };
})();