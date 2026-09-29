(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;
  if(!base)return;

  const OVERRIDE=Object.freeze({
    id:"voice-first-screen-silent-android-audio-locked",
    area:"voice-audio",
    status:"confirmed",
    symptom:"La page Bienvenue reste silencieuse à l’ouverture alors que la voix naturelle fonctionne ensuite dans le parcours Libcomlair.",
    cause:"Cause exacte encore en diagnostic. Les essais v13, v14 et v15 ont éliminé trois hypothèses : amorçage audio trop tardif, contexte Web Audio créé trop tard, et absence du MutationObserver historique sur Bienvenue. Le snapshot fonctionnel ef0114d3 utilisait Render v195 + moteur vocal v189 ; ces deux moteurs utilisent déjà Web Audio et leurs fichiers encore présents sur main correspondent au code historique inspecté.",
    detection:"Ne plus modifier tout le parcours pour cette panne. Utiliser d’abord test-v224-welcome-historical-minimal.html : il charge uniquement Render v195 + moteur v189, lance une phrase automatiquement sans interaction et affiche moteur, Render, état Audio et résultat après dix secondes. Si ce test parle, la régression se situe dans l’orchestration actuelle de Libcomlair. S’il reste silencieux avec Audio verrouillé, le problème est en dehors du présentateur et du routage des pages.",
    repair:"Aucun nouveau correctif global tant que le test historique minimal n’a pas tranché. Conserver la v11 comme base validée pour Profil jusqu’à fiche détaillée. Ne pas détourner Suivant et ne jamais utiliser de voix robotique.",
    files:["libcomlair-render-voice-v195.js","libcomlair-voice-engine-v189.js","libcomlair-v224-guided-presenter-v9.js","libcomlair-v224-welcome-ready-guard-v15.js","test-v224-voice-contextual-v15.html","test-v224-welcome-historical-minimal.html"],
    commits:["ef0114d3bed81e2040c3a451275b2326b70d25b2","247d5a3376cdb049ffaf82d75fde78f003d1c199","f166ed9dee276ac605bda9dde65863f7e0250461"],
    validation:"v13 : échec après dix secondes. v14 : échec après dix secondes. v15 : échec après dix secondes malgré restauration du déclencheur historique de disponibilité de Bienvenue. Test minimal v195/v189 créé, validation utilisateur en attente.",
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

  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-23",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();
