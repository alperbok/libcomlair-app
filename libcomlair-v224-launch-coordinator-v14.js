(()=>{
  "use strict";

  let timerIds=[];
  let attemptCount=0;
  let last={time:0,reason:"",audioReady:false,presenterReady:false,presenterStarted:false,contextId:"",error:""};

  function context(){
    try{return window.LibcomlairVoiceContext?.current?.()||null}catch(_){return null}
  }
  function visible(el){
    if(!el||el.hidden||el.hasAttribute("hidden")||el.getAttribute("aria-hidden")==="true")return false;
    try{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0}catch(_){return false}
  }
  function isWelcome(){
    const ctx=context();
    if(ctx?.id==="welcome")return true;
    return visible(document.getElementById("libcomlairSplash"));
  }
  function clearTimers(){timerIds.forEach(clearTimeout);timerIds=[]}

  async function attempt(reason){
    attemptCount+=1;
    if(!isWelcome()){
      clearTimers();
      last={time:Date.now(),reason:String(reason||"attempt"),audioReady:false,presenterReady:!!window.LibcomlairGuidedPresenter,presenterStarted:false,contextId:context()?.id||"",error:"not-welcome"};
      return false;
    }

    const render=window.LibcomlairRenderVoice;
    const presenter=window.LibcomlairGuidedPresenter;
    const ctx=context();
    if(!render||!presenter){
      last={time:Date.now(),reason:String(reason||"attempt"),audioReady:false,presenterReady:!!presenter,presenterStarted:false,contextId:ctx?.id||"",error:!render?"render-not-ready":"presenter-not-ready"};
      return false;
    }

    let audioReady=false;
    try{
      try{await render.prepare?.()}catch(_){}
      audioReady=!!(await render.unlockAudio?.());
    }catch(error){
      last={time:Date.now(),reason:String(reason||"attempt"),audioReady:false,presenterReady:true,presenterStarted:false,contextId:ctx?.id||"",error:String(error?.message||error||"")};
      return false;
    }

    if(!audioReady){
      last={time:Date.now(),reason:String(reason||"attempt"),audioReady:false,presenterReady:true,presenterStarted:false,contextId:ctx?.id||"",error:"audio-still-locked"};
      return false;
    }

    if(presenter.isPresenting?.()){
      last={time:Date.now(),reason:String(reason||"attempt"),audioReady:true,presenterReady:true,presenterStarted:false,contextId:ctx?.id||"",error:"already-presenting"};
      clearTimers();
      return true;
    }

    let started=false;
    try{started=!!presenter.restartCurrent?.()}catch(error){
      last={time:Date.now(),reason:String(reason||"attempt"),audioReady:true,presenterReady:true,presenterStarted:false,contextId:ctx?.id||"",error:String(error?.message||error||"")};
      return false;
    }
    last={time:Date.now(),reason:String(reason||"attempt"),audioReady:true,presenterReady:true,presenterStarted:started,contextId:ctx?.id||"",error:started?"":"presenter-restart-false"};
    if(started)clearTimers();
    return started;
  }

  function schedule(){
    clearTimers();
    [120,450,900,1500,2400,3600,5200,7600].forEach((delay,index)=>{
      timerIds.push(setTimeout(()=>attempt("launch-retry-"+(index+1)),delay));
    });
  }

  // La lecture normale doit venir du présentateur. Ce module ne prononce aucun texte.
  // Il attend simplement que Render + contexte + présentateur soient réellement prêts,
  // puis relance la page Bienvenue si la première tentative a été faite trop tôt.
  schedule();
  window.addEventListener("pageshow",()=>{if(isWelcome())schedule()});

  const fallbackGesture=event=>{
    if(!isWelcome()||event.target?.closest?.("#libcomlairSplashNext"))return;
    attempt("welcome-fallback-gesture");
  };
  document.addEventListener("pointerdown",fallbackGesture,true);
  document.addEventListener("touchstart",fallbackGesture,{capture:true,passive:true});

  window.LibcomlairLaunchCoordinator=Object.freeze({
    version:"v224-14",
    attempt,
    schedule,
    status:()=>({...last,attemptCount,isWelcome:isWelcome()})
  });
})();