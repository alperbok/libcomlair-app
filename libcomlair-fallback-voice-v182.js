(function(){
  "use strict";

  const SCRIPT_URL="vendor/mespeak/mespeak.js?v=182";
  const CONFIG_URL="vendor/mespeak/mespeak_config.json?v=182";
  const VOICE_URL="vendor/mespeak/voices/fr.json?v=182";

  let loading=null;
  let ready=false;
  let currentId=0;
  let last={state:"idle",error:"",time:0};

  function setLast(state,extra){
    last={state,error:"",time:Date.now(),...(extra||{})};
    try{window.dispatchEvent(new CustomEvent("libcomlair-fallback-voice-status",{detail:{...last}}))}catch(_){}
  }

  function loadScript(){
    if(window.meSpeak)return Promise.resolve(window.meSpeak);
    return new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[data-libcomlair-mespeak="1"]');
      if(existing){
        const start=Date.now();
        const timer=setInterval(()=>{
          if(window.meSpeak){
            clearInterval(timer);
            resolve(window.meSpeak);
          }else if(Date.now()-start>15000){
            clearInterval(timer);
            reject(new Error("meSpeak ne s’est pas chargé."));
          }
        },100);
        return;
      }
      const script=document.createElement("script");
      script.src=SCRIPT_URL;
      script.async=true;
      script.dataset.libcomlairMespeak="1";
      script.onload=()=>window.meSpeak?resolve(window.meSpeak):reject(new Error("meSpeak est introuvable après chargement."));
      script.onerror=()=>reject(new Error("Impossible de charger le moteur vocal de secours."));
      document.head.appendChild(script);
    });
  }

  function waitConfig(ms){
    return new Promise((resolve,reject)=>{
      const start=Date.now();
      const timer=setInterval(()=>{
        try{
          if(window.meSpeak&&window.meSpeak.isConfigLoaded&&window.meSpeak.isConfigLoaded()){
            clearInterval(timer);
            resolve(true);
            return;
          }
        }catch(_){}
        if(Date.now()-start>ms){
          clearInterval(timer);
          reject(new Error("Configuration meSpeak non chargée."));
        }
      },120);
    });
  }

  function prepare(){
    if(ready&&window.meSpeak)return Promise.resolve(true);
    if(loading)return loading;

    loading=(async()=>{
      setLast("loading");
      const ms=await loadScript();

      try{ms.loadConfig(CONFIG_URL)}catch(e){
        throw new Error("Impossible de charger la configuration française : "+(e&&e.message?e.message:String(e)));
      }

      const voicePromise=new Promise((resolve,reject)=>{
        try{
          ms.loadVoice(VOICE_URL,(success,message)=>{
            if(success)resolve(message||"fr");
            else reject(new Error("Voix française non chargée : "+String(message||"erreur")));
          });
        }catch(e){
          reject(e);
        }
      });

      await Promise.all([waitConfig(15000),voicePromise]);

      try{if(ms.setDefaultVoice)ms.setDefaultVoice("fr")}catch(_){}
      ready=true;
      setLast("ready",{voice:"fr"});
      return true;
    })().catch(error=>{
      ready=false;
      setLast("error",{error:error&&error.message?error.message:String(error)});
      throw error;
    }).finally(()=>{loading=null});

    return loading;
  }

  async function speak(text,options){
    const clean=String(text||"").trim();
    if(!clean)throw new Error("Texte vocal vide.");
    await prepare();

    const opts=options||{};
    return new Promise((resolve,reject)=>{
      try{
        if(currentId&&window.meSpeak&&window.meSpeak.stop){
          try{window.meSpeak.stop(currentId)}catch(_){}
        }

        const id=window.meSpeak.speak(clean,{
          voice:"fr",
          amplitude:100,
          pitch:48,
          speed:155,
          wordgap:0
        },success=>{
          currentId=0;
          if(success){
            setLast("ended",{voice:"meSpeak français"});
            if(typeof opts.onend==="function")opts.onend({voice:"meSpeak français",mode:"fallback"});
            resolve({ok:true,voice:"meSpeak français",mode:"fallback"});
          }else{
            const error=new Error("La lecture de secours a été interrompue.");
            setLast("error",{error:error.message});
            if(typeof opts.onerror==="function")opts.onerror(error);
            reject(error);
          }
        });

        if(!id){
          const error=new Error("meSpeak n’a pas pu démarrer la lecture.");
          setLast("error",{error:error.message});
          if(typeof opts.onerror==="function")opts.onerror(error);
          reject(error);
          return;
        }

        currentId=id;
        setLast("started",{voice:"meSpeak français"});
        if(typeof opts.onstart==="function")opts.onstart({voice:"meSpeak français",mode:"fallback"});
      }catch(error){
        setLast("error",{error:error&&error.message?error.message:String(error)});
        if(typeof opts.onerror==="function")opts.onerror(error);
        reject(error);
      }
    });
  }

  function stop(){
    if(currentId&&window.meSpeak&&window.meSpeak.stop){
      try{window.meSpeak.stop(currentId)}catch(_){}
    }else if(window.meSpeak&&window.meSpeak.stop){
      try{window.meSpeak.stop()}catch(_){}
    }
    currentId=0;
    setLast("stopped");
  }

  function status(){
    return {version:"mespeak-v182",ready,loading:!!loading,currentId,last:{...last}};
  }

  window.LibcomlairFallbackVoice=Object.freeze({
    version:"mespeak-v182",
    prepare,
    speak,
    stop,
    status
  });
})();