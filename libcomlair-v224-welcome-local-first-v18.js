(()=>{
"use strict";

const VERSION="v224-18-independent-local-audio";
const MANIFEST_URL="data/voice/libcomlair-fixed-audio.json";
const WELCOME_ID="welcome.main";
const WELCOME_MESSAGE="Bienvenue dans Libcomlair. Ensemble, rendons les lieux accessibles plus faciles à trouver pour tous. Appuyez sur Suivant pour commencer.";
let manifestPromise=null;
let packagedAudio=null;
let packagedUrl="";
let localPlayer=null;
let speaking=false;
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
  packagedUrl=entry.asset;
  const audio=new Audio(entry.asset);
  audio.preload="auto";
  audio.addEventListener("playing",()=>remember("speaking","packaged",entry.id));
  audio.addEventListener("ended",()=>{speaking=false;remember("ended","packaged",entry.id)});
  audio.addEventListener("error",()=>{speaking=false;remember("error","packaged",entry.id)});
  packagedAudio=audio;
  return audio;
}

async function prepareLocal(){
  if(localPlayer)return localPlayer;
  const library=window.LibcomlairLocalAudioLibrary;
  if(!library?.createPlayer)return null;
  try{localPlayer=await library.createPlayer(WELCOME_MESSAGE);return localPlayer}catch(_){return null}
}

function playPreparedAudio(audio,source,detail){
  if(!audio||speaking||!isWelcome())return false;
  speaking=true;
  remember("starting",source,detail);
  try{
    const p=audio.play();
    if(p&&typeof p.catch==="function")p.catch(error=>{
      speaking=false;
      remember("autoplay-blocked",source,error?.name||error?.message||"play-rejected");
    });
    return true;
  }catch(error){
    speaking=false;
    remember("play-failed",source,error?.name||error?.message||"play-failed");
    return false;
  }
}

async function prepare(){
  keepNavigationReady();
  const packaged=await preparePackaged();
  if(packaged)return {source:"packaged",audio:packaged};
  const local=await prepareLocal();
  if(local?.audio){
    local.audio.addEventListener("playing",()=>remember("speaking","local-library",WELCOME_ID));
    local.audio.addEventListener("ended",()=>{speaking=false;remember("ended","local-library",WELCOME_ID);try{local.dispose?.()}catch(_){};localPlayer=null});
    local.audio.addEventListener("error",()=>{speaking=false;remember("error","local-library",WELCOME_ID)});
    return {source:"local-library",audio:local.audio};
  }
  remember("local-miss","none","welcome-audio-unavailable");
  return null;
}

async function tryAutomatic(){
  if(!isWelcome())return false;
  const prepared=await prepare();
  if(!prepared)return false;
  return playPreparedAudio(prepared.audio,prepared.source,WELCOME_ID);
}

function tryFromGesture(){
  if(!isWelcome())return false;
  keepNavigationReady();
  if(packagedAudio)return playPreparedAudio(packagedAudio,"packaged",WELCOME_ID);
  if(localPlayer?.audio)return playPreparedAudio(localPlayer.audio,"local-library",WELCOME_ID);
  prepare().then(prepared=>{if(prepared&&isWelcome())playPreparedAudio(prepared.audio,prepared.source,WELCOME_ID)}).catch(()=>{});
  return false;
}

function disposePrepared(){
  try{if(packagedAudio){packagedAudio.pause();packagedAudio.currentTime=0}}catch(_){}
  try{localPlayer?.dispose?.()}catch(_){}
  localPlayer=null;
  speaking=false;
}

function bind(){
  const b=button();
  if(!b)return false;
  keepNavigationReady();
  if(b.dataset.v224WelcomeLocalFirstBound!=="18"){
    b.dataset.v224WelcomeLocalFirstBound="18";
    b.addEventListener("pointerdown",tryFromGesture,{capture:false,passive:true});
  }
  setTimeout(()=>tryAutomatic().catch(()=>{}),40);
  return true;
}

window.addEventListener("libcomlair-local-audio-updated",event=>{
  const id=event?.detail?.messageId||"";
  if(id&&id!==WELCOME_ID)return;
  disposePrepared();
  if(isWelcome())setTimeout(()=>prepare().catch(()=>{}),30);
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
  status:()=>({...last,navigationBlocked:false,networkFallback:false,renderDependency:false,packagedPrepared:!!packagedAudio,localPrepared:!!localPlayer})
});
})();
