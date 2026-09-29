(()=>{
  "use strict";

  let generation=0;
  let startTimer=null;
  let prepareTimer=null;
  let lastKey="";
  let reading=false;

  const NAV_IDS=new Set([
    "applyAccessProfile","skipAccessProfile","changeAccessProfile",
    "v224VoiceModeBack","v224VoiceModeValidate",
    "v224TutorialBack","v224TutorialNext",
    "v224NeedsBack","v224NeedsValidate",
    "v224HomeBack","v224Page3Next","v224Page4Back"
  ]);

  function onboardingIdFromBody(){
    const b=document.body;
    if(!b)return "";
    if(b.classList.contains("v224-onboarding-needs"))return "onboarding-needs";
    if(b.classList.contains("v224-onboarding-voice"))return "onboarding-voice";
    if(b.classList.contains("v224-onboarding-tutorial"))return "onboarding-tutorial";
    if(b.classList.contains("v224-onboarding-home"))return "onboarding-home";
    if(b.classList.contains("v221-profile-step"))return "profile";
    return "";
  }

  function currentContext(reason){
    try{window.LibcomlairVoiceContext?.refresh?.(reason||"voice-page-lifecycle")}catch(_){}
    try{return window.LibcomlairVoiceContext?.current?.()||null}catch(_){return null}
  }

  function contextKey(ctx){
    if(!ctx)return onboardingIdFromBody()||"unknown";
    return [ctx.id||onboardingIdFromBody()||"",ctx.title||"",ctx.categoryId||"",ctx.subcategoryLabel||""].join("|");
  }

  function hidePresentationCard(){
    const el=document.getElementById("v224PresentationVoiceOverlay");
    if(el){el.hidden=true;el.setAttribute("aria-hidden","true")}
  }

  function cancelCurrent(){
    generation+=1;
    reading=false;
    clearTimeout(startTimer);
    clearTimeout(prepareTimer);
    try{window.LibcomlairVoiceGuide?.stop?.()}catch(_){}
    try{window.LibcomlairPresentationVoiceCard?.stop?.()}catch(_){}
    try{window.LibcomlairVoice?.cancel?.()}catch(_){}
    hidePresentationCard();
  }

  function markLegacyVisited(ctx){
    const presenter=window.LibcomlairGuidedPresenter;
    const engine=window.LibcomlairVoice;
    if(!presenter?.presentCurrent||!engine?.speak||!ctx)return;
    let mode="discovery";
    try{mode=window.LibcomlairVoiceContext?.getMode?.()||"discovery"}catch(_){}
    if(mode==="simplified")return;

    const originalSpeak=engine.speak;
    try{
      engine.speak=()=>false;
      presenter.presentCurrent(true);
    }catch(_){
    }finally{
      try{engine.speak=originalSpeak}catch(_){}
      try{window.LibcomlairVoice?.cancel?.()}catch(_){}
      try{window.LibcomlairPresentationVoiceCard?.stop?.()}catch(_){}
    }
  }

  function readPage(token,retry=0){
    if(token!==generation)return;
    const ctx=currentContext("voice-page-read");
    if(!ctx){
      if(retry<15)startTimer=setTimeout(()=>readPage(token,retry+1),240);
      return;
    }

    const engine=window.LibcomlairVoice;
    const guide=window.LibcomlairVoiceGuide;
    if(!engine?.speak||!guide?.readCurrent){
      if(retry<15)startTimer=setTimeout(()=>readPage(token,retry+1),240);
      return;
    }

    reading=true;
    let ok=false;
    const finish=()=>{if(token===generation)reading=false};

    try{
      if(ctx.id==="onboarding-tutorial"&&window.LibcomlairPresentationVoiceCard?.start){
        ok=!!window.LibcomlairPresentationVoiceCard.start({oncomplete:finish,onerror:finish});
      }else{
        ok=!!guide.readCurrent({oncomplete:finish,onerror:finish});
      }
    }catch(_){ok=false}

    if(!ok){
      reading=false;
      if(retry<15)startTimer=setTimeout(()=>readPage(token,retry+1),300);
    }
  }

  function beginForCurrent(reason){
    cancelCurrent();
    const token=generation;

    prepareTimer=setTimeout(()=>{
      if(token!==generation)return;
      const ctx=currentContext(reason||"voice-page-change");
      const key=contextKey(ctx);
      lastKey=key;
      markLegacyVisited(ctx);
      if(token!==generation)return;
      startTimer=setTimeout(()=>readPage(token,0),180);
    },120);
  }

  function checkForPageChange(reason,force=false){
    const ctx=currentContext(reason||"voice-page-check");
    const key=contextKey(ctx);
    if(force||key!==lastKey){
      lastKey=key;
      beginForCurrent(reason);
    }
  }

  window.addEventListener("libcomlair-onboarding-step",()=>checkForPageChange("onboarding-step",true));
  window.addEventListener("libcomlair-voice-context-change",event=>{
    const ctx=event?.detail?.context;
    const key=contextKey(ctx);
    if(key!==lastKey){lastKey=key;beginForCurrent("voice-context-change")}
  });
  window.addEventListener("libcomlair-voice-mode-change",()=>checkForPageChange("voice-mode-change",true));
  window.addEventListener("pageshow",()=>setTimeout(()=>checkForPageChange("pageshow",true),100));
  ["libcomlair-detail-opened","libcomlair-nearme-result","popstate"].forEach(name=>{
    window.addEventListener(name,()=>setTimeout(()=>checkForPageChange(name,true),80));
  });

  document.addEventListener("click",event=>{
    const button=event.target?.closest?.("button,a");
    if(!button)return;
    if(NAV_IDS.has(button.id))cancelCurrent();
  },true);

  if(document.body){
    try{
      new MutationObserver(()=>{
        const bodyId=onboardingIdFromBody();
        if(bodyId&& !lastKey.startsWith(bodyId+"|"))checkForPageChange("body-page-class",true);
        else if(!bodyId)setTimeout(()=>checkForPageChange("body-class"),60);
      }).observe(document.body,{attributes:true,attributeFilter:["class"]});
    }catch(_){}
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>checkForPageChange("initial",true),350),{once:true});
  }else setTimeout(()=>checkForPageChange("initial",true),350);

  window.LibcomlairVoicePageLifecycle=Object.freeze({
    version:"v224-1",
    cancel:cancelCurrent,
    restart:()=>checkForPageChange("manual-restart",true),
    currentKey:()=>lastKey,
    isReading:()=>reading
  });
})();