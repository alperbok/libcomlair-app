(()=>{
"use strict";

const VERSION="v224-21-eager-vera-autoplay";
const WELCOME_ID="welcome.main";
const WELCOME_MESSAGE="Bienvenue dans Libcomlair. Ensemble, rendons les lieux accessibles plus faciles à trouver pour tous. Appuyez sur Suivant pour commencer.";
const PACKAGED_URL="voice-tests/fr-FR/vera-welcome.wav?v=20261002-1";
const GESTURE_EVENTS=["pointerdown","touchstart","click","keydown"];

let speaking=false;
let playPending=false;
let gestureArmed=false;
let last={time:0,state:"idle",source:"packaged-vera",detail:""};

const audio=new Audio();
audio.preload="auto";
audio.autoplay=true;
audio.src=PACKAGED_URL;
try{audio.load()}catch(_){}

function remember(state,source="packaged-vera",detail=""){
  last={time:Date.now(),state:String(state||""),source:String(source||"packaged-vera"),detail:String(detail||"")};
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
  try{audio.pause();audio.currentTime=0}catch(_){}
  speaking=false;
  playPending=false;
}

function disarmGestureFallback(){
  if(!gestureArmed)return;
  gestureArmed=false;
  for(const type of GESTURE_EVENTS){
    try{document.removeEventListener(type,globalGestureHandler,true)}catch(_){}
  }
}

function armGestureFallback(){
  if(gestureArmed)return;
  gestureArmed=true;
  for(const type of GESTURE_EVENTS){
    try{document.addEventListener(type,globalGestureHandler,{capture:true,passive:type!=="keydown"})}catch(_){document.addEventListener(type,globalGestureHandler,true)}
  }
  remember("waiting-first-gesture","packaged-vera","autoplay-refused-first-touch-will-play");
}

function playNow(fromGesture=false){
  keepNavigationReady();
  if(!isWelcome()||speaking||playPending)return false;
  playPending=true;
  remember(fromGesture?"gesture-play-attempt":"autoplay-attempt","packaged-vera",WELCOME_ID);
  try{
    const p=audio.play();
    if(p&&typeof p.then==="function"){
      p.then(()=>{
        playPending=false;
      }).catch(error=>{
        playPending=false;
        if(!speaking){
          remember(fromGesture?"gesture-play-rejected":"autoplay-blocked","packaged-vera",error?.name||error?.message||"play-rejected");
          armGestureFallback();
        }
      });
    }else{
      playPending=false;
    }
    return true;
  }catch(error){
    playPending=false;
    remember(fromGesture?"gesture-play-failed":"autoplay-failed","packaged-vera",error?.name||error?.message||"play-failed");
    armGestureFallback();
    return false;
  }
}

function globalGestureHandler(){
  if(!isWelcome()){disarmGestureFallback();return}
  // Le fichier audio est déjà créé et préchargé : le premier geste peut appeler play() immédiatement.
  playNow(true);
}

function bind(){
  keepNavigationReady();
  if(isWelcome()){
    playNow(false);
    // Une deuxième tentative rapprochée couvre les navigateurs où la page de bienvenue devient visible juste après DOMContentLoaded.
    setTimeout(()=>{if(isWelcome()&&!speaking&&!playPending)playNow(false)},80);
  }
  return true;
}

audio.addEventListener("playing",()=>{
  playPending=false;
  speaking=true;
  disarmGestureFallback();
  remember("speaking","packaged-vera",WELCOME_ID);
});
audio.addEventListener("ended",()=>{
  speaking=false;
  playPending=false;
  remember("ended","packaged-vera",WELCOME_ID);
});
audio.addEventListener("error",()=>{
  speaking=false;
  playPending=false;
  remember("error","packaged-vera",WELCOME_ID);
  armGestureFallback();
});

// Armer immédiatement le secours tactile afin que, si Android bloque réellement l'autoplay,
// le tout premier geste dans le document soit suffisant.
armGestureFallback();

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});
else bind();
window.addEventListener("pageshow",()=>setTimeout(bind,0));
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="visible"&&isWelcome()&&!speaking&&!playPending)playNow(false);
});

window.LibcomlairWelcomeLocalFirst=Object.freeze({
  version:VERSION,
  welcomeId:WELCOME_ID,
  message:WELCOME_MESSAGE,
  packagedUrl:PACKAGED_URL,
  bind,
  tryAutomatic:()=>playNow(false),
  tryFromGesture:()=>playNow(true),
  stop,
  status:()=>({...last,navigationBlocked:false,networkFallback:false,renderDependency:false,packagedPrepared:true,gestureFallbackArmed:gestureArmed,speaking,playPending})
});
})();
