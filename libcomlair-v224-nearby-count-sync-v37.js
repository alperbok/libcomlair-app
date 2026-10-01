(()=>{
  "use strict";

  const by=id=>document.getElementById(id);
  const text=el=>String(el?.textContent||"").replace(/\s+/g," ").trim();

  function globalNearbyOpen(){
    const panel=by("v224GlobalNearbyPanel");
    return !!(panel&&!panel.hidden&&document.body?.classList.contains("v224-map-gps-standalone"));
  }

  function canonicalMessage(){
    const total=text(by("resultsCount"));
    if(!total)return "Recherche autour de vous terminée.";
    return total+" autour de vous, toutes catégories confondues, lieux et transports compris.";
  }

  function synchronize(event){
    if(!globalNearbyOpen()||event?.detail?.ok!==true)return;
    const message=canonicalMessage();
    const globalStatus=by("v224GlobalNearbyStatus");
    const locationStatus=by("locationStatus");
    if(globalStatus)globalStatus.textContent=message;
    if(locationStatus)locationStatus.textContent=message;
    if(event.detail&&typeof event.detail==="object"){
      try{event.detail.message=message;event.detail.canonicalNearbyCount=true}catch(_){}
    }
  }

  /* Capture=true : corriger le message avant les écouteurs vocaux en phase normale. */
  window.addEventListener("libcomlair-nearme-result",synchronize,true);

  window.LibcomlairNearbyCountSync=Object.freeze({
    version:"v224-37",
    sync:()=>synchronize({detail:{ok:true}}),
    message:canonicalMessage
  });
})();
