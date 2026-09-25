(function(){
  "use strict";

  const TRANSIENT_KEYS=[
    "libcomlair-geoapify-nearby-v3",
    "libcomlair-idfm-nearby-v138",
    "libcomlair-address-cache-v144",
    "libcomlair-auto-source-refresh-v173",
    "libcomlair-auto-source-refresh-v168",
    "libcomlair-auto-source-refresh-v165"
  ];

  const PROTECTED_KEYS=[
    "libcomlair-access-profile-v1",
    "libcomlair-favorites-v16",
    "libcomlair-reviews-v18",
    "libcomlair-reports-v16",
    "libcomlair-proposals-v13"
  ];

  const LAST_REPAIR_KEY="libcomlair-last-repair-v1";

  function status(text){
    const el=document.getElementById("systemRepairResult")||document.getElementById("systemDiagnosticResult");
    if(el)el.textContent=String(text||"");
  }

  function protectedSnapshot(){
    const out={};
    PROTECTED_KEYS.forEach(key=>{
      try{
        const value=localStorage.getItem(key);
        if(value!==null)out[key]=value;
      }catch(_){}
    });
    return out;
  }

  function restoreProtected(snapshot){
    if(!snapshot||typeof snapshot!=="object")return;
    Object.entries(snapshot).forEach(([key,value])=>{
      if(!PROTECTED_KEYS.includes(key))return;
      try{localStorage.setItem(key,String(value))}catch(_){}
    });
  }

  function clearTransientLocalData(){
    TRANSIENT_KEYS.forEach(key=>{
      try{localStorage.removeItem(key)}catch(_){}
    });
  }

  async function clearBrowserCaches(){
    if(!("caches" in window))return 0;
    try{
      const names=await caches.keys();
      let removed=0;
      for(const name of names){
        try{
          if(await caches.delete(name))removed++;
        }catch(_){}
      }
      return removed;
    }catch(_){return 0}
  }

  async function refreshServiceWorkers(){
    if(!("serviceWorker" in navigator)||typeof navigator.serviceWorker.getRegistrations!=="function")return 0;
    try{
      const regs=await navigator.serviceWorker.getRegistrations();
      let updated=0;
      for(const reg of regs){
        try{
          if(reg&&typeof reg.update==="function"){
            await reg.update();
            updated++;
          }
        }catch(_){}
      }
      return updated;
    }catch(_){return 0}
  }

  function recordRepair(meta){
    try{
      localStorage.setItem(LAST_REPAIR_KEY,JSON.stringify({
        date:new Date().toISOString(),
        version:"v175-known-issues",
        ...meta
      }));
    }catch(_){}
  }

  function reloadClean(){
    try{
      const url=new URL(window.location.href);
      url.searchParams.set("repair",String(Date.now()));
      url.hash="";
      window.location.replace(url.toString());
    }catch(_){
      window.location.reload();
    }
  }

  async function repair(){
    const before=protectedSnapshot();
    status("Réparation automatique en cours…");

    try{
      if(window.LibcomlairVoice&&typeof window.LibcomlairVoice.cancel==="function"){
        window.LibcomlairVoice.cancel();
      }
    }catch(_){}

    let knownIssueRepair=null;
    try{
      if(window.LibcomlairKnownIssues&&typeof window.LibcomlairKnownIssues.repairSafe==="function"){
        knownIssueRepair=window.LibcomlairKnownIssues.repairSafe();
      }
    }catch(_){}

    clearTransientLocalData();
    restoreProtected(before);

    const cacheCount=await clearBrowserCaches();
    const workerCount=await refreshServiceWorkers();

    try{
      if(window.LibcomlairDiagnostics&&typeof window.LibcomlairDiagnostics.clearErrors==="function"){
        window.LibcomlairDiagnostics.clearErrors();
      }
    }catch(_){}

    restoreProtected(before);
    recordRepair({cacheCount,workerCount,knownIssueRepair});
    const repairedCount=knownIssueRepair&&Array.isArray(knownIssueRepair.repaired)?knownIssueRepair.repaired.length:0;
    status("✓ Réparation terminée"+(repairedCount?" : "+repairedCount+" panne"+(repairedCount>1?"s":"")+" connue"+(repairedCount>1?"s":"")+" corrigée"+(repairedCount>1?"s":""):"")+". Libcomlair va se recharger avec des données techniques propres.");
    setTimeout(reloadClean,700);
    return {ok:true,cacheCount,workerCount,knownIssueRepair};
  }

  function lastRepair(){
    try{
      const x=JSON.parse(localStorage.getItem(LAST_REPAIR_KEY)||"null");
      return x&&typeof x==="object"?x:null;
    }catch(_){return null}
  }

  window.LibcomlairRepair=Object.freeze({
    version:"v175",
    repair,
    lastRepair,
    transientKeys:Object.freeze([...TRANSIENT_KEYS]),
    protectedKeys:Object.freeze([...PROTECTED_KEYS])
  });
})();