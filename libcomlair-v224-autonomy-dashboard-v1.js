(()=>{
"use strict";

const VERSION="v224-3-independent-local-library";
let last={time:0,confirmedAutonomyPercent:0,measurementCoveragePercent:0,areas:[],externalDependencies:[],unknownAreas:[],infrastructure:[]};

function area(id,label,percent,status,detail,kind="function"){
  return {id,label,percent:Number.isFinite(percent)?Math.max(0,Math.min(100,Math.round(percent))):null,status:String(status||"unknown"),detail:String(detail||""),kind:String(kind||"function")};
}

async function inspect(){
  const areas=[];
  const external=[];
  const unknown=[];
  const infrastructure=[];

  let welcome=null;
  try{welcome=window.LibcomlairWelcomeLocalFirst?.status?.()||null}catch(_){}
  const navigationLocal=!!(welcome&&welcome.navigationBlocked===false&&welcome.networkFallback===false);
  areas.push(area("navigation","Navigation essentielle",navigationLocal?100:0,navigationLocal?"local":"a-verifier",navigationLocal?"l’entrée dans l’application ne dépend pas du réseau":"chaîne d’entrée à vérifier"));

  let coverage=null;
  try{coverage=await window.LibcomlairVoiceLocalCoverage?.inspect?.()}catch(_){}
  const fixedPercent=Number.isFinite(coverage?.criticalCoveragePercent)?coverage.criticalCoveragePercent:0;
  const fixedDetail=coverage?.available
    ?(coverage.criticalReady+" / "+coverage.critical+" messages critiques locaux — empaquetés : "+(coverage.packagedReady||0)+", bibliothèque locale : "+(coverage.libraryReady||0))
    :"manifeste non mesuré";
  areas.push(area("fixed-voice","Voix fixe locale",fixedPercent,coverage?.available?"mesure":"indisponible",fixedDetail));
  if(fixedPercent<100)external.push("voix fixe non encore totalement locale");

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
  try{library=await window.LibcomlairLocalAudioLibrary?.status?.()}catch(_){}
  const libraryAvailable=library?.available===true;
  const libraryEntries=Number(library?.entries)||0;
  infrastructure.push({
    id:"audio-library",
    label:"Bibliothèque audio locale",
    status:libraryAvailable?"infrastructure-disponible":"a-verifier",
    detail:libraryAvailable
      ?("infrastructure indépendante disponible — "+libraryEntries+" audio"+(libraryEntries>1?"s":"")+" enregistré"+(libraryEntries>1?"s":""))
      :"infrastructure locale non confirmée"
  });

  areas.push(area("data","Données essentielles hors ligne",null,"a-mesurer","la couverture locale des données sera calculée source par source"));
  unknown.push("données essentielles hors ligne");

  const functional=areas.filter(x=>x.kind==="function");
  const measurable=functional.filter(x=>Number.isFinite(x.percent));
  const confirmedAutonomyPercent=measurable.length?Math.round(measurable.reduce((s,x)=>s+x.percent,0)/measurable.length):0;
  const measurementCoveragePercent=functional.length?Math.round(measurable.length*100/functional.length):0;

  last={
    time:Date.now(),
    confirmedAutonomyPercent,
    measurementCoveragePercent,
    areas,
    externalDependencies:[...new Set(external)],
    unknownAreas:unknown,
    infrastructure
  };
  try{window.dispatchEvent(new CustomEvent("libcomlair-autonomy-status",{detail:{...last}}))}catch(_){}
  return JSON.parse(JSON.stringify(last));
}

function text(snapshot){
  const s=snapshot||last;
  const lines=[
    "Autonomie locale confirmée : "+s.confirmedAutonomyPercent+" % des fonctions actuellement mesurées",
    "Couverture de mesure : "+s.measurementCoveragePercent+" % des domaines fonctionnels"
  ];
  for(const a of s.areas)lines.push(a.label+" : "+(a.percent===null?"à mesurer":a.percent+" %")+" — "+a.detail);
  for(const item of (s.infrastructure||[]))lines.push(item.label+" : "+item.detail);
  if(s.externalDependencies.length)lines.push("Dépendances restantes : "+s.externalDependencies.join(" ; "));
  if(s.unknownAreas.length)lines.push("À mesurer : "+s.unknownAreas.join(" ; "));
  return lines.join("\n");
}

window.LibcomlairAutonomyDashboard=Object.freeze({version:VERSION,inspect,status:()=>JSON.parse(JSON.stringify(last)),text});
window.addEventListener("libcomlair-local-audio-updated",()=>inspect().catch(()=>{}));
setTimeout(()=>inspect().catch(()=>{}),900);
})();
