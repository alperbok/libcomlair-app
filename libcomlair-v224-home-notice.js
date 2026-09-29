(()=>{
  "use strict";

  const NOTICE_ID="v224HomeNotice";

  function ensureNotice(){
    const start=document.querySelector("section.hero.v219-main-zone");
    if(!start)return null;

    let notice=document.getElementById(NOTICE_ID);
    if(!notice){
      notice=document.createElement("section");
      notice.id=NOTICE_ID;
      notice.className="v224-home-notice";
      notice.setAttribute("role","note");
      notice.setAttribute("data-voice-explain","true");
      notice.innerHTML=`
        <h3>Comment utiliser cette page ?</h3>
        <div>Cette page est le point de départ pour rechercher un lieu accessible avec Libcomlair.</div>
        <div>Vous pouvez écouter la Présentation Libcomlair pour découvrir l’application et les possibilités proposées.</div>
        <div>Lorsque vous êtes prêt, choisissez Rechercher pour accéder aux catégories de lieux et commencer votre recherche.</div>
        <div>Le bouton Retour permet de revenir à l’écran précédent.</div>
        <div>Le micro reste disponible pour utiliser les commandes vocales lorsque l’assistance vocale est activée.</div>
        <div>En mode Découverte guidée, l’assistance vocale explique cette page et ses fonctions. En mode Simplifié, elle annonce uniquement les informations et les choix essentiels.</div>`;

      const homeActions=document.getElementById("v224HomeActions");
      const speech=document.getElementById("speechChoiceControls");
      if(homeActions&&homeActions.parentElement===start)start.insertBefore(notice,homeActions);
      else if(speech&&speech.parentElement===start)speech.insertAdjacentElement("afterend",notice);
      else start.appendChild(notice);
    }
    return notice;
  }

  function sync(){
    const notice=ensureNotice();
    const compact=document.getElementById("v224OnboardingCompactChoices");
    const onHome=document.body?.classList.contains("v224-onboarding-home");

    if(compact){
      compact.style.setProperty("display","none","important");
      compact.setAttribute("aria-hidden","true");
    }

    if(notice){
      if(onHome){
        notice.hidden=false;
        notice.removeAttribute("hidden");
        notice.removeAttribute("aria-hidden");
        notice.style.setProperty("display","block","important");
      }else{
        notice.style.setProperty("display","none","important");
        notice.setAttribute("aria-hidden","true");
      }
    }
  }

  function patchVoice(){
    const base=window.LibcomlairVoice;
    if(!base||base.__v224HomeNoticeProxy)return;
    try{
      const proxy=new Proxy(base,{
        get(target,prop,receiver){
          if(prop==="__v224HomeNoticeProxy")return true;
          if(prop==="speak"){
            return (text,options)=>{
              let output=String(text||"");
              const ctx=window.LibcomlairVoiceContext?.current?.();
              if(ctx?.id==="onboarding-home"){
                output=output.replace(
                  "Cette page permet de poursuivre vers la recherche de lieux accessibles et de rouvrir les aides principales.",
                  "Cette page est le point de départ pour rechercher un lieu accessible avec Libcomlair."
                );
                if(output.includes("Les deux aides permettent de rouvrir Navigation vocale ou Comment fonctionne Libcomlair")){
                  output="Sur cet écran, Présentation Libcomlair permet de réécouter la présentation générale. Vous pouvez arrêter la lecture, revenir à la page précédente ou choisir Rechercher pour continuer.";
                }else if(output.includes("rouvrir les aides")){
                  output="Pour continuer vers la recherche, choisissez Rechercher. Vous pouvez aussi écouter Présentation Libcomlair ou choisir Retour.";
                }
              }
              return target.speak(output,options);
            };
          }
          const value=Reflect.get(target,prop,receiver);
          return typeof value==="function"?value.bind(target):value;
        }
      });
      window.LibcomlairVoice=proxy;
    }catch(_){}
  }

  window.addEventListener("libcomlair-onboarding-step",event=>{
    if(event?.detail?.id==="home"){
      sync();
      setTimeout(sync,80);
      setTimeout(()=>window.LibcomlairVoiceContext?.refresh?.("home-notice"),120);
    }
  });
  window.addEventListener("pageshow",()=>{sync();patchVoice()});

  if(document.body){
    try{new MutationObserver(()=>sync()).observe(document.body,{attributes:true,attributeFilter:["class"]})}catch(_){}
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",()=>{sync();patchVoice()},{once:true});
  }else{
    sync();patchVoice();
  }

  window.LibcomlairHomeNotice=Object.freeze({version:"v224-1",sync});
})();