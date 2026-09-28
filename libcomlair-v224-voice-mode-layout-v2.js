(()=>{
  "use strict";
  const OPTIONS={
    discovery:{title:"Découverte guidée",intro:"Première utilisation",description:"Explication complète des pages et des choix."},
    simplified:{title:"Simplifié",intro:"Utilisation courante",description:"Annonce seulement l’essentiel."}
  };
  function apply(){
    const fieldset=document.getElementById("visionAssistanceMode");
    if(!fieldset)return;
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
      title.className="v224-voice-option-title";
      title.textContent=data.title;
      text.appendChild(title);
      let definition=label.nextElementSibling;
      if(!definition||!definition.classList.contains("v224-voice-option-definition")){
        definition=document.createElement("p");
        definition.className="v224-voice-option-definition data-note";
        label.insertAdjacentElement("afterend",definition);
      }
      definition.dataset.mode=input.value;
      definition.replaceChildren();
      const intro=document.createElement("strong");
      intro.textContent=data.intro+" : ";
      definition.append(intro,document.createTextNode(data.description));
      definition.setAttribute("data-voice-explain","true");
      label.setAttribute("aria-label",data.title+". "+data.intro+". "+data.description);
    });
    const help=document.getElementById("visionAssistanceModeHelp");
    if(help)help.textContent="Le mode d’assistance vocale peut être changé à tout moment.";
  }
  const run=()=>{setTimeout(apply,0);setTimeout(apply,100);setTimeout(apply,300)};
  window.addEventListener("libcomlair-onboarding-step",e=>{if(e?.detail?.id==="voice")run()});
  window.addEventListener("pageshow",run);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
})();
