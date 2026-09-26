(()=>{
  "use strict";

  function setVoice(el,primary,aliases){
    if(!el)return;
    el.dataset.voicePrimary=primary;
    el.dataset.voiceAliases=(aliases||[]).join("|");
  }

  function applySimpleLabels(){
    const validate=document.getElementById("applyAccessProfile");
    const noAdapt=document.getElementById("skipAccessProfile");
    const backProfile=document.getElementById("changeAccessProfile");

    if(validate){
      validate.textContent="Valider";
      validate.setAttribute("aria-label","Valider");
      setVoice(validate,"valider",["confirmer","mes choix","utiliser mes choix"]);
    }

    if(noAdapt){
      noAdapt.textContent="Sans adaptation";
      noAdapt.setAttribute("aria-label","Sans adaptation");
      setVoice(noAdapt,"sans adaptation",["aucune adaptation","pas d’adaptation","continuer sans adaptation","continuer"]);
    }

    if(backProfile){
      backProfile.textContent="Retour au profil";
      backProfile.setAttribute("aria-label","Retour au profil");
      setVoice(backProfile,"retour",["retour profil","profil","modifier mon profil","modifier mon profil d’accessibilité"]);
    }
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",applySimpleLabels,{once:true});
  }else{
    applySimpleLabels();
  }

  window.LibcomlairProfileSimpleActions=Object.freeze({
    version:"v224-2",
    apply:applySimpleLabels
  });
})();