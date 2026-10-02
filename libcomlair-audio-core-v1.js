(()=>{
"use strict";

const VERSION="v1-libcomlair-owned-audio";
const MESSAGES=Object.freeze({
  "welcome.main":Object.freeze({
    id:"welcome.main",
    asset:"voice-tests/fr-FR/vera-welcome.wav",
    voice:"vera",
    critical:true,
    text:"Bienvenue dans Libcomlair. Ensemble, rendons les lieux accessibles plus faciles à trouver pour tous. Appuyez sur Suivant pour commencer."
  })
});

let last={time:0,id:"",state:"idle",source:"libcomlair",detail:""};
let browserAudio=null;

function emit(id,state,source="libcomlair",detail=""){
  last={time:Date.now(),id:String(id||""),state:String(state||""),source:String(source||""),detail:String(detail||"")};
  try{window.dispatchEvent(new CustomEvent("libcomlair-audio-status",{detail:{...last}}))}catch(_){}
  return {...last};
}

function message(id){
  const item=MESSAGES[String(id||"")];
  return item?{...item}:null;
}

function support(){
  const adapter=window.LibcomlairSupportAudio;
  if(adapter&&typeof adapter.playFixed==="function")return adapter;
  return null;
}

function stopBrowserAudio(){
  const a=browserAudio;
  browserAudio=null;
  if(!a)return;
  try{a.pause()}catch(_){}
  try{a.src=""}catch(_){}
}

async function playInBrowser(item,reason){
  stopBrowserAudio();
  const a=new Audio(item.asset);
  browserAudio=a;
  a.preload="auto";
  a.autoplay=false;
  a.muted=false;
  a.volume=1;
  return await new Promise(resolve=>{
    let settled=false;
    const finish=result=>{if(settled)return;settled=true;resolve(result)};
    a.addEventListener("playing",()=>emit(item.id,"speaking","browser",reason||""),{once:true});
    a.addEventListener("ended",()=>{emit(item.id,"ended","browser","");stopBrowserAudio();finish({ok:true,source:"browser"})},{once:true});
    a.addEventListener("error",()=>{const detail=String(a.error?.message||a.error?.code||"audio-error");emit(item.id,"error","browser",detail);stopBrowserAudio();finish({ok:false,source:"browser",reason:detail})},{once:true});
    try{
      const p=a.play();
      if(p&&typeof p.catch==="function")p.catch(error=>{
        const detail=String(error?.name||error?.message||"play-rejected");
        emit(item.id,"blocked-by-support","browser",detail);
        stopBrowserAudio();
        finish({ok:false,source:"browser",reason:detail,blocked:true});
      });
    }catch(error){
      const detail=String(error?.name||error?.message||"play-failed");
      emit(item.id,"blocked-by-support","browser",detail);
      stopBrowserAudio();
      finish({ok:false,source:"browser",reason:detail,blocked:true});
    }
  });
}

async function playFixed(id,options={}){
  const item=MESSAGES[String(id||"")];
  if(!item){
    emit(id,"missing-message","libcomlair","");
    return {ok:false,reason:"unknown-message"};
  }

  const reason=String(options.reason||"");
  emit(item.id,"requested","libcomlair",reason);

  const adapter=support();
  if(adapter){
    try{
      const accepted=adapter.playFixed(item.id);
      emit(item.id,"delegated","support",String(accepted??"accepted"));
      return {ok:true,source:"support",accepted};
    }catch(error){
      const detail=String(error?.message||error||"support-error");
      emit(item.id,"support-error","support",detail);
    }
  }

  return playInBrowser(item,reason);
}

function supportEvent(id,state,detail=""){
  return emit(id,state,"support",detail);
}

function status(){
  return {
    version:VERSION,
    ...last,
    supportAvailable:!!support(),
    browserFallback:true,
    messages:Object.keys(MESSAGES)
  };
}

window.LibcomlairAudioCore=Object.freeze({
  version:VERSION,
  message,
  messages:()=>Object.keys(MESSAGES).map(message),
  playFixed,
  supportEvent,
  status
});
})();
