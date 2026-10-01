(function(){
  "use strict";

  const renderVoice=window.LibcomlairRenderVoice;
  const renderAvailable=!!(renderVoice&&typeof renderVoice.speak==="function"&&typeof renderVoice.prepare==="function");

  let recognitionActive=false;
  let queued=null;
  let generation=0;
  let requestSerial=0;
  let activeRequestId="";
  let activeEngine="none";
  let lastStatus={state:"idle",engine:"none",error:"",time:0,requestId:""};
  let lastOutcome={ok:null,reason:"",engine:"none",time:0,requestId:""};

  function normalizeSpeechText(text){
    return String(text||"").replace(/\bLibcomlair\b/gi,"Lib comme l’air");
  }

  function indicator(){
    const el=document.getElementById("voiceEngineMode");
    if(!el)return;
    if(recognitionActive){el.textContent="Voix Libcomlair : microphone actif.";return}
    if(lastStatus.state==="queued"){el.textContent="Voix Libcomlair : réponse en attente de la fin du microphone.";return}
    if(lastStatus.state==="preparing-render"){el.textContent="Voix dynamique externe : préparation en cours…";return}
    if(lastStatus.state==="generating-render"){el.textContent="Voix dynamique externe : génération en cours…";return}
    if(lastStatus.state==="speaking"){el.textContent="Voix Libcomlair : lecture en cours.";return}
    if(lastOutcome.ok===true){el.textContent="Voix Libcomlair : dernière lecture réussie.";return}
    if(lastOutcome.ok===false){el.textContent="Voix dynamique externe indisponible. Navigation locale disponible.";return}
    el.textContent=renderAvailable?"Voix dynamique externe prête. Pack vocal local en cours d’intégration.":"Voix dynamique externe indisponible. Navigation locale disponible.";
  }

  function emit(state,extra){
    lastStatus={state,engine:activeEngine,error:"",time:Date.now(),requestId:activeRequestId,...(extra||{})};
    indicator();
    try{window.dispatchEvent(new CustomEvent("libcomlair-voice-status",{detail:{...lastStatus}}))}catch(_){}
  }

  function cancel(){
    generation++;
    queued=null;
    const requestId=activeRequestId;
    activeRequestId="";
    try{if(renderAvailable)renderVoice.stop({requestId})}catch(_){}
    activeEngine="none";
    emit("idle",{reason:"cancelled",requestId});
  }

  function fail(opts,myGen,requestId,reason){
    if(myGen!==generation)return;
    if(activeRequestId===requestId)activeRequestId="";
    activeEngine="none";
    lastOutcome={ok:false,reason:String(reason||"external_voice_failed"),engine:"render",time:Date.now(),requestId};
    emit("error",{error:lastOutcome.reason,engine:"render",requestId});
    try{opts.onerror?.({error:lastOutcome.reason,engine:"render",requestId})}catch(_){}
  }

  function warmRenderInBackground(){
    try{
      const task=renderVoice.prepare();
      Promise.resolve(task).catch(()=>{});
      return true;
    }catch(_){return false}
  }

  async function runRender(text,opts,myGen,requestId){
    if(!renderAvailable||myGen!==generation){fail(opts,myGen,requestId,"render_unavailable");return}
    try{
      warmRenderInBackground();
      if(myGen!==generation||activeRequestId!==requestId)return;

      emit("generating-render",{requestId,prepareMode:"background"});
      await renderVoice.speak(text,{
        requestId,
        onstart:meta=>{
          if(myGen!==generation||activeRequestId!==requestId)return;
          activeEngine=meta?.engine||"render";
          lastOutcome={ok:true,reason:"started",engine:meta?.engine||"render",time:Date.now(),requestId};
          emit("speaking",{voice:"voix Libcomlair",engine:meta?.engine||"render",mode:meta?.mode||"server",requestId});
          try{opts.onstart?.({voice:"voix Libcomlair",engine:"render",mode:"server",requestId,...(meta||{})})}catch(_){}
        },
        onend:meta=>{
          if(myGen!==generation||activeRequestId!==requestId)return;
          lastOutcome={ok:true,reason:"ended",engine:meta?.engine||"render",time:Date.now(),requestId};
          activeRequestId="";
          activeEngine="none";
          emit("idle",{voice:"voix Libcomlair",engine:meta?.engine||"render",mode:meta?.mode||"server",requestId});
          indicator();
          try{opts.onend?.({voice:"voix Libcomlair",engine:"render",mode:"server",requestId,...(meta||{})})}catch(_){}
        }
      });
    }catch(error){
      if(myGen!==generation)return;
      const reason=error?.message?error.message:String(error||"render_failed");
      if(reason==="Lecture annulée."){
        if(activeRequestId===requestId)activeRequestId="";
        activeEngine="none";
        emit("idle",{reason:"cancelled",requestId});
        return;
      }
      fail(opts,myGen,requestId,reason);
    }
  }

  function run(text,options){
    const clean=normalizeSpeechText(text).replace(/\s+/g," ").trim();
    if(!clean||!renderAvailable)return false;
    const opts=options||{};
    const myGen=++generation;
    const requestId="voice-"+(++requestSerial);
    activeRequestId=requestId;
    runRender(clean,opts,myGen,requestId);
    return true;
  }

  function speak(text,options){
    const clean=String(text||"").trim();
    if(!clean||!renderAvailable)return false;
    if(recognitionActive){queued={text:clean,options:options||{}};emit("queued",{});return true}
    return run(clean,options);
  }

  function setRecognitionActive(value){
    recognitionActive=!!value;
    if(recognitionActive){
      const requestId=activeRequestId;
      activeRequestId="";
      try{if(renderAvailable)renderVoice.stop({requestId})}catch(_){}
      emit("listening",{requestId});
      return;
    }
    emit("idle",{});
    if(queued){const q=queued;queued=null;setTimeout(()=>run(q.text,q.options),80)}
  }

  function status(){
    let renderStatus=null;
    try{renderStatus=renderAvailable&&typeof renderVoice.status==="function"?renderVoice.status():null}catch(_){}
    return {version:"v191.2-local-first-status",available:renderAvailable,renderAvailable,renderReady:!!renderStatus?.ready,prepareBlocksSpeak:false,activeEngine,activeRequestId,recognitionActive,queued:!!queued,voiceCount:0,frenchVoiceCount:0,localFrenchVoiceCount:0,pronunciationRules:{Libcomlair:"Lib comme l’air"},lastOutcome:{...lastOutcome},last:{...lastStatus},renderStatus};
  }

  function testDetailed(timeoutMs){
    return new Promise(resolve=>{
      if(!renderAvailable){resolve({ok:false,reason:"render_unavailable",status:status()});return}
      let done=false;
      const finish=x=>{if(!done){done=true;resolve(x)}};
      const ok=speak("Assistance vocale Libcomlair activée.",{onstart:meta=>finish({ok:true,reason:"started",meta,status:status()}),onerror:e=>finish({ok:false,reason:e?.error||"render_failed",meta:e,status:status()})});
      if(!ok){finish({ok:false,reason:"speak_returned_false",status:status()});return}
      setTimeout(()=>finish({ok:false,reason:"test_timeout",status:status()}),Number(timeoutMs)||60000);
    });
  }

  function test(){return speak("Assistance vocale Libcomlair activée.")}

  indicator();
  window.LibcomlairVoice={version:"v191.2-local-first-status",available:renderAvailable,speak,cancel,test,testDetailed,setRecognitionActive,isRecognitionActive:()=>recognitionActive,status,prepareRender:()=>renderAvailable?renderVoice.prepare():Promise.reject(new Error("render_unavailable"))};
})();