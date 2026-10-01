(()=>{
"use strict";

const VERSION="v224-1";
const ROOT_ID="v224WelcomeAudioMaintenance";

function developerAllowed(){
  try{return window.LibcomlairDeveloperMaintenance?.isEnabled?.()===true}catch(_){return false}
}

function message(){return window.LibcomlairWelcomeLocalRecorder?.message||""}

function makeButton(text){
  const b=document.createElement("button");
  b.type="button";
  b.className="details-btn";
  b.textContent=text;
  return b;
}

function setStatus(node,text){node.textContent=String(text||"")}

async function refreshStatus(node){
  const recorder=window.LibcomlairWelcomeLocalRecorder;
  const library=window.LibcomlairLocalAudioLibrary;
  if(!recorder||!library){setStatus(node,"Outils audio locaux non chargés.");return}
  const has=await recorder.hasRecording().catch(()=>false);
  const lib=await library.status().catch(()=>null);
  setStatus(node,has
    ?"Audio d’accueil local disponible sur ce téléphone. Bibliothèque : "+String(lib?.entries||0)+" audio(s)."
    :"Aucun audio d’accueil local enregistré sur ce téléphone.");
}

function ensure(){
  if(!developerAllowed())return false;
  const host=document.getElementById("v224AdvancedMaintenanceContent");
  if(!host||document.getElementById(ROOT_ID))return !!document.getElementById(ROOT_ID);

  const wrap=document.createElement("section");
  wrap.id=ROOT_ID;
  wrap.className="data-note";
  wrap.style.borderTop="2px solid #c1c9cd";
  wrap.style.paddingTop="10px";
  wrap.style.marginTop="10px";

  const title=document.createElement("h3");
  title.textContent="🎙️ Voix d’accueil locale";

  const intro=document.createElement("p");
  intro.textContent="Prototype local réservé à la maintenance. L’enregistrement reste sur ce téléphone et n’est pas envoyé au réseau. Il ne devient pas une voix officielle distribuée tant que les droits et la validation ne sont pas établis.";

  const script=document.createElement("p");
  script.className="v224-tech-readout";
  script.textContent="Texte à enregistrer :\n"+message();

  const start=makeButton("🎙️ Démarrer l’enregistrement de l’accueil");
  const stop=makeButton("⏹ Arrêter et enregistrer localement");
  stop.disabled=true;

  const importButton=makeButton("📁 Importer un fichier audio d’accueil");
  const input=document.createElement("input");
  input.type="file";
  input.accept="audio/*";
  input.hidden=true;

  const test=makeButton("▶️ Tester l’audio d’accueil local");
  const remove=makeButton("🗑️ Effacer l’audio d’accueil local");
  const status=document.createElement("p");
  status.className="data-note";
  status.setAttribute("aria-live","polite");

  start.addEventListener("click",async()=>{
    setStatus(status,"Demande d’accès au microphone…");
    const result=await window.LibcomlairWelcomeLocalRecorder?.start?.();
    if(result?.ok){start.disabled=true;stop.disabled=false;setStatus(status,"Enregistrement en cours. Lisez le texte ci-dessus, puis appuyez sur Arrêter.");}
    else setStatus(status,"Impossible de démarrer : "+String(result?.reason||"erreur inconnue"));
  });

  stop.addEventListener("click",async()=>{
    stop.disabled=true;
    setStatus(status,"Enregistrement et sauvegarde locale en cours…");
    const result=await window.LibcomlairWelcomeLocalRecorder?.stop?.();
    start.disabled=false;
    if(result?.ok){
      setStatus(status,"Audio d’accueil enregistré localement. Vous pouvez maintenant le tester, puis mesurer à nouveau l’autonomie.");
      try{window.LibcomlairVoiceLocalCoverage?.inspect?.()}catch(_){}
      try{window.LibcomlairAutonomyDashboard?.inspect?.()}catch(_){}
    }else setStatus(status,"Impossible d’enregistrer : "+String(result?.reason||"erreur inconnue"));
  });

  importButton.addEventListener("click",()=>input.click());
  input.addEventListener("change",async()=>{
    const file=input.files?.[0];
    if(!file)return;
    setStatus(status,"Import de l’audio local…");
    const result=await window.LibcomlairWelcomeLocalRecorder?.importFile?.(file);
    input.value="";
    if(result?.ok){
      setStatus(status,"Audio importé localement. Vous pouvez maintenant le tester.");
      try{window.LibcomlairVoiceLocalCoverage?.inspect?.()}catch(_){}
      try{window.LibcomlairAutonomyDashboard?.inspect?.()}catch(_){}
    }else setStatus(status,"Import impossible : "+String(result?.reason||"erreur inconnue"));
  });

  test.addEventListener("click",async()=>{
    setStatus(status,"Lecture locale…");
    const result=await window.LibcomlairWelcomeLocalRecorder?.test?.();
    setStatus(status,result?.ok?"Lecture locale réussie.":"Lecture locale impossible : "+String(result?.reason||"audio absent"));
  });

  remove.addEventListener("click",async()=>{
    const result=await window.LibcomlairWelcomeLocalRecorder?.remove?.();
    setStatus(status,result?.ok?"Audio d’accueil local effacé.":"Impossible d’effacer l’audio local.");
    try{window.LibcomlairVoiceLocalCoverage?.inspect?.()}catch(_){}
    try{window.LibcomlairAutonomyDashboard?.inspect?.()}catch(_){}
  });

  wrap.append(title,intro,script,start,stop,importButton,input,test,remove,status);
  const future=host.querySelector(".v224-tech-future");
  if(future)host.insertBefore(wrap,future);else host.appendChild(wrap);
  refreshStatus(status).catch(()=>{});
  return true;
}

function run(){
  ensure();
  setTimeout(ensure,120);
  setTimeout(ensure,500);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
window.addEventListener("pageshow",run);
window.addEventListener("libcomlair-onboarding-step",run);
window.addEventListener("libcomlair-local-audio-updated",run);

window.LibcomlairWelcomeAudioMaintenanceUI=Object.freeze({version:VERSION,refresh:run});
})();
