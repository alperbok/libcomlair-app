(()=>{
"use strict";

const VERSION="v1-libcomlair-welcome-owner";
const MESSAGE_ID="welcome.main";
let requested=false;
let last={time:0,state:"idle",detail:""};

function remember(state,detail=""){
  last={time:Date.now(),state:String(state||""),detail:String(detail||"")};
  try{window.dispatchEvent(new CustomEvent("libcomlair-welcome-status",{detail:{...last,messageId:MESSAGE_ID}}))}catch(_){}
}

function splash(){return document.getElementById("libcomlairSplash")}
function visible(el){
  if(!el||el.hidden||el.hasAttribute?.("hidden")||el.getAttribute?.("aria-hidden")==="true")return false;
  try{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0}catch(_){return false}
}
function welcomeVisible(){return visible(splash())}

async function requestWelcome(reason="welcome"){
  if(requested||!welcomeVisible())return false;
  const core=window.LibcomlairAudioCore;
  if(!core||typeof core.playFixed!=="function"){
    remember("waiting-audio-core",reason);
    return false;
  }

  requested=true;
  remember("requested",reason);
  try{
    const result=await core.playFixed(MESSAGE_ID,{reason});
    if(result?.ok){
      remember("accepted",String(result.source||"libcomlair"));
      return true;
    }
    requested=false;
    remember(result?.blocked?"blocked-by-support":"failed",String(result?.reason||"unknown"));
    return false;
  }catch(error){
    requested=false;
    remember("error",String(error?.message||error||"unknown"));
    return false;
  }
}

function check(reason){
  if(requested)return;
  requestWelcome(reason);
}

function bind(){
  check("bind");
  queueMicrotask(()=>check("microtask"));
  requestAnimationFrame(()=>check("animation-frame"));
  [50,150,300,600,1000,1600].forEach(ms=>setTimeout(()=>check("timer-"+ms),ms));

  const observer=new MutationObserver(()=>check("mutation"));
  try{observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["hidden","aria-hidden","style","class"]})}catch(_){}
  setTimeout(()=>{try{observer.disconnect()}catch(_){}},5000);
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});
else bind();
window.addEventListener("pageshow",()=>check("pageshow"));
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")check("visible")});

window.LibcomlairWelcomeController=Object.freeze({
  version:VERSION,
  request:requestWelcome,
  reset:()=>{requested=false;remember("reset","")},
  status:()=>({...last,requested,welcomeVisible:welcomeVisible(),messageId:MESSAGE_ID})
});
})();
