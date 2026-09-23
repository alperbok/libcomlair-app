(function(){
  "use strict";
  const synth=window.speechSynthesis;
  const available=!!synth&&typeof window.SpeechSynthesisUtterance==="function";
  let current=null;
  let recognitionActive=false;
  let lastStatus={state:"idle",error:"",started:false,ended:false,time:0};

  function emit(state,extra){
    lastStatus={state,error:"",started:false,ended:false,time:Date.now(),...(extra||{})};
    try{window.dispatchEvent(new CustomEvent("libcomlair-voice-status",{detail:{...lastStatus}}))}catch(_){}
  }

  function cancel(){
    current=null;
    if(!available)return;
    try{synth.cancel()}catch(_){}
    emit("cancelled");
  }

  function speak(text,options){
    const clean=String(text||"").trim();
    if(!available||!clean)return false;
    const opts=options||{};
    try{
      synth.cancel();
      const u=new SpeechSynthesisUtterance(clean);
      current=u;
      window.__libcomlairVoiceUtterance=u;
      u.lang="fr-FR";
      u.rate=Number.isFinite(opts.rate)?opts.rate:0.9;
      u.volume=1;
      u.pitch=1;
      u.onstart=()=>{
        emit("started",{started:true,text:clean.slice(0,120)});
        if(typeof opts.onstart==="function")opts.onstart();
      };
      u.onend=()=>{
        current=null;
        emit("ended",{started:true,ended:true,text:clean.slice(0,120)});
        if(typeof opts.onend==="function")opts.onend();
      };
      u.onerror=e=>{
        current=null;
        const error=e&&e.error?String(e.error):"speech_error";
        emit("error",{error,text:clean.slice(0,120)});
        if(typeof opts.onerror==="function")opts.onerror(e);
      };
      // Important Samsung Internet: call speak synchronously in the user/event handler.
      synth.speak(u);
      return true;
    }catch(e){
      emit("error",{error:String(e&&e.message||e||"speech_exception")});
      return false;
    }
  }

  function test(){
    return speak("Assistance vocale Libcomlair activée.",{rate:0.9});
  }

  function testDetailed(timeoutMs){
    return new Promise(resolve=>{
      if(!available){
        resolve({ok:false,reason:"unavailable",status:status()});
        return;
      }
      let settled=false;
      const finish=result=>{
        if(settled)return;
        settled=true;
        resolve(result);
      };
      const ok=speak("Assistance vocale Libcomlair activée.",{
        rate:0.9,
        onstart:()=>finish({ok:true,reason:"started",status:status()}),
        onerror:e=>finish({ok:false,reason:(e&&e.error)||"error",status:status()})
      });
      if(!ok){
        finish({ok:false,reason:"speak_returned_false",status:status()});
        return;
      }
      setTimeout(()=>finish({
        ok:false,
        reason:"no_start_event",
        status:status(),
        synthState:{
          speaking:!!synth.speaking,
          pending:!!synth.pending,
          paused:!!synth.paused
        }
      }),Number(timeoutMs)||1800);
    });
  }

  function setRecognitionActive(active){
    recognitionActive=!!active;
    emit(recognitionActive?"listening":"idle",{recognitionActive});
  }

  function status(){
    let voiceCount=0;
    try{voiceCount=typeof synth.getVoices==="function"?synth.getVoices().length:0}catch(_){}
    return {
      available,
      recognitionActive,
      speaking:available?!!synth.speaking:false,
      pending:available?!!synth.pending:false,
      paused:available?!!synth.paused:false,
      voiceCount,
      last:{...lastStatus}
    };
  }

  window.LibcomlairVoice={
    version:"v176",
    available,
    speak,
    cancel,
    test,
    testDetailed,
    setRecognitionActive,
    isRecognitionActive:()=>recognitionActive,
    status
  };
})();