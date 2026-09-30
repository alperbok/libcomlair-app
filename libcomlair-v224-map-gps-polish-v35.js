(()=>{
  "use strict";
  const by=id=>document.getElementById(id);
  const mode=()=>{try{return window.LibcomlairVoiceContext?.getMode?.()||"simplified"}catch(_){return "simplified"}};

  const TUTORIALS={
    v224NearbyMode:"Utilisez ce mode pour découvrir ce qui se trouve près de vous sans choisir d’abord une catégorie. Libcomlair utilise votre position pour afficher les lieux et les transports proches. Si vous lancez plus tard Autour de moi depuis une catégorie précise, la recherche restera limitée à cette catégorie.",
    v224GpsMode:"Ce mode servira à préparer puis guider un trajet accessible. Après avoir choisi un lieu dans les résultats ou dans une fiche détaillée, Y aller avec le GPS transmettra automatiquement cette destination ici. Le guidage GPS accessible complet est encore en projet."
  };

  function ensureTutorial(id,text){
    const button=by(id);if(!button)return null;
    let box=by(id+"Tutorial");
    if(!box){
      box=document.createElement("div");
      box.id=id+"Tutorial";
      box.className="v224-map-gps-tutorial";
      box.setAttribute("role","note");
      button.insertAdjacentElement("afterend",box);
      button.setAttribute("aria-describedby",box.id);
    }
    if(box.textContent!==text)box.textContent=text;
    return box;
  }

  function syncTutorials(){
    const guided=mode()==="discovery";
    Object.entries(TUTORIALS).forEach(([id,text])=>{
      const box=ensureTutorial(id,text);if(!box)return;
      if(box.hidden===guided)box.hidden=!guided;
      const aria=guided?"false":"true";
      if(box.getAttribute("aria-hidden")!==aria)box.setAttribute("aria-hidden",aria);
    });
  }

  function hideDuplicateBacks(){
    ["v224CloseGlobalMap","v224GpsBack"].forEach(id=>{
      const btn=by(id);if(!btn)return;
      if(btn.getAttribute("aria-hidden")!=="true")btn.setAttribute("aria-hidden","true");
      if(btn.tabIndex!==-1)btn.tabIndex=-1;
    });
  }

  function resetViewport(panelId){
    requestAnimationFrame(()=>{
      try{window.scrollTo({top:0,left:0,behavior:"auto"})}catch(_){window.scrollTo(0,0)}
      const standalone=by("v224MapGpsStandalone");if(standalone)standalone.scrollTop=0;
      const hub=by("v224MapGpsHub");if(hub)hub.scrollTop=0;
      const panel=by(panelId);if(panel)panel.scrollTop=0;
    });
    setTimeout(()=>{
      try{window.scrollTo({top:0,left:0,behavior:"auto"})}catch(_){window.scrollTo(0,0)}
      const panel=by(panelId);if(panel)panel.scrollTop=0;
    },180);
  }

  function sync(){syncTutorials();hideDuplicateBacks()}
  function boundedStartupSync(){[0,60,180,420,900].forEach(ms=>setTimeout(sync,ms))}

  document.addEventListener("click",event=>{
    if(event.target?.closest?.("#v224NearbyMode"))resetViewport("v224GlobalNearbyPanel");
    if(event.target?.closest?.("#v224GpsMode"))resetViewport("v224GpsPanel");
  },true);

  window.addEventListener("libcomlair-voice-mode-change",()=>setTimeout(syncTutorials,20));
  window.addEventListener("libcomlair-map-gps-page",()=>setTimeout(sync,20));
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boundedStartupSync,{once:true});else boundedStartupSync();

  window.LibcomlairMapGpsPolishV35=Object.freeze({version:"v224-35.1",sync,resetViewport});
})();