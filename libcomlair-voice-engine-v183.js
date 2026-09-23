(function(){
"use strict";

const synth=window.speechSynthesis;
const webAvailable=!!synth&&typeof window.SpeechSynthesisUtterance==="function";
const workerAvailable=typeof Worker==="function"&&typeof WebAssembly==="object";
const available=webAvailable||workerAvailable;

let recognitionActive=false;
let queued=null;
let seq=0;
let active=null;
let activeWorker=null;
let activeAudio=null;
let activeSource=null;
let audioContext=null;
let pendingPlayback=null;

let state="idle";
let activeEngine="none";
let webDisabled=false;
let lastOutcome={ok:null,reason:"not-tested",engine:"none",time:0};
let lastStatus={state:"idle",engine:"none",time:Date.now(),requestId:0,detail:""};
const providerFailures={web:0,piperPrimary:0,piperSecondary:0};

const WEB_START_TIMEOUT=1800;
const WORKER_TIMEOUT=70000;
const GLOBAL_TIMEOUT=100000;

function msg(e){return e&&e.message?String(e.message):String(e||"unknown_error")}
function current(req){return !!req&&!!active&&req.id===active.id}
function clear(req,key){if(req&&req[key]){clearTimeout(req[key]);req[key]=null}}

function updateIndicator(){
  const el=document.getElementById("voiceEngineMode");
  if(!el)return;
  if(state==="listening"){el.textContent="Moteur vocal : microphone actif.";return}
  if(state==="queued"){el.textContent="Moteur vocal : réponse en attente de la fin du microphone.";return}
  if(state==="preparing"){el.textContent="Moteur vocal : préparation de la voix…";return}
  if(state==="speaking"){
    el.textContent=activeEngine==="piper"?"Moteur vocal : voix de secours active.":"Moteur vocal : voix normale active.";
    return;
  }
  if(state==="waiting-gesture"){el.textContent="Moteur vocal : son prêt — touchez l’écran pour lancer la lecture.";return}
  if(lastOutcome.ok===false){
    el.textContent="Moteur vocal : dernière lecture en échec, application débloquée.";
    return;
  }
  if(lastOutcome.ok===true){
    el.textContent=lastOutcome.engine==="piper"?"Moteur vocal : voix de secours validée.":"Moteur vocal : voix normale validée.";
    return;
  }
  el.textContent="Moteur vocal : superviseur prêt.";
}

function emit(next,extra){
  state=next;
  lastStatus={state:next,engine:activeEngine,time:Date.now(),requestId:active?active.id:0,detail:"",...(extra||{})};
  updateIndicator();
  try{window.dispatchEvent(new CustomEvent("libcomlair-voice-status",{detail:{...lastStatus}}))}catch(_){}
}

function detachUtterance(req){
  if(!req||!req.utterance)return;
  try{
    req.utterance.onstart=null;
    req.utterance.onend=null;
    req.utterance.onerror=null;
  }catch(_){}
  req.utterance=null;
}

function stopNative(req){
  detachUtterance(req);
  if(webAvailable){try{synth.cancel()}catch(_){}}
}

function terminateWorker(){
  if(activeWorker){try{activeWorker.terminate()}catch(_){} activeWorker=null}
}

function stopAudio(){
  pendingPlayback=null;
  if(activeSource){
    try{activeSource.stop()}catch(_){}
    try{activeSource.disconnect()}catch(_){}
    activeSource=null;
  }
  if(activeAudio){
    try{activeAudio.pause()}catch(_){}
    try{activeAudio.removeAttribute("src");activeAudio.load()}catch(_){}
    activeAudio=null;
  }
}

function resetRuntime(reason,preserveOutcome){
  const req=active;
  if(req){
    clear(req,"providerTimer");
    clear(req,"globalTimer");
    stopNative(req);
  }else{
    stopNative(null);
  }
  terminateWorker();
  stopAudio();
  active=null;
  activeEngine="none";
  if(!preserveOutcome&&reason)lastOutcome={ok:false,reason:String(reason),engine:"none",time:Date.now()};
  emit(recognitionActive?"listening":"idle",{reason:reason||"reset"});
}

function armAudio(){
  const Ctx=window.AudioContext||window.webkitAudioContext;
  if(!Ctx)return false;
  try{
    if(!audioContext)audioContext=new Ctx();
    if(audioContext.state!=="running"){
      const p=audioContext.resume();
      if(p&&typeof p.then==="function"){
        p.then(()=>{
          if(pendingPlayback&&audioContext&&audioContext.state==="running"){
            const x=pendingPlayback;
            pendingPlayback=null;
            playBuffer(x.buffer,x.req,x.provider).catch(error=>finishFailure(x.req,"audio_playback_failed: "+msg(error),"piper"));
          }
        }).catch(()=>{});
      }
    }
    return true;
  }catch(_){return false}
}
["pointerdown","touchstart","keydown","click"].forEach(t=>document.addEventListener(t,armAudio,{capture:true,passive:true}));

function markStarted(req,engine,provider){
  if(!current(req)||req.started)return;
  req.started=true;
  activeEngine=engine;
  lastOutcome={ok:true,reason:"started",engine,time:Date.now()};
  emit("speaking",{engine,provider});
  if(typeof req.options.onstart==="function"){
    try{req.options.onstart({engine,voice:engine==="piper"?"Voix de secours Piper":"Voix normale",provider})}catch(_){}
  }
}

function finishSuccess(req,engine){
  if(!current(req))return;
  const cb=req.options.onend;
  lastOutcome={ok:true,reason:"ended",engine,time:Date.now()};
  resetRuntime("ended",true);
  updateIndicator();
  if(typeof cb==="function"){try{cb({engine,voice:engine==="piper"?"Voix de secours Piper":"Voix normale"})}catch(_){}}
}

function finishFailure(req,reason,engine){
  if(!current(req))return;
  const cb=req.options.onerror;
  lastOutcome={ok:false,reason:String(reason||"voice_failed"),engine:engine||"none",time:Date.now()};
  resetRuntime(reason,true);
  updateIndicator();
  if(typeof cb==="function"){try{cb({error:String(reason||"voice_failed"),engine:engine||"none"})}catch(_){}}
}

function frenchVoice(){
  if(!webAvailable)return null;
  let voices=[];
  try{voices=synth.getVoices()||[]}catch(_){}
  return voices.find(v=>v.localService===true&&String(v.lang||"").toLowerCase().startsWith("fr"))
    ||voices.find(v=>String(v.lang||"").toLowerCase().startsWith("fr"))
    ||null;
}

function startWeb(req){
  if(!current(req))return;
  if(!webAvailable||webDisabled){startWorker(req,0,"web_unavailable");return}
  emit("preparing",{provider:"web"});
  try{
    const u=new SpeechSynthesisUtterance(req.text);
    req.utterance=u;
    u.lang="fr-FR";
    u.rate=Number.isFinite(req.options.rate)?req.options.rate:0.9;
    u.volume=1;
    const v=frenchVoice();
    if(v){u.voice=v;u.lang=v.lang||"fr-FR"}

    u.onstart=()=>{
      if(!current(req))return;
      clear(req,"providerTimer");
      markStarted(req,"web","web");
    };
    u.onend=()=>{
      if(!current(req)||!req.started)return;
      finishSuccess(req,"web");
    };
    u.onerror=e=>{
      if(!current(req))return;
      clear(req,"providerTimer");
      detachUtterance(req);
      providerFailures.web++;
      webDisabled=true;
      startWorker(req,0,e&&e.error?String(e.error):"speech_error");
    };

    req.providerTimer=setTimeout(()=>{
      if(!current(req)||req.started)return;
      clear(req,"providerTimer");
      providerFailures.web++;
      webDisabled=true;
      detachUtterance(req);
      try{synth.cancel()}catch(_){}
      startWorker(req,0,"web_start_timeout");
    },WEB_START_TIMEOUT);

    synth.speak(u);
  }catch(error){
    providerFailures.web++;
    webDisabled=true;
    startWorker(req,0,msg(error));
  }
}

function startWorker(req,variant,previousReason){
  if(!current(req))return;
  terminateWorker();
  stopAudio();

  if(!workerAvailable){
    finishFailure(req,previousReason||"worker_unavailable","none");
    return;
  }

  const provider=variant===0?"piperPrimary":"piperSecondary";
  emit("preparing",{provider,previousReason:previousReason||""});

  let worker;
  try{
    worker=new Worker("libcomlair-piper-provider-v183.js?v=183",{type:"module"});
  }catch(error){
    providerFailures[provider]++;
    if(variant===0){startWorker(req,1,msg(error));return}
    finishFailure(req,"worker_create_failed: "+msg(error),"piper");
    return;
  }
  activeWorker=worker;

  req.providerTimer=setTimeout(()=>{
    if(!current(req)||worker!==activeWorker)return;
    providerFailures[provider]++;
    terminateWorker();
    if(variant===0){startWorker(req,1,provider+"_timeout");return}
    finishFailure(req,provider+"_timeout","piper");
  },WORKER_TIMEOUT);

  worker.onmessage=e=>{
    if(!current(req)||worker!==activeWorker)return;
    const d=e.data||{};
    if(d.id!==req.id)return;

    if(d.type==="progress"){
      emit("preparing",{provider,progress:d.progress||""});
      return;
    }

    if(d.type==="error"){
      clear(req,"providerTimer");
      providerFailures[provider]++;
      terminateWorker();
      if(variant===0){startWorker(req,1,d.message||provider+"_failed");return}
      finishFailure(req,d.message||provider+"_failed","piper");
      return;
    }

    if(d.type==="audio"&&d.buffer){
      clear(req,"providerTimer");
      terminateWorker();
      playBuffer(d.buffer,req,provider).catch(error=>{
        if(current(req))finishFailure(req,"audio_playback_failed: "+msg(error),"piper");
      });
    }
  };

  worker.onerror=e=>{
    if(!current(req)||worker!==activeWorker)return;
    clear(req,"providerTimer");
    providerFailures[provider]++;
    const reason=e&&e.message?String(e.message):provider+"_worker_error";
    terminateWorker();
    if(variant===0){startWorker(req,1,reason);return}
    finishFailure(req,reason,"piper");
  };

  try{worker.postMessage({type:"synthesize",id:req.id,text:req.text,variant})}
  catch(error){
    clear(req,"providerTimer");
    providerFailures[provider]++;
    terminateWorker();
    if(variant===0){startWorker(req,1,msg(error));return}
    finishFailure(req,msg(error),"piper");
  }
}

async function playBuffer(buffer,req,provider){
  if(!current(req))return;

  armAudio();
  const Ctx=window.AudioContext||window.webkitAudioContext;
  if(Ctx){
    if(!audioContext)audioContext=new Ctx();
    try{if(audioContext.state!=="running")await audioContext.resume()}catch(_){}
    if(audioContext.state==="running"){
      const decoded=await audioContext.decodeAudioData(buffer.slice(0));
      if(!current(req))return;
      return await new Promise((resolve,reject)=>{
        try{
          const source=audioContext.createBufferSource();
          activeSource=source;
          source.buffer=decoded;
          source.connect(audioContext.destination);
          source.onended=()=>{
            if(activeSource===source)activeSource=null;
            if(current(req))finishSuccess(req,"piper");
            resolve();
          };
          markStarted(req,"piper",provider);
          source.start(0);
        }catch(error){reject(error)}
      });
    }
  }

  // If autoplay is blocked, hold the ready audio. A later user gesture resumes AudioContext.
  pendingPlayback={buffer,req,provider};
  emit("waiting-gesture",{provider});
}

function begin(text,options){
  const clean=String(text||"").replace(/\s+/g," ").trim();
  if(!clean||!available)return false;

  if(recognitionActive){
    queued={text:clean,options:options||{}};
    emit("queued",{});
    return true;
  }

  if(active)resetRuntime("superseded",true);

  const req={
    id:++seq,
    text:clean,
    options:options||{},
    started:false,
    providerTimer:null,
    globalTimer:null,
    utterance:null
  };
  active=req;
  activeEngine="none";
  emit("preparing",{requestId:req.id});

  req.globalTimer=setTimeout(()=>{
    if(current(req))finishFailure(req,"global_voice_timeout",activeEngine);
  },GLOBAL_TIMEOUT);

  startWeb(req);
  return true;
}

function speak(text,options){return begin(text,options)}

function cancel(){
  queued=null;
  resetRuntime("cancelled",true);
  updateIndicator();
}

function setRecognitionActive(value){
  recognitionActive=!!value;
  if(recognitionActive){
    if(active)resetRuntime("microphone_started",true);
    emit("listening",{});
    return;
  }
  emit("idle",{reason:"microphone_ended"});
  if(queued){
    const q=queued;
    queued=null;
    setTimeout(()=>begin(q.text,q.options),60);
  }
}

function testDetailed(timeoutMs){
  return new Promise(resolve=>{
    let settled=false;
    const finish=x=>{if(!settled){settled=true;resolve(x)}};
    armAudio();
    const ok=begin("Assistance vocale Libcomlair activée.",{
      rate:0.9,
      onstart:meta=>finish({ok:true,reason:"started",meta,status:status()}),
      onerror:e=>finish({ok:false,reason:e&&e.error?e.error:"voice_failed",meta:e,status:status()})
    });
    if(!ok){finish({ok:false,reason:"speak_returned_false",status:status()});return}
    setTimeout(()=>finish({ok:false,reason:"test_timeout",status:status()}),Number(timeoutMs)||105000);
  });
}

function test(){armAudio();return begin("Assistance vocale Libcomlair activée.",{rate:0.9})}

function status(){
  let voices=[];
  try{voices=webAvailable&&typeof synth.getVoices==="function"?synth.getVoices():[]}catch(_){}
  return {
    available,
    version:"v183",
    state,
    blocked:false,
    activeEngine,
    recognitionActive,
    queued:!!queued,
    webAvailable,
    workerAvailable,
    webDisabled,
    voiceCount:voices.length,
    frenchVoiceCount:voices.filter(v=>String(v.lang||"").toLowerCase().startsWith("fr")).length,
    localFrenchVoiceCount:voices.filter(v=>v.localService===true&&String(v.lang||"").toLowerCase().startsWith("fr")).length,
    providerFailures:{...providerFailures},
    lastOutcome:{...lastOutcome},
    last:{...lastStatus}
  };
}

updateIndicator();
window.LibcomlairVoice={
  version:"v183",
  available,
  speak,
  cancel,
  test,
  testDetailed,
  setRecognitionActive,
  isRecognitionActive:()=>recognitionActive,
  status,
  armAudio,
  reset:()=>resetRuntime("manual_reset",true)
};
})();