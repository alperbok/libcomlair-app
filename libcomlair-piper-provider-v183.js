const CONFIGS=[
  {
    library:"https://esm.sh/@mintplex-labs/piper-tts-web@1.0.3?bundle",
    runtime:{
      name:"jsDelivr",
      onnxWasm:"https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/",
      piperData:"https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data",
      piperWasm:"https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm"
    }
  },
  {
    library:"https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.3/+esm",
    runtime:{
      name:"UNPKG",
      onnxWasm:"https://unpkg.com/onnxruntime-web@1.18.0/dist/",
      piperData:"https://unpkg.com/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data",
      piperWasm:"https://unpkg.com/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm"
    }
  }
];
const VOICE_ID="fr_FR-siwis-low";
const message=e=>e&&e.message?String(e.message):String(e||"unknown_error");

self.addEventListener("message",async event=>{
  const d=event.data||{};
  if(d.type!=="synthesize")return;
  const id=d.id;
  const cfg=CONFIGS[d.variant===1?1:0];

  try{
    self.postMessage({type:"progress",id,progress:"loading-library",provider:cfg.runtime.name});
    const tts=await import(cfg.library);
    if(!tts||typeof tts.TtsSession!=="function")throw new Error("TtsSession unavailable");

    // This worker is disposable: one failed ONNX/WASM context is never reused.
    if("_instance" in tts.TtsSession)tts.TtsSession._instance=null;

    self.postMessage({type:"progress",id,progress:"loading-model",provider:cfg.runtime.name});
    const session=await tts.TtsSession.create({
      voiceId:VOICE_ID,
      progress:()=>{},
      logger:()=>{},
      wasmPaths:{
        onnxWasm:cfg.runtime.onnxWasm,
        piperData:cfg.runtime.piperData,
        piperWasm:cfg.runtime.piperWasm
      }
    });

    self.postMessage({type:"progress",id,progress:"synthesizing",provider:cfg.runtime.name});
    const wav=await session.predict(String(d.text||"").trim());
    if(!(wav instanceof Blob)||wav.size<1000)throw new Error("invalid_audio_blob");

    const buffer=await wav.arrayBuffer();
    self.postMessage({type:"audio",id,provider:cfg.runtime.name,buffer},[buffer]);
  }catch(error){
    self.postMessage({type:"error",id,provider:cfg.runtime.name,message:message(error)});
  }
});