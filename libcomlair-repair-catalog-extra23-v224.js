(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;if(!base)return;
  const OVERRIDES=Object.freeze([
    Object.freeze({
      id:"master-frame-needs-footer-held-by-legacy-center-scroll",
      area:"accessibility-profile-layout",
      status:"repaired-awaiting-validation",
      symptom:"Dans Mes besoins d’accessibilité, plusieurs accordéons peuvent rester ouverts mais Retour et Valider restent au bas de l’écran au lieu d’apparaître après la fin de la liste.",
      cause:"libcomlair-v224-needs-step.css imposait encore height:100% et overflow-y:auto à #mainContent sous le cadre maître. Cette règle ancienne empêchait la hauteur cumulée des accordéons de pousser la ligne du footer.",
      detection:"Si le footer reste visible pendant que les accordéons continuent derrière lui, rechercher toute ancienne règle v224-onboarding-needs.v224-master-frame-active imposant height:100%, overflow-y:auto ou une hauteur fixe à #mainContent.",
      repair:"Supprimer la règle de défilement locale dans needs-step.css. Sous le cadre maître, seul le cadre maître pilote la hauteur et le défilement : ligne contenu en max-content et footer après la liste.",
      files:["libcomlair-v224-needs-step.css","libcomlair-v224-master-frame-integration-v1.css"],
      commits:["a6815a0d87da29e1e2dab5926469836b3aaef2a0","d391d15f24f3a9a3076d7bf36686fbc325d16b40"],
      validation:"Cause confirmée par capture utilisateur du 01/10/2026. Correctif source installé ; validation Samsung Browser en attente.",
      safeAutoRepair:false
    }),
    Object.freeze({
      id:"nearby-visible-count-differs-from-voice-count",
      area:"map-gps-voice-consistency",
      status:"repaired-awaiting-validation",
      symptom:"Carte/GPS affiche un nombre total de résultats différent du nombre annoncé vocalement après Tout autour de moi.",
      cause:"La recherche source publiait d’abord real.length (lieux Geoapify seulement) alors que l’écran Carte/GPS recalculait ensuite resultsCount avec les résultats réellement affichés, incluant transports et filtres actifs.",
      detection:"Comparer le message de l’événement libcomlair-nearme-result, #locationStatus, #v224GlobalNearbyStatus et #resultsCount après une recherche globale.",
      repair:"Ajouter un synchroniseur en phase capture qui prend #resultsCount comme source canonique, met à jour les deux statuts et remplace event.detail.message avant les écouteurs vocaux.",
      files:["libcomlair-v224-nearby-count-sync-v37.js","test-v224-master-frame-integration-v1.html"],
      commits:["622b9d256a024a765fd441d630b1ceafafac8d5a","0ca9807b153534cafcf730ba44b27146b1117628"],
      validation:"Écart constaté par l’utilisateur le 01/10/2026 (379 affichés contre 172 annoncés). Correctif installé ; validation Samsung Browser en attente.",
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
  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-37.0",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();
