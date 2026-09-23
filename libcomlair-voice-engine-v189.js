(function(){
  "use strict";

  const renderVoice=window.LibcomlairRenderVoice;
  const renderAvailable=!!(renderVoice&&typeof renderVoice.speak==="function"&&typeof renderVoice.prepare==="function");

  let recognitionActive=false;
  let queued=null;
  let generation=0;
  let activeEngine="none";
  let lastStatus={state:"idle",engine:"none",error:"",time:0};
  let lastOutcome={ok:null,reason:"",engine:"none",time:0};

  function indicator(){
    const el=document.getElementById("voiceEngineMode");
    if(!el)return;
    if(recognitionActive){el.textContent="Moteur vocal : microphone actif.";return}
    if(lastStatus.state==="queued"){el.textContent="Moteur vocal : réponse en attente de la fin du microphone.";return}
    if(lastStatus.state==="preparing-render"){el.textContent="Moteur vocal : connexion à la voix naturelle Render…";return}
    if(lastStatus.state==="generating-render"){el.textContent="Moteur vocal : génération de la voix sur Render…";return}
    if(lastStatus.state==="speaking"){el.textContent="Moteur vocal : voix naturelle Render active.";return}
    if(lastOutcome.ok===true){el.textContent="Moteur vocal : voix naturelle Render validée.";return}
    if(lastOutcome.ok===false){el.textContent="Moteur vocal : Render indisponible — aucune voix robotique utilisée.";return}
    el.textContent=renderAvailable?"Moteur vocal : Render prêt.":"Moteur vocal : Render indisponible.";
  }

  function emit(state,extra){
    lastStatus={state,engine:activeEngine,error:"",time:Date.now(),...(extra||{})};
    indicator();
    try{window.dispatchEvent(new CustomEvent("libcomlair-voice-status",{detail:{...lastStatus}}))}catch(_){}
  }

  function cancel(){
    generation++;
    queued=null;
    try{if(renderAvailable)renderVoice.stop()}catch(_){}
    activeEngine="none";
    emit("idle",{reason:"cancelled"});
  }

  function fail(opts,myGen,reason){
    if(myGen!==generation)return;
    activeEngine="none";
    lastOutcome={ok:false,reason:String(reason||"render_failed"),engine:"render",time:Date.now()};
    emit("error",{error:lastOutcome.reason,engine:"render"});
    if(typeof opts.onerror==="function")opts.onerror({error:lastOutcome.reason,engine:"render"});
  }

  async function runRender(text,opts,myGen){
    if(!renderAvailable||myGen!==generation){
      fail(opts,myGen,"render_unavailable");
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
          activeEngine="render";
          lastOutcome={ok:true,reason:"started",engine:"render",time:Date.now()};
          emit("speaking",{voice:"voix naturelle Render",engine:"render"});
          if(typeof opts.onstart==="function")opts.onstart({voice:"voix naturelle Render",engine:"render",mode:"server",...(meta||{})});
        },
        onend:meta=>{
          if(myGen!==generation)return;
          lastOutcome={ok:true,reason:"ended",engine:"render",time:Date.now()};
          activeEngine="none";
          emit("idle",{voice:"voix naturelle Render",engine:"render"});
          indicator();
          if(typeof opts.onend==="function")opts.onend({voice:"voix naturelle Render",engine:"render",mode:"server",...(meta||{})});
        }
      });
    }catch(error){
      if(myGen!==generation)return;
      const reason=error&&error.message?error.message:String(error||"render_failed");
      fail(opts,myGen,reason);
    }
  }

  function run(text,options){
    const clean=String(text||"").replace(/\s+/g," ").trim();
    if(!clean||!renderAvailable)return false;
    const opts=options||{};
    const myGen=++generation;
    runRender(clean,opts,myGen);
    return true;
  }

  function speak(text,options){
    const clean=String(text||"").trim();
    if(!clean||!renderAvailable)return false;
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
    let renderStatus=null;
    try{renderStatus=renderAvailable&&typeof renderVoice.status==="function"?renderVoice.status():null}catch(_){}
    return {
      version:"v189",
      available:renderAvailable,
      renderAvailable,
      renderReady:!!(renderStatus&&renderStatus.ready),
      activeEngine,
      recognitionActive,
      queued:!!queued,
      voiceCount:0,
      frenchVoiceCount:0,
      localFrenchVoiceCount:0,
      lastOutcome:{...lastOutcome},
      last:{...lastStatus},
      renderStatus
    };
  }

  function testDetailed(timeoutMs){
    return new Promise(resolve=>{
      if(!renderAvailable){resolve({ok:false,reason:"render_unavailable",status:status()});return}
      let done=false;
      const finish=x=>{if(!done){done=true;resolve(x)}};
      const ok=speak("Assistance vocale Libcomlair activée.",{
        onstart:meta=>finish({ok:true,reason:"started",meta,status:status()}),
        onerror:e=>finish({ok:false,reason:e&&e.error?e.error:"render_failed",meta:e,status:status()})
      });
      if(!ok){finish({ok:false,reason:"speak_returned_false",status:status()});return}
      setTimeout(()=>finish({ok:false,reason:"test_timeout",status:status()}),Number(timeoutMs)||60000);
    });
  }

  function test(){
    return speak("Assistance vocale Libcomlair activée.");
  }

  indicator();
  window.LibcomlairVoice={
    version:"v189",
    available:renderAvailable,
    speak,
    cancel,
    test,
    testDetailed,
    setRecognitionActive,
    isRecognitionActive:()=>recognitionActive,
    status,
    prepareRender:()=>renderAvailable?renderVoice.prepare():Promise.reject(new Error("render_unavailable"))
  };
})();