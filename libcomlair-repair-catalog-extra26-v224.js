(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;if(!base)return;
  const OVERRIDES=Object.freeze([
    Object.freeze({
      id:"welcome-navigation-blocked-by-voice-loading",
      area:"welcome-navigation-voice-separation",
      status:"repaired-awaiting-validation",
      symptom:"À l'accueil, l'utilisateur ne peut pas entrer dans Libcomlair parce que le bouton reste sur Chargement de la voix ou parce que la voix externe ne démarre pas.",
      cause:"Le même bouton possédait deux responsabilités incompatibles : lancer la voix d'accueil et ouvrir la page de choix du profil. Le gestionnaire vocal interceptait le clic avant le gestionnaire de navigation et pouvait conserver l'état loading tant que Render ne répondait pas.",
      detection:"Vérifier que le bouton libcomlairSplashNext reste toujours en état Suivant, qu'il ne reçoit pas aria-busy pendant une tentative vocale et que le module d'accueil n'appelle aucune génération réseau quand aucun audio local n'est disponible.",
      repair:"Séparer strictement navigation et voix : la navigation reste propriétaire du clic ; le nouveau module welcome-local-first ne bloque ni clic ni propagation, tente uniquement un audio empaqueté ou déjà stocké localement et n'utilise aucun secours réseau pour l'accueil.",
      files:["libcomlair-v224-welcome-local-first-v17.js","data/voice/libcomlair-fixed-audio.json","test-v224-master-frame-integration-v2.html"],
      commits:["5255e0f72426b80810717b5bb6397d236cb2046f","635621d91f4f223cef2b9c476d55ef860f885d73"],
      validation:"Correction source installée le 01/10/2026. À valider sur Samsung : ouverture immédiate de la page profil même si Render est lent ou indisponible.",
      safeAutoRepair:false
    })
  ]);
  function clone(x){return {...x,files:[...(x.files||[])],commits:[...(x.commits||[])]}}
  function all(){const map=new Map(base.all().map(x=>[x.id,clone(x)]));OVERRIDES.forEach(x=>map.set(x.id,clone(x)));return [...map.values()]}
  function byId(id){return all().find(x=>x.id===id)||null}
  function byStatus(status){return all().filter(x=>x.status===status)}
  function validated(){return byStatus("repaired-and-validated")}
  function autoRepairable(){return all().filter(x=>x.safeAutoRepair)}
  function pendingValidation(){return all().filter(x=>!["repaired-and-validated","investigated-not-root-cause","observed-performance"].includes(x.status))}
  function historical(){return base.historical?.()||[]}
  function combined(){const map=new Map();historical().forEach(x=>map.set(x.id,x));all().forEach(x=>map.set(x.id,{...x,source:"repair-catalog"}));return [...map.values()]}
  function summary(){const recent=all(),items=combined();return {totalKnown:items.length,recent:recent.length,validated:validated().length,pendingValidation:pendingValidation().length,safeAutoRepair:autoRepairable().length,investigatedNotRootCause:recent.filter(x=>x.status==="investigated-not-root-cause").length}}
  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-40.0",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();
