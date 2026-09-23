(() => {
"use strict";

const MODEL_BASE="https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/low/fr_FR-siwis-low.onnx";
const PHONEMIZER_JS="https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.js";
const PHONEMIZER_BASE="https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize";
const ORT_MODULE="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/esm/ort.min.js";
const ORT_WASM_BASE="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/";
const TEST_TEXT="Bonjour. Assistance vocale Libcomlair activée.";

const prepare=document.getElementById("prepareVoice");
const listen=document.getElementById("listenVoice");
const status=document.getElementById("status");
const details=document.getElementById("details");
const audio=document.getElementById("audio");
let audioUrl="";
let phonemizerFactory=null;

function sayStatus(text){ if(status)status.textContent=text; }

function loadScript(src){
  return new Promise((resolve,reject)=>{
    const existing=[...document.scripts].find(s=>s.src===src);
    if(existing&&window.createPiperPhonemize){resolve();return}
    const s=document.createElement("script");
    s.src=src;
    s.async=true;
    s.onload=resolve;
    s.onerror=()=>reject(new Error("Impossible de charger "+src));
    document.head.appendChild(s);
  });
}

async function getPhonemizer(){
  if(phonemizerFactory)return phonemizerFactory;
  await loadScript(PHONEMIZER_JS);
  if(typeof window.createPiperPhonemize!=="function")throw new Error("Le phonémiseur Piper n’est pas disponible.");
  phonemizerFactory=window.createPiperPhonemize;
  return phonemizerFactory;
}

async function phonemize(text,voice){
  const factory=await getPhonemizer();
  return new Promise(async(resolve,reject)=>{
    let done=false;
    try{
      const mod=await factory({
        print:data=>{
          if(done)return;
          try{
            const parsed=JSON.parse(String(data||""));
            if(Array.isArray(parsed.phonemes)){
              done=true;
              resolve(parsed.phonemes);
            }
          }catch(_){}
        },
        printErr:msg=>{
          const m=String(msg||"");
          if(!done&&/error|abort|exception/i.test(m)){done=true;reject(new Error(m))}
        },
        locateFile:url=>{
          if(url.endsWith(".wasm"))return PHONEMIZER_BASE+".wasm";
          if(url.endsWith(".data"))return PHONEMIZER_BASE+".data";
          return url;
        }
      });
      mod.callMain(["-l",voice||"fr","--input",JSON.stringify([{text:String(text||"").trim()}]),"--espeak_data","/espeak-ng-data"]);
      setTimeout(()=>{if(!done){done=true;reject(new Error("Le phonémiseur n’a renvoyé aucun phonème."))}},6000);
    }catch(e){
      if(!done){done=true;reject(e)}
    }
  });
}

function applyPhonemeMap(chars,phonemeMap){
  if(!phonemeMap||typeof phonemeMap!=="object")return chars;
  const out=[];
  for(const ch of chars){
    const mapped=phonemeMap[ch];
    if(Array.isArray(mapped)&&mapped.length){
      for(const m of mapped)out.push(String(m));
    }else out.push(ch);
  }
  return out;
}

function phonemesToModelIds(sentences,config){
  const idMap=config.phoneme_id_map||{};
  const phonemeMap=config.phoneme_map||{};
  const pad=idMap["_"]||[0], bos=idMap["^"]||[1], eos=idMap["$"]||[2];
  const ids=[...bos,...pad];
  const missing=new Set();

  for(const sentence of sentences){
    const raw=[];
    for(const part of Array.isArray(sentence)?sentence:[sentence]){
      for(const ch of Array.from(String(part||"")))raw.push(ch);
    }
    const chars=applyPhonemeMap(raw,phonemeMap);
    for(const ch of chars){
      const mapped=idMap[ch];
      if(!Array.isArray(mapped)||!mapped.length){missing.add(ch);continue}
      ids.push(...mapped,...pad);
    }
  }
  ids.push(...eos);
  return {ids,missing:[...missing]};
}

async function fetchWithProgress(url,label){
  const r=await fetch(url,{cache:"force-cache"});
  if(!r.ok)throw new Error(label+" HTTP "+r.status);
  if(!r.body)return await r.arrayBuffer();
  const total=Number(r.headers.get("content-length")||0);
  const reader=r.body.getReader(),chunks=[];
  let loaded=0;
  while(true){
    const {done,value}=await reader.read();
    if(done)break;
    chunks.push(value);loaded+=value.byteLength;
    if(total>0)sayStatus(label+" : "+Math.round(loaded*100/total)+" %");
    else sayStatus(label+" : "+Math.round(loaded/1024/1024)+" Mo");
  }
  const out=new Uint8Array(loaded);
  let off=0; for(const c of chunks){out.set(c,off);off+=c.length}
  return out.buffer;
}

function pcmToWav(pcm,sampleRate){
  const samples=pcm instanceof Float32Array?pcm:Float32Array.from(pcm);
  const buffer=new ArrayBuffer(44+samples.length*2);
  const view=new DataView(buffer);
  const write=(o,s)=>{for(let i=0;i<s.length;i++)view.setUint8(o+i,s.charCodeAt(i))};
  write(0,"RIFF");view.setUint32(4,36+samples.length*2,true);write(8,"WAVE");
  write(12,"fmt ");view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
  view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
  write(36,"data");view.setUint32(40,samples.length*2,true);
  let o=44;
  for(let i=0;i<samples.length;i++,o+=2){
    const s=Math.max(-1,Math.min(1,samples[i]));
    view.setInt16(o,s<0?s*0x8000:s*0x7fff,true);
  }
  return new Blob([buffer],{type:"audio/wav"});
}

async function buildAudio(){
  prepare.disabled=true;listen.hidden=true;
  try{
    sayStatus("Chargement de la configuration de la voix française…");
    const configResponse=await fetch(MODEL_BASE+".json",{cache:"force-cache"});
    if(!configResponse.ok)throw new Error("Configuration voix HTTP "+configResponse.status);
    const config=await configResponse.json();

    sayStatus("Conversion du texte en phonèmes…");
    const phonemeSentences=await phonemize(TEST_TEXT,(config.espeak&&config.espeak.voice)||"fr");
    const mapped=phonemesToModelIds(phonemeSentences,config);
    if(mapped.ids.length<4)throw new Error("Aucun phonème compatible avec le modèle.");
    if(details){
      details.textContent="Identifiants compatibles : "+mapped.ids.length+
        " • phonèmes ignorés car absents du modèle : "+(mapped.missing.length?mapped.missing.join(" "):"aucun");
    }

    sayStatus("Chargement du moteur ONNX en mode WebAssembly simple…");
    const ort=await import(ORT_MODULE);
    ort.env.wasm.numThreads=1;
    ort.env.wasm.proxy=false;
    ort.env.wasm.wasmPaths=ORT_WASM_BASE;

    const model=await fetchWithProgress(MODEL_BASE,"Téléchargement du modèle français");
    sayStatus("Création du moteur vocal…");
    const session=await ort.InferenceSession.create(model,{executionProviders:["wasm"]});

    const ids=BigInt64Array.from(mapped.ids.map(x=>BigInt(x)));
    const len=BigInt64Array.from([BigInt(mapped.ids.length)]);
    const inf=config.inference||{};
    const feeds={
      input:new ort.Tensor("int64",ids,[1,mapped.ids.length]),
      input_lengths:new ort.Tensor("int64",len,[1]),
      scales:new ort.Tensor("float32",Float32Array.from([
        Number(inf.noise_scale??0.667),
        Number(inf.length_scale??1),
        Number(inf.noise_w??0.8)
      ]),[3])
    };
    if(config.speaker_id_map&&Object.keys(config.speaker_id_map).length){
      feeds.sid=new ort.Tensor("int64",BigInt64Array.from([0n]),[1]);
    }

    sayStatus("Génération de la voix…");
    const outputs=await session.run(feeds);
    const first=outputs.output||outputs[Object.keys(outputs)[0]];
    if(!first||!first.data)throw new Error("Le modèle n’a produit aucun son.");
    const wav=pcmToWav(first.data,Number(config.audio&&config.audio.sample_rate)||16000);
    if(audioUrl)URL.revokeObjectURL(audioUrl);
    audioUrl=URL.createObjectURL(wav);
    audio.src=audioUrl;audio.load();
    listen.hidden=false;
    sayStatus("✓ Voix générée. Appuyez sur « Écouter le test ».");
  }catch(e){
    prepare.disabled=false;
    const message=e&&e.message?e.message:String(e||"Erreur inconnue");
    sayStatus("⚠ Échec du test compatible : "+message);
  }
}

function playAudio(){
  if(!audioUrl){sayStatus("La voix n’est pas encore générée.");return}
  audio.pause();audio.currentTime=0;
  const p=audio.play();
  if(p&&typeof p.catch==="function")p.catch(e=>{
    sayStatus("⚠ Le son a été généré mais la lecture a échoué : "+(e&&e.message?e.message:String(e)));
    audio.hidden=false;
  });
}

prepare.addEventListener("click",buildAudio);
listen.addEventListener("click",playAudio);
audio.addEventListener("play",()=>sayStatus("▶ Lecture du fichier audio généré."));
audio.addEventListener("ended",()=>sayStatus("✓ Test terminé. Si vous avez entendu la phrase, le moteur compatible fonctionne."));
})();