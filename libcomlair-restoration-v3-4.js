(()=>{
  "use strict";

  const PROFILE_PROXY_ID="libcomlairProfileMenuProxy";

  function profileVisible(){
    const body=document.body;
    const welcome=document.getElementById("accessWelcome");
    if(!body||!welcome)return false;
    if(!body.classList.contains("v221-profile-step"))return false;
    try{
      const s=getComputedStyle(welcome),r=welcome.getBoundingClientRect();
      return !welcome.hidden&&s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0;
    }catch(_){return !welcome.hidden}
  }

  function openExistingMenu(){
    const backdrop=document.getElementById("libcomlairGlobalMenuBackdrop");
    const close=document.getElementById("libcomlairGlobalMenuClose");
    const globalButton=document.getElementById("libcomlairGlobalMenuButton");
    if(backdrop){
      backdrop.hidden=false;
      globalButton?.setAttribute?.("aria-expanded","true");
      requestAnimationFrame(()=>close?.focus?.());
      return true;
    }
    try{
      if(window.LibcomlairGlobalAssistance?.open?.(false))return true;
    }catch(_){}
    return false;
  }

  function ensureProfileMenu(){
    let proxy=document.getElementById(PROFILE_PROXY_ID);
    const welcome=document.getElementById("accessWelcome");
    if(!welcome)return;

    if(!proxy){
      proxy=document.createElement("button");
      proxy.id=PROFILE_PROXY_ID;
      proxy.type="button";
      proxy.textContent="☰";
      proxy.setAttribute("aria-label","Assistance et réglages");
      proxy.setAttribute("aria-haspopup","dialog");
      proxy.addEventListener("click",openExistingMenu);
      welcome.appendChild(proxy);
    }

    if(profileVisible())proxy.style.setProperty("display","flex","important");
    else proxy.style.setProperty("display","none","important");
  }

  function boundedSync(){
    [0,80,220,500].forEach(ms=>setTimeout(ensureProfileMenu,ms));
  }

  ["pageshow","libcomlair-onboarding-step","libcomlair-voice-context-change"].forEach(name=>window.addEventListener(name,boundedSync));
  document.addEventListener("click",()=>setTimeout(ensureProfileMenu,80),true);

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boundedSync,{once:true});
  else boundedSync();

  window.LibcomlairRestorationV34=Object.freeze({version:"restoration-v3.4-finish",sync:ensureProfileMenu});
})();
