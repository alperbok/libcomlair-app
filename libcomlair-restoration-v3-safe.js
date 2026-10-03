(()=>{
  "use strict";

  const by=id=>document.getElementById(id);

  function enrichVoiceModeTutorial(){
    const screen=by("v224VoiceScreenFresh");
    if(!screen)return;
    const cards=[...screen.querySelectorAll(".v224-voice-fresh-card")];
    for(const card of cards){
      const input=card.querySelector('input[name="v224FreshVoiceMode"]');
      const help=card.querySelector(".v224-voice-fresh-help");
      if(!input||!help)continue;
      if(input.value==="discovery"){
        help.textContent="Première utilisation — Libcomlair présente chaque page, lit les explications et les choix visibles, annonce les éléments sélectionnés et indique les commandes vocales disponibles.";
      }else if(input.value==="simplified"){
        help.textContent="Utilisation courante — Libcomlair annonce seulement le nom de la page, les informations essentielles et les actions utiles pour aller plus vite.";
      }
    }
    const note=screen.querySelector(".v224-voice-fresh-note");
    if(note)note.textContent="Vous pourrez changer ce niveau à tout moment depuis Assistance et réglages, sans modifier vos besoins d’accessibilité.";
  }

  function enrichMapGpsTutorial(){
    const nearby=by("v224NearbyModeTutorial");
    const gps=by("v224GpsModeTutorial");
    if(nearby)nearby.textContent="Rôle : utiliser votre position pour afficher les lieux et transports proches. La carte est facultative : les lieux trouvés restent disponibles dans Résultats, et une catégorie déjà choisie doit rester active.";
    if(gps)gps.textContent="Rôle : préparer un trajet vers un lieu que vous avez choisi. Le GPS accessible est encore en projet et devra tenir compte, lorsque les données le permettent, de vos besoins d’accessibilité.";
  }

  function sync(){
    enrichVoiceModeTutorial();
    enrichMapGpsTutorial();
  }

  function boundedSync(){
    [0,80,220,500].forEach(ms=>setTimeout(sync,ms));
  }

  ["libcomlair-onboarding-step","libcomlair-map-gps-page","libcomlair-voice-mode-change","libcomlair-voice-context-change","pageshow"].forEach(name=>window.addEventListener(name,boundedSync));
  document.addEventListener("click",()=>{setTimeout(sync,0);setTimeout(sync,140)},true);

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boundedSync,{once:true});
  else boundedSync();

  window.LibcomlairRestorationV3Safe=Object.freeze({version:"restoration-v3.1-samsung-safe",sync});
})();