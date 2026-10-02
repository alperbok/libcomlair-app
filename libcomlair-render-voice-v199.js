(function(){
  "use strict";

  const API_BASE="https://libcomlair-backend.onrender.com";
  const PRIMARY_STATUS_URL=API_BASE+"/api/tts/azure-v1/status";
  const PRIMARY_TTS_URL=API_BASE+"/api/tts/azure-v1";
  const FALLBACK_STATUS_URL=API_BASE+"/api/tts/v181/status";
  const FALLBACK_TTS_URL=API_BASE+"/api/tts/v181";

  let audioContext=null;
  let currentSource=null;
  let currentSourceRequestId="";
  let currentReject=null;
  let currentRejectRequestId="";
  let prepared=false;
  let preparePromise=null;
  let requestSerial=0;
  let activeRequestId="";
  let adoptedEarlyContext=false;
  const audioCache=new Map();
  const decodeCache=new Map();
  let last={state:"idle",error:"",time:0,provider:"render",requestId:""};

  function emit(state,extra){
    last={state,error:"",time:Date.now(),provider:"render",requestId:activeRequestId,...(extra||{})};
    try{window.dispatchEvent(new CustomEvent("libcomlair-render-voice-status",{detail:{...last}}))}catch(_){}
  }

  function welcomeVisible(){
    const el=document.getElementById("libcomlairSplash");
    if(!el||el.hidden||el.hasAttribute("hidden")||el.getAttribute("aria-hidden")==="true")return false;
    try{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0}catch(_){return true}
  }

  function getAudioContext(){
    if(welcomeVisible()){
      emit("audio-deferred-welcome",{audioState:"none",adoptedEarlyContext:false});
      return null;
    }
    const AC=window.AudioContext||window.webkitAudioContext;
    if(typeof AC!=="function")return null;
    if(!audioContext){
      const early=window.__libcomlairEarlyAudioContext;
      if(early&&typeof early.createBufferSource==="function"&&early.state!=="closed"){
        audioContext=early;
        adoptedEarlyContext=true;
        emit("early-audio-adopted",{audioState:audioContext.state});
      }else{
        audioContext=new AC();
      }
    }
    return audioContext;
  }

  async function unlockAudio(){
    const ctx=getAudioContext();
    if(!ctx){
      if(welcomeVisible())return false;
      throw new Error("Web Audio indisponible.");
    }
    try{if(ctx.state!=="running")await ctx.resume()}catch(_){}
    const ok=ctx.state==="running";
    emit(ok?"audio-ready":"audio-locked",{audioState:ctx.state,adoptedEarlyContext});
    return ok;
  }

  function gestureUnlock(){
    if(welcomeVisible())return;
    unlockAudio().then(ok=>{
      if(ok)["pointerdown","touchstart","keydown","click"].forEach(type=>document.removeEventListener(type,gestureUnlock,true));
    }).catch(()=>{});
  }
  ["pointerdown","touchstart","keydown","click"].forEach(type=>document.addEventListener(type,gestureUnlock,true));

  async function fetchStatus(url,provider){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),75000);
    try{
      const response=await fetch(url,{method:"GET",headers:{Accept:"application/json"},signal:controller.signal,cache:"no-store"});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data.configured)throw new Error(data?.error?String(data.error):provider+"_tts_unavailable_"+response.status);
      return {...data,provider:data.provider||provider};
    }finally{clearTimeout(timer)}
  }

  async function checkStatus(){
    let data;
    try{
      data=await fetchStatus(PRIMARY_STATUS_URL,"azure-speech");
    }catch(primaryError){
      emit("primary-unavailable",{error:String(primaryError?.message||primaryError),provider:"azure-speech"});
      data=await fetchStatus(FALLBACK_STATUS_URL,"render-fallback");
    }
    prepared=true;
    emit("ready",{voice:data.voice||"voix française serveur",provider:data.provider||"unknown",audioState:audioContext?.state||"none",adoptedEarlyContext});
    return data;
  }

  function prepare(){
    if(prepared)return Promise.resolve(true);
    if(preparePromise)return preparePromise;
    getAudioContext();
    emit("warming",{audioState:audioContext?.state||"none",adoptedEarlyContext});
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

  async function requestAudio(url,provider,cacheKey){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),90000);
    try{
      emit("requesting",{chars:cacheKey.length,provider,adoptedEarlyContext});
      const response=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json",Accept:"audio/mpeg"},body:JSON.stringify({text:cacheKey}),signal:controller.signal,cache:"no-store"});
      if(!response.ok){
        let reason=provider+"_tts_http_"+response.status;
        try{const data=await response.json();if(data?.error)reason=String(data.error)}catch(_){}
        throw new Error(reason);
      }
      const buffer=await response.arrayBuffer();
      if(!buffer||buffer.byteLength<500)throw new Error(provider+"_tts_empty_audio");
      return {buffer,cacheKey,provider:response.headers.get("X-Libcomlair-TTS-Provider")||provider,voice:response.headers.get("X-Libcomlair-TTS-Voice")||"voix française serveur",cache:response.headers.get("X-Libcomlair-TTS-Cache")||""};
    }finally{clearTimeout(timer)}
  }

  async function fetchAudio(text){
    const cacheKey=String(text||"").replace(/\s+/g," ").trim();
    if(audioCache.has(cacheKey))return audioCache.get(cacheKey);
    const task=(async()=>{
      try{
        return await requestAudio(PRIMARY_TTS_URL,"azure-speech",cacheKey);
      }catch(primaryError){
        emit("fallback",{error:String(primaryError?.message||primaryError),from:"azure-speech",to:"render-fallback",chars:cacheKey.length,adoptedEarlyContext});
        return await requestAudio(FALLBACK_TTS_URL,"render-fallback",cacheKey);
      }
    })();
    audioCache.set(cacheKey,task);
    try{return await task}catch(error){audioCache.delete(cacheKey);throw error}
  }

  function assertActive(requestId){
    if(!requestId||activeRequestId!==requestId)throw new Error("Lecture annulée.");
  }

  async function playBuffer(buffer,meta,opts,requestId){
    const ctx=getAudioContext();
    if(!ctx)throw new Error(welcomeVisible()?"Web Audio désactivé sur l’accueil.":"Web Audio indisponible.");
    if(ctx.state!=="running"){
      const ok=await unlockAudio();
      if(!ok)throw new Error("Audio Android verrouillé. Appuyez une fois sur l’écran puis réessayez.");
    }
    assertActive(requestId);
    emit("decoding",{voice:meta.voice,requestId,adoptedEarlyContext});
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
        emit("ended",{voice:meta.voice,cache:meta.cache,requestId,adoptedEarlyContext});
        try{opts.onend?.({voice:meta.voice,engine:meta.provider||"server",mode:"server",requestId})}catch(_){}
        resolve({ok:true,voice:meta.voice,engine:meta.provider||"server",mode:"server",requestId});
      };
      try{
        source.start(0);
        emit("speaking",{voice:meta.voice,cache:meta.cache,audioState:ctx.state,requestId,adoptedEarlyContext});
        try{opts.onstart?.({voice:meta.voice,engine:meta.provider||"server",mode:"server",requestId})}catch(_){}
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
    emit("prefetched",{chars:clean.length,adoptedEarlyContext});
    return true;
  }

  async function speak(text,options){
    const clean=String(text||"").replace(/\s+/g," ").trim();
    if(!clean)throw new Error("Texte vocal vide.");
    const opts=options||{};
    const requestId=String(opts.requestId||("render-"+(++requestSerial)));
    activeRequestId=requestId;

    const ctx=getAudioContext();
    if(!ctx){
      if(welcomeVisible())throw new Error("Web Audio désactivé sur l’accueil.");
      throw new Error("Web Audio indisponible.");
    }
    if(ctx.state!=="running"){
      const ok=await unlockAudio();
      if(!ok)throw new Error("Audio Android verrouillé. Appuyez sur un bouton de l’application puis réessayez.");
    }

    try{
      const meta=await fetchAudio(clean);
      assertActive(requestId);
      return await playBuffer(meta.buffer,meta,opts,requestId);
    }catch(error){
      if(activeRequestId===requestId)activeRequestId="";
      const reason=error?.name==="AbortError"?"render_tts_timeout":error?.message?error.message:String(error||"render_tts_error");
      emit(reason==="Lecture annulée."?"cancelled":"error",{error:reason,requestId,adoptedEarlyContext});
      try{opts.onerror?.(error)}catch(_){}
      throw error;
    }
  }

  function stop(options){
    const requested=typeof options==="string"?options:String(options?.requestId||activeRequestId||currentSourceRequestId||"");
    if(requested&&activeRequestId&&requested!==activeRequestId){
      emit("stale-stop-ignored",{requestId:requested,activeRequestId,adoptedEarlyContext});
      return false;
    }
    const reject=(currentRejectRequestId&&(!requested||currentRejectRequestId===requested))?currentReject:null;
    if(reject){currentReject=null;currentRejectRequestId=""}
    stopSource(requested);
    if(!requested||activeRequestId===requested)activeRequestId="";
    emit("stopped",{requestId:requested,adoptedEarlyContext});
    if(reject)reject(new Error("Lecture annulée."));
    return true;
  }

  function status(){
    const ctx=audioContext;
    const early=window.__libcomlairEarlyAudioStatus||{};
    return {version:"azure-first-v199-lazy-welcome-blocked",ready:prepared,audioState:ctx?ctx.state:"none",welcomeBlocked:welcomeVisible(),endpoint:PRIMARY_TTS_URL,fallbackEndpoint:FALLBACK_TTS_URL,activeRequestId,currentSourceRequestId,adoptedEarlyContext,earlyAudio:{...early},last:{...last}};
  }

  window.LibcomlairRenderVoice=Object.freeze({version:"azure-first-v199-lazy-welcome-blocked",prepare,prefetch,speak,stop,unlockAudio,status});
  // Aucune création d'AudioContext ni préparation Render au chargement.
  // Tant que l'écran Bienvenue est visible, Web Audio reste explicitement désactivé.
})();