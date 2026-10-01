(()=>{
"use strict";

const VERSION="v224-2-packaged-plus-local-library";
const MANIFEST_URL="data/voice/libcomlair-fixed-audio.json";
let last={available:false,total:0,critical:0,ready:0,criticalReady:0,packagedReady:0,libraryReady:0,coveragePercent:0,criticalCoveragePercent:0,missingCritical:[],sources:{},time:0,error:""};

async function entryLocalSource(entry){
  if(entry?.status==="ready"&&typeof entry?.asset==="string"&&entry.asset)return "packaged";
  const library=window.LibcomlairLocalAudioLibrary;
  if(library?.hasText&&typeof entry?.text==="string"&&entry.text){
    try{if(await library.hasText(entry.text))return "local-library"}catch(_){}
  }
  return "missing";
}

async function inspect(){
  try{
    const response=await fetch(MANIFEST_URL,{cache:"no-store"});
    if(!response.ok)throw new Error("HTTP "+response.status);
    const manifest=await response.json();
    const entries=Array.isArray(manifest?.entries)?manifest.entries:[];
    const evaluated=[];
    for(const entry of entries)evaluated.push({...entry,localSource:await entryLocalSource(entry)});
    const critical=evaluated.filter(x=>x?.critical===true);
    const ready=evaluated.filter(x=>x.localSource!=="missing");
    const criticalReady=critical.filter(x=>x.localSource!=="missing");
    const packagedReady=ready.filter(x=>x.localSource==="packaged");
    const libraryReady=ready.filter(x=>x.localSource==="local-library");
    const sources={};
    for(const entry of evaluated)sources[String(entry.id||"")]=entry.localSource;
    last={
      available:true,
      total:evaluated.length,
      critical:critical.length,
      ready:ready.length,
      criticalReady:criticalReady.length,
      packagedReady:packagedReady.length,
      libraryReady:libraryReady.length,
      coveragePercent:evaluated.length?Math.round(ready.length*100/evaluated.length):100,
      criticalCoveragePercent:critical.length?Math.round(criticalReady.length*100/critical.length):100,
      missingCritical:critical.filter(x=>x.localSource==="missing").map(x=>String(x.id||"")),
      sources,
      time:Date.now(),
      error:""
    };
    try{window.dispatchEvent(new CustomEvent("libcomlair-voice-local-coverage",{detail:{...last}}))}catch(_){}
    return {...last};
  }catch(error){
    last={available:false,total:0,critical:0,ready:0,criticalReady:0,packagedReady:0,libraryReady:0,coveragePercent:0,criticalCoveragePercent:0,missingCritical:[],sources:{},time:Date.now(),error:String(error?.message||error||"manifest-error")};
    return {...last};
  }
}

window.LibcomlairVoiceLocalCoverage=Object.freeze({version:VERSION,inspect,status:()=>({...last})});
window.addEventListener("libcomlair-local-audio-updated",()=>inspect().catch(()=>{}));
inspect().catch(()=>{});
})();
