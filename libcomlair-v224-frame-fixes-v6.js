(()=>{
  "use strict";

  const body=document.body;
  if(!body)return;

  function applyNeedsMic(){
    if(!body.classList.contains("v224-onboarding-needs"))return;
    const mic=document.getElementById("v222ProfileMic");
    if(!mic)return;

    const size="62px";
    ["width","height","min-width","min-height","max-width","max-height"].forEach(prop=>{
      if(mic.style.getPropertyValue(prop)!==size)mic.style.setProperty(prop,size,"important");
    });
    mic.style.setProperty("right","4px","important");
    mic.style.setProperty("top","4px","important");
    mic.style.setProperty("border-width","3px","important");
    mic.style.setProperty("font-size","1.35rem","important");

    const label=mic.querySelector("span");
    if(label){
      label.style.setProperty("margin-top","0","important");
      label.style.setProperty("font-size",".72rem","important");
      label.style.setProperty("line-height","1","important");
    }
  }

  function schedule(){
    applyNeedsMic();
    setTimeout(applyNeedsMic,0);
    setTimeout(applyNeedsMic,100);
    setTimeout(applyNeedsMic,240);
  }

  new MutationObserver(schedule).observe(body,{attributes:true,attributeFilter:["class"]});
  window.addEventListener("libcomlair-onboarding-step",schedule);
  window.addEventListener("pageshow",schedule);
  document.addEventListener("click",()=>setTimeout(applyNeedsMic,0),true);

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});
  else schedule();

  window.LibcomlairFrameFixesV6=Object.freeze({version:"v6.1",refresh:schedule});
})();
