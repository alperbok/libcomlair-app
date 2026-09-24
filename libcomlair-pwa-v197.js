(function(){
  "use strict";
  const status=document.getElementById("installLibcomlairStatus");
  const button=document.getElementById("installLibcomlair");
  const standalone=window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone===true;
  if(status)status.textContent=standalone?"Mode application installée actif.":"Mode navigateur.";
  if("serviceWorker" in navigator){
    window.addEventListener("load",()=>navigator.serviceWorker.register("./libcomlair-sw-v197.js",{scope:"./"}).catch(()=>{}),{once:true});
  }
  let deferred=null;
  window.addEventListener("beforeinstallprompt",event=>{
    event.preventDefault();
    deferred=event;
    if(button&&!standalone)button.hidden=false;
  });
  if(button){
    if(standalone)button.hidden=true;
    button.addEventListener("click",async()=>{
      if(deferred){
        deferred.prompt();
        try{await deferred.userChoice}catch(_){}
        deferred=null;
        button.hidden=true;
      }else if(status){
        status.textContent="Utilisez le menu du navigateur puis Ajouter à l’écran d’accueil / Installer l’application.";
      }
    });
  }
  window.addEventListener("appinstalled",()=>{
    if(status)status.textContent="Libcomlair est installée. Fermez cette page puis ouvrez Libcomlair depuis son icône.";
    if(button)button.hidden=true;
  });
})();