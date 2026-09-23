(function(){
  "use strict";
  const synth=window.speechSynthesis;
  const available=!!synth&&typeof window.SpeechSynthesisUtterance==="function";
  let current=null;
  let recognitionActive=false;
  let pendingText="";
  let pendingOptions=null;
  let generation=0;
  let lastStatus={state:"idle",error:"",time:0};

  function emit(state,extra){
    lastStatus={state,error:"",time:Date.now(),...(extra||{})};
    try{window.dispatchEvent(new CustomEvent("libcomlair-voice-status",{detail:{...lastStatus}}))}catch(_){}
  }

  function cancel(){
    generation++;
    current=null;
    pendingText="";
    pendingOptions=null;
    if(!available)return;
    try{synth.cancel()}catch(_){}
    emit("cancelled");
  }

  function makeUtterance(text,opts,myGeneration,onStart,onEnd,onError){
    const u=new SpeechSynthesisUtterance(text);
    current=u;
    window.__libcomlairVoiceUtterance=u;
    u.lang="fr-FR";
    u.rate=Number.isFinite(opts.rate)?opts.rate:0.9;
    u.volume=1;
    u.pitch=1;
    u.onstart=()=>{
      if(myGeneration!==generation)return;
      emit("started",{text:text.slice(0,120)});
      onStart&&onStart();
    };
    u.onend=()=>{
      if(myGeneration!==generation)return;
      current=null;
      emit("ended",{text:text.slice(0,120)});
      onEnd&&onEnd();
    };
    u.onerror=e=>{
      if(myGeneration!==generation)return;
      current=null;
      const error=e&&e.error?String(e.error):"speech_error";
      emit("error",{error,text:text.slice(0,120)});
      onError&&onError(e);
    };
    return u;
  }

  function speakNow(text,options){
    const clean=String(text||"").trim();
    if(!available||!clean)return false;
    const opts=options||{};
    const myGeneration=++generation;

    try{
      // Avoid Samsung's cancel->speak race when the synthesizer is already idle.
      if(synth.speaking||synth.pending){
        try{synth.cancel()}catch(_){}
      }
      const u=makeUtterance(
        clean,
        opts,
        myGeneration,
        ()=>{if(typeof opts.onstart==="function")opts.onstart()},
        ()=>{if(typeof opts.onend==="function")opts.onend()},
        e=>{if(typeof opts.onerror==="function")opts.onerror(e)}
      );
      // Direct call: keep the user gesture for buttons such as "Tester l'assistance vocale".
      synth.speak(u);
      return true;
    }catch(e){
      emit("error",{error:String(e&&e.message||e||"speech_exception")});
      if(typeof opts.onerror==="function")opts.onerror(e);
      return false;
    }
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
    return speakNow(clean,options);
  }

  function flushPending(){
    if(recognitionActive||!pendingText)return;
    const text=pendingText;
    const opts=pendingOptions||{};
    pendingText="";
    pendingOptions=null;
    // Microphone is now fully closed; do not cancel again before this response.
    speakNow(text,opts);
  }

  function setRecognitionActive(active){
    recognitionActive=!!active;
    if(recognitionActive){
      // Stop any old speech before listening, but keep future responses queued.
      try{if(synth.speaking||synth.pending)synth.cancel()}catch(_){}
      emit("listening",{recognitionActive:true});
      return;
    }
    emit("idle",{recognitionActive:false});
    flushPending();
  }

  function test(){
    return speakNow("Assistance vocale Libcomlair activée.",{rate:0.9});
  }

  function testDetailed(timeoutMs){
    return new Promise(resolve=>{
      if(!available){
        resolve({ok:false,reason:"unavailable",status:status()});
        return;
      }
      let settled=false;
      let fallbackTried=false;
      const finish=result=>{
        if(settled)return;
        settled=true;
        resolve(result);
      };
      const onStart=()=>finish({ok:true,reason:"start_event",status:status()});
      const onError=e=>finish({ok:false,reason:(e&&e.error)||"speech_error",status:status()});
      const ok=speakNow("Assistance vocale Libcomlair activée.",{rate:0.9,onstart:onStart,onerror:onError});
      if(!ok){
        finish({ok:false,reason:"speak_returned_false",status:status()});
        return;
      }

      const startedAt=Date.now();
      const poll=setInterval(()=>{
        if(settled){clearInterval(poll);return}
        try{
          if(synth.speaking){
            clearInterval(poll);
            finish({ok:true,reason:"synth_speaking",status:status()});
            return;
          }
        }catch(_){}
        if(!fallbackTried&&Date.now()-startedAt>650){
          fallbackTried=true;
          // Some Android/Samsung builds accept the utterance but remain paused.
          try{if(typeof synth.resume==="function")synth.resume()}catch(_){}
        }
      },100);

      setTimeout(()=>{
        clearInterval(poll);
        finish({
          ok:false,
          reason:"no_speech_started",
          status:status(),
          synthState:{
            speaking:!!synth.speaking,
            pending:!!synth.pending,
            paused:!!synth.paused
          }
        });
      },Number(timeoutMs)||2000);
    });
  }

  function status(){
    let voiceCount=0;
    try{voiceCount=typeof synth.getVoices==="function"?synth.getVoices().length:0}catch(_){}
    return {
      available,
      recognitionActive,
      pendingResponse:!!pendingText,
      speaking:available?!!synth.speaking:false,
      pending:available?!!synth.pending:false,
      paused:available?!!synth.paused:false,
      voiceCount,
      last:{...lastStatus}
    };
  }

  window.LibcomlairVoice={
    version:"v177",
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