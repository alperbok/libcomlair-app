(function(){
  "use strict";

  const API_BASE="https://libcomlair-backend.onrender.com";
  const STATUS_URL=API_BASE+"/api/tts/v181/status";
  const TTS_URL=API_BASE+"/api/tts/v181";

  let audioContext=null;
  let currentSource=null;
  let generation=0;
  let currentReject=null;
  let prepared=false;
  let last={state:"idle",error:"",time:0,provider:"render"};

  function emit(state,extra){
    last={state,error:"",time:Date.now(),provider:"render",...(extra||{})};
    try{window.dispatchEvent(new CustomEvent("libcomlair-render-voice-status",{detail:{...last}}))}catch(_){}
  }

  function getAudioContext(){
    const AC=window.AudioContext||window.webkitAudioContext;
    if(typeof AC!=="function")return null;
    if(!audioContext)audioContext=new AC();
    return audioContext;
  }

  async function unlockAudio(){
    const ctx=getAudioContext();
    if(!ctx)throw new Error("Web Audio indisponible.");
    try{if(ctx.state!=="running")await ctx.resume()}catch(_){}
    const ok=ctx.state==="running";
    emit(ok?"audio-ready":"audio-locked",{audioState:ctx.state});
    return ok;
  }

  function gestureUnlock(){
    unlockAudio().then(ok=>{
      if(ok){
        ["pointerdown","touchstart","keydown","click"].forEach(type=>document.removeEventListener(type,gestureUnlock,true));
      }
    }).catch(()=>{});
  }
  ["pointerdown","touchstart","keydown","click"].forEach(type=>document.addEventListener(type,gestureUnlock,true));

  async function checkStatus(){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),12000);
    try{
      const response=await fetch(STATUS_URL,{method:"GET",headers:{Accept:"application/json"},signal:controller.signal,cache:"no-store"});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data.configured){
        const reason=data&&data.error?String(data.error):"render_tts_unavailable_"+response.status;
        throw new Error(reason);
      }
      prepared=true;
      emit("ready",{voice:data.voice||"voix française serveur"});
      return data;
    }finally{
      clearTimeout(timer);
    }
  }

  function prepare(){
    if(prepared)return Promise.resolve(true);
    return checkStatus().then(()=>true);
  }

  function stopSource(){
    if(currentSource){
      try{currentSource.onended=null;currentSource.stop(0)}catch(_){}
      try{currentSource.disconnect()}catch(_){}
      currentSource=null;
    }
  }

  async function fetchAudio(text){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),45000);
    try{
      emit("requesting",{chars:text.length});
      const response=await fetch(TTS_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json",Accept:"audio/mpeg"},
        body:JSON.stringify({text}),
        signal:controller.signal,
        cache:"no-store"
      });
      if(!response.ok){
        let reason="render_tts_http_"+response.status;
        try{
          const data=await response.json();
          if(data&&data.error)reason=String(data.error);
        }catch(_){}
        throw new Error(reason);
      }
      const buffer=await response.arrayBuffer();
      if(!buffer||buffer.byteLength<500)throw new Error("render_tts_empty_audio");
      return {
        buffer,
        voice:response.headers.get("X-Libcomlair-TTS-Voice")||"voix française serveur",
        cache:response.headers.get("X-Libcomlair-TTS-Cache")||""
      };
    }finally{
      clearTimeout(timer);
    }
  }

  async function playBuffer(buffer,meta,opts,myGen){
    const ctx=getAudioContext();
    if(!ctx)throw new Error("Web Audio indisponible.");
    if(ctx.state!=="running"){
      const ok=await unlockAudio();
      if(!ok)throw new Error("Audio Android verrouillé. Appuyez une fois sur l’écran puis réessayez.");
    }
    if(myGen!==generation)throw new Error("Lecture annulée.");

    emit("decoding",{voice:meta.voice});
    const decoded=await ctx.decodeAudioData(buffer.slice(0));
    if(myGen!==generation)throw new Error("Lecture annulée.");

    stopSource();
    const source=ctx.createBufferSource();
    currentSource=source;
    source.buffer=decoded;
    source.connect(ctx.destination);

    return await new Promise((resolve,reject)=>{
      let settled=false;
      currentReject=reason=>{
        if(settled)return;
        settled=true;
        reject(reason instanceof Error?reason:new Error(String(reason||"Lecture annulée.")));
      };

      source.onended=()=>{
        if(settled)return;
        settled=true;
        currentReject=null;
        if(currentSource===source)currentSource=null;
        try{source.disconnect()}catch(_){}
        if(myGen!==generation)return resolve({ok:false,cancelled:true});
        emit("ended",{voice:meta.voice,cache:meta.cache});
        if(typeof opts.onend==="function")opts.onend({voice:meta.voice,engine:"render",mode:"server"});
        resolve({ok:true,voice:meta.voice,engine:"render",mode:"server"});
      };

      try{
        source.start(0);
        emit("speaking",{voice:meta.voice,cache:meta.cache,audioState:ctx.state});
        if(typeof opts.onstart==="function")opts.onstart({voice:meta.voice,engine:"render",mode:"server"});
      }catch(error){
        settled=true;
        currentReject=null;
        if(currentSource===source)currentSource=null;
        try{source.disconnect()}catch(_){}
        reject(error);
      }
    });
  }

  async function speak(text,options){
    const clean=String(text||"").replace(/\s+/g," ").trim();
    if(!clean)throw new Error("Texte vocal vide.");
    const opts=options||{};
    const myGen=++generation;

    const ctx=getAudioContext();
    if(!ctx||ctx.state!=="running"){
      const ok=await unlockAudio();
      if(!ok)throw new Error("Audio Android verrouillé. Appuyez sur un bouton de l’application puis réessayez.");
    }

    try{
      const meta=await fetchAudio(clean);
      if(myGen!==generation)throw new Error("Lecture annulée.");
      return await playBuffer(meta.buffer,meta,opts,myGen);
    }catch(error){
      const reason=error&&error.name==="AbortError"?"render_tts_timeout":error&&error.message?error.message:String(error||"render_tts_error");
      emit("error",{error:reason});
      if(typeof opts.onerror==="function")opts.onerror(error);
      throw error;
    }
  }

  function stop(){
    generation++;
    const reject=currentReject;
    currentReject=null;
    stopSource();
    emit("stopped");
    if(reject)reject(new Error("Lecture annulée."));
  }

  function status(){
    const ctx=getAudioContext();
    return {
      version:"render-v188",
      ready:prepared,
      audioState:ctx?ctx.state:"none",
      endpoint:TTS_URL,
      last:{...last}
    };
  }

  window.LibcomlairRenderVoice=Object.freeze({
    version:"render-v188",
    prepare,
    speak,
    stop,
    unlockAudio,
    status
  });
})();