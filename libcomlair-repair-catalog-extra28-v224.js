(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;if(!base)return;
  const EXTRA=Object.freeze({
    id:"nested-wrapper-extra-modules-not-injected",
    area:"master-wrapper-module-injection",
    status:"repaired-awaiting-validation",
    symptom:"Les nouveaux outils techniques sont présents dans le dépôt mais n’apparaissent pas dans le menu de la version de test ; le menu reste dans son ancienne présentation.",
    cause:"Le wrapper v2 modifiait le texte source du wrapper v1 avec des chaînes contenant un antislash supplémentaire avant le guillemet fermant de certains attributs. Les chaînes ne correspondaient donc jamais au texte réel du wrapper v1 et l’injection CSS/JS échouait silencieusement.",
    detection:"Ouvrir le mode développeur et vérifier la présence des accordéons État et tests essentiels, Diagnostic et réparation et Maintenance avancée. Vérifier aussi que LibcomlairDeveloperMaintenance et LibcomlairAutonomyDashboard existent.",
    repair:"Corriger les chaînes de remplacement du wrapper v2 pour cibler exactement le texte source du wrapper v1, sans antislash avant le guillemet de l’attribut. Charger le Diagnostic local-first depuis le wrapper interne qui possède réellement la page applicative.",
    files:["test-v224-master-frame-integration-v2.html","test-v224-master-frame-integration-v1.html","libcomlair-v224-technical-menu-access-v1.js","libcomlair-selftest-v189.js"],
    commits:["e37a90cf6f29efe751e70cd75e1f6bc5be70b1ba","2a9f3d7238676541627a7a62d145ee3cf1d0f8d8"],
    validation:"Correction source installée le 01/10/2026. Validation Samsung du menu développeur encore nécessaire.",
    safeAutoRepair:false
  });
  function clone(x){return {...x,files:[...(x.files||[])],commits:[...(x.commits||[])]}}
  function all(){const map=new Map(base.all().map(x=>[x.id,clone(x)]));map.set(EXTRA.id,clone(EXTRA));return [...map.values()]}
  function byId(id){return all().find(x=>x.id===id)||null}
  function byStatus(status){return all().filter(x=>x.status===status)}
  function validated(){return byStatus("repaired-and-validated")}
  function autoRepairable(){return all().filter(x=>x.safeAutoRepair)}
  function pendingValidation(){return all().filter(x=>!["repaired-and-validated","investigated-not-root-cause","observed-performance"].includes(x.status))}
  function historical(){return base.historical?.()||[]}
  function combined(){const map=new Map();historical().forEach(x=>map.set(x.id,x));all().forEach(x=>map.set(x.id,{...x,source:"repair-catalog"}));return [...map.values()]}
  function summary(){const recent=all(),items=combined();return {totalKnown:items.length,recent:recent.length,validated:validated().length,pendingValidation:pendingValidation().length,safeAutoRepair:autoRepairable().length,investigatedNotRootCause:recent.filter(x=>x.status==="investigated-not-root-cause").length}}
  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-42.0",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();