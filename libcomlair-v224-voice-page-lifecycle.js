(()=>{
  "use strict";

  /*
    v224-2
    Ce module ne relit plus lui-même les pages.
    Le présentateur guidé reste l'unique propriétaire de la lecture automatique.
    Ici, on coupe seulement la lecture de l'écran précédent dès qu'une navigation
    commence ou qu'un nouveau contexte devient actif.
  */

  const NAV_IDS=new Set([
    "applyAccessProfile","skipAccessProfile","changeAccessProfile",
    "v224VoiceModeBack","v224VoiceModeValidate",
    "v224TutorialBack","v224TutorialNext",
    "v224NeedsBack","v224NeedsValidate",
    "v224HomeBack","v224Page3Next","v224Page4Back"
  ]);

  let stopCount=0;
  let restartTimer=null;

  function hidePresentationCard(){
    const el=document.getElementById("v224PresentationVoiceOverlay");
    if(el){
      el.hidden=true;
      el.setAttribute("aria-hidden","true");
    }
  }

  function stopCurrent(){
    stopCount+=1;
    clearTimeout(restartTimer);

    /* Le guide arrête sa séquence et le moteur vocal. */
    try{window.LibcomlairVoiceGuide?.stop?.()}catch(_){}

    /* Si la présentation centrale est active, elle doit aussi être terminée. */
    try{window.LibcomlairPresentationVoiceCard?.stop?.()}catch(_){}

    hidePresentationCard();
  }

  function restartCurrent(){
    clearTimeout(restartTimer);
    restartTimer=setTimeout(()=>{
      try{window.LibcomlairGuidedPresenter?.presentCurrent?.(true)}catch(_){}
    },320);
  }

  /*
    Le clic est intercepté avant la navigation afin que la phrase de l'ancien
    écran soit coupée immédiatement. Le présentateur guidé relancera ensuite
    automatiquement le nouvel écran grâce à ses propres événements.
  */
  document.addEventListener("click",event=>{
    const target=event.target?.closest?.("button,a");
    if(target&&NAV_IDS.has(target.id))stopCurrent();
  },true);

  /* Navigation vocale, changements d'écran et retour navigateur. */
  [
    "libcomlair-onboarding-step",
    "libcomlair-voice-context-change",
    "libcomlair-voice-mode-change",
    "libcomlair-detail-opened",
    "libcomlair-nearme-result",
    "popstate",
    "pageshow"
  ].forEach(name=>window.addEventListener(name,stopCurrent));

  window.LibcomlairVoicePageLifecycle=Object.freeze({
    version:"v224-2",
    cancel:stopCurrent,
    restart:restartCurrent,
    stopCount:()=>stopCount,
    isReading:()=>!!(
      window.LibcomlairGuidedPresenter?.isPresenting?.()||
      window.LibcomlairPresentationVoiceCard?.isRunning?.()
    )
  });
})();