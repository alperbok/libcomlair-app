(()=>{
"use strict";

const VERSION="v224-welcome-autoplay-diagnostic-v2-auto-only";
const enabled=new URLSearchParams(location.search).get("voiceDiag")==="1";
let lastEvent=null;

function activation(){
  try{return {isActive:!!navigator.userActivation?.isActive,hasBeenActive:!!navigator.userActivation?.hasBeenActive}}catch(_){return {isActive:false,hasBeenActive:false}}
}

function welcomeStatus(){
  try{return window.LibcomlairWelcomeLocalFirst?.status?.()||window.LibcomlairWelcomeAutoplay?.status?.()||null}catch(_){return null}
}

function render(){
  if(!enabled)return;
  let box=document.getElementById("libcomlairWelcomeVoiceDiag");
  if(!box){
    box=document.createElement("div");
    box.id="libcomlairWelcomeVoiceDiag";
    box.setAttribute("role","status");
    box.style.cssText="position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;background:#fff;color:#111;border:2px solid #111;border-radius:8px;padding:8px;font:12px/1.35 monospace;white-space:pre-wrap;max-height:42vh;overflow:auto";
    document.body.appendChild(box);
  }
  const s=welcomeStatus();
  const a=activation();
  box.textContent=[
    "Diagnostic voix accueil "+VERSION,
    "module="+(s?.version||"absent"),
    "state="+(s?.state||lastEvent?.state||"inconnu"),
    "detail="+(s?.detail||lastEvent?.detail||""),
    "source="+(s?.source||""),
    "speaking="+String(!!s?.speaking),
    "playPending="+String(!!s?.playPending),
    "userActivation.isActive="+String(a.isActive),
    "userActivation.hasBeenActive="+String(a.hasBeenActive),
    "visibility="+document.visibilityState,
    "readyState="+document.readyState
  ].join("\n");
}

window.addEventListener("libcomlair-welcome-audio-status",e=>{lastEvent=e.detail||null;render()});
window.addEventListener("pageshow",()=>setTimeout(render,100));
document.addEventListener("visibilitychange",render);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{render();setTimeout(render,500);setTimeout(render,2500);setTimeout(render,6000)},{once:true});
else{render();setTimeout(render,500);setTimeout(render,2500);setTimeout(render,6000)}

window.LibcomlairWelcomeAutoplayDiagnostic=Object.freeze({version:VERSION,enabled,status:()=>({activation:activation(),welcome:welcomeStatus(),lastEvent})});
})();