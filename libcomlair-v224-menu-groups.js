(()=>{
  "use strict";

  function ensureGroups(){
    const panel=document.getElementById("libcomlairGlobalMenuPanel");
    const actions=panel?.querySelector(".libcomlair-settings-actions");
    if(!panel||!actions)return false;

    let frame=document.getElementById("libcomlairHelpActionsFrame");
    if(!frame){
      frame=document.createElement("section");
      frame.id="libcomlairHelpActionsFrame";
      frame.className="libcomlair-settings-group libcomlair-help-group";
      frame.setAttribute("aria-labelledby","libcomlairHelpActionsTitle");

      const title=document.createElement("h3");
      title.id="libcomlairHelpActionsTitle";
      title.textContent="Aide et utilisation";

      actions.parentElement.insertBefore(frame,actions);
      frame.append(title,actions);
    }

    const technical=panel.querySelector(".technical-menu-panel");
    if(technical){
      technical.classList.add("libcomlair-technical-group");
      technical.setAttribute("aria-label","Outils techniques");
    }
    return true;
  }

  const run=()=>{ensureGroups();setTimeout(ensureGroups,80);setTimeout(ensureGroups,250)};
  window.addEventListener("pageshow",run);
  window.addEventListener("libcomlair-onboarding-step",run);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();

  window.LibcomlairMenuGroups=Object.freeze({version:"v224-1",apply:ensureGroups});
})();