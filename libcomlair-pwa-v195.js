(function(){
  "use strict";
  if("serviceWorker" in navigator){
    window.addEventListener("load",()=>navigator.serviceWorker.register("./libcomlair-sw-v195.js",{scope:"./"}).catch(()=>{}),{once:true});
  }
  let deferred=null;
  const button=document.getElementById("installLibcomlair");
  window.addEventListener("beforeinstallprompt",event=>{
    event.preventDefault();
    deferred=event;
    if(button)button.hidden=false;
  });
  if(button){
    button.addEventListener("click",async()=>{
      if(!deferred){
        const status=document.getElementById("installLibcomlairStatus");
        if(status)status.textContent="Si aucun bouton d’installation n’apparaît, utilisez le menu du navigateur puis Ajouter à l’écran d’accueil.";
        return;
      }
      deferred.prompt();
      try{await deferred.userChoice}catch(_){}
      deferred=null;
      button.hidden=true;
    });
  }
  window.addEventListener("appinstalled",()=>{
    const status=document.getElementById("installLibcomlairStatus");
    if(status)status.textContent="Libcomlair est installée sur l’écran d’accueil.";
    if(button)button.hidden=true;
  });
})();