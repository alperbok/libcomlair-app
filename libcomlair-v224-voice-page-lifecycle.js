(()=>{
  "use strict";

  /*
    v224-3
    Le présentateur guidé est l'unique propriétaire du cycle vocal.
    Ce module ne fait plus qu'intercepter le début d'une navigation afin
    d'arrêter immédiatement l'ancienne page, puis délègue toute relance.
  */

  const NAV_IDS=new Set([
    "libcomlairSplashNext",
    "applyAccessProfile","skipAccessProfile","changeAccessProfile",
    "v224VoiceModeBack","v224VoiceModeValidate",
    "v224TutorialBack","v224TutorialNext",
    "v224NeedsBack","v224NeedsValidate",
    "v224HomeBack","v224Page3Next","v224Page4Back"
  ]);

  let stopCount=0;

  function fallbackStop(){
    try{window.LibcomlairPresentationVoiceCard?.stop?.()}catch(_){}
    try{window.LibcomlairVoiceGuide?.stop?.()}catch(_){}
  }

  function stopCurrent(){
    stopCount+=1;
    const presenter=window.LibcomlairGuidedPresenter;
    if(presenter?.cancelCurrent){
      try{presenter.cancelCurrent();return}catch(_){}
    }
    fallbackStop();
  }

  function restartCurrent(){
    const presenter=window.LibcomlairGuidedPresenter;
    if(presenter?.restartCurrent){
      try{presenter.restartCurrent();return true}catch(_){}
    }
    try{return !!presenter?.presentCurrent?.(true)}catch(_){return false}
  }

  document.addEventListener("click",event=>{
    const target=event.target?.closest?.("button,a");
    if(target&&NAV_IDS.has(target.id))stopCurrent();
  },true);

  /*
    Aucun écouteur sur context-change/onboarding-step ici : ces événements
    appartiennent désormais uniquement à LibcomlairGuidedPresenter.
    Cela évite qu'un second module annule la nouvelle lecture juste après
    son lancement.
  */

  window.LibcomlairVoicePageLifecycle=Object.freeze({
    version:"v224-3",
    cancel:stopCurrent,
    restart:restartCurrent,
    stopCount:()=>stopCount,
    isReading:()=>!!(
      window.LibcomlairGuidedPresenter?.isPresenting?.()||
      window.LibcomlairPresentationVoiceCard?.isRunning?.()
    )
  });
})();