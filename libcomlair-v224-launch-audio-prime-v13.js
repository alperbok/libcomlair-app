(()=>{
  "use strict";

  let last={time:0,reason:"",ok:false,audioState:"",error:""};
  let priming=null;

  function context(){
    try{return window.LibcomlairVoiceContext?.current?.()||null}catch(_){return null}
  }
  function isWelcome(){
    const ctx=context();
    if(ctx?.id==="welcome")return true;
    const el=document.getElementById("libcomlairSplash");
    if(!el||el.hidden||el.hasAttribute("hidden")||el.getAttribute("aria-hidden")==="true")return false;
    try{
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0;
    }catch(_){return false}
  }

  async function prime(reason){
    const render=window.LibcomlairRenderVoice;
    if(!render){
      last={time:Date.now(),reason:String(reason||"prime"),ok:false,audioState:"",error:"render-unavailable"};
      return false;
    }
    if(priming)return priming;
    priming=(async()=>{
      try{
        try{render.prepare?.().catch?.(()=>{})}catch(_){}
        const ok=await render.unlockAudio?.();
        const status=render.status?.()||{};
        last={time:Date.now(),reason:String(reason||"prime"),ok:!!ok,audioState:String(status.audioState||""),error:""};
        return !!ok;
      }catch(error){
        const status=render.status?.()||{};
        last={time:Date.now(),reason:String(reason||"prime"),ok:false,audioState:String(status.audioState||""),error:String(error?.message||error||"")};
        return false;
      }finally{
        priming=null;
      }
    })();
    return priming;
  }

  function retryPresenterAfterFallback(){
    if(!isWelcome())return;
    const presenter=window.LibcomlairGuidedPresenter;
    if(!presenter||presenter.isPresenting?.())return;
    const attempt=presenter.lastAttempt?.()||{};
    if(attempt.result==="error"||attempt.result==="failed"){
      setTimeout(()=>presenter.restartCurrent?.(),0);
    }
  }

  // Règle produit : l’ouverture du lien ou de l’application amorce immédiatement
  // la voix naturelle. Ce module ne parle jamais lui-même : le présentateur reste
  // l’unique orchestrateur des annonces.
  prime("app-launch");

  window.addEventListener("pageshow",()=>prime("pageshow"));
  document.addEventListener("visibilitychange",()=>{
    if(!document.hidden)prime("visible");
  });

  // Filet de sécurité Android seulement. Suivant n’est jamais détourné : il reste
  // exclusivement un bouton de navigation.
  const fallbackGesture=event=>{
    if(!isWelcome()||event.target?.closest?.("#libcomlairSplashNext"))return;
    prime("welcome-fallback-gesture").then(ok=>{if(ok)retryPresenterAfterFallback()});
  };
  document.addEventListener("pointerdown",fallbackGesture,true);
  document.addEventListener("touchstart",fallbackGesture,{capture:true,passive:true});

  window.LibcomlairLaunchAudioPrime=Object.freeze({
    version:"v224-13",
    prime,
    status:()=>({...last}),
    isWelcome
  });
})();