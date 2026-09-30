(()=>{
  "use strict";
  const body=document.body;
  const main=document.getElementById("mainContent");
  const by=id=>document.getElementById(id);
  let active=false;
  let pending=false;
  let brandHome=null,brandNext=null;

  function important(el,name,value){if(el)el.style.setProperty(name,value,"important")}
  function directSections(){return main?[...main.children].filter(el=>el.tagName==="SECTION"):[]}

  function ensurePage(){
    if(!main)return null;
    let page=by("v224MapGpsStandalone");
    if(!page){
      page=document.createElement("section");
      page.id="v224MapGpsStandalone";
      page.hidden=true;
      page.setAttribute("aria-label","Carte et GPS");
      page.innerHTML='<div id="v224MapGpsStandaloneHeader"></div><div id="v224MapGpsStandaloneContent"></div>';
      const categories=by("v224Page4Categories");
      if(categories?.parentNode===main)main.insertBefore(page,categories);else main.appendChild(page);
    }
    const hub=by("v224MapGpsHub"),content=by("v224MapGpsStandaloneContent");
    if(hub&&content&&hub.parentNode!==content)content.appendChild(hub);
    ensureNav();
    return page;
  }

  function ensureNav(){
    const hub=by("v224MapGpsHub");if(!hub)return null;
    let nav=by("v224MapGpsNavV33");if(nav)return nav;
    by("v224MapGpsNav")?.remove?.();
    nav=document.createElement("div");
    nav.id="v224MapGpsNavV33";nav.className="v224-map-gps-nav-v33";
    const back=document.createElement("button");back.id="v224MapGpsBackV33";back.type="button";back.className="details-btn";back.textContent="Retour";
    const next=document.createElement("button");next.id="v224MapGpsNextV33";next.type="button";next.className="details-btn";next.textContent="Suivant";
    nav.append(back,next);hub.appendChild(nav);
    back.addEventListener("click",leaveToHome);
    next.addEventListener("click",leaveToSearch);
    return nav;
  }

  function moveBrandIn(){
    const brand=by("v224Page4Brand"),host=by("v224MapGpsStandaloneHeader");
    if(!brand||!host)return;
    if(!brandHome){brandHome=brand.parentNode;brandNext=brand.nextSibling}
    if(brand.parentNode!==host)host.appendChild(brand);
  }
  function restoreBrand(){
    const brand=by("v224Page4Brand");if(!brand||!brandHome)return;
    if(brand.parentNode===brandHome)return;
    if(brandNext&&brandNext.parentNode===brandHome)brandHome.insertBefore(brand,brandNext);else brandHome.prepend(brand);
  }

  function hideAllExcept(page){
    directSections().forEach(section=>{
      if(section===page){section.hidden=false;section.removeAttribute("hidden");important(section,"display","block")}
      else important(section,"display","none");
    });
  }

  function closeModes(){
    try{const p=by("v224GlobalNearbyPanel");if(p&&!p.hidden)by("v224CloseGlobalMap")?.click()}catch(_){}
    try{const p=by("v224GpsPanel");if(p&&!p.hidden)by("v224GpsBack")?.click()}catch(_){}
  }

  function announceState(on,reason){
    try{window.dispatchEvent(new CustomEvent("libcomlair-map-gps-page",{detail:{active:on,reason,version:"v224-33"}}))}catch(_){}
  }

  function openPage(reason="from-home"){
    const flow=window.LibcomlairPageFlow;
    if(!flow?.showSearch)return false;
    flow.showSearch();
    const page=ensurePage();if(!page)return false;
    pending=false;active=true;
    body.classList.remove("v224-map-gps-page");
    body.classList.add("v224-map-gps-standalone");
    moveBrandIn();hideAllExcept(page);
    requestAnimationFrame(()=>{window.scrollTo({top:0,left:0,behavior:"auto"});page.scrollIntoView({block:"start",behavior:"auto"})});
    announceState(true,reason);
    return true;
  }

  function leaveToSearch(){
    closeModes();
    active=false;pending=false;
    body.classList.remove("v224-map-gps-standalone","v224-map-gps-page");
    restoreBrand();
    window.LibcomlairPageFlow?.showSearch?.();
    requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:"auto"}));
    announceState(false,"next");
  }

  function leaveToHome(){
    closeModes();
    active=false;pending=false;
    body.classList.remove("v224-map-gps-standalone","v224-map-gps-page");
    restoreBrand();
    const page=by("v224MapGpsStandalone");if(page){page.hidden=true;important(page,"display","none")}
    window.LibcomlairOnboardingScreens?.showHome?.();
    announceState(false,"back");
  }

  function scheduleOpen(reason){
    pending=true;
    setTimeout(()=>{if(pending)openPage(reason)},70);
    setTimeout(()=>{if(pending)openPage(reason)},180);
  }

  const page3Next=by("v224Page3Next");
  page3Next?.addEventListener("click",()=>scheduleOpen("from-home"),true);

  document.addEventListener("click",event=>{
    const target=event.target?.closest?.(".v224-gps-go,#v224DetailGps");
    if(target)scheduleOpen("gps-destination");
  },true);

  window.addEventListener("libcomlair-map-gps-open",()=>scheduleOpen("api"));

  try{
    new MutationObserver(()=>{
      if(active&&!body.classList.contains("v224-page4-step")){
        active=false;body.classList.remove("v224-map-gps-standalone");restoreBrand();announceState(false,"page-left");
      }
    }).observe(body,{attributes:true,attributeFilter:["class"]});
  }catch(_){}

  function init(){ensurePage();body.classList.remove("v224-map-gps-page")}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,0),{once:true});else setTimeout(init,0);

  window.LibcomlairMapGpsPage=Object.freeze({version:"v224-33",open:()=>openPage("manual"),leaveToSearch,leaveToHome,isActive:()=>active});
})();