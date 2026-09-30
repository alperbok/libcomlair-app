(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;if(!base)return;
  const OVERRIDES=Object.freeze([
    Object.freeze({id:"map-gps-v35-samsung-mutation-loop",area:"runtime-performance",status:"repaired-awaiting-validation",symptom:"Après l’ajout des tutoriels Carte/GPS v35, Samsung Browser affiche « La page ne répond plus » puis « L’onglet ne répond pas » dès l’ouverture de Libcomlair.",cause:"La v35 avait réintroduit une observation DOM permanente. MutationObserver déclenchait sync ; syncTutorials réassignait box.textContent à chaque passage ; cette écriture créait une nouvelle mutation childList, relançant immédiatement l’observateur en boucle. Cette famille de panne avait déjà été rencontrée auparavant sur Samsung Browser.",detection:"Si la page devient très lente ou ne répond plus juste après une modification utilisant MutationObserver, vérifier si la fonction observée modifie elle-même un nœud ou une classe surveillée. Toute synchronisation doit être idempotente et ne jamais s’auto-déclencher sans borne.",repair:"v35.1 supprime complètement le MutationObserver permanent de libcomlair-v224-map-gps-polish-v35.js. Les tutoriels sont synchronisés seulement au chargement par une courte série bornée de vérifications et lors des événements Libcomlair utiles. Les écritures de texte, attributs et états ne sont faites que si la valeur change réellement.",files:["libcomlair-v224-map-gps-polish-v35.js","test-v224-voice-contextual-v16.html"],commits:["190a4a4b1c93176c3f7736d7c961e2e8ba677681"],validation:"Régression confirmée par captures utilisateur le 30/09/2026. Correctif v35.1 installé ; validation sur Samsung Browser en attente.",safeAutoRepair:true})
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
  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-35.1",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();