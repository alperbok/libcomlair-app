(()=>{
  "use strict";
  let active=false;
  let pending=false;
  const body=document.body;
  const by=id=>document.getElementById(id);

  function ensureNav(){
    const hub=by("v224MapGpsHub");if(!hub)return null;
    let nav=by("v224MapGpsNav");
    if(nav)return nav;
    nav=document.createElement("div");nav.id="v224MapGpsNav";nav.className="v224-map-gps-nav";
    const back=document.createElement("button");back.id="v224MapGpsBack";back.type="button";back.className="details-btn";back.textContent="Retour";
    const next=document.createElement("button");next.id="v224MapGpsNext";next.type="button";next.className="details-btn";next.textContent="Suivant";
    nav.append(back,next);hub.appendChild(nav);
    back.addEventListener("click",()=>leaveToHome());
    next.addEventListener("click",()=>leaveToSearch());
    return nav;
  }

  function closeModes(){
    try{
      const globalPanel=by("v224GlobalNearbyPanel");
      if(globalPanel&&!globalPanel.hidden){by("v224CloseGlobalMap")?.click()}
    }catch(_){}
    try{
      const gpsPanel=by("v224GpsPanel");
      if(gpsPanel&&!gpsPanel.hidden){by("v224GpsBack")?.click()}
    }catch(_){}
  }

  function activate(reason="page4"){
    if(!body?.classList.contains("v224-page4-step"))return false;
    const hub=by("v224MapGpsHub");if(!hub)return false;
    ensureNav();pending=false;active=true;body.classList.add("v224-map-gps-page");
    requestAnimationFrame(()=>{window.scrollTo({top:0,left:0,behavior:"auto"});hub.scrollIntoView({block:"start",behavior:"auto"})});
    try{window.dispatchEvent(new CustomEvent("libcomlair-map-gps-page",{detail:{active:true,reason}}))}catch(_){}
    return true;
  }

  function deactivate(reason="next"){
    pending=false;active=false;body?.classList.remove("v224-map-gps-page");
    try{window.dispatchEvent(new CustomEvent("libcomlair-map-gps-page",{detail:{active:false,reason}}))}catch(_){}
  }

  function leaveToSearch(){
    closeModes();
    deactivate("next");
    requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:"auto"}));
    try{window.dispatchEvent(new Event("libcomlair-voice-context-change"))}catch(_){}
  }

  function leaveToHome(){
    closeModes();
    deactivate("back");
    try{window.LibcomlairOnboardingScreens?.showHome?.()}catch(_){}
  }

  function requestHub(reason){
    pending=true;
    setTimeout(()=>{if(body?.classList.contains("v224-page4-step"))activate(reason)},90);
    setTimeout(()=>{if(pending&&body?.classList.contains("v224-page4-step"))activate(reason)},220);
  }

  const page3Next=by("v224Page3Next");
  page3Next?.addEventListener("click",()=>requestHub("from-home"),true);

  document.addEventListener("click",event=>{
    const target=event.target?.closest?.(".v224-gps-go,#v224DetailGps");
    if(target)requestHub("gps-destination");
  },true);

  window.addEventListener("libcomlair-map-gps-open",()=>requestHub("api"));

  try{
    new MutationObserver(()=>{
      if(!body?.classList.contains("v224-page4-step")){
        if(active)deactivate("page-left");
        return;
      }
      ensureNav();
      if(pending&&!active)activate("pending");
      const gps=by("v224GpsPanel");
      if(gps&&!gps.hidden&&!active)activate("gps-panel");
    }).observe(body,{attributes:true,attributeFilter:["class"]});
  }catch(_){}

  function sync(){ensureNav();if(pending&&body?.classList.contains("v224-page4-step"))activate("sync")}
  window.addEventListener("pageshow",()=>setTimeout(sync,120));
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(sync,0),{once:true});else setTimeout(sync,0);

  window.LibcomlairMapGpsPage=Object.freeze({version:"v224-32.1",activate:()=>activate("manual"),leaveToSearch,leaveToHome,isActive:()=>active});
})();