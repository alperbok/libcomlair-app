(function(){
  "use strict";
  const CONFIG_URL="https://cdn.jsdelivr.net/gh/btopro/mespeak@078d6597254776c151c67f73434c91be034a9fdc/mespeak_config.json";
  const VOICE_URL="https://cdn.jsdelivr.net/gh/btopro/mespeak@078d6597254776c151c67f73434c91be034a9fdc/voices/fr.json";
  let ready=false;
  let loading=false;
  let loadError="";
  let readyPromise=null;
  let currentAudio=null;

  function waitForConfig(timeoutMs){
    return new Promise((resolve,reject)=>{
      const started=Date.now();
      const tick=()=>{
        try{
          if(window.meSpeak&&meSpeak.isConfigLoaded&&meSpeak.isConfigLoaded()){resolve(true);return}
        }catch(_){}
        if(Date.now()-started>(timeoutMs||10000)){reject(new Error("config_timeout"));return}
        setTimeout(tick,80);
      };
      tick();
    });
  }

  function init(){
    if(ready)return Promise.resolve(true);
    if(readyPromise)return readyPromise;
    loading=true;
    readyPromise=new Promise(async(resolve,reject)=>{
      try{
        if(!window.meSpeak)throw new Error("mespeak_script_missing");
        meSpeak.loadConfig(CONFIG_URL);
        await waitForConfig(12000);
        meSpeak.loadVoice(VOICE_URL,(success,message)=>{
          loading=false;
          if(success){
            ready=true;
            loadError="";
            try{meSpeak.setDefaultVoice("fr")}catch(_){}
            resolve(true);
          }else{
            loadError=String(message||"voice_load_failed");
            reject(new Error(loadError));
          }
        });
      }catch(e){
        loading=false;
        loadError=String(e&&e.message||e||"fallback_init_failed");
        reject(e);
      }
    });
    readyPromise.catch(()=>{});
    return readyPromise;
  }

  function stop(){
    try{if(currentAudio){currentAudio.pause();currentAudio.src="";currentAudio=null}}catch(_){}
    try{if(window.meSpeak&&typeof meSpeak.stop==="function")meSpeak.stop()}catch(_){}
  }

  function speakReady(text,options){
    const clean=String(text||"").trim();
    const opts=options||{};
    if(!ready||!window.meSpeak||!clean)return Promise.reject(new Error("fallback_not_ready"));
    stop();
    return new Promise((resolve,reject)=>{
      try{
        const data=meSpeak.speak(clean,{
          voice:"fr",
          amplitude:100,
          speed:Number.isFinite(opts.speed)?opts.speed:155,
          pitch:50,
          volume:1,
          rawdata:"data-url"
        });
        if(!data||typeof data!=="string")throw new Error("audio_generation_failed");
        const audio=new Audio(data);
        currentAudio=audio;
        audio.preload="auto";
        audio.volume=1;
        let started=false;
        audio.onplaying=()=>{
          if(started)return;
          started=true;
          if(typeof opts.onstart==="function")opts.onstart({engine:"mespeak-fr"});
        };
        audio.onended=()=>{
          if(currentAudio===audio)currentAudio=null;
          if(typeof opts.onend==="function")opts.onend({engine:"mespeak-fr"});
          resolve({ok:true,engine:"mespeak-fr"});
        };
        audio.onerror=()=>{
          if(currentAudio===audio)currentAudio=null;
          const err=new Error("audio_playback_failed");
          if(typeof opts.onerror==="function")opts.onerror(err);
          reject(err);
        };
        const p=audio.play();
        if(p&&typeof p.then==="function"){
          p.then(()=>{
            if(!started){
              started=true;
              if(typeof opts.onstart==="function")opts.onstart({engine:"mespeak-fr"});
            }
          }).catch(err=>{
            if(currentAudio===audio)currentAudio=null;
            const e=new Error(err&&err.name==="NotAllowedError"?"audio_not_allowed":"audio_play_failed");
            if(typeof opts.onerror==="function")opts.onerror(e);
            reject(e);
          });
        }
      }catch(e){
        if(typeof opts.onerror==="function")opts.onerror(e);
        reject(e);
      }
    });
  }

  async function speak(text,options){
    if(!ready)await init();
    return speakReady(text,options);
  }

  function speakFromGesture(text,options){
    if(!ready)return {ok:false,reason:loading?"fallback_loading":(loadError||"fallback_not_ready")};
    try{
      const promise=speakReady(text,options);
      return {ok:true,promise};
    }catch(e){
      return {ok:false,reason:String(e&&e.message||e)};
    }
  }

  function status(){
    return {available:!!window.meSpeak,ready,loading,error:loadError,engine:"mespeak-fr"};
  }

  window.LibcomlairFallbackVoice={
    version:"v179",
    init,
    speak,
    speakFromGesture,
    stop,
    status
  };

  // Preload the independent engine so a later user click can play immediately.
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",()=>{init().catch(()=>{})},{once:true});
  }else{
    init().catch(()=>{});
  }
})();