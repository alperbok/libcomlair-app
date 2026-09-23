(function(){
  "use strict";

  const TEST_TEXT="Assistance vocale Libcomlair activée.";
  const WORKER_URL="libcomlair-piper-worker-v188.js?v=188";

  let worker=null;
  let workerReady=false;
  let workerFailed=false;
  let requestSeq=0;
  const pending=new Map();

  let audioContext=null;
  let currentSource=null;
  let currentReject=null;
  let generation=0;
  let unlocked=false;
  let last={state:"idle",error:"",time:0,voice:"fr_FR-siwis-medium",source:""};

  function emit(state,extra){
    last={state,error:"",time:Date.now(),voice:"fr_FR-siwis-medium",source:last.source||"",...(extra||{})};
    try{window.dispatchEvent(new CustomEvent("libcomlair-piper-status",{detail:{...last}}))}catch(_){}
  }

  function capabilities(){
    const AC=window.AudioContext||window.webkitAudioContext;
    return {
      wasm:typeof WebAssembly==="object",
      opfs:!!(navigator.storage&&typeof navigator.storage.getDirectory==="function"),
      webAudio:typeof AC==="function",
      worker:typeof Worker==="function"
    };
  }

  async function unlockAudio(){
    const AC=window.AudioContext||window.webkitAudioContext;
    if(typeof AC!=="function")throw new Error("Web Audio indisponible.");
    if(!audioContext)audioContext=new AC();
    try{
      if(audioContext.state!=="running")await audioContext.resume();
    }catch(_){}
    unlocked=audioContext.state==="running";
    emit(unlocked?"audio-ready":"audio-locked",{audioState:audioContext.state});
    return unlocked;
  }

  function gestureUnlock(){
    unlockAudio().then(ok=>{
      if(ok){
        ["pointerdown","touchstart","keydown","click"].forEach(type=>document.removeEventListener(type,gestureUnlock,true));
      }
    }).catch(()=>{});
  }
  ["pointerdown","touchstart","keydown","click"].forEach(type=>document.addEventListener(type,gestureUnlock,true));

  function ensureWorker(){
    if(worker)return worker;
    if(workerFailed)throw new Error("Worker Piper indisponible.");

    try{
      worker=new Worker(WORKER_URL,{type:"module"});
    }catch(error){
      workerFailed=true;
      throw error;
    }

    worker.addEventListener("message",event=>{
      const data=event.data||{};
      if(data.source)last.source=data.source;

      if(data.type==="loading"){
        emit("loading",{source:data.source||""});
        return;
      }
      if(data.type==="preparing"){
        emit("preparing");
        return;
      }
      if(data.type==="progress"){
        emit("downloading",{progress:data.progress,loaded:data.loaded,total:data.total});
        return;
      }
      if(data.type==="ready"||data.type==="prepared"){
        workerReady=true;
        emit("ready",{source:data.source||last.source});
      }
      if(data.type==="generating"){
        emit("generating",{chars:data.chars||0,source:data.source||last.source});
        return;
      }

      const requestId=Number(data.requestId||0);
      if(!requestId)return;
      const item=pending.get(requestId);
      if(!item)return;

      if(data.type==="result"){
        pending.delete(requestId);
        item.resolve(data.audio);
      }else if(data.type==="error"){
        pending.delete(requestId);
        item.reject(new Error(String(data.message||"Erreur Piper.")));
      }
    });

    worker.addEventListener("error",event=>{
      workerFailed=true;
      const message=event&&event.message?event.message:"Le Worker Piper a échoué.";
      emit("error",{error:message});
      for(const item of pending.values())item.reject(new Error(message));
      pending.clear();
      try{worker.terminate()}catch(_){}
      worker=null;
    });

    return worker;
  }

  function askWorker(type,payload){
    const w=ensureWorker();
    const requestId=++requestSeq;
    return new Promise((resolve,reject)=>{
      pending.set(requestId,{resolve,reject});
      try{
        w.postMessage({type,requestId,...(payload||{})});
      }catch(error){
        pending.delete(requestId);
        reject(error);
      }
    });
  }

  async function prepare(){
    if(workerReady)return true;
    await askWorker("prepare");
    workerReady=true;
    return true;
  }

  function stopSource(){
    if(currentSource){
      try{currentSource.onended=null;currentSource.stop(0)}catch(_){}
      try{currentSource.disconnect()}catch(_){}
      currentSource=null;
    }
  }

  async function playBlob(wav,opts,myGen){
    if(!audioContext||audioContext.state!=="running"){
      const ok=await unlockAudio();
      if(!ok)throw new Error("Audio Android verrouillé. Appuyez une fois sur l’écran puis réessayez.");
    }
    if(myGen!==generation)throw new Error("Lecture annulée.");

    const bytes=await wav.arrayBuffer();
    const decoded=await audioContext.decodeAudioData(bytes.slice(0));
    if(myGen!==generation)throw new Error("Lecture annulée.");

    stopSource();
    const source=audioContext.createBufferSource();
    currentSource=source;
    source.buffer=decoded;
    source.connect(audioContext.destination);

    return await new Promise((resolve,reject)=>{
      let settled=false;
      currentReject=reason=>{
        if(settled)return;
        settled=true;
        reject(reason instanceof Error?reason:new Error(String(reason||"Lecture annulée.")));
      };

      source.onended=()=>{
        if(settled)return;
        settled=true;
        currentReject=null;
        if(currentSource===source)currentSource=null;
        try{source.disconnect()}catch(_){}
        if(myGen!==generation)return resolve({ok:false,cancelled:true});
        emit("ended",{source:last.source});
        if(typeof opts.onend==="function")opts.onend({voice:"Piper français — Siwis medium",engine:"piper",mode:"worker-webaudio"});
        resolve({ok:true,voice:"Piper français — Siwis medium",engine:"piper",mode:"worker-webaudio"});
      };

      try{
        source.start(0);
        emit("speaking",{source:last.source,audioState:audioContext.state});
        if(typeof opts.onstart==="function")opts.onstart({voice:"Piper français — Siwis medium",engine:"piper",mode:"worker-webaudio"});
      }catch(error){
        settled=true;
        currentReject=null;
        if(currentSource===source)currentSource=null;
        try{source.disconnect()}catch(_){}
        reject(error);
      }
    });
  }

  async function speak(text,options){
    const clean=String(text||"").replace(/\s+/g," ").trim();
    if(!clean)throw new Error("Texte vocal vide.");
    const opts=options||{};
    const myGen=++generation;

    try{
      const wav=await askWorker("predict",{text:clean});
      if(myGen!==generation)throw new Error("Lecture annulée.");
      if(!(wav instanceof Blob)||wav.size<1000)throw new Error("Le fichier audio Piper est vide ou invalide.");
      return await playBlob(wav,opts,myGen);
    }catch(error){
      if(myGen===generation){
        emit("error",{error:error&&error.message?error.message:String(error),source:last.source});
        if(typeof opts.onerror==="function")opts.onerror(error);
      }
      throw error;
    }
  }

  function stop(){
    generation++;
    const reject=currentReject;
    currentReject=null;
    stopSource();
    emit("stopped");
    if(reject)reject(new Error("Lecture annulée."));
  }

  function status(){
    const caps=capabilities();
    return {
      version:"piper-v188",
      voiceId:"fr_FR-siwis-medium",
      ready:workerReady,
      loading:pending.size>0&&!workerReady,
      unlocked,
      audioState:audioContext?audioContext.state:"none",
      workerActive:!!worker,
      workerFailed,
      source:last.source||"",
      capabilities:caps,
      last:{...last}
    };
  }

  async function test(options){
    return speak(TEST_TEXT,options||{});
  }

  window.LibcomlairPiperVoice=Object.freeze({
    version:"piper-v188",
    voiceId:"fr_FR-siwis-medium",
    prepare,
    speak,
    stop,
    test,
    unlockAudio,
    status
  });
})();