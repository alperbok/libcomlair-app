(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;
  if(!base)return;

  const OVERRIDE=Object.freeze({
    id:"voice-first-screen-silent-android-audio-locked",
    area:"voice-audio",
    status:"confirmed",
    symptom:"La première page d’accueil/Bienvenue peut rester silencieuse alors que le parcours suivant fonctionne normalement.",
    cause:"La voix naturelle Render utilise Web Audio. Le démarrage tardif de la première annonce peut perdre la possibilité de démarrer l’audio obtenue lors de l’ouverture du lien ou de l’application, et Android peut aussi verrouiller exceptionnellement l’audio.",
    detection:"Ouvrir Libcomlair depuis son lien puis, plus tard, depuis son icône, sans toucher l’écran après l’ouverture. Vérifier si Bienvenue commence à parler automatiquement et relever LibcomlairLaunchAudioPrime.status() si elle reste silencieuse.",
    repair:"Règle produit : lancement de Libcomlair = tentative immédiate de lancement de la voix d’accueil. Amorcer Render dès l’ouverture du lien ou de l’application, tout en conservant le présentateur unique comme seul narrateur. Suivant sert uniquement à changer de page. Un premier geste dans l’application reste seulement un secours Android si l’audio est exceptionnellement verrouillé. Ne jamais utiliser de voix robotique.",
    files:["libcomlair-v224-launch-audio-prime-v13.js","libcomlair-render-voice-v196.js","libcomlair-v224-guided-presenter-v9.js","test-v224-voice-contextual-v13.html"],
    commits:["56152ed8da7810d19a457b163198e551d772db35"],
    validation:"La logique v12 qui utilisait Suivant pour démarrer la voix a été abandonnée avant validation, car elle ne correspond pas au fonctionnement final souhaité. Correctif v13 en attente de validation utilisateur.",
    safeAutoRepair:true
  });

  function clone(x){return {...x,files:[...(x.files||[])],commits:[...(x.commits||[])]};}
  function all(){
    const map=new Map(base.all().map(x=>[x.id,clone(x)]));
    map.set(OVERRIDE.id,clone(OVERRIDE));
    return [...map.values()];
  }
  function byId(id){return all().find(x=>x.id===id)||null}
  function byStatus(status){return all().filter(x=>x.status===status)}
  function validated(){return byStatus("repaired-and-validated")}
  function autoRepairable(){return all().filter(x=>x.safeAutoRepair)}
  function pendingValidation(){return all().filter(x=>x.status!=="repaired-and-validated"&&x.status!=="investigated-not-root-cause")}
  function historical(){return base.historical?.()||[]}
  function combined(){
    const map=new Map();
    historical().forEach(x=>map.set(x.id,x));
    all().forEach(x=>map.set(x.id,{...x,source:"repair-catalog"}));
    return [...map.values()];
  }
  function summary(){
    const recent=all(),items=combined();
    return {totalKnown:items.length,recent:recent.length,validated:validated().length,pendingValidation:pendingValidation().length,safeAutoRepair:autoRepairable().length,investigatedNotRootCause:recent.filter(x=>x.status==="investigated-not-root-cause").length};
  }

  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-21",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();