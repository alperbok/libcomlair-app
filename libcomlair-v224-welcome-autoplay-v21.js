(()=>{
"use strict";

const VERSION="v224-21-direct-autoplay";
const AUDIO_ID="libcomlairWelcomeAutoplay";
const WELCOME_ID="welcome.main";
let last={time:0,state:"idle",detail:""};
let started=false;

function remember(state,detail=""){
  last={time:Date.now(),state:String(state||""),detail:String(detail||"")};
  try{window.dispatchEvent(new CustomEvent("libcomlair-welcome-audio-status",{detail:{...last}}))}catch(_){}
}

function audio(){return document.getElementById(AUDIO_ID)}
function splash(){return document.getElementById("libcomlairSplash")}
function visible(el){
  if(!el||el.hidden||el.hasAttribute?.("hidden")||el.getAttribute?.("aria-hidden")==="true")return false;
  try{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0}catch(_){return false}
}
function isWelcome(){return visible(splash())}

function bindAudio(){
  const a=audio();
  if(!a||a.dataset.libcomlairAutoplayBound==="1")return !!a;
  a.dataset.libcomlairAutoplayBound="1";
  a.autoplay=true;
  a.preload="auto";
  a.muted=false;
  a.volume=1;
  a.addEventListener("loadstart",()=>remember("loading",WELCOME_ID));
  a.addEventListener("canplay",()=>remember("canplay",WELCOME_ID));
  a.addEventListener("playing",()=>{started=true;remember("speaking",WELCOME_ID)});
  a.addEventListener("ended",()=>remember("ended",WELCOME_ID));
  a.addEventListener("error",()=>remember("error",a.error?.message||a.error?.code||"audio-error"));
  return true;
}

function tryAutoplay(reason="load"){
  bindAudio();
  const a=audio();
  if(!a||!isWelcome()||started)return false;
  a.autoplay=true;
  a.muted=false;
  a.volume=1;
  remember("autoplay-attempt",reason);
  try{
    const p=a.play();
    if(p&&typeof p.then==="function"){
      p.then(()=>remember("autoplay-started",reason)).catch(error=>{
        remember("autoplay-blocked",error?.name||error?.message||"play-rejected");
      });
    }
    return true;
  }catch(error){
    remember("autoplay-blocked",error?.name||error?.message||"play-failed");
    return false;
  }
}

function bind(){
  bindAudio();
  // Tentatives automatiques uniquement : aucun toucher n'est nécessaire ni utilisé ici.
  tryAutoplay("bind");
  queueMicrotask(()=>tryAutoplay("microtask"));
  requestAnimationFrame(()=>tryAutoplay("animation-frame"));
  setTimeout(()=>tryAutoplay("timer-50"),50);
  setTimeout(()=>tryAutoplay("timer-250"),250);
  setTimeout(()=>tryAutoplay("timer-800"),800);
  return true;
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});
else bind();
window.addEventListener("pageshow",()=>tryAutoplay("pageshow"));
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")tryAutoplay("visible")});

window.LibcomlairWelcomeAutoplay=Object.freeze({
  version:VERSION,
  bind,
  tryAutoplay,
  status:()=>({...last,started,audioPresent:!!audio(),welcomeVisible:isWelcome(),touchRequired:false})
});
})();
