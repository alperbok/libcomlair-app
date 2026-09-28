(()=>{
  "use strict";

  const body=document.body;
  const needsSection=document.getElementById("accessNeedsSection");
  if(!body||!needsSection)return;

  function show(el,display="block"){
    if(!el)return;
    el.hidden=false;
    el.removeAttribute("hidden");
    el.style.setProperty("display",display,"important");
  }

  function hide(el){
    if(!el)return;
    el.style.setProperty("display","none","important");
  }

  function syncHeader(){
    const isNeeds=body.classList.contains("v224-onboarding-needs");
    const isPage3Other=
      body.classList.contains("v224-onboarding-voice")||
      body.classList.contains("v224-onboarding-tutorial")||
      body.classList.contains("v224-onboarding-home");
    const isLater=
      body.classList.contains("v224-page4-step")||
      body.classList.contains("v224-page5-step");

    if(isLater){
      hide(needsSection);
      needsSection.setAttribute("aria-hidden","true");
      return;
    }

    if(isPage3Other){
      show(needsSection,"block");
      needsSection.removeAttribute("aria-hidden");
      [...needsSection.children].forEach(child=>{
        if(child.classList.contains("v222-app-brand"))show(child,"flex");
        else hide(child);
      });
      try{window.LibcomlairGlobalAssistance?.refresh?.()}catch(_){}
      return;
    }

    if(isNeeds){
      show(needsSection,"block");
      needsSection.removeAttribute("aria-hidden");
      const brand=needsSection.querySelector(".v222-app-brand");
      if(brand)show(brand,"flex");
      try{window.LibcomlairGlobalAssistance?.refresh?.()}catch(_){}
    }
  }

  const observer=new MutationObserver(syncHeader);
  observer.observe(body,{attributes:true,attributeFilter:["class"]});
  window.addEventListener("libcomlair-onboarding-step",()=>setTimeout(syncHeader,0));
  window.addEventListener("pageshow",syncHeader);
  setTimeout(syncHeader,0);

  window.LibcomlairPage3HeaderGuard=Object.freeze({
    version:"v224-1",
    sync:syncHeader
  });
})();
