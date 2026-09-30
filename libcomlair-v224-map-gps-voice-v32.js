(()=>{
  "use strict";
  const DISCOVERY="Vous êtes dans Carte et GPS. Cette page propose deux modes. Mode Recherche autour de moi utilise votre position pour découvrir les lieux et transports proches. Mode GPS accessible est encore en projet : il recevra une destination choisie dans les résultats ou dans une fiche détaillée, puis servira à préparer et guider le trajet depuis votre position. Choisissez l’un des deux modes. Vous pouvez aussi dire Suivant pour poursuivre vers la recherche par catégories, ou Retour pour revenir à Accueil et Recherche.";
  const SIMPLE="Carte et GPS. Choisissez Recherche autour de moi, GPS accessible, Suivant pour continuer vers les catégories, ou Retour.";
  let speaking=false;
  function mode(){try{return window.LibcomlairVoiceContext?.getMode?.()||"simplified"}catch(_){return "simplified"}}
  function text(){return mode()==="discovery"?DISCOVERY:SIMPLE}
  function isActive(){return !!document.body?.classList.contains("v224-map-gps-page")}
  function speak(options){
    if(!isActive())return false;
    const engine=window.LibcomlairVoice;if(!engine?.speak)return false;
    speaking=true;const opts=options||{};
    const ok=engine.speak(text(),{rate:.9,onend:()=>{speaking=false;try{opts.oncomplete?.()}catch(_){}},onerror:e=>{speaking=false;try{opts.onerror?.(e)}catch(_){}}});
    if(ok===false)speaking=false;
    return ok!==false;
  }
  function patchGuide(){
    const base=window.LibcomlairVoiceGuide;if(!base||base.__v224MapGpsVoiceProxy)return;
    try{
      window.LibcomlairVoiceGuide=new Proxy(base,{
        get(target,prop,receiver){
          if(prop==="__v224MapGpsVoiceProxy")return true;
          if(prop==="readCurrent")return options=>isActive()?speak(options):target.readCurrent(options);
          if(prop==="describe")return ()=>isActive()?{contextId:"map-gps-hub",title:"Carte et GPS",mode:mode(),controls:[],explanations:[text()],text:text()}:target.describe();
          const value=Reflect.get(target,prop,receiver);return typeof value==="function"?value.bind(target):value;
        }
      });
    }catch(_){}
  }
  function onPage(event){
    patchGuide();
    const active=event?.detail?.active===true;
    try{window.LibcomlairGuidedPresenter?.cancelCurrent?.()}catch(_){}
    try{window.LibcomlairVoice?.cancel?.()}catch(_){}
    if(active)setTimeout(()=>{if(isActive())speak()},120);
  }
  window.addEventListener("libcomlair-map-gps-page",onPage);
  window.addEventListener("libcomlair-voice-mode-change",()=>{patchGuide();if(isActive()){try{window.LibcomlairVoice?.cancel?.()}catch(_){}setTimeout(speak,100)}});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",patchGuide,{once:true});else patchGuide();
  window.LibcomlairMapGpsVoice=Object.freeze({version:"v224-32",speak,isActive,isSpeaking:()=>speaking});
})();