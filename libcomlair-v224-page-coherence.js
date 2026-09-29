(()=>{
  "use strict";

  const HOME_TEXT=[
    "Cette page permet de commencer une recherche de lieu accessible avec Libcomlair.",
    "Choisissez Rechercher pour accéder aux catégories de lieux et poursuivre votre recherche.",
    "Le bouton Retour permet de revenir à l’écran précédent.",
    "Le micro permet d’utiliser les commandes vocales lorsque l’assistance vocale est activée.",
    "En Découverte guidée, cette page est expliquée en détail. En Simplifié, seules les actions essentielles sont annoncées."
  ];

  const PRESENTATION_BLOCKS=[
    ["Le but de Libcomlair","Libcomlair aide à trouver des lieux et services avec des informations d’accessibilité plus faciles à comprendre."],
    ["Votre profil","Au début, vous pouvez indiquer un ou plusieurs besoins d’accessibilité afin d’adapter l’affichage, la lecture et les propositions de l’application."],
    ["Vos critères","Les critères utiles sont choisis sur la page dédiée Mes besoins d’accessibilité. Cette présentation n’entre pas dans leur détail."],
    ["La recherche","Vous pouvez ensuite rechercher par catégorie, sous-catégorie, lieu ou ville selon les fonctions disponibles."],
    ["Les informations affichées","Libcomlair distingue les informations connues, vérifiées ou encore à vérifier. L’application n’invente pas une information d’accessibilité manquante."],
    ["L’assistance vocale","Le mode Découverte guidée explique les pages et les choix. Le mode Simplifié annonce seulement l’essentiel. Le micro reste disponible pour les commandes vocales."],
    ["Les mises à jour","Le nombre de lieux, leur classement et certaines informations peuvent évoluer lorsque les sources sont mises à jour."]
  ];

  const PAGE_VOICE={
    "onboarding-home":"Vous êtes sur Accueil et Recherche. Cette page sert uniquement à commencer une recherche. Choisissez Rechercher pour accéder aux catégories de lieux. Vous pouvez aussi utiliser Retour. Le micro reste disponible pour les commandes vocales. Aucun critère d’accessibilité n’est expliqué sur cette page.",
    "onboarding-voice":"Vous êtes sur Navigation vocale. Cette page permet de choisir le niveau d’assistance. Découverte guidée est conseillé pour une première utilisation et explique les pages et les choix. Simplifié est prévu pour une utilisation courante et annonce seulement l’essentiel. Choisissez un mode puis Valider, ou utilisez Retour.",
    "onboarding-tutorial":"Vous êtes sur Présentation Libcomlair. Cette page présente le but général de l’application, le rôle du profil, la recherche, les informations affichées et l’assistance vocale. Les critères d’accessibilité ne sont pas détaillés ici : ils sont expliqués uniquement sur la page Mes besoins d’accessibilité. Choisissez Suivant pour continuer ou Retour pour revenir à Navigation vocale."
  };

  function hide(el){if(el)el.style.setProperty("display","none","important")}
  function show(el,display="block"){if(!el)return;el.hidden=false;el.removeAttribute("hidden");el.style.setProperty("display",display,"important")}

  function buildHome(){
    const start=document.querySelector("section.hero.v219-main-zone");
    if(!start)return;
    hide(document.getElementById("speechChoiceControls"));
    hide(document.getElementById("v224OnboardingCompactChoices"));

    let label=document.getElementById("v224HomeHowToLabel");
    if(!label){
      label=document.createElement("div");
      label.id="v224HomeHowToLabel";
      label.textContent="Comment utiliser cette page ?";
      label.setAttribute("role","heading");
      label.setAttribute("aria-level","3");
    }

    let notice=document.getElementById("v224HomeNotice");
    if(!notice){
      notice=document.createElement("section");
      notice.id="v224HomeNotice";
      notice.setAttribute("role","note");
      notice.setAttribute("data-voice-explain","true");
    }
    notice.replaceChildren();
    HOME_TEXT.forEach(text=>{const p=document.createElement("p");p.textContent=text;notice.appendChild(p)});

    const actions=document.getElementById("v224HomeActions");
    if(actions&&actions.parentElement===start){
      if(label.parentElement!==start)start.insertBefore(label,actions);
      if(notice.parentElement!==start)start.insertBefore(notice,actions);
      else if(notice.previousElementSibling!==label)start.insertBefore(label,notice);
    }
  }

  function buildPresentation(){
    const title=document.getElementById("v224TutorialScreenTitle");
    if(title)title.textContent="Présentation Libcomlair";
    const tutorial=document.getElementById("libcomlairTutorial");
    const text=document.getElementById("libcomlairTutorialText");
    if(!tutorial||!text)return;
    tutorial.setAttribute("aria-label","Présentation Libcomlair");
    text.replaceChildren();
    PRESENTATION_BLOCKS.forEach(([heading,body])=>{
      const block=document.createElement("div");
      block.className="v224-presentation-block";
      block.setAttribute("data-voice-explain","true");
      const strong=document.createElement("strong");strong.textContent=heading;
      block.append(strong,document.createTextNode(body));
      text.appendChild(block);
    });
  }

  function stabilizeVoice(){
    const inVoice=document.body?.classList.contains("v224-onboarding-voice");
    if(!inVoice){document.body?.classList.remove("v224-voice-layout-ready");return}
    document.body?.classList.remove("v224-voice-layout-ready");
    try{window.LibcomlairVoiceModeLayoutFinal?.apply?.()}catch(_){}
    requestAnimationFrame(()=>document.body?.classList.add("v224-voice-layout-ready"));
  }

  function speakSequence(text,options){
    const engine=window.LibcomlairVoice;if(!engine?.speak)return false;
    const parts=String(text||"").split(/(?<=[.!?])\s+/).reduce((out,s)=>{
      if(!s)return out;const last=out[out.length-1]||"";
      if(last.length+s.length<900)out[out.length-1]=(last+" "+s).trim();else out.push(s);
      return out;
    },[""]).filter(Boolean);
    let i=0;const opts=options||{};
    const next=()=>{
      if(i>=parts.length){try{opts.oncomplete?.()}catch(_){}return}
      engine.speak(parts[i++],{rate:.9,onerror:opts.onerror,onend:next});
    };
    next();return true;
  }

  function patchGuide(){
    const base=window.LibcomlairVoiceGuide;
    if(!base||base.__v224PageCoherenceProxy)return;
    try{
      const proxy=new Proxy(base,{
        get(target,prop,receiver){
          if(prop==="__v224PageCoherenceProxy")return true;
          if(prop==="readCurrent")return options=>{
            const id=window.LibcomlairVoiceContext?.current?.().id;
            const text=PAGE_VOICE[id];
            if(text)return speakSequence(text,options);
            return target.readCurrent(options);
          };
          if(prop==="describe")return ()=>{
            const id=window.LibcomlairVoiceContext?.current?.().id;
            if(PAGE_VOICE[id])return {contextId:id,title:window.LibcomlairVoiceContext?.current?.().title||"",mode:window.LibcomlairVoiceContext?.getMode?.()||"simplified",controls:[],explanations:[PAGE_VOICE[id]],text:PAGE_VOICE[id]};
            return target.describe();
          };
          const value=Reflect.get(target,prop,receiver);
          return typeof value==="function"?value.bind(target):value;
        }
      });
      window.LibcomlairVoiceGuide=proxy;
    }catch(_){}
  }

  function sync(){
    const b=document.body;if(!b)return;
    if(b.classList.contains("v224-onboarding-home")){
      buildHome();
      show(document.getElementById("v224HomeHowToLabel"));
      show(document.getElementById("v224HomeNotice"));
    }else{
      hide(document.getElementById("v224HomeHowToLabel"));
      hide(document.getElementById("v224HomeNotice"));
    }
    buildPresentation();
    stabilizeVoice();
    patchGuide();
  }

  window.addEventListener("libcomlair-onboarding-step",()=>{sync();setTimeout(sync,40);setTimeout(sync,140)});
  window.addEventListener("pageshow",()=>{sync();setTimeout(sync,80)});
  window.addEventListener("libcomlair-voice-mode-change",()=>{stabilizeVoice();patchGuide()});

  if(document.body){
    try{new MutationObserver(()=>sync()).observe(document.body,{attributes:true,attributeFilter:["class"]})}catch(_){}
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",sync,{once:true});else sync();

  window.LibcomlairPageCoherence=Object.freeze({version:"v224-1",sync,buildHome,buildPresentation,stabilizeVoice});
})();
