(()=>{
  "use strict";

  const body=document.body;
  if(!body)return;

  let shell=null,header=null,main=null,footer=null,menu=null,logo=null;
  let profileHome=null,profileNext=null,micHome=null,micNext=null;

  function by(id){return document.getElementById(id)}
  function profileActive(){return body.classList.contains("v221-profile-step")&&!body.classList.contains("v224-master-frame-active")}

  function openMenu(){
    try{if(window.LibcomlairGlobalAssistance?.open){window.LibcomlairGlobalAssistance.open(false);return}}catch(_){}
    try{by("libcomlairGlobalMenuButton")?.click?.()}catch(_){}
  }

  function remember(el,type){
    if(!el)return;
    if(type==="profile"&&!profileHome){profileHome=el.parentNode;profileNext=el.nextSibling}
    if(type==="mic"&&!micHome){micHome=el.parentNode;micNext=el.nextSibling}
  }

  function restoreNode(el,parent,next){
    if(!el||!parent||!parent.isConnected)return;
    if(next&&next.parentNode===parent)parent.insertBefore(el,next);else parent.appendChild(el);
  }

  function makeProfileShell(){
    if(shell)return;
    shell=document.createElement("div");
    shell.id="v3ProfileShell";
    shell.setAttribute("aria-label","Cadre Libcomlair — Profil");

    header=document.createElement("header");
    header.id="v3ProfileHeader";

    menu=document.createElement("button");
    menu.id="v3ProfileMenu";
    menu.type="button";
    menu.setAttribute("aria-label","Assistance et réglages");
    menu.textContent="☰";
    menu.addEventListener("click",openMenu);

    logo=document.createElement("img");
    logo.id="v3ProfileLogo";
    logo.src="assets/libcomlair-logo-v222.jpg?v=224-clean-source-4";
    logo.alt="Libcomlair — Sortir en toute liberté";

    main=document.createElement("main");
    main.id="v3ProfileMain";

    footer=document.createElement("footer");
    footer.id="v3ProfileFooter";

    const validate=document.createElement("button");
    validate.type="button";
    validate.textContent="Valider";
    validate.setAttribute("aria-label","Valider mes besoins d’accessibilité");
    validate.addEventListener("click",()=>by("applyAccessProfile")?.click?.());

    const skip=document.createElement("button");
    skip.type="button";
    skip.textContent="Sans adaptation";
    skip.setAttribute("aria-label","Continuer sans adaptation");
    skip.addEventListener("click",()=>by("skipAccessProfile")?.click?.());

    header.append(menu,logo);
    footer.append(validate,skip);
    shell.append(header,main,footer);
  }

  function activateProfileFrame(){
    const profile=by("accessWelcome");
    const mic=by("v222ProfileMic");
    if(!profile)return;
    makeProfileShell();
    if(!shell.isConnected){
      const parent=profile.parentNode;
      remember(profile,"profile");
      if(parent)parent.insertBefore(shell,profile);
    }
    remember(mic,"mic");
    if(profile.parentNode!==main)main.appendChild(profile);
    if(mic&&mic.parentNode!==header)header.appendChild(mic);
    body.classList.add("v3-profile-frame-active");
    try{main.scrollTop=0}catch(_){}
  }

  function deactivateProfileFrame(){
    if(!shell)return;
    const profile=by("accessWelcome");
    const mic=by("v222ProfileMic");
    body.classList.remove("v3-profile-frame-active");
    if(micHome)restoreNode(mic,micHome,micNext);
    if(profileHome)restoreNode(profile,profileHome,profileNext);
    shell.remove();
    shell=header=main=footer=menu=logo=null;
    profileHome=profileNext=micHome=micNext=null;
  }

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

  function fixShortPageScroll(){
    const shortPage=(
      body.classList.contains("v224-onboarding-voice")||
      body.classList.contains("v224-onboarding-home")||
      body.classList.contains("v224-map-gps-standalone")||
      (body.classList.contains("v224-page4-step")&&!body.classList.contains("v224-page5-step"))||
      (body.classList.contains("v224-page5-step")&&!body.classList.contains("v224-results-step")&&!body.classList.contains("v224-utility-step"))
    );
    if(shortPage)body.classList.remove("v224-master-scroll-needed");
  }

  function sync(){
    if(profileActive())activateProfileFrame();else deactivateProfileFrame();
    enrichVoiceModeTutorial();
    enrichMapGpsTutorial();
    fixShortPageScroll();
    setTimeout(()=>{enrichVoiceModeTutorial();enrichMapGpsTutorial();fixShortPageScroll()},80);
    setTimeout(fixShortPageScroll,260);
  }

  const observer=new MutationObserver(sync);
  observer.observe(body,{attributes:true,attributeFilter:["class"]});
  ["libcomlair-onboarding-step","libcomlair-map-gps-page","libcomlair-voice-mode-change","pageshow"].forEach(name=>window.addEventListener(name,sync));
  document.addEventListener("click",()=>setTimeout(sync,0),true);

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",sync,{once:true});else sync();

  window.LibcomlairRestorationV3=Object.freeze({version:"restoration-v3-frame-unification",sync});
})();