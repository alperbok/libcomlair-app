(()=>{
"use strict";

const VERSION="v224-1";
const MANIFEST_URL="data/voice/libcomlair-fixed-audio.json";
let last={available:false,total:0,critical:0,ready:0,criticalReady:0,coveragePercent:0,criticalCoveragePercent:0,missingCritical:[],time:0,error:""};

async function inspect(){
  try{
    const response=await fetch(MANIFEST_URL,{cache:"no-store"});
    if(!response.ok)throw new Error("HTTP "+response.status);
    const manifest=await response.json();
    const entries=Array.isArray(manifest?.entries)?manifest.entries:[];
    const critical=entries.filter(x=>x?.critical===true);
    const ready=entries.filter(x=>x?.status==="ready"&&typeof x?.asset==="string"&&x.asset);
    const criticalReady=critical.filter(x=>x?.status==="ready"&&typeof x?.asset==="string"&&x.asset);
    last={
      available:true,
      total:entries.length,
      critical:critical.length,
      ready:ready.length,
      criticalReady:criticalReady.length,
      coveragePercent:entries.length?Math.round(ready.length*100/entries.length):100,
      criticalCoveragePercent:critical.length?Math.round(criticalReady.length*100/critical.length):100,
      missingCritical:critical.filter(x=>!criticalReady.includes(x)).map(x=>String(x.id||"")),
      time:Date.now(),
      error:""
    };
    try{window.dispatchEvent(new CustomEvent("libcomlair-voice-local-coverage",{detail:{...last}}))}catch(_){}
    return {...last};
  }catch(error){
    last={available:false,total:0,critical:0,ready:0,criticalReady:0,coveragePercent:0,criticalCoveragePercent:0,missingCritical:[],time:Date.now(),error:String(error?.message||error||"manifest-error")};
    return {...last};
  }
}

window.LibcomlairVoiceLocalCoverage=Object.freeze({version:VERSION,inspect,status:()=>({...last})});
inspect().catch(()=>{});
})();
