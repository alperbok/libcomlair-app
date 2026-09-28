(()=>{
  "use strict";

  const body=document.body;
  const needsSection=document.getElementById("accessNeedsSection");
  if(!body||!needsSection)return;

  const hiddenWhenActive=[
    "v224-onboarding-voice",
    "v224-onboarding-tutorial",
    "v224-onboarding-home",
    "v224-page4-step",
    "v224-page5-step"
  ];

  function syncNeedsVisibility(){
    if(body.classList.contains("v224-onboarding-needs"))return;
    if(hiddenWhenActive.some(className=>body.classList.contains(className))){
      needsSection.style.setProperty("display","none","important");
      needsSection.setAttribute("aria-hidden","true");
    }
  }

  const observer=new MutationObserver(syncNeedsVisibility);
  observer.observe(body,{attributes:true,attributeFilter:["class"]});

  window.addEventListener("libcomlair-onboarding-step",syncNeedsVisibility);
  syncNeedsVisibility();

  window.LibcomlairOnboardingVisibilityGuard=Object.freeze({
    version:"v224-1",
    sync:syncNeedsVisibility
  });
})();