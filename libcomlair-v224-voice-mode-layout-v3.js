(()=>{
  "use strict";
  const OPTIONS={
    discovery:{title:"Découverte guidée",description:"Première utilisation — Explication complète des pages et des choix."},
    simplified:{title:"Simplifié",description:"Utilisation courante — Annonce seulement l’essentiel."}
  };

  function apply(){
    const fieldset=document.getElementById("visionAssistanceMode");
    if(!fieldset)return false;

    fieldset.querySelectorAll('input[name="visionAssistanceModeChoice"]').forEach(input=>{
      const data=OPTIONS[input.value];
      const label=input.closest("label");
      if(!data||!label)return;

      let text=label.querySelector(".v224-assistance-option-text");
      if(!text){
        text=document.createElement("span");
        text.className="v224-assistance-option-text";
        label.appendChild(text);
      }

      text.replaceChildren();

      const title=document.createElement("strong");
      title.className="v224-voice-option-title v224-voice-option-title-box";
      title.textContent=data.title;

      const description=document.createElement("span");
      description.className="v224-voice-option-description v224-voice-option-description-final";
      description.textContent=data.description;

      text.append(title,description);
      label.setAttribute("aria-label",data.title+". "+data.description);

      let sibling=label.nextElementSibling;
      while(sibling&&sibling.classList&&sibling.classList.contains("v224-voice-option-definition")){
        const next=sibling.nextElementSibling;
        sibling.remove();
        sibling=next;
      }
    });

    const help=document.getElementById("visionAssistanceModeHelp");
    if(help)help.textContent="Le mode d’assistance vocale peut être changé à tout moment.";
    return true;
  }

  const schedule=()=>{setTimeout(apply,0);setTimeout(apply,120);setTimeout(apply,350);setTimeout(apply,700)};
  window.addEventListener("libcomlair-onboarding-step",e=>{if(e?.detail?.id==="voice")schedule()});
  window.addEventListener("pageshow",schedule);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();

  try{
    new MutationObserver(()=>{
      if(document.body?.classList.contains("v224-onboarding-voice"))schedule();
    }).observe(document.body,{attributes:true,attributeFilter:["class"]});
  }catch(_){}

  window.LibcomlairVoiceModeLayoutFinal=Object.freeze({version:"v224-3",apply});
})();
