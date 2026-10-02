(()=>{
"use strict";

const VERSION="v224-welcome-system-autostart-v1";
const WELCOME_ID="welcome.main";
const WELCOME_MESSAGE="Bienvenue dans Libcomlair. Ensemble, rendons les lieux accessibles plus faciles à trouver pour tous. Appuyez sur Suivant pour commencer.";
const GESTURE_EVENTS=["pointerdown","touchstart","click","keydown"];

const synth=window.speechSynthesis;
const available=!!synth&&typeof window.SpeechSynthesisUtterance==="function";
let speaking=false;
let playPending=false;
let gestureArmed=false;
let started=false;
let utterance=null;
let last={time:0,state:"idle",source:"speechSynthesis-v162-style",detail:""};

function remember(state,detail=""){
  last={time:Date.now(),state:String(state||""),source:"speechSynthesis-v162-style",detail:String(detail||"")};
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

function disarmGestureFallback(){
  if(!gestureArmed)return;
  gestureArmed=false;
  for(const type of GESTURE_EVENTS){
    try{document.removeEventListener(type,globalGestureHandler,true)}catch(_){}
  }
}

function armGestureFallback(){
  if(gestureArmed||started)return;
  gestureArmed=true;
  for(const type of GESTURE_EVENTS){
    try{document.addEventListener(type,globalGestureHandler,{capture:true,passive:type!=="keydown"})}catch(_){document.addEventListener(type,globalGestureHandler,true)}
  }
  remember("waiting-first-gesture","automatic-system-voice-did-not-start");
}

function stop(){
  disarmGestureFallback();
  playPending=false;
  speaking=false;
  started=false;
  utterance=null;
  try{if(available&&(synth.speaking||synth.pending))synth.cancel()}catch(_){}
}

function makeUtterance(fromGesture){
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
    disarmGestureFallback();
    remember("speaking",fromGesture?"gesture-fallback":"automatic-v162-style");
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
    if(!fromGesture)armGestureFallback();
  };
  return u;
}

function playNow(fromGesture=false){
  keepNavigationReady();
  if(!available){remember("unavailable","speechSynthesis-missing");return false}
  if(!isWelcome()||speaking||playPending||started)return false;
  playPending=true;
  remember(fromGesture?"gesture-speech-attempt":"automatic-speech-attempt",WELCOME_ID);
  try{
    if(fromGesture&&synth&&(synth.speaking||synth.pending)){
      try{synth.cancel()}catch(_){}
    }
    const u=makeUtterance(fromGesture);
    synth.speak(u);
    if(!fromGesture){
      setTimeout(()=>{
        if(utterance!==u||started)return;
        playPending=false;
        armGestureFallback();
      },1400);
    }
    return true;
  }catch(error){
    playPending=false;
    remember("speech-exception",error?.message||String(error||"speech_exception"));
    if(!fromGesture)armGestureFallback();
    return false;
  }
}

function globalGestureHandler(){
  if(!isWelcome()){disarmGestureFallback();return}
  playNow(true);
}

function scheduleAutomatic(){
  keepNavigationReady();
  setTimeout(()=>{
    if(started||speaking||playPending)return;
    if(isWelcome())playNow(false);
    else setTimeout(()=>{if(!started&&!speaking&&!playPending&&isWelcome())playNow(false)},500);
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
  tryAutomatic:()=>playNow(false),
  tryFromGesture:()=>playNow(true),
  stop,
  status:()=>({...last,navigationBlocked:false,networkFallback:false,renderDependency:false,systemSpeechAvailable:available,gestureFallbackArmed:gestureArmed,speaking,playPending,started})
});

// Compatibilité avec le présentateur général : l'accueil possède sa propre lecture.
window.LibcomlairWelcomeListenFirst=api;
window.LibcomlairWelcomeSystemAutostart=api;
// Alias conservé pour le diagnostic existant.
window.LibcomlairWelcomeLocalFirst=api;

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});
else bind();
window.addEventListener("pageshow",()=>{if(!started&&!speaking&&!playPending)scheduleAutomatic()});
})();
