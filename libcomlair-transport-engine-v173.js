(function(){
  "use strict";
  function normalizeNearbyStops(data,groupFn){
    const raw=Array.isArray(data&&data.stops)?data.stops:[];
    const clean=raw.map(p=>({
      ...p,
      idfm:true,
      accessibilityKnown:p.accessibilityKnown===true,
      access:[],
      category:"Transports",
      transportType:p.transportType==="Arrêt de bus"?"Bus / Arrêt":p.transportType==="Gare"?"Train / Gare":p.transportType==="Arrêt de tramway"?"Tramway":p.transportType
    })).filter(p=>p.name&&Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon)));
    return typeof groupFn==="function"?groupFn(clean):clean;
  }
  function inferGeoapifyTransportType(categories){
    const cats=Array.isArray(categories)?categories.map(String):[];
    if(cats.some(x=>x.startsWith("public_transport.bus")))return "Arrêt de bus";
    if(cats.some(x=>x.startsWith("public_transport.tram")))return "Arrêt de tramway";
    if(cats.some(x=>x.startsWith("public_transport.train")))return "Gare";
    if(cats.some(x=>x.startsWith("public_transport.platform")))return "Arrêt de transport";
    return "";
  }
  window.LibcomlairTransport=Object.freeze({normalizeNearbyStops,inferGeoapifyTransportType});
})();