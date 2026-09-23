(function(){
  "use strict";
  const CONFIG_URL="https://cdn.jsdelivr.net/gh/btopro/mespeak@master/mespeak_config.json";
  const VOICE_URL="https://cdn.jsdelivr.net/gh/btopro/mespeak@master/voices/fr.json";
  let preparePromise=null;
  let ready=false;
  let lastError="";

  function waitFor(test,timeoutMs){
    return new Promise((resolve,reject)=>{
      const started=Date.now();
      const timer=setInterval(()=>{
        try{
          if(test()){clearInterval(timer);resolve(true);return}
        }catch(_){}
        if(Date.now()-started>timeoutMs){
          clearInterval(timer);
          reject(new Error("timeout"));
        }
      },80);
    });
  }

  function prepare(){
    if(ready)return Promise.resolve(true);
    if(preparePromise)return preparePromise;
    preparePromise=new Promise(async(resolve,reject)=>{
      try{
        if(!window.meSpeak)throw new Error("meSpeak indisponible");
        if(!meSpeak.isConfigLoaded()){
          meSpeak.loadConfig(CONFIG_URL);
          await waitFor(()=>meSpeak.isConfigLoaded(),10000);
        }
        if(!meSpeak.isVoiceLoaded("fr")){
          await new Promise((ok,ko)=>{
            meSpeak.loadVoice(VOICE_URL,(success,message)=>{
              if(success)ok(true);
              else ko(new Error(String(message||"échec du chargement de la voix française")));
            });
          });
        }
        meSpeak.setDefaultVoice("fr");
        ready=true;
        lastError="";
        resolve(true);
      }catch(error){
        lastError=error&&error.message?error.message:String(error||"erreur inconnue");
        preparePromise=null;
        reject(error);
      }
    });
    return preparePromise;
  }

  async function speak(text,options){
    const clean=String(text||"").trim();
    if(!clean)return false;
    const opts=options||{};
    try{
      await prepare();
      if(typeof meSpeak.stop==="function"){
        try{meSpeak.stop()}catch(_){}
      }
      const id=meSpeak.speak(clean,{
        amplitude:100,
        wordgap:0,
        pitch:50,
        speed:155
      },()=>{
        if(typeof opts.onend==="function")opts.onend();
      });
      if(id===false||id===null||typeof id==="undefined"){
        throw new Error("meSpeak n’a pas démarré");
      }
      if(typeof opts.onstart==="function")opts.onstart();
      return true;
    }catch(error){
      lastError=error&&error.message?error.message:String(error||"erreur inconnue");
      if(typeof opts.onerror==="function")opts.onerror(error);
      return false;
    }
  }

  function stop(){
    try{if(window.meSpeak&&typeof meSpeak.stop==="function")meSpeak.stop()}catch(_){}
  }

  function status(){
    return {
      available:!!window.meSpeak,
      ready,
      lastError
    };
  }

  window.LibcomlairFallbackVoice=Object.freeze({
    version:"v181",
    name:"Voix de secours française",
    prepare,
    speak,
    stop,
    status
  });
})();