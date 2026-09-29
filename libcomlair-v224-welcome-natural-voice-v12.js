(()=>{
  "use strict";

  let speaking=false;
  let completed=false;
  let bypass=false;
  let retryTimer=null;

  function splash(){return document.getElementById("libcomlairSplash")}
  function visible(el){
    if(!el||el.hidden||el.hasAttribute("hidden")||el.getAttribute("aria-hidden")==="true")return false;
    try{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0}catch(_){return false}
  }
  function isWelcome(){return visible(splash())}
  function unlock(){
    try{const r=window.LibcomlairRenderVoice?.unlockAudio?.();Promise.resolve(r).catch(()=>{});return true}catch(_){return false}
  }
  function welcomeText(){
    try{
      const d=window.LibcomlairVoiceGuide?.describe?.();
      const t=String(d?.text||"").replace(/\s+/g," ").trim();
      if(t&&t.length>30)return t+" Pour continuer, dites ou utilisez Suivant.";
    }catch(_){}
    return "Bienvenue dans Libcomlair. Libcomlair vous aide à trouver des lieux et des services avec des informations d’accessibilité. Pour continuer vers le choix de vos besoins, dites ou utilisez Suivant.";
  }
  function proceed(){
    if(!isWelcome())return;
    bypass=true;
    try{window.LibcomlairWelcomeTransitionHotfix?.openProfile?.()}catch(_){}
    setTimeout(()=>{bypass=false},0);
  }
  function finishAndProceed(){
    speaking=false;completed=true;clearTimeout(retryTimer);proceed();
  }
  function startNaturalWelcome(){
    if(!isWelcome())return false;
    unlock();
    const engine=window.LibcomlairVoice;
    if(!engine?.speak)return false;
    speaking=true;
    const ok=engine.speak(welcomeText(),{
      rate:.9,
      onend:finishAndProceed,
      onerror:()=>{
        speaking=false;
        clearTimeout(retryTimer);
        retryTimer=setTimeout(()=>{
          if(!isWelcome()||completed)return;
          unlock();
          speaking=true;
          const again=engine.speak(welcomeText(),{rate:.9,onend:finishAndProceed,onerror:()=>{speaking=false}});
          if(again===false)speaking=false;
        },120);
      }
    });
    if(ok===false){speaking=false;return false}
    return true;
  }

  document.addEventListener("pointerdown",event=>{
    if(!isWelcome())return;
    const root=splash();
    if(root&&(event.target===root||root.contains(event.target)))unlock();
  },true);

  document.addEventListener("click",event=>{
    const button=event.target?.closest?.("#libcomlairSplashNext");
    if(!button||bypass||!isWelcome())return;
    if(completed)return;

    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();

    if(speaking){
      try{window.LibcomlairVoice?.cancel?.()}catch(_){}
      finishAndProceed();
      return;
    }
    if(!startNaturalWelcome()){
      unlock();
      setTimeout(()=>startNaturalWelcome(),80);
    }
  },true);

  window.LibcomlairWelcomeNaturalVoice=Object.freeze({
    version:"v224-12",
    start:startNaturalWelcome,
    unlock,
    status:()=>({speaking,completed,isWelcome:isWelcome()})
  });
})();