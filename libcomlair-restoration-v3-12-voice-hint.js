(()=>{
  "use strict";

  const ID="v312VoiceGuidanceHint";
  const TEXT="Choisissez Découverte guidée pour les explications complètes ou Simplifié pour les annonces essentielles. Dites ensuite Valider. Vous pouvez aussi dire Retour.";

  function ensure(){
    const screen=document.getElementById("v224VoiceScreenFresh");
    if(!screen)return false;
    let hint=document.getElementById(ID);
    if(!hint){
      hint=document.createElement("p");
      hint.id=ID;
      hint.className="v312-voice-guidance-hint";
      hint.textContent=TEXT;
      const fieldset=screen.querySelector(".v224-voice-fresh-fieldset");
      if(fieldset&&fieldset.parentNode===screen){
        fieldset.insertAdjacentElement("afterend",hint);
      }else{
        screen.appendChild(hint);
      }
    }
    const active=document.body.classList.contains("v224-onboarding-voice");
    hint.hidden=!active;
    hint.style.setProperty("display",active?"block":"none","important");
    return true;
  }

  function schedule(){
    [0,80,220,500].forEach(ms=>setTimeout(ensure,ms));
  }

  window.addEventListener("libcomlair-onboarding-step",schedule);
  window.addEventListener("pageshow",schedule);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();

  window.LibcomlairRestorationVoiceHint=Object.freeze({version:"v3.12",ensure});
})();
