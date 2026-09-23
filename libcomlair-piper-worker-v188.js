const VOICE_ID="fr_FR-siwis-medium";

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
let sessionSource="";
let preparing=null;

function post(type,extra){
  self.postMessage({type,...(extra||{})});
}

function progressMessage(progress){
  if(!progress||typeof progress!=="object")return;
  const total=Number(progress.total||0);
  const loaded=Number(progress.loaded||0);
  if(total>0&&loaded>=0){
    const pct=Math.max(0,Math.min(100,Math.round(loaded*100/total)));
    post("progress",{progress:pct,loaded,total});
  }else{
    post("progress",{progress:null,loaded,total});
  }
}

async function buildSession(){
  const errors=[];
  for(const source of SOURCES){
    try{
      post("loading",{source:source.name});
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
      sessionSource=source.name;
      return created;
    }catch(error){
      errors.push(source.name+" : "+(error&&error.message?error.message:String(error)));
    }
  }
  throw new Error(errors.join(" | ")||"Piper indisponible.");
}

async function prepare(){
  if(session)return true;
  if(preparing)return preparing;
  preparing=(async()=>{
    post("preparing");
    session=await buildSession();
    post("ready",{source:sessionSource});
    return true;
  })().catch(error=>{
    session=null;
    post("error",{message:error&&error.message?error.message:String(error)});
    throw error;
  }).finally(()=>{preparing=null});
  return preparing;
}

self.addEventListener("message",async event=>{
  const data=event.data||{};
  if(data.type==="prepare"){
    try{
      await prepare();
      post("prepared",{requestId:data.requestId||0,source:sessionSource});
    }catch(error){
      post("error",{requestId:data.requestId||0,message:error&&error.message?error.message:String(error)});
    }
    return;
  }

  if(data.type!=="predict")return;

  const requestId=data.requestId||0;
  const text=String(data.text||"").replace(/\s+/g," ").trim();
  if(!text){
    post("error",{requestId,message:"Texte vocal vide."});
    return;
  }

  try{
    await prepare();
    post("generating",{requestId,chars:text.length,source:sessionSource});
    const wav=await session.predict(text);
    if(!(wav instanceof Blob)||wav.size<1000)throw new Error("Le fichier audio Piper est vide ou invalide.");
    post("result",{requestId,audio:wav,source:sessionSource});
  }catch(error){
    post("error",{requestId,message:error&&error.message?error.message:String(error)});
  }
});
