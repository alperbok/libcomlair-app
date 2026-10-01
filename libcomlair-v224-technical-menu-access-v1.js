(()=>{
"use strict";

const VERSION="v224-1";
const SESSION_KEY="libcomlair-developer-mode-v1";
const QUERY_KEY="libcomlair-dev";
const STRUCTURED_ATTR="v224MaintenanceStructured";

function consumeDeveloperQuery(){
  try{
    const url=new URL(location.href);
    if(!url.searchParams.has(QUERY_KEY))return;
    const value=url.searchParams.get(QUERY_KEY);
    if(value==="1")sessionStorage.setItem(SESSION_KEY,"1");
    if(value==="0")sessionStorage.removeItem(SESSION_KEY);
    url.searchParams.delete(QUERY_KEY);
    history.replaceState(history.state,"",url.pathname+(url.search||"")+(url.hash||""));
  }catch(_){}
}

function isDeveloperMode(){
  try{return sessionStorage.getItem(SESSION_KEY)==="1"}catch(_){return false}
}

function setDeveloperMode(enabled){
  try{
    if(enabled)sessionStorage.setItem(SESSION_KEY,"1");
    else sessionStorage.removeItem(SESSION_KEY);
  }catch(_){}
  refreshDeveloperVisibility();
  return isDeveloperMode();
}

function makeAccordion(id,label){
  const section=document.createElement("section");
  section.className="v224-tech-accordion";
  section.dataset.v224TechGroup=id;

  const button=document.createElement("button");
  button.type="button";
  button.className="details-btn v224-tech-accordion-toggle";
  button.id=id+"Toggle";
  button.setAttribute("aria-expanded","false");
  button.setAttribute("aria-controls",id+"Content");
  button.textContent=label;

  const content=document.createElement("div");
  content.id=id+"Content";
  content.className="v224-tech-accordion-content";
  content.hidden=true;

  button.addEventListener("click",()=>{
    const open=content.hidden;
    content.hidden=!open;
    button.setAttribute("aria-expanded",open?"true":"false");
  });

  section.append(button,content);
  return {section,button,content};
}

function moduleSnapshot(){
  const targets={
    "global-assistance":"LibcomlairGlobalAssistance",
    "voice":"LibcomlairVoice",
    "render-voice":"LibcomlairRenderVoice",
    "voice-independence":"LibcomlairVoiceIndependence",
    "voice-context":"LibcomlairVoiceContext",
    "voice-guide":"LibcomlairVoiceGuide",
    "page-flow":"LibcomlairPageFlow",
    "diagnostics":"LibcomlairDiagnostics",
    "repair":"LibcomlairRepairEngine",
    "menu-groups":"LibcomlairMenuGroups"
  };
  return Object.entries(targets).map(([moduleId,globalName])=>{
    let value=null;
    try{value=window[globalName]}catch(_){}
    return {
      moduleId,
      version:value&&typeof value.version==="string"?value.version:null,
      state:value?"present":"absent",
      lastSuccessfulTest:null,
      lastErrorCode:null,
      dependencies:[],
      fallbackActive:null,
      featureFlag:null
    };
  });
}

async function readFeatureFlags(){
  try{
    const response=await fetch("config/libcomlair-feature-flags.json",{cache:"no-store"});
    if(!response.ok)throw new Error("HTTP "+response.status);
    return await response.json();
  }catch(err){return {error:String(err&&err.message||err)}}
}

function renderFlags(target,data){
  target.textContent="";
  const pre=document.createElement("pre");
  pre.className="v224-tech-readout";
  if(data&&data.flags){
    const lines=["Configuration runtime active : "+String(!!data.runtimeActive)];
    for(const [name,state] of Object.entries(data.flags))lines.push(name+" : "+state);
    pre.textContent=lines.join("\n");
  }else pre.textContent="Impossible de lire la configuration : "+String(data?.error||"erreur inconnue");
  target.appendChild(pre);
}

async function buildTechnicalReport(){
  const flags=await readFeatureFlags();
  const report={
    schemaVersion:1,
    appVersion:document.documentElement.dataset.libcomlairTestBuild||null,
    generatedAt:new Date().toISOString(),
    mode:isDeveloperMode()?"developer":"normal",
    activeContext:null,
    networkState:navigator.onLine?"online":"offline",
    storage:{available:null,estimatedBytes:null,usedBytes:null},
    modules:moduleSnapshot(),
    voice:{provider:null,localAudioAvailable:null,dictionaryAvailable:null,localTtsAvailable:null,lastErrorCode:null},
    microphone:{permissionState:null,captureAvailable:null,recognitionProvider:null,lastErrorCode:null},
    gps:{permissionState:null,available:null,lastErrorCode:null},
    data:{catalogueVersion:null,transportVersion:null,voiceDictionaryVersion:null,counts:{}},
    lastRepair:null,
    lastReferenceJourney:null,
    featureFlags:flags&&flags.flags?flags.flags:null,
    privacy:{includePreciseLocation:false,includeUserText:false,includeAudioContent:false,includeSecrets:false,includeRawStorage:false}
  };
  try{report.activeContext=window.LibcomlairVoiceContext?.current?.()||window.LibcomlairVoiceContext?.getCurrent?.()||null}catch(_){}
  try{
    if(navigator.storage?.estimate){
      const estimate=await navigator.storage.estimate();
      report.storage={available:true,estimatedBytes:estimate.quota??null,usedBytes:estimate.usage??null};
    }
  }catch(_){report.storage.available=false}
  return report;
}

async function downloadTechnicalReport(status){
  status.textContent="Préparation du rapport…";
  try{
    const report=await buildTechnicalReport();
    const blob=new Blob([JSON.stringify(report,null,2)],{type:"application/json"});
    const href=URL.createObjectURL(blob);
    const a=document.createElement("a");
    const stamp=new Date().toISOString().replace(/[:.]/g,"-");
    a.href=href;
    a.download="libcomlair-rapport-technique-"+stamp+".json";
    a.hidden=true;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(href),1000);
    status.textContent="Rapport technique créé. Aucune position précise, dictée, donnée audio, secret ou stockage brut n’est inclus.";
  }catch(err){status.textContent="Impossible de créer le rapport : "+String(err&&err.message||err)}
}

function buildAdvancedContent(content){
  if(content.dataset.built==="true")return;
  content.dataset.built="true";

  const note=document.createElement("p");
  note.className="data-note";
  note.textContent="Mode développeur actif pour cet onglet. Les outils ci-dessous sont séparés du menu utilisateur. Les fonctions dangereuses restent désactivées tant qu’elles ne sont pas validées.";

  const flagButton=document.createElement("button");
  flagButton.type="button";
  flagButton.className="details-btn";
  flagButton.textContent="🧩 Voir les fonctions expérimentales";

  const flagResult=document.createElement("div");
  flagResult.className="data-note";
  flagResult.setAttribute("aria-live","polite");
  flagButton.addEventListener("click",async()=>renderFlags(flagResult,await readFeatureFlags()));

  const reportButton=document.createElement("button");
  reportButton.type="button";
  reportButton.className="details-btn";
  reportButton.textContent="📄 Exporter un rapport technique";

  const reportStatus=document.createElement("p");
  reportStatus.className="data-note";
  reportStatus.setAttribute("aria-live","polite");
  reportButton.addEventListener("click",()=>downloadTechnicalReport(reportStatus));

  const future=document.createElement("p");
  future.className="data-note v224-tech-future";
  future.textContent="Prévus ici après validation : tests de panne volontaire, matrice de dépendances, migrations, stockage, licences et retour arrière.";

  const exitButton=document.createElement("button");
  exitButton.type="button";
  exitButton.className="details-btn";
  exitButton.textContent="🔒 Quitter la maintenance avancée";
  exitButton.addEventListener("click",()=>{
    setDeveloperMode(false);
    window.LibcomlairVoice?.speak?.("Maintenance avancée fermée.",{rate:.9});
  });

  content.append(note,flagButton,flagResult,reportButton,reportStatus,future,exitButton);
}

function refreshDeveloperVisibility(){
  const section=document.getElementById("v224AdvancedMaintenanceSection");
  if(!section)return;
  const enabled=isDeveloperMode();
  section.hidden=!enabled;
  if(!enabled){
    const content=document.getElementById("v224AdvancedMaintenanceContent");
    const toggle=document.getElementById("v224AdvancedMaintenanceToggle");
    if(content)content.hidden=true;
    if(toggle)toggle.setAttribute("aria-expanded","false");
  }
}

function ensureStructuredMenu(){
  const panel=document.querySelector("#libcomlairGlobalMenuPanel .technical-menu-panel")||document.querySelector("#technicalMenu .technical-menu-panel");
  if(!panel)return false;
  if(panel.dataset[STRUCTURED_ATTR]==="true"){
    refreshDeveloperVisibility();
    return true;
  }

  const voiceTest=document.getElementById("visionVoiceTest");
  const voiceMode=document.getElementById("voiceEngineMode");
  const systemDiagnostic=document.getElementById("systemDiagnostic");

  const essential=makeAccordion("v224EssentialStatus","🔊 État et tests essentiels");
  if(voiceTest)essential.content.appendChild(voiceTest);
  if(voiceMode)essential.content.appendChild(voiceMode);

  const diagnostic=makeAccordion("v224DiagnosticRepair","🧪 Diagnostic et réparation");
  if(systemDiagnostic)diagnostic.content.appendChild(systemDiagnostic);

  const advanced=makeAccordion("v224AdvancedMaintenance","🛠 Maintenance avancée");
  advanced.section.id="v224AdvancedMaintenanceSection";
  buildAdvancedContent(advanced.content);

  panel.append(essential.section,diagnostic.section,advanced.section);
  panel.dataset[STRUCTURED_ATTR]="true";
  refreshDeveloperVisibility();
  return true;
}

consumeDeveloperQuery();
const run=()=>{
  ensureStructuredMenu();
  setTimeout(ensureStructuredMenu,80);
  setTimeout(ensureStructuredMenu,300);
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
window.addEventListener("pageshow",run);
window.addEventListener("libcomlair-onboarding-step",run);

window.LibcomlairDeveloperMaintenance=Object.freeze({
  version:VERSION,
  isEnabled:isDeveloperMode,
  enableForSession:()=>setDeveloperMode(true),
  disableForSession:()=>setDeveloperMode(false),
  refresh:run,
  buildTechnicalReport
});
})();