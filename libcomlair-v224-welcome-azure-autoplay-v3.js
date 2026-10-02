(()=>{
  "use strict";

  const VERSION="v224-3-azure-early-context-autostart";
  const WELCOME_MESSAGE="Bienvenue dans Libcomlair. Ensemble, rendons les lieux accessibles plus faciles à trouver pour tous. Appuyez sur Suivant pour commencer.";
  const RETRIES=[40,180,450,900,1500,2400,3600,5200];

  let started=false;
  let completed=false;
  let attempting=false;
  let attemptCount=0;
  let timers=[];
  let last={time:Date.now(),state:"idle",reason:"",error:"",audioState:"",earlyAudio:false,userActivation:false};

  function visible(el){
    if(!el||el.hidden||el.hasAttribute?.("hidden")||el.getAttribute?.("aria-hidden")==="true")return false;
    try{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0}catch(_){return false}
  }

  function isWelcome(){
    try{if(window.LibcomlairVoiceContext?.current?.()?.id==="welcome")return true}catch(_){}
    return visible(document.getElementById("libcomlairSplash"));
  }

  function renderStatus(){
    try{return window.LibcomlairRenderVoice?.status?.()||{}}catch(_){return {}}
  }

  function emit(state,extra){
    const rs=renderStatus();
    last={
      time:Date.now(),
      state:String(state||""),
      reason:"",
      error:"",
      audioState:String(rs.audioState||window.__libcomlairEarlyAudioStatus?.currentState||""),
      earlyAudio:!!(rs.adoptedEarlyContext||window.__libcomlairEarlyAudioContext),
      userActivation:!!navigator.userActivation?.isActive,
      ...(extra||{})
    };
    try{window.dispatchEvent(new CustomEvent("libcomlair-welcome-autoplay-status",{detail:{...last}}))}catch(_){}
  }

  function clearTimers(){timers.forEach(clearTimeout);timers=[]}

  function removeGestureFallback(){
    ["pointerdown","touchstart","keydown","click"].forEach(type=>document.removeEventListener(type,onFirstGesture,true));
  }

  function markStarted(meta,reason){
    started=true;
    removeGestureFallback();
    clearTimers();
    emit("speaking",{reason:String(reason||"automatic"),provider:String(meta?.engine||"azure-speech")});
  }

  function markEnded(meta){
    completed=true;
    started=false;
    attempting=false;
    clearTimers();
    removeGestureFallback();
    emit("ended",{reason:"welcome-complete",provider:String(meta?.engine||"azure-speech")});
  }

  async function attempt(reason){
    if(started||completed||attempting||!isWelcome())return false;
    const render=window.LibcomlairRenderVoice;
    if(!render?.speak){
      emit("engine-not-ready",{reason:String(reason||"attempt")});
      return false;
    }

    attempting=true;
    attemptCount+=1;
    const requestId="welcome-azure-early-"+attemptCount;
    emit("starting",{reason:String(reason||"attempt"),requestId});

    try{
      const result=await render.speak(WELCOME_MESSAGE,{
        requestId,
        onstart:meta=>markStarted(meta,reason),
        onend:meta=>markEnded(meta),
        onerror:error=>{
          if(!started&&!completed){
            emit("attempt-error",{reason:String(reason||"attempt"),error:String(error?.message||error||"voice-error"),requestId});
          }
        }
      });
      return !!result?.ok;
    }catch(error){
      if(!started&&!completed){
        emit("attempt-error",{reason:String(reason||"attempt"),error:String(error?.message||error||"voice-error"),requestId});
      }
      return false;
    }finally{
      attempting=false;
    }
  }

  function schedule(){
    clearTimers();
    RETRIES.forEach((delay,index)=>{
      timers.push(setTimeout(()=>attempt("launch-retry-"+(index+1)),delay));
    });
  }

  function onFirstGesture(event){
    if(started||completed||!isWelcome())return;
    if(event?.target?.closest?.("#libcomlairSplashNext"))return;
    const render=window.LibcomlairRenderVoice;
    if(!render?.unlockAudio){attempt("first-gesture-no-unlock");return}
    Promise.resolve(render.unlockAudio()).then(ok=>{
      emit(ok?"gesture-unlocked":"gesture-still-locked",{reason:event?.type||"gesture"});
      if(ok)attempt("first-gesture");
    }).catch(error=>emit("gesture-unlock-error",{reason:event?.type||"gesture",error:String(error?.message||error||"unlock-error")}));
  }

  ["pointerdown","touchstart","keydown","click"].forEach(type=>document.addEventListener(type,onFirstGesture,true));

  const observer=new MutationObserver(()=>{
    if(started||completed)return;
    if(isWelcome())attempt("welcome-dom-ready");
  });
  try{observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["class","hidden","aria-hidden","style"]})}catch(_){}

  window.LibcomlairWelcomeListenFirst=Object.freeze({
    version:VERSION,
    mode:"automatic-azure-early-context",
    play:()=>attempt("manual-api"),
    status:()=>({...last,started,completed,attempting,attemptCount,isWelcome:isWelcome(),earlyStatus:{...(window.__libcomlairEarlyAudioStatus||{})}})
  });
  window.LibcomlairWelcomeAzureAutoplay=window.LibcomlairWelcomeListenFirst;

  schedule();
  window.addEventListener("pageshow",()=>{if(isWelcome()&&!completed)schedule()});
})();
