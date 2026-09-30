(()=>{
  "use strict";

  const body=document.body;
  if(!body)return;

  const nativeIds=[
    "v224NeedsActions",
    "v224VoiceModeActions",
    "v224TutorialActions",
    "v224HomeActions",
    "v224Page4Back",
    "v224Page5Back",
    "v224MapGpsNavV33"
  ];

  function hideNativeActions(){
    if(!body.classList.contains("v224-master-frame-active"))return;
    nativeIds.forEach(id=>{
      const el=document.getElementById(id);
      if(!el)return;
      el.style.setProperty("display","none","important");
      el.style.setProperty("visibility","hidden","important");
      el.style.setProperty("height","0","important");
      el.style.setProperty("min-height","0","important");
      el.style.setProperty("max-height","0","important");
      el.style.setProperty("margin","0","important");
      el.style.setProperty("padding","0","important");
      el.style.setProperty("overflow","hidden","important");
    });
  }

  function refresh(){
    try{window.LibcomlairMasterFrameIntegration?.refresh?.()}catch(_){}
    hideNativeActions();
    setTimeout(hideNativeActions,0);
    setTimeout(hideNativeActions,120);
    setTimeout(hideNativeActions,300);
  }

  new MutationObserver(refresh).observe(body,{attributes:true,attributeFilter:["class"]});
  window.addEventListener("libcomlair-onboarding-step",refresh);
  window.addEventListener("libcomlair-map-gps-page",refresh);
  window.addEventListener("pageshow",refresh);
  document.addEventListener("click",()=>setTimeout(hideNativeActions,0),true);

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",refresh,{once:true});
  else refresh();

  window.LibcomlairFrameFixesV6=Object.freeze({version:"v6.2-master-frame-consistency",refresh});
})();
