(()=>{
  "use strict";

  let profileOpenedAt=0;

  function openProfile(event){
    const splash=document.getElementById("libcomlairSplash");
    const welcome=document.getElementById("accessWelcome");
    const title=document.getElementById("accessWelcomeTitle");
    if(!splash||!welcome)return false;

    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();

    profileOpenedAt=performance.now();

    splash.hidden=true;
    splash.setAttribute("aria-hidden","true");
    splash.style.setProperty("display","none","important");

    document.body.classList.remove("v221-onboarding");
    document.body.classList.add("v221-profile-step");

    welcome.hidden=false;
    welcome.removeAttribute("hidden");
    welcome.removeAttribute("aria-hidden");
    welcome.style.removeProperty("display");

    requestAnimationFrame(()=>{
      try{(title||welcome).scrollIntoView({block:"start",behavior:"auto"})}catch(_){}
      try{title?.focus?.()}catch(_){}
    });
    return true;
  }

  function guardProfileActions(event){
    const target=event.target?.closest?.("#applyAccessProfile,#skipAccessProfile");
    if(!target)return;
    if(!document.body.classList.contains("v221-profile-step"))return;
    if(performance.now()-profileOpenedAt>650)return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }

  function bind(){
    const button=document.getElementById("libcomlairSplashNext");
    if(button&&button.dataset.v224WelcomeHotfixBound!=="2"){
      button.dataset.v224WelcomeHotfixBound="2";
      button.addEventListener("click",openProfile,true);
    }
    if(document.documentElement.dataset.v224ProfileClickGuard!=="1"){
      document.documentElement.dataset.v224ProfileClickGuard="1";
      document.addEventListener("click",guardProfileActions,true);
    }
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});
  else bind();
  window.addEventListener("pageshow",bind);

  window.LibcomlairWelcomeTransitionHotfix=Object.freeze({version:"v224-2",bind,openProfile});
})();
