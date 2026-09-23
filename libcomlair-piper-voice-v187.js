(function(){
  "use strict";

  const VOICE_ID="fr_FR-siwis-medium";
  const TEST_TEXT="Assistance vocale Libcomlair activée.";
  const SOURCES=[
    {
      name:"esm.sh + jsDelivr",
      library:"https://esm.sh/@mintplex-labs/piper-tts-web@1.0.3?bundle",
      onnxWasm:"https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/",
      piperData:"https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data",
      piperWasm:"https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm"
    },
    {
      name:"jsDelivr ESM + UNPKG",
      library:"https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.3/+esm",
      onnxWasm:"https://unpkg.com/onnxruntime-web@1.18.0/dist/",
      piperData:"https://unpkg.com/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data",
      piperWasm:"https://unpkg.com/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm"
    }
  ];

  let session=null;
  let loading=null;
  let generation=0;
  let audioContext=null;
  let currentSource=null;
  let currentReject=null;
  let unlocked=false;
  let last={state:"idle",error:"",time:0,voice:VOICE_ID,source:""};

  function emit(state,extra){
    last={state,error:"",time:Date.now(),voice:VOICE_ID,source:last.source||"",...(extra||{})};
    try{window.dispatchEvent(new CustomEvent("libcomlair-piper-status",{detail:{...last}}))}catch(_){}
  }

  function capabilities(){
    const AC=window.AudioContext||window.webkitAudioContext;
    return {
      wasm:typeof WebAssembly==="object",
      opfs:!!(navigator.storage&&typeof navigator.storage.getDirectory==="function"),
      webAudio:typeof AC==="function"
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

  function progressMessage(progress){
    if(!progress||typeof progress!=="object")return;
    const total=Number(progress.total||0);
    const loaded=Number(progress.loaded||0);
    if(total>0&&loaded>=0){
      const pct=Math.max(0,Math.min(100,Math.round(loaded*100/total)));
      emit("downloading",{progress:pct,loaded,total});
    }else{
      emit("downloading",{progress:null,loaded,total});
    }
  }

  async function createSession(){
    const caps=capabilities();
    if(!caps.wasm)throw new Error("WebAssembly indisponible.");
    if(!caps.opfs)throw new Error("Stockage vocal local indisponible.");

    const errors=[];
    for(const source of SOURCES){
      try{
        emit("loading",{source:source.name});
        const tts=await import(source.library);
        if(!tts||typeof tts.TtsSession!=="function")throw new Error("TtsSession indisponible.");
        const created=await tts.TtsSession.create({
          voiceId:VOICE_ID,
          progress:progressMessage,
          logger:()=>{},
          wasmPaths:{
            onnxWasm:source.onnxWasm,
            piperData:source.piperData,
            piperWasm:source.piperWasm
          }
        });
        last.source=source.name;
        return created;
      }catch(error){
        errors.push(source.name+" : "+(error&&error.message?error.message:String(error)));
      }
    }
    throw new Error(errors.join(" | ")||"Piper indisponible.");
  }

  function prepare(){
    if(session)return Promise.resolve(true);
    if(loading)return loading;
    loading=(async()=>{
      emit("preparing");
      session=await createSession();
      emit("ready",{source:last.source});
      return true;
    })().catch(error=>{
      session=null;
      emit("error",{error:error&&error.message?error.message:String(error)});
      throw error;
    }).finally(()=>{loading=null});
    return loading;
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
        if(typeof opts.onend==="function")opts.onend({voice:"Piper français — Siwis medium",engine:"piper",mode:"webaudio"});
        resolve({ok:true,voice:"Piper français — Siwis medium",engine:"piper",mode:"webaudio"});
      };

      try{
        source.start(0);
        emit("speaking",{source:last.source,audioState:audioContext.state});
        if(typeof opts.onstart==="function")opts.onstart({voice:"Piper français — Siwis medium",engine:"piper",mode:"webaudio"});
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

    await prepare();
    if(myGen!==generation)throw new Error("Lecture annulée.");

    emit("generating",{chars:clean.length,source:last.source});
    const wav=await session.predict(clean);
    if(myGen!==generation)throw new Error("Lecture annulée.");
    if(!(wav instanceof Blob)||wav.size<1000)throw new Error("Le fichier audio Piper est vide ou invalide.");

    try{
      return await playBlob(wav,opts,myGen);
    }catch(error){
      emit("error",{error:error&&error.message?error.message:String(error),source:last.source});
      if(typeof opts.onerror==="function")opts.onerror(error);
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
      version:"piper-v187",
      voiceId:VOICE_ID,
      ready:!!session,
      loading:!!loading,
      unlocked,
      audioState:audioContext?audioContext.state:"none",
      source:last.source||"",
      capabilities:caps,
      last:{...last}
    };
  }

  async function test(options){
    return speak(TEST_TEXT,options||{});
  }

  window.LibcomlairPiperVoice=Object.freeze({
    version:"piper-v187",
    voiceId:VOICE_ID,
    prepare,
    speak,
    stop,
    test,
    unlockAudio,
    status
  });
})();