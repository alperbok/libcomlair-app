(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;
  if(!base)return;

  const OVERRIDE=Object.freeze({
    id:"voice-first-screen-silent-android-audio-locked",
    area:"voice-audio",
    status:"confirmed",
    symptom:"La page Bienvenue reste silencieuse à l’ouverture alors que le parcours suivant fonctionne avec la voix naturelle.",
    cause:"Les essais v13 et v14 ont montré que l’amorçage audio seul ne suffit pas. La comparaison avec le commit historique ef0114d3 montre qu’une ancienne version fonctionnelle relançait la présentation lors des mutations réelles de la page. Le présentateur v9 n’avait plus cet observateur de disponibilité de Bienvenue.",
    detection:"Ouvrir Libcomlair depuis le lien sans toucher l’écran pendant dix secondes. Si Bienvenue reste silencieuse mais que la voix revient dès les pages suivantes, comparer l’état du présentateur avec le garde LibcomlairWelcomeReadyGuard.",
    repair:"Conserver le présentateur v9 et le moteur Render validés pour tout le parcours. Restaurer uniquement le déclencheur historique de disponibilité de Bienvenue : observer l’apparition réelle du splash et relancer une seule fois la présentation lorsque le contexte welcome est effectivement prêt. Désactiver ce garde dès que la voix commence afin d’éviter tout replay. Ne pas détourner le bouton Suivant et ne jamais utiliser de voix robotique.",
    files:["libcomlair-v224-guided-presenter-v9.js","libcomlair-v224-welcome-ready-guard-v15.js","test-v224-voice-contextual-v15.html"],
    commits:["ef0114d3bed81e2040c3a451275b2326b70d25b2","247d5a3376cdb049ffaf82d75fde78f003d1c199"],
    validation:"v13 : échec, aucune voix après dix secondes. v14 : échec, aucune voix après dix secondes malgré amorçage audio anticipé et plusieurs relances. v15 : en attente de validation utilisateur.",
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
  function combined(){const map=new Map();historical().forEach(x=>map.set(x.id,x));all().forEach(x=>map.set(x.id,{...x,source:"repair-catalog"}));return [...map.values()]}
  function summary(){const recent=all(),items=combined();return {totalKnown:items.length,recent:recent.length,validated:validated().length,pendingValidation:pendingValidation().length,safeAutoRepair:autoRepairable().length,investigatedNotRootCause:recent.filter(x=>x.status==="investigated-not-root-cause").length}}

  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-22",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();