(function(){
  "use strict";

  const API_BASE="https://libcomlair-backend.onrender.com";
  const STATUS_URL=API_BASE+"/api/tts/azure-v1/status";
  const TTS_URL=API_BASE+"/api/tts/azure-v1";

  let audioContext=null;
  let currentSource=null;
  let currentSourceRequestId="";
  let currentReject=null;
  let currentRejectRequestId="";
  let prepared=false;
  let preparePromise=null;
  let requestSerial=0;
  let activeRequestId="";
  const audioCache=new Map();
  const decodeCache=new Map();
  let last={state:"idle",error:"",time:0,provider:"azure-speech",requestId:""};

  function emit(state,extra){
    last={state,error:"",time:Date.now(),provider:"azure-speech",requestId:activeRequestId,...(extra||{})};
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
      if(ok)["pointerdown","touchstart","keydown","click"].forEach(type=>document.removeEventListener(type,gestureUnlock,true));
    }).catch(()=>{});
  }
  ["pointerdown","touchstart","keydown","click"].forEach(type=>document.addEventListener(type,gestureUnlock,true));

  async function checkStatus(){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),75000);
    try{
      const response=await fetch(STATUS_URL,{method:"GET",headers:{Accept:"application/json"},signal:controller.signal,cache:"no-store"});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data.configured)throw new Error(data?.error?String(data.error):"azure_tts_unavailable_"+response.status);
      prepared=true;
      emit("ready",{voice:data.voice||"voix française Azure"});
      return data;
    }finally{clearTimeout(timer)}
  }

  function prepare(){
    if(prepared)return Promise.resolve(true);
    if(preparePromise)return preparePromise;
    emit("warming");
    preparePromise=checkStatus().then(()=>{prepared=true;return true}).catch(error=>{preparePromise=null;throw error});
    return preparePromise;
  }

  function stopSource(requestId){
    if(!currentSource)return false;
    if(requestId&&currentSourceRequestId&&requestId!==currentSourceRequestId)return false;
    try{currentSource.onended=null;currentSource.stop(0)}catch(_){}
    try{currentSource.disconnect()}catch(_){}
    currentSource=null;
    currentSourceRequestId="";
    return true;
  }

  async function fetchAudio(text){
    const cacheKey=String(text||"").replace(/\s+/g," ").trim();
    if(audioCache.has(cacheKey))return audioCache.get(cacheKey);
    const task=(async()=>{
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),90000);
      try{
        emit("requesting",{chars:cacheKey.length});
        const response=await fetch(TTS_URL,{method:"POST",headers:{"Content-Type":"application/json",Accept:"audio/mpeg"},body:JSON.stringify({text:cacheKey}),signal:controller.signal,cache:"no-store"});
        if(!response.ok){
          let reason="azure_tts_http_"+response.status;
          try{const data=await response.json();if(data?.error)reason=String(data.error)}catch(_){}
          throw new Error(reason);
        }
        const buffer=await response.arrayBuffer();
        if(!buffer||buffer.byteLength<500)throw new Error("azure_tts_empty_audio");
        return {buffer,cacheKey,voice:response.headers.get("X-Libcomlair-TTS-Voice")||"voix française Azure",cache:response.headers.get("X-Libcomlair-TTS-Cache")||""};
      }finally{clearTimeout(timer)}
    })();
    audioCache.set(cacheKey,task);
    try{return await task}catch(error){audioCache.delete(cacheKey);throw error}
  }

  function assertActive(requestId){
    if(!requestId||activeRequestId!==requestId)throw new Error("Lecture annulée.");
  }

  async function playBuffer(buffer,meta,opts,requestId){
    const ctx=getAudioContext();
    if(!ctx)throw new Error("Web Audio indisponible.");
    if(ctx.state!=="running"){
      const ok=await unlockAudio();
      if(!ok)throw new Error("Audio Android verrouillé. Appuyez une fois sur l’écran puis réessayez.");
    }
    assertActive(requestId);
    emit("decoding",{voice:meta.voice,requestId});
    let decoded=decodeCache.get(meta.cacheKey);
    if(!decoded){decoded=await ctx.decodeAudioData(meta.buffer.slice(0));decodeCache.set(meta.cacheKey,decoded)}
    assertActive(requestId);

    stopSource();
    const source=ctx.createBufferSource();
    currentSource=source;
    currentSourceRequestId=requestId;
    source.buffer=decoded;
    source.connect(ctx.destination);

    return await new Promise((resolve,reject)=>{
      let settled=false;
      currentRejectRequestId=requestId;
      currentReject=reason=>{
        if(settled)return;
        settled=true;
        reject(reason instanceof Error?reason:new Error(String(reason||"Lecture annulée.")));
      };
      source.onended=()=>{
        if(settled)return;
        settled=true;
        if(currentRejectRequestId===requestId){currentReject=null;currentRejectRequestId=""}
        if(currentSource===source){currentSource=null;currentSourceRequestId=""}
        try{source.disconnect()}catch(_){}
        if(activeRequestId!==requestId)return resolve({ok:false,cancelled:true,requestId});
        activeRequestId="";
        emit("ended",{voice:meta.voice,cache:meta.cache,requestId});
        try{opts.onend?.({voice:meta.voice,engine:"azure-speech",mode:"server",requestId})}catch(_){}
        resolve({ok:true,voice:meta.voice,engine:"azure-speech",mode:"server",requestId});
      };
      try{
        source.start(0);
        emit("speaking",{voice:meta.voice,cache:meta.cache,audioState:ctx.state,requestId});
        try{opts.onstart?.({voice:meta.voice,engine:"azure-speech",mode:"server",requestId})}catch(_){}
      }catch(error){
        settled=true;
        if(currentRejectRequestId===requestId){currentReject=null;currentRejectRequestId=""}
        if(currentSource===source){currentSource=null;currentSourceRequestId=""}
        try{source.disconnect()}catch(_){}
        reject(error);
      }
    });
  }

  async function prefetch(text){
    const clean=String(text||"").replace(/\s+/g," ").trim();
    if(!clean)return false;
    await prepare();
    const meta=await fetchAudio(clean);
    const ctx=getAudioContext();
    if(ctx&&!decodeCache.has(meta.cacheKey)){
      try{decodeCache.set(meta.cacheKey,await ctx.decodeAudioData(meta.buffer.slice(0)))}catch(_){}
    }
    emit("prefetched",{chars:clean.length});
    return true;
  }

  async function speak(text,options){
    const clean=String(text||"").replace(/\s+/g," ").trim();
    if(!clean)throw new Error("Texte vocal vide.");
    const opts=options||{};
    const requestId=String(opts.requestId||("azure-"+(++requestSerial)));
    activeRequestId=requestId;

    const ctx=getAudioContext();
    if(!ctx||ctx.state!=="running"){
      const ok=await unlockAudio();
      if(!ok)throw new Error("Audio Android verrouillé. Appuyez sur un bouton de l’application puis réessayez.");
    }

    try{
      const meta=await fetchAudio(clean);
      assertActive(requestId);
      return await playBuffer(meta.buffer,meta,opts,requestId);
    }catch(error){
      if(activeRequestId===requestId)activeRequestId="";
      const reason=error?.name==="AbortError"?"azure_tts_timeout":error?.message?error.message:String(error||"azure_tts_error");
      emit(reason==="Lecture annulée."?"cancelled":"error",{error:reason,requestId});
      try{opts.onerror?.(error)}catch(_){}
      throw error;
    }
  }

  function stop(options){
    const requested=typeof options==="string"?options:String(options?.requestId||activeRequestId||currentSourceRequestId||"");
    if(requested&&activeRequestId&&requested!==activeRequestId){
      emit("stale-stop-ignored",{requestId:requested,activeRequestId});
      return false;
    }
    const reject=(currentRejectRequestId&&(!requested||currentRejectRequestId===requested))?currentReject:null;
    if(reject){currentReject=null;currentRejectRequestId=""}
    stopSource(requested);
    if(!requested||activeRequestId===requested)activeRequestId="";
    emit("stopped",{requestId:requested});
    if(reject)reject(new Error("Lecture annulée."));
    return true;
  }

  function status(){
    const ctx=getAudioContext();
    return {version:"azure-v200-v196-gesture-restored",ready:prepared,audioState:ctx?ctx.state:"none",endpoint:TTS_URL,activeRequestId,currentSourceRequestId,last:{...last}};
  }

  window.LibcomlairRenderVoice=Object.freeze({version:"azure-v200-v196-gesture-restored",prepare,prefetch,speak,stop,unlockAudio,status});
  prepare().catch(()=>{});
})();