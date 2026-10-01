(()=>{
  "use strict";

  const by=id=>document.getElementById(id);
  const text=el=>String(el?.textContent||"").replace(/\s+/g," ").trim();
  let lastPlaceCount="";

  function globalNearbyOpen(){
    const panel=by("v224GlobalNearbyPanel");
    return !!(panel&&!panel.hidden&&document.body?.classList.contains("v224-map-gps-standalone"));
  }

  function totalCount(){
    return text(by("resultsCount"))||"";
  }

  function extractPlaceCount(value){
    const raw=String(value||"");
    const lower=raw.toLocaleLowerCase("fr");
    if(!lower.includes("lieu"))return "";
    const m=raw.match(/\b(\d+)\b/);
    return m?m[1]:"";
  }

  function rememberPlaceCount(value){
    const n=extractPlaceCount(value);
    if(n)lastPlaceCount=n;
    return lastPlaceCount;
  }

  function writtenMessage(){
    const total=totalCount();
    if(total)return total+" résultats au total autour de vous, lieux et transports compris.";
    if(lastPlaceCount)return lastPlaceCount+" lieux trouvés autour de vous.";
    return "Recherche autour de vous terminée.";
  }

  function voiceMessage(){
    const total=totalCount();
    const places=lastPlaceCount;
    if(places&&total&&places!==total){
      return places+" lieux trouvés autour de vous. "+total+" résultats au total, transports compris.";
    }
    if(total)return total+" résultats au total autour de vous, lieux et transports compris.";
    if(places)return places+" lieux trouvés autour de vous.";
    return "Recherche autour de vous terminée.";
  }

  function synchronize(event){
    if(!globalNearbyOpen()||event?.detail?.ok!==true)return;
    const globalStatus=by("v224GlobalNearbyStatus");
    const locationStatus=by("locationStatus");
    rememberPlaceCount(event?.detail?.message);
    if(!lastPlaceCount)rememberPlaceCount(text(locationStatus));
    if(!lastPlaceCount)rememberPlaceCount(text(globalStatus));
    const written=writtenMessage();
    const spoken=voiceMessage();
    if(globalStatus)globalStatus.textContent=written;
    if(locationStatus)locationStatus.textContent=written;
    if(event.detail&&typeof event.detail==="object"){
      try{
        event.detail.message=spoken;
        event.detail.canonicalNearbyCount=true;
        event.detail.placeCount=lastPlaceCount||null;
        event.detail.totalCount=totalCount()||null;
      }catch(_){}
    }
  }

  function rewriteNearbySpeech(value){
    const raw=String(value??"");
    if(!globalNearbyOpen())return raw;
    const lower=raw.toLocaleLowerCase("fr");
    const mentionsNearby=lower.includes("autour de moi")||lower.includes("autour de vous")||lower.includes("autour de votre position");
    const mentionsCount=/\b\d+\b/.test(raw)&&(lower.includes("lieu")||lower.includes("résultat")||lower.includes("resultat"));
    if(mentionsNearby&&mentionsCount){
      rememberPlaceCount(raw);
      return voiceMessage();
    }
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
    version:"v224-37.3-written-total-spoken-detail",
    sync:()=>synchronize({detail:{ok:true}}),
    writtenMessage,
    voiceMessage,
    placeCount:()=>lastPlaceCount,
    totalCount,
    rewriteSpeech:rewriteNearbySpeech,
    patchVoice
  });
})();
