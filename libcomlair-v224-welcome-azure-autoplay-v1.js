(()=>{
  "use strict";

  const VERSION="v224-1-azure-autoplay-first";
  const WELCOME_MESSAGE="Bienvenue dans Libcomlair. Ensemble, rendons les lieux accessibles plus faciles à trouver pour tous. Appuyez sur Suivant pour commencer.";
  const API_BASE="https://libcomlair-backend.onrender.com";
  const PRIMARY_URL=API_BASE+"/api/tts/azure-v1";
  const FALLBACK_URL=API_BASE+"/api/tts/v181";

  let audio=null;
  let objectUrl="";
  let started=false;
  let completed=false;
  let fetching=false;
  let gestureAttempts=0;
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

  function removeGestureFallback(){
    ["pointerdown","touchstart","keydown","click"].forEach(type=>document.removeEventListener(type,onFirstGesture,true));
  }

  function markCompleted(provider){
    if(completed)return;
    completed=true;
    started=false;
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

  async function attemptImmediate(){
    if(fetching||started||completed||!isWelcome())return false;
    fetching=true;
    emit("fetching",{provider:"azure-speech",reason:"page-open"});
    try{
      const meta=await getWelcomeAudio();
      if(completed||!isWelcome())return false;
      audio=createAudio(meta);
      try{
        await audio.play();
        return true;
      }catch(error){
        started=false;
        emit("autoplay-blocked",{provider:meta.provider,error:String(error?.name||error?.message||error||"autoplay-blocked"),reason:"browser-policy"});
        return false;
      }
    }catch(error){
      emit("error",{provider:"azure-speech",error:String(error?.message||error||"welcome-audio-failed"),reason:"fetch-failed"});
      return false;
    }finally{fetching=false}
  }

  function speakAfterUnlock(reason){
    if(started||completed||!isWelcome())return;
    const render=window.LibcomlairRenderVoice;
    if(!render?.unlockAudio||!render?.speak){
      emit("gesture-engine-not-ready",{reason});
      return;
    }
    gestureAttempts+=1;
    Promise.resolve(render.unlockAudio()).then(ok=>{
      if(!ok||started||completed||!isWelcome()){
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
    if(started||completed||!isWelcome())return;
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

  ["pointerdown","touchstart","keydown","click"].forEach(type=>document.addEventListener(type,onFirstGesture,true));

  // Compatibility flag: the guided presenter must not duplicate the welcome message.
  window.LibcomlairWelcomeListenFirst=Object.freeze({
    version:VERSION,
    mode:"automatic-azure-first",
    play:()=>attemptImmediate(),
    status:()=>({...last,started,completed,fetching,gestureAttempts,isWelcome:isWelcome()})
  });
  window.LibcomlairWelcomeAzureAutoplay=window.LibcomlairWelcomeListenFirst;

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(attemptImmediate,40),{once:true});
  else setTimeout(attemptImmediate,40);
  window.addEventListener("pageshow",()=>{if(isWelcome()&&!completed)setTimeout(attemptImmediate,40)});
})();