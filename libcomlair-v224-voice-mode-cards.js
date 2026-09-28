(()=>{
  "use strict";

  const OPTIONS={
    discovery:{
      eyebrow:"Première utilisation",
      title:"Découverte guidée",
      description:"Explication complète des pages et des choix."
    },
    simplified:{
      eyebrow:"Utilisation courante",
      title:"Simplifié",
      description:"Annonce seulement l’essentiel."
    }
  };

  function decorate(){
    const fieldset=document.getElementById("visionAssistanceMode");
    if(!fieldset)return false;

    fieldset.querySelectorAll('input[name="visionAssistanceModeChoice"]').forEach(input=>{
      const data=OPTIONS[input.value];
      if(!data)return;
      const label=input.closest("label");
      if(!label)return;

      let text=label.querySelector(".v224-assistance-option-text");
      if(!text){
        text=document.createElement("span");
        text.className="v224-assistance-option-text";
        [...label.childNodes].forEach(node=>{if(node!==input)text.appendChild(node)});
        label.appendChild(text);
      }

      text.replaceChildren();
      const eyebrow=document.createElement("span");
      eyebrow.className="v224-voice-option-eyebrow";
      eyebrow.textContent=data.eyebrow;

      const title=document.createElement("strong");
      title.className="v224-voice-option-title";
      title.textContent=data.title;

      const description=document.createElement("span");
      description.className="v224-voice-option-description";
      description.textContent=data.description;

      text.append(eyebrow,title,description);
      label.setAttribute("aria-label",data.eyebrow+", "+data.title+". "+data.description);
      label.dataset.voiceModeCard="true";
    });

    const help=document.getElementById("visionAssistanceModeHelp");
    if(help)help.textContent="Première utilisation : Découverte guidée explique les pages et les choix en détail. Utilisation courante : Simplifié annonce l’essentiel. Le mode peut être changé à tout moment.";

    return true;
  }

  function schedule(){
    setTimeout(decorate,0);
    setTimeout(decorate,80);
    setTimeout(decorate,250);
  }

  window.addEventListener("libcomlair-onboarding-step",event=>{
    if(event?.detail?.id==="voice")schedule();
  });
  window.addEventListener("pageshow",schedule);

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});
  else schedule();

  try{
    new MutationObserver(()=>{
      if(document.body?.classList.contains("v224-onboarding-voice"))schedule();
    }).observe(document.body,{attributes:true,attributeFilter:["class"]});
  }catch(_){}

  window.LibcomlairVoiceModeCards=Object.freeze({version:"v224-1",decorate});
})();
