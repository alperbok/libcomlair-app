(()=>{
  "use strict";

  const VERSION="v224-2-azure-android-native-playback";
  const WELCOME_MESSAGE="Bienvenue dans Libcomlair. Ensemble, rendons les lieux accessibles plus faciles à trouver pour tous. Appuyez sur Suivant pour commencer.";
  const API_BASE="https://libcomlair-backend.onrender.com";
  const PRIMARY_URL=API_BASE+"/api/tts/azure-v1";
  const FALLBACK_URL=API_BASE+"/api/tts/v181";
  const NATIVE_MESSAGE_ID="welcome.azure";

  let audio=null;
  let objectUrl="";
  let started=false;
  let completed=false;
  let fetching=false;
  let nativePending=false;
  let nativeTimer=null;
  let gestureAttempts=0;
  let lastMeta=null;
  let last={time:Date.now(),state:"idle",provider:"",error:"",reason:""};

  function emit(state,extra){
    last={time:Date.now(),state,provider:"",error:"",reason:"",...(extra||{})};
    try{window.dispatchEvent(new CustomEvent("libcomlair-welcome-autoplay-status",{detail:{...last}}))}catch(_){}
  }

  function visible(el){
    if(!el||el.hidden||el.hasAttribute("hidden")||el.getAttribute("aria-hidden")==="true")return false;
    try{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0}catch(_){return false}
  }

  function isWelcome(){
    try{if(window.LibcomlairVoiceContext?.current?.()?.id==="welcome")return true}catch(_){}
    return visible(document.getElementById("libcomlairSplash"));
  }

  function cleanupObjectUrl(){
    if(objectUrl){try{URL.revokeObjectURL(objectUrl)}catch(_){}objectUrl=""}
  }

  function clearNativeTimer(){
    if(nativeTimer){clearTimeout(nativeTimer);nativeTimer=null}
  }

  function removeGestureFallback(){
    ["pointerdown","touchstart","keydown","click"].forEach(type=>document.removeEventListener(type,onFirstGesture,true));
  }

  function markCompleted(provider){
    if(completed)return;
    completed=true;
    started=false;
    nativePending=false;
    clearNativeTimer();
    removeGestureFallback();
    emit("ended",{provider:provider||last.provider||"azure-speech"});
    cleanupObjectUrl();
  }

  async function fetchAudio(url,provider){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),90000);
    try{
      const response=await fetch(url,{
        method:"POST",
        headers:{"Content-Type":"application/json",Accept:"audio/mpeg"},
        body:JSON.stringify({text:WELCOME_MESSAGE}),
        signal:controller.signal,
        cache:"no-store"
      });
      if(!response.ok)throw new Error(provider+"_http_"+response.status);
      const blob=await response.blob();
      if(!blob||blob.size<500)throw new Error(provider+"_empty_audio");
      return {blob,provider:response.headers.get("X-Libcomlair-TTS-Provider")||provider};
    }finally{clearTimeout(timer)}
  }

  async function getWelcomeAudio(){
    try{return await fetchAudio(PRIMARY_URL,"azure-speech")}
    catch(primaryError){
      emit("primary-unavailable",{provider:"azure-speech",error:String(primaryError?.message||primaryError||"")});
      return await fetchAudio(FALLBACK_URL,"render-fallback");
    }
  }

  function createAudio(meta){
    cleanupObjectUrl();
    objectUrl=URL.createObjectURL(meta.blob);
    const el=document.createElement("audio");
    el.autoplay=true;
    el.preload="auto";
    el.playsInline=true;
    el.setAttribute("playsinline","");
    el.setAttribute("aria-hidden","true");
    el.style.display="none";
    el.src=objectUrl;
    el.addEventListener("play",()=>{
      started=true;
      removeGestureFallback();
      emit("speaking",{provider:meta.provider,reason:"html-audio-autoplay"});
    });
    el.addEventListener("ended",()=>markCompleted(meta.provider),{once:true});
    el.addEventListener("error",()=>{
      if(completed)return;
      started=false;
      emit("html-audio-error",{provider:meta.provider,error:"media-error"});
    });
    try{(document.body||document.documentElement).appendChild(el)}catch(_){}
    return el;
  }

  async function blobToBase64(blob){
    const buffer=await blob.arrayBuffer();
    const bytes=new Uint8Array(buffer);
    const chunkSize=0x8000;
    let binary="";
    for(let i=0;i<bytes.length;i+=chunkSize){
      const chunk=bytes.subarray(i,Math.min(i+chunkSize,bytes.length));
      binary+=String.fromCharCode.apply(null,chunk);
    }
    return btoa(binary);
  }

  function nativeAdapter(){
    const bridge=window.LibcomlairSupportAudio;
    return bridge&&typeof bridge.playEncoded==="function"?bridge:null;
  }

  async function tryNativePlayback(meta){
    const bridge=nativeAdapter();
    if(!bridge)return false;
    try{
      const base64=await blobToBase64(meta.blob);
      if(completed||!isWelcome())return false;
      const mime=String(meta.blob.type||"audio/mpeg");
      const result=String(bridge.playEncoded(NATIVE_MESSAGE_ID,mime,base64)||"");
      if(!/accepted/i.test(result)){
        emit("native-rejected",{provider:meta.provider,error:result||"native-rejected",reason:"android-native-adapter"});
        return false;
      }
      nativePending=true;
      emit("delegated-native",{provider:meta.provider,reason:"android-native-adapter"});
      clearNativeTimer();
      nativeTimer=setTimeout(()=>{
        if(!nativePending||started||completed||!isWelcome())return;
        nativePending=false;
        emit("native-start-timeout",{provider:meta.provider,reason:"android-native-adapter"});
        attemptHtmlPlayback(meta,"native-start-timeout").catch(()=>{});
      },5000);
      return true;
    }catch(error){
      nativePending=false;
      emit("native-error",{provider:meta.provider,error:String(error?.message||error||"native-error"),reason:"android-native-adapter"});
      return false;
    }
  }

  async function attemptHtmlPlayback(meta,reason){
    if(started||completed||!isWelcome())return false;
    audio=createAudio(meta);
    try{
      await audio.play();
      return true;
    }catch(error){
      started=false;
      emit("autoplay-blocked",{provider:meta.provider,error:String(error?.name||error?.message||error||"autoplay-blocked"),reason:reason||"browser-policy"});
      return false;
    }
  }

  async function attemptImmediate(){
    if(fetching||started||completed||nativePending||!isWelcome())return false;
    fetching=true;
    emit("fetching",{provider:"azure-speech",reason:"page-open"});
    try{
      const meta=await getWelcomeAudio();
      lastMeta=meta;
      if(completed||!isWelcome())return false;
      if(await tryNativePlayback(meta))return true;
      return await attemptHtmlPlayback(meta,"page-open");
    }catch(error){
      emit("error",{provider:"azure-speech",error:String(error?.message||error||"welcome-audio-failed"),reason:"fetch-failed"});
      return false;
    }finally{fetching=false}
  }

  function speakAfterUnlock(reason){
    if(started||completed||nativePending||!isWelcome())return;
    const render=window.LibcomlairRenderVoice;
    if(!render?.unlockAudio||!render?.speak){
      emit("gesture-engine-not-ready",{reason});
      return;
    }
    gestureAttempts+=1;
    Promise.resolve(render.unlockAudio()).then(ok=>{
      if(!ok||started||completed||nativePending||!isWelcome()){
        if(!ok)emit("gesture-audio-locked",{reason});
        return;
      }
      emit("gesture-unlocked",{reason});
      return render.speak(WELCOME_MESSAGE,{
        requestId:"welcome-azure-autoplay-"+Date.now(),
        onstart:meta=>{
          started=true;
          removeGestureFallback();
          emit("speaking",{provider:meta?.engine||"azure-speech",reason:"first-gesture-fallback"});
        },
        onend:meta=>markCompleted(meta?.engine||"azure-speech"),
        onerror:error=>{
          started=false;
          emit("gesture-play-error",{provider:"azure-speech",error:String(error?.message||error||"gesture-play-error"),reason});
        }
      });
    }).catch(error=>emit("gesture-unlock-error",{error:String(error?.message||error||"unlock-error"),reason}));
  }

  function onFirstGesture(event){
    if(started||completed||nativePending||!isWelcome())return;
    if(event?.target?.closest?.("#libcomlairSplashNext"))return;
    if(audio){
      try{
        const task=audio.play();
        if(task&&typeof task.catch==="function")task.catch(()=>speakAfterUnlock(event?.type||"gesture"));
        return;
      }catch(_){}
    }
    speakAfterUnlock(event?.type||"gesture");
  }

  function onSupportAudioStatus(event){
    const detail=event?.detail||{};
    if(String(detail.id||"")!==NATIVE_MESSAGE_ID)return;
    const state=String(detail.state||"");
    if(state==="speaking"){
      nativePending=false;
      clearNativeTimer();
      started=true;
      removeGestureFallback();
      emit("speaking",{provider:lastMeta?.provider||"azure-speech",reason:"android-native-adapter"});
      return;
    }
    if(state==="ended"){
      markCompleted(lastMeta?.provider||"azure-speech");
      return;
    }
    if(state==="error"){
      nativePending=false;
      clearNativeTimer();
      started=false;
      emit("native-play-error",{provider:lastMeta?.provider||"azure-speech",error:String(detail.detail||"native-play-error"),reason:"android-native-adapter"});
      if(lastMeta&&isWelcome())attemptHtmlPlayback(lastMeta,"native-play-error").catch(()=>{});
    }
  }

  ["pointerdown","touchstart","keydown","click"].forEach(type=>document.addEventListener(type,onFirstGesture,true));
  window.addEventListener("libcomlair-support-audio-status",onSupportAudioStatus);

  // Compatibility flag: the guided presenter must not duplicate the welcome message.
  window.LibcomlairWelcomeListenFirst=Object.freeze({
    version:VERSION,
    mode:"automatic-azure-first-native-android",
    play:()=>attemptImmediate(),
    status:()=>({...last,started,completed,fetching,nativePending,nativeAvailable:!!nativeAdapter(),gestureAttempts,isWelcome:isWelcome()})
  });
  window.LibcomlairWelcomeAzureAutoplay=window.LibcomlairWelcomeListenFirst;

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(attemptImmediate,40),{once:true});
  else setTimeout(attemptImmediate,40);
  window.addEventListener("pageshow",()=>{if(isWelcome()&&!completed)setTimeout(attemptImmediate,40)});
})();
