(function(){
  "use strict";
  const synth=window.speechSynthesis;
  const hasTts=!!synth&&typeof window.SpeechSynthesisUtterance==="function";
  let generation=0;
  let currentUtterance=null;
  let recognitionActive=false;
  let pendingText="";
  let voices=[];

  function refreshVoices(){
    try{voices=hasTts&&typeof synth.getVoices==="function"?synth.getVoices():[]}catch(_){voices=[]}
  }
  refreshVoices();
  if(hasTts&&"onvoiceschanged" in synth){
    try{synth.addEventListener("voiceschanged",refreshVoices)}catch(_){}
  }

  function emit(state,detail){
    try{window.dispatchEvent(new CustomEvent("libcomlair-voice-status",{detail:{state,...(detail||{})}}))}catch(_){}
  }

  function frenchVoice(){
    refreshVoices();
    return voices.find(v=>String(v.lang||"").toLowerCase()==="fr-fr")
      ||voices.find(v=>String(v.lang||"").toLowerCase().startsWith("fr"))
      ||null;
  }

  function splitText(text){
    const clean=String(text||"").replace(/\s+/g," ").trim();
    if(!clean)return [];
    const sentences=clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[clean];
    const chunks=[];
    let current="";
    sentences.forEach(sentence=>{
      const s=sentence.trim();
      if(!s)return;
      if((current+" "+s).trim().length<=220){
        current=(current+" "+s).trim();
      }else{
        if(current)chunks.push(current);
        if(s.length<=220){current=s;return}
        const words=s.split(" ");
        current="";
        words.forEach(word=>{
          if((current+" "+word).trim().length>220){
            if(current)chunks.push(current);
            current=word;
          }else current=(current+" "+word).trim();
        });
      }
    });
    if(current)chunks.push(current);
    return chunks;
  }

  function cancel(){
    generation++;
    pendingText="";
    currentUtterance=null;
    if(!hasTts)return;
    try{synth.cancel()}catch(_){}
    try{if(typeof synth.resume==="function")synth.resume()}catch(_){}
    emit("cancelled");
  }

  function speakNow(text,options){
    if(!hasTts)return false;
    const chunks=splitText(text);
    if(!chunks.length)return false;
    const myGeneration=++generation;
    const opts=options||{};
    try{synth.cancel()}catch(_){}
    try{if(typeof synth.resume==="function")synth.resume()}catch(_){}
    let index=0;
    let started=false;

    function next(){
      if(myGeneration!==generation)return;
      if(index>=chunks.length){
        currentUtterance=null;
        emit("ended");
        if(typeof opts.onend==="function")opts.onend();
        return;
      }
      const u=new SpeechSynthesisUtterance(chunks[index++]);
      currentUtterance=u;
      window.__libcomlairVoiceUtterance=u;
      u.lang="fr-FR";
      u.rate=Number.isFinite(opts.rate)?opts.rate:0.9;
      const voice=frenchVoice();
      if(voice)u.voice=voice;
      u.onstart=()=>{
        if(!started){
          started=true;
          emit("started");
          if(typeof opts.onstart==="function")opts.onstart();
        }
      };
      u.onend=()=>setTimeout(next,45);
      u.onerror=e=>{
        currentUtterance=null;
        emit("error",{error:e&&e.error?e.error:"speech_error"});
        if(typeof opts.onerror==="function")opts.onerror(e);
      };
      setTimeout(()=>{
        if(myGeneration!==generation)return;
        try{
          if(typeof synth.resume==="function")synth.resume();
          synth.speak(u);
          setTimeout(()=>{try{if(synth.paused&&typeof synth.resume==="function")synth.resume()}catch(_){}},120);
        }catch(e){
          u.onerror&&u.onerror(e);
        }
      },index===1?120:0);
    }
    next();
    return true;
  }

  function speak(text,options){
    const clean=String(text||"").trim();
    if(!clean)return false;
    if(recognitionActive){
      pendingText=clean;
      emit("queued");
      return true;
    }
    return speakNow(clean,options);
  }

  function setRecognitionActive(active){
    recognitionActive=!!active;
    if(recognitionActive){
      try{synth&&synth.cancel()}catch(_){}
      emit("listening");
      return;
    }
    emit("idle");
    if(pendingText){
      const text=pendingText;
      pendingText="";
      setTimeout(()=>speakNow(text),280);
    }
  }

  function test(){
    return speakNow("Assistance vocale Libcomlair activée.");
  }

  window.LibcomlairVoice={
    available:hasTts,
    speak,
    cancel,
    test,
    setRecognitionActive,
    isRecognitionActive:()=>recognitionActive
  };
})();