(()=>{
"use strict";

const VERSION="v224-17-local-first-nonblocking";
const MANIFEST_URL="data/voice/libcomlair-fixed-audio.json";
const WELCOME_ID="welcome.main";
const WELCOME_MESSAGE="Bienvenue dans Libcomlair. Ensemble, rendons les lieux accessibles plus faciles à trouver pour tous. Appuyez sur Suivant pour commencer.";
const CACHE_KEY=WELCOME_MESSAGE.replace(/\bLibcomlair\b/gi,"Lib comme l’air");

let manifestPromise=null;
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
  manifestPromise=fetch(MANIFEST_URL,{cache:"no-store"})
    .then(r=>r.ok?r.json():null)
    .catch(()=>null);
  return manifestPromise;
}

async function packagedEntry(){
  const manifest=await loadManifest();
  const entries=Array.isArray(manifest?.entries)?manifest.entries:[];
  return entries.find(x=>x?.id===WELCOME_ID&&x?.status==="ready"&&typeof x?.asset==="string"&&x.asset)||null;
}

async function playPackaged(entry,fromGesture){
  if(!entry?.asset||!isWelcome()||speaking)return false;
  const audio=new Audio(entry.asset);
  audio.preload="auto";
  speaking=true;
  const finish=(state,detail="")=>{speaking=false;remember(state,"packaged",detail)};
  audio.addEventListener("playing",()=>remember("speaking","packaged",entry.id),{once:true});
  audio.addEventListener("ended",()=>finish("ended",entry.id),{once:true});
  audio.addEventListener("error",()=>finish("error",entry.id),{once:true});
  try{
    await audio.play();
    return true;
  }catch(error){
    speaking=false;
    remember(fromGesture?"packaged-play-failed":"autoplay-blocked","packaged",error?.name||error?.message||"play-failed");
    return false;
  }
}

async function cachedRecord(){
  const render=window.LibcomlairRenderVoice;
  if(!render?.persistentGet)return null;
  try{
    const saved=await render.persistentGet(CACHE_KEY);
    return saved?.buffer&&saved.buffer.byteLength>500?saved:null;
  }catch(_){return null}
}

async function playCached(fromGesture){
  if(!isWelcome()||speaking)return false;
  const render=window.LibcomlairRenderVoice;
  if(!render?.speak)return false;
  const saved=await cachedRecord();
  if(!saved){remember("local-miss","none","welcome-cache-empty");return false}
  try{
    if(fromGesture&&render.unlockAudio)await render.unlockAudio().catch(()=>false);
    speaking=true;
    await render.speak(CACHE_KEY,{
      requestId:"welcome-local-"+Date.now(),
      onstart:()=>remember("speaking","local-library","welcome-cache"),
      onend:()=>{speaking=false;remember("ended","local-library","welcome-cache")},
      onerror:error=>{speaking=false;remember("error","local-library",error?.message||error||"local-play-error")}
    });
    speaking=false;
    return true;
  }catch(error){
    speaking=false;
    remember(fromGesture?"local-play-failed":"autoplay-blocked","local-library",error?.name||error?.message||"play-failed");
    return false;
  }
}

async function tryLocalOnly(fromGesture=false){
  if(!isWelcome())return false;
  keepNavigationReady();
  const entry=await packagedEntry();
  if(entry&&await playPackaged(entry,fromGesture))return true;
  return playCached(fromGesture);
}

function onFirstGesture(){
  // Important : aucune interception du clic et aucune attente réseau.
  // La navigation reste propriétaire de l'entrée dans l'application.
  tryLocalOnly(true).catch(()=>{});
}

function bind(){
  const b=button();
  if(!b)return false;
  keepNavigationReady();
  if(b.dataset.v224WelcomeLocalFirstBound!=="1"){
    b.dataset.v224WelcomeLocalFirstBound="1";
    b.addEventListener("pointerdown",onFirstGesture,{capture:false,passive:true});
  }
  setTimeout(()=>tryLocalOnly(false).catch(()=>{}),40);
  return true;
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});
else bind();
window.addEventListener("pageshow",bind);

window.LibcomlairWelcomeLocalFirst=Object.freeze({
  version:VERSION,
  welcomeId:WELCOME_ID,
  message:WELCOME_MESSAGE,
  bind,
  tryLocalOnly,
  status:()=>({...last,navigationBlocked:false,networkFallback:false})
});
})();
