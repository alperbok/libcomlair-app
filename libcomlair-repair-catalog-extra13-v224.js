(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;
  if(!base)return;

  const OVERRIDE=Object.freeze({
    id:"voice-first-screen-silent-android-audio-locked",
    area:"voice-audio",
    status:"confirmed",
    symptom:"La page Bienvenue reste silencieuse à l’ouverture alors que Render est disponible et que la voix naturelle fonctionne ensuite dans le parcours.",
    cause:"Cause confirmée le 30/09/2026 par le test historique minimal v195/v189 sur Samsung Browser : Render prêt = oui, moteur = generating-render, voix démarrée = non et AudioContext = suspended après dix secondes sans interaction. Le navigateur maintient donc Web Audio verrouillé tant qu’aucun geste n’a lieu dans la page Libcomlair. L’ouverture d’un lien ou d’une future icône ne doit pas être considérée comme un geste audio fiable pour le document chargé.",
    detection:"Avant toute nouvelle modification de Render ou du présentateur, vérifier test-v224-welcome-historical-minimal.html. Le diagnostic caractéristique est Render prêt oui + génération lancée + Audio suspended + aucune voix démarrée. Dans ce cas ne pas relancer les anciennes hypothèses v13, v14 ou v15.",
    repair:"Conserver la v11 comme base fonctionnelle. Sur Bienvenue, remplacer initialement Suivant par un bouton visible Écouter. Son premier appui reste sur la page, déverrouille Web Audio via Render puis lit avec la voix naturelle le message officiel : « Bienvenue dans Libcomlair. Ensemble, rendons les lieux accessibles plus faciles à trouver pour tous. Appuyez sur Suivant pour commencer. » Le mot « Ensemble » est volontaire : l’usager utilise Libcomlair mais peut aussi participer à son évolution. Dès que la voix passe réellement à speaking, retirer le style blanc Écouter pour rendre à nouveau visible le bouton vert Suivant déjà dessiné dans l’écran d’accueil, tout en conservant la zone HTML cliquable et son libellé accessible. Aucune voix robotique et aucun passage automatique vers le Profil.",
    files:["test-v224-welcome-historical-minimal.html","libcomlair-v224-welcome-listen-first-v16.js","libcomlair-v224-welcome-listen-first-v16.css","test-v224-voice-contextual-v16.html"],
    commits:["fbd8dfed78eb7e8ce6ad8ecd2c9a1dfc0c184d8e","439422b60ecb584dbec2539b4bf052fd35a1101c","4585f1c64dfc4e539a11c4687d2bb6f186f2c64b","3f3c089ff7ae73606b8ce81d1a109f0f835f9c31","8cdf3dcfa14b86cad04a0d4997e048ff62e8ce26","35c5d9829d5407ff0f35769235ee782feb5e548a"],
    validation:"Cause confirmée par capture utilisateur : Audio suspended, Render prêt oui, état voix generating-render et aucune lecture après dix secondes. En v16, l’utilisateur confirme que le bouton Écouter déclenche correctement le message vocal et que l’état passe bien à Suivant. Le texte a été validé avec retrait de la virgule avant « pour tous ». Un chevauchement visuel du bouton blanc sur le bouton vert a été observé ; correction installée pour retirer la surcouche blanche dès le démarrage de la voix. Validation finale de ce raffinement en attente.",
    safeAutoRepair:false
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
  function combined(){const map=new Map();historical().forEach(x=>map.set(x.id,x));all().forEach(x=>map.set(x.id,{...x,source:"repair-catalog"}));return [...map.values()]}
  function summary(){const recent=all(),items=combined();return {totalKnown:items.length,recent:recent.length,validated:validated().length,pendingValidation:pendingValidation().length,safeAutoRepair:autoRepairable().length,investigatedNotRootCause:recent.filter(x=>x.status==="investigated-not-root-cause").length}}

  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-26",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();