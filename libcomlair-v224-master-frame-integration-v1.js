(()=>{
  "use strict";

  const body=document.body;
  const main=document.getElementById("mainContent");
  if(!body||!main)return;

  const origin={parent:main.parentNode,next:main.nextSibling};
  const moved=new Map();
  let shell=null,header=null,footer=null,backButton=null,nextButton=null,status=null,menuProxy=null;
  let currentMic=null;

  const isOnboardingFramed=()=>body.classList.contains("v224-onboarding-voice")||body.classList.contains("v224-onboarding-tutorial")||body.classList.contains("v224-onboarding-home");
  const isFramedScreen=()=>isOnboardingFramed()||body.classList.contains("v224-page4-step")||body.classList.contains("v224-page5-step")||body.classList.contains("v224-map-gps-standalone");

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
      ? ["#v224Page4Categories .v224-page5-active .category","#v224ResultsSection button","#places button","#detail button"]
      : ["#v224Page4Categories summary.category","#v224Page4Categories .category","#search"];
    for(const selector of selectors){
      const found=[...main.querySelectorAll(selector)].find(visible);
      if(found)return found;
    }
    return null;
  }

  function handleBack(){
    const btn=nativeBack();
    if(btn){btn.click();return;}
    announce("Le bouton Retour de cette page n'est pas encore disponible.");
  }

  function handleNext(){
    const btn=nativeNext();
    if(btn){btn.click();return;}

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
    if(needs)needs.style.setProperty("display","none","important");
  }

  function syncControls(){
    if(!header||!body.classList.contains("v224-master-frame-active"))return;

    const mic=desiredMic();
    if(currentMic&&currentMic!==mic)restore(currentMic);
    if(mic){rememberAndMove(mic,header);currentMic=mic}
    suppressLegacyHeader();

    if(nextButton){
      if(body.classList.contains("v224-map-gps-standalone")){
        nextButton.setAttribute("aria-label","Suivant, revenir à la recherche");
      }else if(body.classList.contains("v224-onboarding-home")){
        nextButton.setAttribute("aria-label","Suivant, ouvrir Carte et GPS");
      }else if(body.classList.contains("v224-onboarding-voice")){
        nextButton.setAttribute("aria-label","Suivant, valider le niveau d’assistance vocale");
      }else if(body.classList.contains("v224-onboarding-tutorial")){
        nextButton.setAttribute("aria-label","Suivant");
      }else if(body.classList.contains("v224-page5-step")){
        nextButton.setAttribute("aria-label","Suivant après avoir choisi une sous-catégorie ou une action");
      }else{
        nextButton.setAttribute("aria-label","Suivant après avoir choisi une catégorie");
      }
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
  }

  function deactivate(){
    if(!shell)return;
    if(body.classList.contains("v224-master-frame-active"))body.classList.remove("v224-master-frame-active");
    restoreAll();
    if(main.parentNode===shell&&origin.parent&&origin.parent.isConnected){
      if(origin.next&&origin.next.parentNode===origin.parent)origin.parent.insertBefore(main,origin.next);else origin.parent.appendChild(main);
    }
    shell.remove();
    shell=header=footer=backButton=nextButton=status=menuProxy=null;
  }

  function sync(){
    if(isFramedScreen())activate();else deactivate();
  }

  const observer=new MutationObserver(()=>{
    sync();
    if(body.classList.contains("v224-master-frame-active"))setTimeout(syncControls,0);
  });
  observer.observe(body,{attributes:true,attributeFilter:["class"]});

  window.addEventListener("libcomlair-map-gps-page",()=>setTimeout(sync,0));
  window.addEventListener("libcomlair-onboarding-step",()=>setTimeout(sync,0));
  document.addEventListener("click",()=>{
    if(body.classList.contains("v224-master-frame-active"))setTimeout(syncControls,0);
  },true);

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(sync,0),{once:true});else setTimeout(sync,0);

  window.LibcomlairMasterFrameIntegration=Object.freeze({
    version:"v3-onboarding-samsung-stable",
    refresh:sync,
    isActive:()=>body.classList.contains("v224-master-frame-active")
  });
})();
