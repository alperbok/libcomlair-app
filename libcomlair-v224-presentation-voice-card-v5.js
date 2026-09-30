(()=>{
  "use strict";

  const GPS_BODY=window.LibcomlairGpsExplanations?.gpsDetail||"Carte et GPS réunit deux usages. Recherche autour de moi utilise votre position pour afficher les lieux et transports proches. Depuis un résultat ou une fiche détaillée, Y aller avec le GPS transmet directement le lieu comme destination. Le GPS accessible est encore en projet et servira à préparer puis guider le trajet depuis votre position en tenant compte, lorsque les données le permettent, de vos besoins d’accessibilité.";

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
    Object.freeze({heading:"Carte / GPS accessible",body:GPS_BODY,future:true,partial:true})
  ]);

  let running=false;
  let generation=0;
  let waiters=[];

  function isTutorial(){return !!document.body?.classList.contains("v224-onboarding-tutorial")}
  function ensureCard(){
    let host=document.getElementById("v224PresentationVoiceOverlay");
    if(host)return host;
    host=document.createElement("div");
    host.id="v224PresentationVoiceOverlay";host.hidden=true;host.setAttribute("aria-hidden","true");
    host.innerHTML='<section id="v224PresentationVoiceCard" role="status" aria-live="polite" aria-atomic="true"><div id="v224PresentationVoiceProgress"></div><h2 id="v224PresentationVoiceHeading"></h2><p id="v224PresentationVoiceBody"></p></section>';
    document.body.appendChild(host);return host;
  }
  function showCard(index){
    const host=ensureCard(),data=BLOCKS[index];
    const progress=document.getElementById("v224PresentationVoiceProgress");
    const heading=document.getElementById("v224PresentationVoiceHeading");
    const body=document.getElementById("v224PresentationVoiceBody");
    if(progress)progress.textContent="Présentation vocale — "+(index+1)+" sur "+BLOCKS.length;
    if(heading)heading.textContent=data.heading+(data.future?" — Projet":"");
    if(body)body.textContent=data.body;
    host.hidden=false;host.setAttribute("aria-hidden","false");
  }
  function hideCard(){const host=document.getElementById("v224PresentationVoiceOverlay");if(host){host.hidden=true;host.setAttribute("aria-hidden","true")}}
  function closeAccordions(){document.querySelectorAll("#libcomlairTutorialText details.v224-presentation-item").forEach(item=>{item.open=false})}
  function settle(ok,error){
    running=false;document.body?.classList.remove("v224-presentation-reading");hideCard();
    const list=waiters.splice(0);list.forEach(opts=>{try{(ok?opts.oncomplete:opts.onerror)?.(error)}catch(_){}});
  }
  function announceNavigation(token){
    if(token!==generation||!isTutorial())return settle(false,"page-changed");
    const engine=window.LibcomlairVoice;
    const ok=engine?.speak?.("Présentation terminée. Vous pouvez dire Suivant pour continuer, ou Précédent, ou Retour, pour revenir à l’écran précédent.",{
      rate:.9,
      onend:()=>settle(true),
      onerror:error=>settle(false,error)
    });
    if(ok===false)settle(false,"engine-speak-false");
  }
  function start(options){
    const opts=options||{};
    if(running){waiters.push(opts);return true}
    if(!isTutorial())return false;
    const engine=window.LibcomlairVoice;if(!engine?.speak)return false;
    running=true;waiters=[opts];const token=++generation;let index=0;
    closeAccordions();document.body?.classList.add("v224-presentation-reading");
    const next=()=>{
      if(token!==generation)return settle(false,"cancelled");
      if(!isTutorial())return settle(false,"page-changed");
      if(index>=BLOCKS.length)return announceNavigation(token);
      const data=BLOCKS[index];showCard(index);
      const prefix=data.future&&!data.partial?"Projet en préparation. ":"";
      const ok=engine.speak(data.heading+". "+prefix+data.body,{rate:.9,onend:()=>{index+=1;setTimeout(next,140)},onerror:error=>settle(false,error)});
      if(ok===false)settle(false,"engine-speak-false");
    };
    const introOk=engine.speak("Présentation Libcomlair. Les explications vont s’afficher au centre de l’écran pendant leur lecture.",{rate:.9,onend:next,onerror:error=>settle(false,error)});
    if(introOk===false)settle(false,"engine-speak-false");
    return true;
  }
  function stop(){generation+=1;try{window.LibcomlairVoice?.cancel?.()}catch(_){}if(running)settle(false,"stopped");else{document.body?.classList.remove("v224-presentation-reading");hideCard()}}
  try{new MutationObserver(()=>{if(running&&!isTutorial())stop()}).observe(document.body,{attributes:true,attributeFilter:["class"]})}catch(_){}
  window.LibcomlairPresentationVoiceCard=Object.freeze({version:"v224-5",start,stop,isRunning:()=>running,blocks:()=>BLOCKS.map(x=>({...x}))});
})();