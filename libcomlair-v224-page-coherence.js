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
    {heading:"Le but de Libcomlair",body:"Libcomlair aide à trouver des lieux et services avec des informations d’accessibilité plus faciles à comprendre."},
    {heading:"Choix des besoins",body:"Au début, vous pouvez indiquer un ou plusieurs besoins d’accessibilité afin d’adapter l’affichage, la lecture et les propositions de l’application."},
    {heading:"Vos critères",body:"Les critères utiles sont choisis sur la page dédiée Mes besoins d’accessibilité. Cette présentation n’entre pas dans leur détail."},
    {heading:"La recherche",body:"Vous pouvez ensuite rechercher par catégorie, sous-catégorie, lieu ou ville selon les fonctions disponibles."},
    {heading:"Les informations affichées",body:"Libcomlair distingue les informations connues, vérifiées ou encore à vérifier. L’application n’invente pas une information d’accessibilité manquante."},
    {heading:"L’assistance vocale",body:"Le mode Découverte guidée explique les pages et les choix. Le mode Simplifié annonce seulement l’essentiel. Le micro reste disponible pour les commandes vocales."},
    {heading:"Le menu",body:"Le menu permet d’accéder aux fonctions d’aide et d’utilisation ainsi qu’aux outils techniques de diagnostic et de réparation. Ces deux groupes sont séparés pour rester faciles à comprendre."},
    {heading:"Les mises à jour",body:"Le nombre de lieux, leur classement et certaines informations peuvent évoluer lorsque les sources sont mises à jour."},
    {heading:"Profil enregistré",body:"Projet : un profil personnel pourra mémoriser les besoins et critères d’accessibilité de l’utilisateur afin de simplifier la navigation et d’éviter de refaire les mêmes choix à chaque utilisation.",future:true},
    {heading:"Carte / GPS accessible",body:"Projet : une carte et un GPS accessibles pourront proposer des itinéraires adaptés au handicap, notamment à pied, en fauteuil, en voiture et, lorsque les données le permettent, en transports en commun accessibles.",future:true}
  ];

  const PAGE_VOICE={
    "onboarding-home":"Vous êtes sur Accueil et Recherche. Cette page sert uniquement à commencer une recherche. Choisissez Rechercher pour accéder aux catégories de lieux. Vous pouvez aussi utiliser Retour. Le micro reste disponible pour les commandes vocales. Aucun critère d’accessibilité n’est expliqué sur cette page.",
    "onboarding-voice":"Vous êtes sur Navigation vocale. Cette page permet de choisir le niveau d’assistance. Découverte guidée est conseillé pour une première utilisation et explique les pages et les choix. Simplifié est prévu pour une utilisation courante et annonce seulement l’essentiel. Choisissez un mode puis Valider, ou utilisez Retour."
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
    if(notice.dataset.v224HomeBuilt!=="1"){
      notice.dataset.v224HomeBuilt="1";
      notice.replaceChildren();
      HOME_TEXT.forEach(text=>{const p=document.createElement("p");p.textContent=text;notice.appendChild(p)});
    }

    const actions=document.getElementById("v224HomeActions");
    if(actions&&actions.parentElement===start){
      if(label.parentElement!==start)start.insertBefore(label,actions);
      if(notice.parentElement!==start)start.insertBefore(notice,actions);
      else if(notice.previousElementSibling!==label)start.insertBefore(label,notice);
    }
  }

  function closeOtherPresentationItems(current){
    document.querySelectorAll("#libcomlairTutorialText details.v224-presentation-item[open]").forEach(item=>{
      if(item!==current)item.open=false;
    });
  }

  function buildPresentation(){
    const title=document.getElementById("v224TutorialScreenTitle");
    if(title)title.textContent="Présentation Libcomlair";
    const tutorial=document.getElementById("libcomlairTutorial");
    const text=document.getElementById("libcomlairTutorialText");
    if(!tutorial||!text)return;
    tutorial.setAttribute("aria-label","Présentation Libcomlair");

    if(text.dataset.v224AccordionBuilt==="2")return;
    text.dataset.v224AccordionBuilt="2";
    text.replaceChildren();

    PRESENTATION_BLOCKS.forEach((item,index)=>{
      const details=document.createElement("details");
      details.className="v224-presentation-item";
      details.dataset.presentationIndex=String(index);
      details.setAttribute("data-voice-explain","true");

      const summary=document.createElement("summary");
      summary.className="v224-presentation-summary";
      const heading=document.createElement("strong");
      heading.textContent=item.heading;
      summary.appendChild(heading);
      if(item.future){
        const badge=document.createElement("span");
        badge.className="v224-presentation-status";
        badge.textContent="Projet";
        summary.appendChild(badge);
      }

      const body=document.createElement("div");
      body.className="v224-presentation-body";
      body.textContent=item.body;
      details.append(summary,body);
      details.addEventListener("toggle",()=>{if(details.open)closeOtherPresentationItems(details)});
      text.appendChild(details);
    });
  }

  function presentationItems(){
    return [...document.querySelectorAll("#libcomlairTutorialText details.v224-presentation-item")];
  }

  function stabilizeVoice(){
    const body=document.body;
    if(!body)return;
    const inVoice=body.classList.contains("v224-onboarding-voice");
    if(!inVoice){
      if(body.classList.contains("v224-voice-layout-ready"))body.classList.remove("v224-voice-layout-ready");
      return;
    }
    if(body.classList.contains("v224-voice-layout-ready"))return;
    requestAnimationFrame(()=>{
      if(document.body?.classList.contains("v224-onboarding-voice"))document.body.classList.add("v224-voice-layout-ready");
    });
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

  function speakPresentation(options){
    buildPresentation();
    const engine=window.LibcomlairVoice;
    const items=presentationItems();
    if(!engine?.speak||!items.length)return false;
    const opts=options||{};
    items.forEach(item=>item.open=false);
    let index=0;

    const finish=()=>{
      engine.speak("Présentation terminée. Vous pouvez choisir Suivant pour continuer ou Retour pour revenir à Navigation vocale.",{
        rate:.9,
        onerror:opts.onerror,
        onend:()=>{try{opts.oncomplete?.()}catch(_){} }
      });
    };

    const readNext=()=>{
      if(index>=items.length){finish();return}
      const details=items[index];
      const data=PRESENTATION_BLOCKS[index];
      closeOtherPresentationItems(details);
      details.open=true;
      requestAnimationFrame(()=>{
        try{details.querySelector("summary")?.scrollIntoView({block:"nearest",behavior:"smooth"})}catch(_){}
      });
      const prefix=data.future?"Projet en préparation. ":"";
      engine.speak(data.heading+". "+prefix+data.body,{
        rate:.9,
        onerror:opts.onerror,
        onend:()=>{
          details.open=false;
          index+=1;
          setTimeout(readNext,120);
        }
      });
    };

    engine.speak("Présentation Libcomlair. Les rubriques vont s’ouvrir une à une pendant la lecture.",{
      rate:.9,
      onerror:opts.onerror,
      onend:readNext
    });
    return true;
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
            if(id==="onboarding-tutorial")return speakPresentation(options);
            const text=PAGE_VOICE[id];
            if(text)return speakSequence(text,options);
            return target.readCurrent(options);
          };
          if(prop==="describe")return ()=>{
            const id=window.LibcomlairVoiceContext?.current?.().id;
            if(id==="onboarding-tutorial"){
              const text=PRESENTATION_BLOCKS.map(x=>x.heading+". "+x.body).join(" ");
              return {contextId:id,title:"Présentation Libcomlair",mode:window.LibcomlairVoiceContext?.getMode?.()||"simplified",controls:[],explanations:PRESENTATION_BLOCKS.map(x=>x.heading+". "+x.body),text};
            }
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

  let syncQueued=false;
  function sync(){
    if(syncQueued)return;
    syncQueued=true;
    requestAnimationFrame(()=>{
      syncQueued=false;
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
    });
  }

  window.addEventListener("libcomlair-onboarding-step",()=>{sync();setTimeout(sync,80)});
  window.addEventListener("pageshow",()=>{sync();setTimeout(sync,100)});
  window.addEventListener("libcomlair-voice-mode-change",()=>{stabilizeVoice();patchGuide()});

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",sync,{once:true});else sync();

  window.LibcomlairPageCoherence=Object.freeze({version:"v224-4",sync,buildHome,buildPresentation,stabilizeVoice,speakPresentation});
})();
