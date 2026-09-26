(()=>{
  "use strict";

  function applySimpleLabels(){
    const validate=document.getElementById("applyAccessProfile");
    const noAdapt=document.getElementById("skipAccessProfile");

    if(validate){
      validate.textContent="Valider";
      validate.setAttribute("aria-label","Valider");
      validate.dataset.voicePrimary="valider";
      validate.dataset.voiceAliases="confirmer|mes choix|utiliser mes choix";
    }

    if(noAdapt){
      noAdapt.textContent="Sans adaptation";
      noAdapt.setAttribute("aria-label","Sans adaptation");
      noAdapt.dataset.voicePrimary="sans adaptation";
      noAdapt.dataset.voiceAliases="aucune adaptation|pas d’adaptation|continuer sans adaptation|continuer";
    }
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",applySimpleLabels,{once:true});
  }else{
    applySimpleLabels();
  }

  window.LibcomlairProfileSimpleActions=Object.freeze({
    version:"v224-1",
    apply:applySimpleLabels
  });
})();
