(()=>{
"use strict";

const VERSION="v224-1";
let last={time:0,measurablePercent:0,areas:[],externalDependencies:[],unknownAreas:[]};

function area(id,label,percent,status,detail){return {id,label,percent:Number.isFinite(percent)?Math.max(0,Math.min(100,Math.round(percent))):null,status:String(status||"unknown"),detail:String(detail||"")}}

async function inspect(){
  const areas=[];
  const external=[];
  const unknown=[];

  let welcome=null;
  try{welcome=window.LibcomlairWelcomeLocalFirst?.status?.()||null}catch(_){}
  const navigationLocal=!!(welcome&&welcome.navigationBlocked===false&&welcome.networkFallback===false);
  areas.push(area("navigation","Navigation essentielle",navigationLocal?100:0,navigationLocal?"local":"a-verifier",navigationLocal?"l’entrée dans l’application ne dépend pas du réseau":"chaîne d’entrée à vérifier"));

  let coverage=null;
  try{coverage=await window.LibcomlairVoiceLocalCoverage?.inspect?.()}catch(_){}
  const fixedPercent=Number.isFinite(coverage?.criticalCoveragePercent)?coverage.criticalCoveragePercent:0;
  areas.push(area("fixed-voice","Voix fixe locale",fixedPercent,coverage?.available?"mesure":"indisponible",coverage?.available?(coverage.criticalReady+" / "+coverage.critical+" messages critiques locaux"):"manifeste non mesuré"));
  if(fixedPercent<100)external.push("voix fixe non encore totalement empaquetée");

  let diag=null;
  try{diag=window.LibcomlairDiagnostics?.status?.()||null}catch(_){}
  const diagLocal=diag?.networkRequired===false;
  areas.push(area("diagnostic","Diagnostic local",diagLocal?100:0,diagLocal?"local":"a-verifier",diagLocal?"aucun accès réseau requis pour le diagnostic local":"diagnostic à vérifier"));

  const localTts=!!(window.LibcomlairLocalTTS&&typeof window.LibcomlairLocalTTS.speak==="function");
  areas.push(area("dynamic-voice","Voix dynamique locale",localTts?100:0,localTts?"local":"a-construire",localTts?"TTS local disponible":"les textes nouveaux dépendent encore d’un moteur non local"));
  if(!localTts)external.push("voix dynamique / TTS local à construire");

  const localRecognition=!!(window.LibcomlairLocalRecognition&&typeof window.LibcomlairLocalRecognition.start==="function");
  areas.push(area("micro","Reconnaissance vocale locale",localRecognition?100:0,localRecognition?"local":"a-construire",localRecognition?"reconnaissance locale disponible":"le micro local hors réseau reste à construire"));
  if(!localRecognition)external.push("reconnaissance micro locale à construire");

  let library=null;
  try{library=await window.LibcomlairRenderVoice?.voiceLibraryStatus?.()}catch(_){}
  const localLibrary=library?.available===true;
  areas.push(area("audio-library","Bibliothèque audio locale",localLibrary?100:0,localLibrary?"local":"a-verifier",localLibrary?(String(library.entries||0)+" enregistrement(s) local(aux)"):"bibliothèque locale non disponible"));

  areas.push(area("data","Données essentielles hors ligne",null,"a-mesurer","la couverture locale des données sera calculée source par source"));
  unknown.push("données essentielles hors ligne");

  const measurable=areas.filter(x=>Number.isFinite(x.percent));
  const measurablePercent=measurable.length?Math.round(measurable.reduce((s,x)=>s+x.percent,0)/measurable.length):0;
  last={time:Date.now(),measurablePercent,areas,externalDependencies:[...new Set(external)],unknownAreas:unknown};
  try{window.dispatchEvent(new CustomEvent("libcomlair-autonomy-status",{detail:{...last}}))}catch(_){}
  return JSON.parse(JSON.stringify(last));
}

function text(snapshot){
  const s=snapshot||last;
  const lines=["Autonomie mesurable : "+s.measurablePercent+" %"];
  for(const a of s.areas)lines.push(a.label+" : "+(a.percent===null?"à mesurer":a.percent+" %")+" — "+a.detail);
  if(s.externalDependencies.length)lines.push("Dépendances restantes : "+s.externalDependencies.join(" ; "));
  if(s.unknownAreas.length)lines.push("À mesurer : "+s.unknownAreas.join(" ; "));
  return lines.join("\n");
}

window.LibcomlairAutonomyDashboard=Object.freeze({version:VERSION,inspect,status:()=>JSON.parse(JSON.stringify(last)),text});
setTimeout(()=>inspect().catch(()=>{}),900);
})();
