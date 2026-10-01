(()=>{
"use strict";

const VERSION="v224-20-first-gesture-immediate";
const MANIFEST_URL="data/voice/libcomlair-fixed-audio.json";
const WELCOME_ID="welcome.main";
const WELCOME_MESSAGE="Bienvenue dans Libcomlair. Ensemble, rendons les lieux accessibles plus faciles à trouver pour tous. Appuyez sur Suivant pour commencer.";
const GESTURE_EVENTS=["pointerdown","touchstart","keydown"];
let manifestPromise=null;
let packagedAudio=null;
let localPlayer=null;
let speaking=false;
let gestureArmed=false;
let last={time:0,state:"idle",source:"none",detail:""};

function remember(state,source="none",detail=""){
  last={time:Date.now(),state:String(state||""),source:String(source||"none"),detail:String(detail||"")};
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

async function loadManifest(){
  if(manifestPromise)return manifestPromise;
  manifestPromise=fetch(MANIFEST_URL,{cache:"no-store"}).then(r=>r.ok?r.json():null).catch(()=>null);
  return manifestPromise;
}

async function packagedEntry(){
  const manifest=await loadManifest();
  const entries=Array.isArray(manifest?.entries)?manifest.entries:[];
  return entries.find(x=>x?.id===WELCOME_ID&&x?.status==="ready"&&typeof x?.asset==="string"&&x.asset)||null;
}

async function preparePackaged(){
  if(packagedAudio)return packagedAudio;
  const entry=await packagedEntry();
  if(!entry?.asset)return null;
  const audio=new Audio(entry.asset);
  audio.preload="auto";
  audio.addEventListener("playing",()=>{speaking=true;remember("speaking","packaged",entry.id);disarmGestureFallback()});
  audio.addEventListener("ended",()=>{speaking=false;remember("ended","packaged",entry.id)});
  audio.addEventListener("error",()=>{speaking=false;remember("error","packaged",entry.id)});
  packagedAudio=audio;
  return audio;
}

async function prepareLocal(){
  if(localPlayer)return localPlayer;
  const library=window.LibcomlairLocalAudioLibrary;
  if(!library?.createPlayer)return null;
  try{
    localPlayer=await library.createPlayer(WELCOME_MESSAGE);
    if(localPlayer?.audio){
      localPlayer.audio.addEventListener("playing",()=>{speaking=true;remember("speaking","local-library",WELCOME_ID);disarmGestureFallback()});
      localPlayer.audio.addEventListener("ended",()=>{speaking=false;remember("ended","local-library",WELCOME_ID)});
      localPlayer.audio.addEventListener("error",()=>{speaking=false;remember("error","local-library",WELCOME_ID)});
    }
    return localPlayer;
  }catch(_){return null}
}

async function prepare(){
  keepNavigationReady();
  const packaged=await preparePackaged();
  if(packaged)return {source:"packaged",audio:packaged};
  const local=await prepareLocal();
  if(local?.audio)return {source:"local-library",audio:local.audio};
  remember("local-miss","none","welcome-audio-unavailable");
  return null;
}

function playPreparedAudio(audio,source,detail,{fromGesture=false}={}){
  if(!audio||speaking||!isWelcome())return false;
  // Ne pas déclarer speaking tant que l'événement "playing" n'a pas réellement eu lieu.
  // Ainsi un autoplay refusé ne bloque pas le premier geste utilisateur suivant.
  remember(fromGesture?"gesture-play-attempt":"autoplay-attempt",source,detail);
  try{
    const p=audio.play();
    if(p&&typeof p.catch==="function")p.catch(error=>{
      if(!speaking){
        remember(fromGesture?"gesture-play-rejected":"autoplay-blocked",source,error?.name||error?.message||"play-rejected");
        armGestureFallback();
      }
    });
    return true;
  }catch(error){
    remember(fromGesture?"gesture-play-failed":"play-failed",source,error?.name||error?.message||"play-failed");
    armGestureFallback();
    return false;
  }
}

async function tryAutomatic(){
  if(!isWelcome())return false;
  const prepared=await prepare();
  if(!prepared)return false;
  const started=playPreparedAudio(prepared.audio,prepared.source,WELCOME_ID,{fromGesture:false});
  if(!started)armGestureFallback();
  return started;
}

function tryFromGesture(){
  if(!isWelcome()||speaking)return false;
  keepNavigationReady();
  if(packagedAudio)return playPreparedAudio(packagedAudio,"packaged",WELCOME_ID,{fromGesture:true});
  if(localPlayer?.audio)return playPreparedAudio(localPlayer.audio,"local-library",WELCOME_ID,{fromGesture:true});
  // Cas rare : le chargement IndexedDB n'était pas fini. On prépare sans bloquer le geste courant.
  prepare().then(prepared=>{if(prepared&&isWelcome()&&!speaking)playPreparedAudio(prepared.audio,prepared.source,WELCOME_ID,{fromGesture:true})}).catch(()=>{});
  return false;
}

function globalGestureHandler(){
  if(!isWelcome()){disarmGestureFallback();return}
  // Aucune interception : les commandes de navigation restent propriétaires du geste.
  tryFromGesture();
}

function armGestureFallback(){
  if(gestureArmed||!isWelcome())return;
  gestureArmed=true;
  for(const type of GESTURE_EVENTS){
    try{document.addEventListener(type,globalGestureHandler,{capture:true,passive:type!=="keydown"})}catch(_){document.addEventListener(type,globalGestureHandler,true)}
  }
  remember("waiting-first-gesture",last.source||"local-library","autoplay-refused-first-touch-will-play");
}

function disarmGestureFallback(){
  if(!gestureArmed)return;
  gestureArmed=false;
  for(const type of GESTURE_EVENTS){
    try{document.removeEventListener(type,globalGestureHandler,true)}catch(_){}
  }
}

function disposePrepared(){
  disarmGestureFallback();
  try{if(packagedAudio){packagedAudio.pause();packagedAudio.currentTime=0}}catch(_){}
  try{localPlayer?.dispose?.()}catch(_){}
  localPlayer=null;
  speaking=false;
}

function bind(){
  const b=button();
  if(!b)return false;
  keepNavigationReady();
  if(b.dataset.v224WelcomeLocalFirstBound!=="20"){
    b.dataset.v224WelcomeLocalFirstBound="20";
    b.addEventListener("pointerdown",tryFromGesture,{capture:false,passive:true});
  }
  // Préparer immédiatement l'audio local avant tout geste.
  prepare().then(()=>setTimeout(()=>tryAutomatic().catch(()=>{}),20)).catch(()=>{});
  return true;
}

window.addEventListener("libcomlair-local-audio-updated",event=>{
  const id=event?.detail?.messageId||"";
  if(id&&id!==WELCOME_ID)return;
  disposePrepared();
  if(isWelcome())setTimeout(()=>{prepare().then(()=>tryAutomatic()).catch(()=>{})},30);
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
window.addEventListener("pageshow",bind);

window.LibcomlairWelcomeLocalFirst=Object.freeze({
  version:VERSION,
  welcomeId:WELCOME_ID,
  message:WELCOME_MESSAGE,
  bind,
  prepare,
  tryAutomatic,
  tryFromGesture,
  armGestureFallback,
  status:()=>({...last,navigationBlocked:false,networkFallback:false,renderDependency:false,packagedPrepared:!!packagedAudio,localPrepared:!!localPlayer,gestureFallbackArmed:gestureArmed,speaking})
});
})();
