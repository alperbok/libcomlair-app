(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;if(!base)return;
  const OVERRIDES=Object.freeze([
    Object.freeze({
      id:"needs-accordion-reset-by-legacy-body-observer",
      area:"accessibility-profile-layout",
      status:"repaired-awaiting-validation",
      symptom:"Dans Mes besoins d’accessibilité, Vision reste ouvert mais l’ouverture d’Audition, Mobilité ou d’un troisième dossier ne persiste pas ; le centre ne peut donc pas atteindre sa hauteur réelle ni déclencher son défilement.",
      cause:"L’ancien libcomlair-v224-needs-profile-sync.js observait chaque changement de classe du body. Le cadre maître modifie ses classes pour son état visuel ; l’observateur relançait alors syncNeedsPage(), qui réappliquait details.open uniquement aux handicaps enregistrés dans le profil et refermait immédiatement les dossiers ouverts manuellement.",
      detection:"Sur l’écran Mes besoins, ouvrir un dossier non enregistré puis vérifier s’il reste ouvert après une modification de classe du cadre. Rechercher tout MutationObserver du body qui rappelle une fonction écrivant details.open.",
      repair:"Supprimer l’observateur de classe obsolète. Le profil enregistré ne fixe l’état open qu’à l’entrée de la page ; ensuite chaque details est indépendant. Le centre du cadre reste en overflow-y:auto et défile seulement lorsque la hauteur cumulée des dossiers ouverts dépasse la zone disponible.",
      files:["libcomlair-v224-needs-profile-sync.js","libcomlair-v224-frame-fixes-v6.css"],
      commits:["bf2d996fd9630a65c4d9930286ab458d996d1649"],
      validation:"Cause confirmée le 01/10/2026 pendant l’intégration du cadre maître. Correctif source installé ; validation Samsung Browser en attente.",
      safeAutoRepair:false
    }),
    Object.freeze({
      id:"master-frame-category-sizing-rules-stacked",
      area:"layout-css",
      status:"repaired-awaiting-validation",
      symptom:"Les sept grandes catégories alternent entre trop petites et trop espacées malgré plusieurs changements de hauteur.",
      cause:"La hauteur des grandes catégories sous le cadre maître était définie simultanément dans page4.css, master-frame-integration-v1.css et frame-fixes-v6.css. Des règles anciennes restaient donc capables de reprendre la priorité ou de rendre le réglage imprévisible.",
      detection:"Rechercher plusieurs sélecteurs v224-page4-step.v224-master-frame-active visant #v224Page4Categories et imposant grid-template-rows, height, min-height ou max-height.",
      repair:"Supprimer les deux copies obsolètes et conserver une seule règle canonique dans le cadre maître. Les grandes cases sont fixées à 78px avec 8px d’intervalle, sans space-around.",
      files:["libcomlair-v224-page4.css","libcomlair-v224-master-frame-integration-v1.css","libcomlair-v224-frame-fixes-v6.css"],
      commits:["99f53c631d4c005d1bfcd27eacbb8527a59b6268","38cca4e607a21c0e8e7cea77e6474bb775abf14c","80804c89efc4b7148798f413b3e9102ab42e35d8"],
      validation:"Nettoyage structurel effectué le 01/10/2026 ; validation visuelle Samsung Browser en attente.",
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
  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-36.0",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();