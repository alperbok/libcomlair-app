(()=>{
  "use strict";

  const by=id=>document.getElementById(id);
  const text=el=>String(el?.textContent||"").replace(/\s+/g," ").trim();

  function globalNearbyOpen(){
    const panel=by("v224GlobalNearbyPanel");
    return !!(panel&&!panel.hidden&&document.body?.classList.contains("v224-map-gps-standalone"));
  }

  function canonicalCount(){
    const total=text(by("resultsCount"));
    return total||"";
  }

  function canonicalMessage(){
    const total=canonicalCount();
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

  function rewriteNearbySpeech(value){
    const raw=String(value??"");
    if(!globalNearbyOpen())return raw;
    const lower=raw.toLocaleLowerCase("fr");
    const mentionsNearby=lower.includes("autour de moi")||lower.includes("autour de vous")||lower.includes("autour de votre position");
    const mentionsCount=/\b\d+\b/.test(raw)&&(lower.includes("lieu")||lower.includes("résultat")||lower.includes("resultat"));
    if(mentionsNearby&&mentionsCount)return canonicalMessage();
    return raw;
  }

  function patchVoice(){
    const current=window.LibcomlairVoice;
    if(!current||current.__v224NearbyCountVoiceSync)return false;
    try{
      const proxy=new Proxy(current,{
        get(target,prop,receiver){
          if(prop==="__v224NearbyCountVoiceSync")return true;
          if(prop==="speak")return (message,options)=>{
            const fn=Reflect.get(target,"speak",receiver);
            if(typeof fn!=="function")return false;
            return fn.call(target,rewriteNearbySpeech(message),options);
          };
          const value=Reflect.get(target,prop,receiver);
          return typeof value==="function"?value.bind(target):value;
        }
      });
      window.LibcomlairVoice=proxy;
      return true;
    }catch(_){return false}
  }

  /* Corrige le message avant les écouteurs, puis corrige aussi le dernier maillon vocal. */
  window.addEventListener("libcomlair-nearme-result",event=>{
    synchronize(event);
    patchVoice();
    setTimeout(()=>synchronize({detail:{ok:true}}),20);
  },true);
  window.addEventListener("libcomlair-map-gps-page",()=>setTimeout(patchVoice,0));
  setTimeout(patchVoice,0);
  setTimeout(patchVoice,250);
  setTimeout(patchVoice,900);

  window.LibcomlairNearbyCountSync=Object.freeze({
    version:"v224-37.1-last-mile-voice",
    sync:()=>synchronize({detail:{ok:true}}),
    message:canonicalMessage,
    rewriteSpeech:rewriteNearbySpeech,
    patchVoice
  });
})();
