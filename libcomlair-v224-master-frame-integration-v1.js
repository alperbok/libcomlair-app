(()=>{
  "use strict";

  const body=document.body;
  const main=document.getElementById("mainContent");
  if(!body||!main)return;

  const origin={parent:main.parentNode,next:main.nextSibling};
  const moved=new Map();
  const nativeObservers=new Map();
  let shell=null,header=null,footer=null,backButton=null,nextButton=null,status=null,menuProxy=null;
  let currentMic=null;

  const isOnboardingFramed=()=>body.classList.contains("v224-onboarding-voice")||body.classList.contains("v224-onboarding-tutorial")||body.classList.contains("v224-onboarding-home");
  const isFramedScreen=()=>isOnboardingFramed()||body.classList.contains("v224-page4-step")||body.classList.contains("v224-page5-step")||body.classList.contains("v224-map-gps-standalone");
  const isNeeds=()=>body.classList.contains("v224-onboarding-needs");
  const nativeActionIds=["v224VoiceModeActions","v224TutorialActions","v224HomeActions","v224Page4Back","v224Page5Back","v224MapGpsNavV33"];

  function rememberAndMove(el,target){
    if(!el||!target)return;
    if(!moved.has(el))moved.set(el,{parent:el.parentNode,next:el.nextSibling});
    if(el.parentNode!==target)target.appendChild(el);
  }

  function restore(el){
    const home=moved.get(el);if(!home)return;
    const parent=home.parent;
    if(parent&&parent.isConnected){
      if(home.next&&home.next.parentNode===parent)parent.insertBefore(el,home.next);else parent.appendChild(el);
    }
    moved.delete(el);
  }

  function restoreAll(){
    [...moved.keys()].forEach(restore);
    currentMic=null;
  }

  function openGlobalMenu(){
    try{
      if(window.LibcomlairGlobalAssistance?.open){window.LibcomlairGlobalAssistance.open(false);return}
    }catch(_){}
    document.getElementById("libcomlairGlobalMenuButton")?.click?.();
  }

  function makeShell(){
    if(shell)return;

    shell=document.createElement("div");
    shell.id="v224MasterShell";
    shell.setAttribute("aria-label","Cadre Libcomlair");

    header=document.createElement("header");
    header.id="v224MasterHeader";
    header.className="v222-app-brand";

    menuProxy=document.createElement("button");
    menuProxy.id="v224MasterMenu";
    menuProxy.type="button";
    menuProxy.setAttribute("aria-label","Assistance et réglages");
    menuProxy.setAttribute("aria-haspopup","dialog");
    menuProxy.textContent="☰";
    menuProxy.addEventListener("click",openGlobalMenu);

    const logo=document.createElement("img");
    logo.className="v222-brand-logo";
    logo.src="assets/libcomlair-logo-v222.jpg?v=224-clean-source-4";
    logo.alt="Libcomlair — Sortir en toute liberté";
    header.append(menuProxy,logo);

    footer=document.createElement("footer");
    footer.id="v224MasterFooter";

    backButton=document.createElement("button");
    backButton.id="v224MasterReturn";
    backButton.className="v224-master-nav";
    backButton.type="button";
    backButton.textContent="Retour";

    nextButton=document.createElement("button");
    nextButton.id="v224MasterNext";
    nextButton.className="v224-master-nav";
    nextButton.type="button";
    nextButton.textContent="Suivant";

    status=document.createElement("p");
    status.id="v224MasterStatus";
    status.setAttribute("aria-live","polite");

    footer.append(backButton,nextButton,status);
    backButton.addEventListener("click",handleBack);
    nextButton.addEventListener("click",handleNext);
  }

  function announce(message){
    if(!status)return;
    status.textContent="";
    requestAnimationFrame(()=>{if(status)status.textContent=message});
  }

  function nativeBack(){
    if(body.classList.contains("v224-onboarding-voice"))return document.getElementById("v224VoiceModeBack");
    if(body.classList.contains("v224-onboarding-tutorial"))return document.getElementById("v224TutorialBack");
    if(body.classList.contains("v224-onboarding-home"))return document.getElementById("v224HomeBack");
    if(body.classList.contains("v224-map-gps-standalone"))return document.getElementById("v224MapGpsBackV33");
    if(body.classList.contains("v224-page5-step"))return document.getElementById("v224Page5Back");
    return document.getElementById("v224Page4Back");
  }

  function nativeNext(){
    if(body.classList.contains("v224-onboarding-voice"))return document.getElementById("v224VoiceModeValidate");
    if(body.classList.contains("v224-onboarding-tutorial"))return document.getElementById("v224TutorialNext");
    if(body.classList.contains("v224-onboarding-home"))return document.getElementById("v224Page3Next");
    if(body.classList.contains("v224-map-gps-standalone"))return document.getElementById("v224MapGpsNextV33");
    return null;
  }

  function visible(el){
    if(!el||!el.isConnected)return false;
    const style=getComputedStyle(el);
    return style.display!=="none"&&style.visibility!=="hidden"&&!el.hidden;
  }

  function firstCentralChoice(){
    const selectors=body.classList.contains("v224-page5-step")
      ? ["#v224Page4Categories .v224-page5-active .subcategory-button","#v224Page4Categories .v224-page5-active .category","#v224ResultsSection button","#places button","#detail button"]
      : ["#v224Page4Categories summary.category","#v224Page4Categories .category","#search"];
    for(const selector of selectors){
      const found=[...main.querySelectorAll(selector)].find(visible);
      if(found)return found;
    }
    return null;
  }

  function handleBack(){
    const btn=nativeBack();
    if(btn){btn.click();return}
    announce("Le bouton Retour de cette page n'est pas encore disponible.");
  }

  function handleNext(){
    const btn=nativeNext();
    if(btn){btn.click();return}

    const focused=document.activeElement;
    if(focused&&main.contains(focused)&&visible(focused)&&typeof focused.click==="function"&&focused.matches("button,summary,[role='button'],a")){
      focused.click();
      return;
    }

    const choice=firstCentralChoice();
    if(choice){
      try{choice.focus({preventScroll:false})}catch(_){choice.focus?.()}
      announce(body.classList.contains("v224-page5-step")
        ? "Choisissez une sous-catégorie ou une action dans le centre de la page."
        : "Choisissez une catégorie dans le centre de la page.");
      return;
    }
    announce("Choisissez d'abord une option dans le centre de la page.");
  }

  function desiredMic(){
    if(isOnboardingFramed())return document.getElementById("v224Page3Mic");
    if(body.classList.contains("v224-page5-step"))return document.getElementById("v224Page5Mic");
    return document.getElementById("v224Page4Mic");
  }

  function suppressLegacyHeader(){
    if(!isOnboardingFramed())return;
    const needs=document.getElementById("accessNeedsSection");
    if(needs){
      needs.style.setProperty("display","none","important");
      needs.setAttribute("aria-hidden","true");
    }
  }

  function suppressNativeNavigation(){
    if(!body.classList.contains("v224-master-frame-active"))return;
    nativeActionIds.forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.style.setProperty("display","none","important");
    });
  }

  function watchNativeNavigation(){
    nativeActionIds.forEach(id=>{
      const el=document.getElementById(id);
      if(!el||nativeObservers.has(el))return;
      const observer=new MutationObserver(()=>{
        if(body.classList.contains("v224-master-frame-active")&&el.style.getPropertyValue("display")!=="none"){
          el.style.setProperty("display","none","important");
        }
      });
      observer.observe(el,{attributes:true,attributeFilter:["style","hidden"]});
      nativeObservers.set(el,observer);
    });
  }

  function syncNeedsCosmetics(){
    if(!isNeeds())return;
    const mic=document.getElementById("v222ProfileMic");
    if(mic){
      ["width","height","min-width","min-height","max-width","max-height"].forEach(prop=>mic.style.setProperty(prop,"74px","important"));
      mic.style.setProperty("right","0","important");
      mic.style.setProperty("top","1px","important");
      mic.style.setProperty("font-size","1.62rem","important");
      const label=mic.querySelector("span");
      if(label)label.style.setProperty("font-size",".82rem","important");
    }
    document.querySelectorAll("#v224NeedsActions button").forEach(btn=>{
      btn.style.setProperty("background","#0f7784","important");
      btn.style.setProperty("color","#fff","important");
      btn.style.setProperty("border-color","#0f7784","important");
    });
  }

  function syncScrollMode(){
    if(!body.classList.contains("v224-master-frame-active")){
      body.classList.remove("v224-master-scroll-needed");
      return;
    }
    requestAnimationFrame(()=>{
      if(!body.classList.contains("v224-master-frame-active"))return;
      const forced=body.classList.contains("v224-results-step")||body.classList.contains("v224-utility-step");
      const overflow=main.scrollHeight>main.clientHeight+3;
      const needed=forced||overflow;
      if(body.classList.contains("v224-master-scroll-needed")!==needed){
        body.classList.toggle("v224-master-scroll-needed",needed);
      }
    });
  }

  function syncControls(){
    if(!header||!body.classList.contains("v224-master-frame-active"))return;

    const mic=desiredMic();
    if(currentMic&&currentMic!==mic)restore(currentMic);
    if(mic){rememberAndMove(mic,header);currentMic=mic}
    suppressLegacyHeader();
    suppressNativeNavigation();
    watchNativeNavigation();
    syncScrollMode();

    if(nextButton){
      if(body.classList.contains("v224-map-gps-standalone"))nextButton.setAttribute("aria-label","Suivant, revenir à la recherche");
      else if(body.classList.contains("v224-onboarding-home"))nextButton.setAttribute("aria-label","Suivant, ouvrir Carte et GPS");
      else if(body.classList.contains("v224-onboarding-voice"))nextButton.setAttribute("aria-label","Suivant, valider le niveau d’assistance vocale");
      else if(body.classList.contains("v224-onboarding-tutorial"))nextButton.setAttribute("aria-label","Suivant");
      else if(body.classList.contains("v224-page5-step"))nextButton.setAttribute("aria-label","Suivant après avoir choisi une sous-catégorie ou une action");
      else nextButton.setAttribute("aria-label","Suivant après avoir choisi une catégorie");
    }
  }

  function activate(){
    makeShell();
    if(main.parentNode!==shell){
      const parent=main.parentNode;
      parent.insertBefore(shell,main);
      shell.append(header,main,footer);
    }
    if(!body.classList.contains("v224-master-frame-active"))body.classList.add("v224-master-frame-active");
    syncControls();
    setTimeout(syncControls,0);
    setTimeout(syncControls,100);
    setTimeout(syncControls,300);
  }

  function deactivate(){
    if(!shell)return;
    body.classList.remove("v224-master-frame-active","v224-master-scroll-needed");
    restoreAll();
    if(main.parentNode===shell&&origin.parent&&origin.parent.isConnected){
      if(origin.next&&origin.next.parentNode===origin.parent)origin.parent.insertBefore(main,origin.next);else origin.parent.appendChild(main);
    }
    shell.remove();
    shell=header=footer=backButton=nextButton=status=menuProxy=null;
  }

  function sync(){
    syncNeedsCosmetics();
    if(isFramedScreen())activate();else deactivate();
  }

  function screenName(){
    if(isNeeds())return "needs";
    if(body.classList.contains("v224-onboarding-voice"))return "navigation-voice";
    if(body.classList.contains("v224-onboarding-tutorial"))return "presentation";
    if(body.classList.contains("v224-onboarding-home"))return "home-search";
    if(body.classList.contains("v224-map-gps-standalone"))return "map-gps";
    if(body.classList.contains("v224-results-step"))return "results";
    if(body.classList.contains("v224-utility-step"))return "utility";
    if(body.classList.contains("v224-page5-step"))return "subcategory";
    if(body.classList.contains("v224-page4-step"))return "categories";
    return "protected-or-other";
  }

  function inspect(){
    const active=body.classList.contains("v224-master-frame-active");
    const masterRect=main.getBoundingClientRect();
    const footerRect=footer?.getBoundingClientRect?.();
    const mic=active?desiredMic():document.getElementById("v222ProfileMic");
    const micRect=mic?.getBoundingClientRect?.();
    const visibleLogos=[...document.querySelectorAll(".v222-brand-logo")].filter(visible);
    const visibleMics=[...document.querySelectorAll("#v222ProfileMic,#v224Page3Mic,#v224Page4Mic,#v224Page5Mic")].filter(visible);
    const visibleNativeActions=nativeActionIds.map(id=>document.getElementById(id)).filter(visible);
    return {
      screen:screenName(),
      masterActive:active,
      visibleLogos:visibleLogos.length,
      visibleMicros:visibleMics.length,
      visibleNativeNavigation:visibleNativeActions.map(el=>el.id),
      center:{top:Math.round(masterRect.top),bottom:Math.round(masterRect.bottom),height:Math.round(masterRect.height),scrollHeight:main.scrollHeight,clientHeight:main.clientHeight},
      mic:micRect?{bottom:Math.round(micRect.bottom),size:Math.round(micRect.width)}:null,
      footer:footerRect?{top:Math.round(footerRect.top)}:null,
      overlaps:{micCenter:!!(micRect&&micRect.bottom>masterRect.top),centerFooter:!!(footerRect&&masterRect.bottom>footerRect.top+1)},
      scrollEnabled:body.classList.contains("v224-master-scroll-needed")
    };
  }

  const observer=new MutationObserver(()=>{
    sync();
    if(body.classList.contains("v224-master-frame-active")){
      setTimeout(syncControls,0);
      setTimeout(syncControls,120);
    }
  });
  observer.observe(body,{attributes:true,attributeFilter:["class"]});

  window.addEventListener("libcomlair-map-gps-page",()=>setTimeout(sync,0));
  window.addEventListener("libcomlair-onboarding-step",()=>{
    setTimeout(sync,0);
    setTimeout(syncControls,120);
    setTimeout(syncNeedsCosmetics,160);
  });
  window.addEventListener("resize",()=>setTimeout(syncScrollMode,50));
  document.addEventListener("click",()=>{
    syncNeedsCosmetics();
    if(body.classList.contains("v224-master-frame-active")){
      setTimeout(syncControls,0);
      setTimeout(syncControls,120);
      setTimeout(syncScrollMode,250);
    }
  },true);

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(sync,0),{once:true});else setTimeout(sync,0);

  window.LibcomlairMasterFrameIntegration=Object.freeze({
    version:"v5.1-systematic-audit-stable",
    refresh:sync,
    inspect,
    isActive:()=>body.classList.contains("v224-master-frame-active")
  });
})();
