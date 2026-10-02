(()=>{
"use strict";

const VERSION="v224-welcome-system-autostart-v3-auto-only";
const WELCOME_ID="welcome.main";
const WELCOME_MESSAGE="Bienvenue dans Libcomlair. Ensemble, rendons les lieux accessibles plus faciles à trouver pour tous. Appuyez sur Suivant pour commencer.";

const synth=window.speechSynthesis;
const available=!!synth&&typeof window.SpeechSynthesisUtterance==="function";
let speaking=false;
let playPending=false;
let started=false;
let utterance=null;
let last={time:0,state:"idle",source:"speechSynthesis-v162-style-auto-only",detail:""};

function remember(state,detail=""){
  last={time:Date.now(),state:String(state||""),source:"speechSynthesis-v162-style-auto-only",detail:String(detail||"")};
  try{window.dispatchEvent(new CustomEvent("libcomlair-welcome-audio-status",{detail:{...last}}))}catch(_){}
}

function visible(el){
  if(!el||el.hidden||el.hasAttribute?.("hidden")||el.getAttribute?.("aria-hidden")==="true")return false;
  try{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0}catch(_){return false}
}
function isWelcome(){return visible(document.getElementById("libcomlairSplash"))}
function button(){return document.getElementById("libcomlairSplashNext")}

function keepNavigationReady(){
  const b=button();if(!b)return false;
  b.removeAttribute("aria-busy");
  b.dataset.v224WelcomeStage="navigation-ready";
  b.textContent="Suivant";
  b.setAttribute("aria-label","Suivant vers le choix de vos besoins d’accessibilité");
  return true;
}

function stop(){
  playPending=false;
  speaking=false;
  started=false;
  utterance=null;
  try{if(available&&(synth.speaking||synth.pending))synth.cancel()}catch(_){}
}

function makeUtterance(){
  const u=new SpeechSynthesisUtterance(WELCOME_MESSAGE);
  utterance=u;
  window.__libcomlairWelcomeSystemUtterance=u;
  u.lang="fr-FR";
  u.rate=0.9;
  u.volume=1;
  u.pitch=1;
  u.onstart=()=>{
    if(utterance!==u)return;
    started=true;
    speaking=true;
    playPending=false;
    remember("speaking","automatic-v162-style");
  };
  u.onend=()=>{
    if(utterance!==u)return;
    speaking=false;
    playPending=false;
    remember("ended",WELCOME_ID);
  };
  u.onerror=e=>{
    if(utterance!==u)return;
    speaking=false;
    playPending=false;
    remember("speech-error",e?.error||"speech_error");
  };
  return u;
}

function playNow(){
  keepNavigationReady();
  if(!available){remember("unavailable","speechSynthesis-missing");return false}
  if(!isWelcome()||speaking||playPending||started)return false;
  playPending=true;
  remember("automatic-speech-attempt",WELCOME_ID);
  try{
    const u=makeUtterance();
    synth.speak(u);
    return true;
  }catch(error){
    playPending=false;
    remember("speech-exception",error?.message||String(error||"speech_exception"));
    return false;
  }
}

function scheduleAutomatic(){
  keepNavigationReady();
  setTimeout(()=>{
    if(started||speaking||playPending)return;
    if(isWelcome())playNow();
    else setTimeout(()=>{if(!started&&!speaking&&!playPending&&isWelcome())playNow()},500);
  },700);
}

function bind(){
  keepNavigationReady();
  scheduleAutomatic();
  return true;
}

const api=Object.freeze({
  version:VERSION,
  welcomeId:WELCOME_ID,
  message:WELCOME_MESSAGE,
  bind,
  tryAutomatic:playNow,
  stop,
  status:()=>({...last,navigationBlocked:false,networkFallback:false,renderDependency:false,systemSpeechAvailable:available,speaking,playPending,started})
});

window.LibcomlairWelcomeListenFirst=api;
window.LibcomlairWelcomeSystemAutostart=api;
window.LibcomlairWelcomeLocalFirst=api;

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});
else bind();
window.addEventListener("pageshow",()=>{if(!started&&!speaking&&!playPending)scheduleAutomatic()});
})();