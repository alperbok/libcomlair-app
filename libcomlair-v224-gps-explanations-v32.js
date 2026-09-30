(()=>{
  "use strict";

  const HOME_TEXT=Object.freeze([
    "Cette page permet de commencer une recherche de lieu accessible avec Libcomlair.",
    "Carte et GPS propose Recherche autour de moi pour découvrir les lieux et transports proches de votre position.",
    "Le GPS accessible, encore en projet, pourra recevoir directement comme destination un lieu choisi avec Y aller avec le GPS.",
    "Choisissez Rechercher pour ouvrir Carte et GPS, puis utilisez Suivant si vous préférez poursuivre vers les catégories de lieux.",
    "Retour revient à l’écran précédent. Le micro permet d’utiliser les commandes vocales. En Découverte guidée, toutes les explications affichées sur cette page sont lues. En Simplifié, seules les actions essentielles sont annoncées."
  ]);

  const HOME_SIMPLE="Accueil et Recherche. Choisissez Rechercher pour ouvrir Carte et GPS. Vous pourrez rechercher autour de vous, préparer une destination GPS, ou utiliser Suivant pour poursuivre vers les catégories. Vous pouvez aussi utiliser Retour.";

  const GPS_DETAIL="Carte et GPS réunit deux usages. Recherche autour de moi utilise votre position pour afficher les lieux et transports proches. Si la carte est lancée depuis une catégorie, par exemple Magasins, le filtre choisi doit rester actif afin de n’afficher que les lieux correspondants. Depuis un résultat ou une fiche détaillée, le bouton Y aller avec le GPS transmet directement le lieu comme destination. Le GPS accessible est encore en projet : il servira ensuite à préparer puis guider le trajet depuis votre position en tenant compte, autant que les données disponibles le permettent, de vos besoins d’accessibilité. La carte peut aussi être utilisée pour localiser précisément un lieu.";

  const by=id=>document.getElementById(id);
  function mode(){try{return window.LibcomlairVoiceContext?.getMode?.()||"simplified"}catch(_){return "simplified"}}
  function homeVoice(){return mode()==="discovery"?HOME_TEXT.join(" "):HOME_SIMPLE}

  function updateHome(){
    const notice=by("v224HomeNotice");
    if(!notice)return;
    const wanted=HOME_TEXT.join("\n");
    const current=[...notice.querySelectorAll(":scope > p")].map(p=>p.textContent||"").join("\n");
    if(current===wanted)return;
    notice.replaceChildren();
    HOME_TEXT.forEach(text=>{const p=document.createElement("p");p.textContent=text;notice.appendChild(p)});
    notice.dataset.v224GpsExplanation="32";
  }

  function updatePresentation(){
    const items=[...document.querySelectorAll("#libcomlairTutorialText details.v224-presentation-item")];
    const item=items.find(d=>/Carte\s*\/\s*GPS accessible/i.test(d.querySelector("summary strong")?.textContent||""));
    if(!item)return;
    const body=item.querySelector(".v224-presentation-body");
    if(body&&body.textContent!==GPS_DETAIL)body.textContent=GPS_DETAIL;
    item.dataset.v224GpsExplanation="32";
  }

  function speakText(text,options){
    const engine=window.LibcomlairVoice;if(!engine?.speak)return false;
    const opts=options||{};
    return engine.speak(text,{rate:.9,onend:()=>{try{opts.oncomplete?.()}catch(_){}},onerror:e=>{try{opts.onerror?.(e)}catch(_){}}});
  }

  function patchGuide(){
    const base=window.LibcomlairVoiceGuide;
    if(!base||base.__v224GpsExplanationProxy)return;
    try{
      window.LibcomlairVoiceGuide=new Proxy(base,{
        get(target,prop,receiver){
          if(prop==="__v224GpsExplanationProxy")return true;
          if(prop==="readCurrent")return options=>{
            const id=window.LibcomlairVoiceContext?.current?.().id;
            if(id==="onboarding-home")return speakText(homeVoice(),options);
            return target.readCurrent(options);
          };
          if(prop==="describe")return ()=>{
            const d=target.describe();
            const id=window.LibcomlairVoiceContext?.current?.().id;
            if(id!=="onboarding-home")return d;
            const text=homeVoice();
            return {...(d||{}),contextId:id,title:"Accueil / Recherche",explanations:[text],text};
          };
          const value=Reflect.get(target,prop,receiver);
          return typeof value==="function"?value.bind(target):value;
        }
      });
    }catch(_){}
  }

  function sync(){updateHome();updatePresentation();patchGuide()}
  window.addEventListener("libcomlair-onboarding-step",()=>{sync();setTimeout(sync,100)});
  window.addEventListener("libcomlair-voice-mode-change",()=>{patchGuide();setTimeout(sync,40)});
  window.addEventListener("pageshow",()=>{sync();setTimeout(sync,120)});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(sync,0),{once:true});else setTimeout(sync,0);

  window.LibcomlairGpsExplanations=Object.freeze({version:"v224-32",homeText:()=>[...HOME_TEXT],gpsDetail:GPS_DETAIL,sync});
})();