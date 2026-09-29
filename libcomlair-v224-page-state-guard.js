(()=>{
  "use strict";

  const ONBOARDING_CLASSES=[
    "v224-onboarding-needs",
    "v224-onboarding-voice",
    "v224-onboarding-tutorial",
    "v224-onboarding-home"
  ];

  let cleaning=false;
  let last={time:0,reason:"",removed:[],pageClass:""};

  function refreshIdentity(reason){
    setTimeout(()=>{
      try{window.LibcomlairIdentity?.refresh?.("state-guard:"+reason)}catch(_){}
      try{window.LibcomlairVoiceContext?.refresh?.("state-guard:"+reason)}catch(_){}
    },0);
  }

  function clean(reason){
    const body=document.body;
    if(!body||cleaning)return false;
    const isPage4=body.classList.contains("v224-page4-step");
    const isPage5=body.classList.contains("v224-page5-step");
    if(!isPage4&&!isPage5)return false;

    const removed=ONBOARDING_CLASSES.filter(cls=>body.classList.contains(cls));
    if(!removed.length)return false;

    cleaning=true;
    try{removed.forEach(cls=>body.classList.remove(cls))}finally{cleaning=false}
    last={time:Date.now(),reason:String(reason||"clean"),removed,pageClass:isPage5?"v224-page5-step":"v224-page4-step"};
    refreshIdentity(reason||"clean");
    return true;
  }

  function schedule(reason){
    [0,70,220].forEach(delay=>setTimeout(()=>clean(reason),delay));
  }

  try{
    new MutationObserver(()=>schedule("body-class-change")).observe(document.body,{attributes:true,attributeFilter:["class"]});
  }catch(_){}

  document.addEventListener("click",event=>{
    const target=event.target?.closest?.("button,a,summary");
    if(!target)return;
    if(target.id==="v224Page3Next"||target.id==="v224Page4Back"||target.id==="v224Page5Back"||target.closest?.("#v224Page4Categories")){
      schedule("navigation:"+(target.id||target.dataset?.libcomlairActionId||target.tagName));
    }
  },true);

  ["libcomlair-onboarding-step","libcomlair-voice-context-change","pageshow","popstate"].forEach(name=>{
    window.addEventListener(name,()=>schedule(name));
  });

  schedule("initial");

  window.LibcomlairPageStateGuard=Object.freeze({
    version:"v224-1",
    clean,
    status:()=>({version:"v224-1",last:{...last},bodyClasses:[...(document.body?.classList||[])]})
  });
})();