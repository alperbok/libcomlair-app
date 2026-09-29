(()=>{
  "use strict";

  const BLOCKS=Object.freeze([
    Object.freeze({heading:"Le but de Libcomlair",body:"Libcomlair aide à trouver des lieux et services avec des informations d’accessibilité plus faciles à comprendre."}),
    Object.freeze({heading:"Choix des besoins",body:"Au début, vous pouvez indiquer un ou plusieurs besoins d’accessibilité afin d’adapter l’affichage, la lecture et les propositions de l’application."}),
    Object.freeze({heading:"Vos critères",body:"Les critères utiles sont choisis sur la page dédiée Mes besoins d’accessibilité. Cette présentation n’entre pas dans leur détail."}),
    Object.freeze({heading:"La recherche",body:"Vous pouvez ensuite rechercher par catégorie, sous-catégorie, lieu ou ville selon les fonctions disponibles."}),
    Object.freeze({heading:"Les informations affichées",body:"Libcomlair distingue les informations connues, vérifiées ou encore à vérifier. L’application n’invente pas une information d’accessibilité manquante."}),
    Object.freeze({heading:"L’assistance vocale",body:"Le mode Découverte guidée explique les pages et les choix. Le mode Simplifié annonce seulement l’essentiel. Le micro reste disponible pour les commandes vocales."}),
    Object.freeze({heading:"Le menu",body:"Le menu permet d’accéder aux fonctions d’aide et d’utilisation ainsi qu’aux outils techniques de diagnostic et de réparation. Ces deux groupes sont séparés pour rester faciles à comprendre."}),
    Object.freeze({heading:"Les mises à jour",body:"Le nombre de lieux, leur classement et certaines informations peuvent évoluer lorsque les sources sont mises à jour."}),
    Object.freeze({heading:"Profil enregistré",body:"Projet : un profil personnel pourra mémoriser les besoins et critères d’accessibilité de l’utilisateur afin de simplifier la navigation et d’éviter de refaire les mêmes choix à chaque utilisation.",future:true}),
    Object.freeze({heading:"Carte / GPS accessible",body:"Projet : une carte et un GPS accessibles pourront proposer des itinéraires adaptés au handicap, notamment à pied, en fauteuil, en voiture et, lorsque les données le permettent, en transports en commun accessibles.",future:true})
  ]);

  let running=false;
  let generation=0;
  let waiters=[];
  let entryActive=false;
  let autoStarted=false;
  let retryTimer=null;

  function isTutorial(){return !!document.body?.classList.contains("v224-onboarding-tutorial")}
  function discovery(){return window.LibcomlairVoiceContext?.getMode?.()==="discovery"}

  function ensureCard(){
    let host=document.getElementById("v224PresentationVoiceOverlay");
    if(host)return host;
    host=document.createElement("div");
    host.id="v224PresentationVoiceOverlay";
    host.hidden=true;
    host.setAttribute("aria-hidden","true");
    host.innerHTML='<section id="v224PresentationVoiceCard" role="status" aria-live="polite" aria-atomic="true"><div id="v224PresentationVoiceProgress"></div><h2 id="v224PresentationVoiceHeading"></h2><p id="v224PresentationVoiceBody"></p></section>';
    document.body.appendChild(host);
    return host;
  }

  function showCard(index){
    const host=ensureCard(),data=BLOCKS[index];
    const progress=document.getElementById("v224PresentationVoiceProgress");
    const heading=document.getElementById("v224PresentationVoiceHeading");
    const body=document.getElementById("v224PresentationVoiceBody");
    if(progress)progress.textContent="Présentation vocale — "+(index+1)+" sur "+BLOCKS.length;
    if(heading)heading.textContent=data.heading+(data.future?" — Projet":"");
    if(body)body.textContent=data.body;
    host.hidden=false;
    host.setAttribute("aria-hidden","false");
  }

  function hideCard(){
    const host=document.getElementById("v224PresentationVoiceOverlay");
    if(!host)return;
    host.hidden=true;
    host.setAttribute("aria-hidden","true");
  }

  function settle(ok){
    running=false;
    hideCard();
    const list=waiters.splice(0);
    list.forEach(opts=>{
      try{(ok?opts.oncomplete:opts.onerror)?.()}catch(_){}
    });
  }

  function start(options){
    const opts=options||{};
    if(running){waiters.push(opts);return true}
    const engine=window.LibcomlairVoice;
    if(!engine?.speak)return false;
    running=true;
    waiters=[opts];
    const token=++generation;
    let index=0;

    document.querySelectorAll("#libcomlairTutorialText details.v224-presentation-item").forEach(item=>{item.open=false});

    const next=()=>{
      if(token!==generation){settle(false);return}
      if(!isTutorial()){settle(false);return}
      if(index>=BLOCKS.length){settle(true);return}
      const data=BLOCKS[index];
      showCard(index);
      const prefix=data.future?"Projet en préparation. ":"";
      const ok=engine.speak(data.heading+". "+prefix+data.body,{
        rate:.9,
        onend:()=>{index+=1;setTimeout(next,140)},
        onerror:()=>settle(false)
      });
      if(ok===false)settle(false);
    };

    const introOk=engine.speak("Présentation Libcomlair. Les explications vont s’afficher au centre de l’écran pendant leur lecture.",{
      rate:.9,
      onend:next,
      onerror:()=>settle(false)
    });
    if(introOk===false)settle(false);
    return true;
  }

  function stop(){
    generation+=1;
    clearTimeout(retryTimer);
    try{window.LibcomlairVoice?.cancel?.()}catch(_){}
    if(running)settle(false);else hideCard();
  }

  function patchGuide(){
    const base=window.LibcomlairVoiceGuide;
    if(!base||base.__v224PresentationVoiceCardProxy)return;
    try{
      const proxy=new Proxy(base,{
        get(target,prop,receiver){
          if(prop==="__v224PresentationVoiceCardProxy")return true;
          if(prop==="readCurrent")return options=>{
            const id=window.LibcomlairVoiceContext?.current?.().id;
            if(id==="onboarding-tutorial")return start(options);
            return target.readCurrent(options);
          };
          const value=Reflect.get(target,prop,receiver);
          return typeof value==="function"?value.bind(target):value;
        }
      });
      window.LibcomlairVoiceGuide=proxy;
    }catch(_){}
  }

  function attemptAuto(retries=0){
    if(!isTutorial()||!discovery()||autoStarted)return;
    patchGuide();
    const engineReady=!!window.LibcomlairVoice?.speak;
    const presenter=window.LibcomlairGuidedPresenter;
    if(engineReady&&presenter?.presentCurrent){
      if(presenter.isPresenting?.()||running){autoStarted=true;return}
      try{window.LibcomlairVoiceContext?.refresh?.("presentation-auto") }catch(_){}
      const ok=presenter.presentCurrent(true);
      if(ok){autoStarted=true;return}
    }
    if(retries<14){
      clearTimeout(retryTimer);
      retryTimer=setTimeout(()=>attemptAuto(retries+1),320);
    }
  }

  function sync(){
    patchGuide();
    const active=isTutorial();
    if(active&&!entryActive){
      entryActive=true;
      autoStarted=false;
      setTimeout(()=>attemptAuto(0),420);
    }else if(!active&&entryActive){
      entryActive=false;
      autoStarted=false;
      stop();
    }
  }

  window.addEventListener("libcomlair-onboarding-step",()=>{sync();setTimeout(sync,100)});
  window.addEventListener("libcomlair-voice-mode-change",()=>{if(isTutorial()){autoStarted=false;sync();setTimeout(()=>attemptAuto(0),250)}});
  window.addEventListener("pageshow",()=>{sync();setTimeout(sync,120)});
  if(document.body){try{new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:["class"]})}catch(_){}}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",sync,{once:true});else sync();

  window.LibcomlairPresentationVoiceCard=Object.freeze({version:"v224-2",start,stop,sync,isRunning:()=>running,blocks:()=>BLOCKS.map(x=>({...x}))});
})();