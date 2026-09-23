(function(){
  "use strict";
  const AUTO_REFRESH_KEY="libcomlair-auto-source-refresh-v173";
  const AUTO_REFRESH_MS=24*60*60*1000;
  const AUTO_REFRESH_DISTANCE_KM=2;
  function distanceKm(aLat,aLon,bLat,bLon){
    const toRad=x=>x*Math.PI/180,R=6371;
    const dLat=toRad(bLat-aLat),dLon=toRad(bLon-aLon);
    const a=Math.sin(dLat/2)**2+Math.cos(toRad(aLat))*Math.cos(toRad(bLat))*Math.sin(dLon/2)**2;
    return 2*R*Math.asin(Math.sqrt(a));
  }
  function loadState(){
    try{
      const x=JSON.parse(localStorage.getItem(AUTO_REFRESH_KEY)||"{}");
      return x&&typeof x==="object"&&!Array.isArray(x)?x:{};
    }catch(_){return {}}
  }
  function saveState(state){
    try{localStorage.setItem(AUTO_REFRESH_KEY,JSON.stringify(state&&typeof state==="object"?state:{}));return true}catch(_){return false}
  }
  function isFresh(state,key,lat,lon){
    const t=Number(state&&state[key]||0),slat=Number(state&&state.lat),slon=Number(state&&state.lon);
    if(!t||Date.now()-t>AUTO_REFRESH_MS)return false;
    if(!Number.isFinite(slat)||!Number.isFinite(slon))return false;
    return distanceKm(slat,slon,lat,lon)<=AUTO_REFRESH_DISTANCE_KM;
  }
  window.LibcomlairData=Object.freeze({AUTO_REFRESH_KEY,AUTO_REFRESH_MS,AUTO_REFRESH_DISTANCE_KM,distanceKm,loadState,saveState,isFresh});
})();