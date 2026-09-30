(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;if(!base)return;
  const OVERRIDES=Object.freeze([
    Object.freeze({
      id:"needs-accordion-reset-by-legacy-body-observer",
      area:"accessibility-profile-layout",
      status:"repaired-and-validated",
      symptom:"Dans Mes besoins d’accessibilité, Vision reste ouvert mais l’ouverture d’Audition, Mobilité ou d’un troisième dossier ne persiste pas ; le centre ne peut donc pas atteindre sa hauteur réelle ni déclencher son défilement.",
      cause:"L’ancien libcomlair-v224-needs-profile-sync.js observait chaque changement de classe du body. Le cadre maître modifie ses classes pour son état visuel ; l’observateur relançait alors syncNeedsPage(), qui réappliquait details.open uniquement aux handicaps enregistrés dans le profil et refermait immédiatement les dossiers ouverts manuellement.",
      detection:"Sur l’écran Mes besoins, ouvrir un dossier non enregistré puis vérifier s’il reste ouvert après une modification de classe du cadre. Rechercher tout MutationObserver du body qui rappelle une fonction écrivant details.open.",
      repair:"Supprimer l’observateur de classe obsolète. Le profil enregistré ne fixe l’état open qu’à l’entrée de la page ; ensuite chaque details est indépendant.",
      files:["libcomlair-v224-needs-profile-sync.js"],
      commits:["bf2d996fd9630a65c4d9930286ab458d996d1649"],
      validation:"Validé sur Samsung Browser le 01/10/2026 à 01:36 : plusieurs dossiers peuvent désormais rester ouverts simultanément.",
      safeAutoRepair:false
    }),
    Object.freeze({
      id:"master-frame-category-sizing-rules-stacked",
      area:"layout-css",
      status:"repaired-awaiting-validation",
      symptom:"Les sept grandes catégories alternent entre trop petites et trop espacées malgré plusieurs changements de hauteur.",
      cause:"La hauteur des grandes catégories sous le cadre maître était définie simultanément dans page4.css, master-frame-integration-v1.css et frame-fixes-v6.css. Des règles anciennes restaient donc capables de reprendre la priorité ou de rendre le réglage imprévisible.",
      detection:"Rechercher plusieurs sélecteurs v224-page4-step.v224-master-frame-active visant #v224Page4Categories et imposant grid-template-rows, height, min-height ou max-height.",
      repair:"Supprimer les copies obsolètes et conserver une seule règle canonique dans le cadre maître. Après validation visuelle intermédiaire, régler les grandes cases à 70px avec 14px d’intervalle vertical.",
      files:["libcomlair-v224-page4.css","libcomlair-v224-master-frame-integration-v1.css","libcomlair-v224-frame-fixes-v6.css"],
      commits:["99f53c631d4c005d1bfcd27eacbb8527a59b6268","38cca4e607a21c0e8e7cea77e6474bb775abf14c","80804c89efc4b7148798f413b3e9102ab42e35d8","fb0cbe36452ad17f067914c58ef032eca06e7b93"],
      validation:"Nettoyage structurel confirmé ; réglage final 70px/14px publié en v6.6, validation Samsung Browser en attente.",
      safeAutoRepair:false
    }),
    Object.freeze({
      id:"master-frame-fixed-footer-hides-accordion-tail",
      area:"master-frame-layout",
      status:"repaired-awaiting-validation",
      symptom:"Sur Mes besoins d’accessibilité, plusieurs accordéons peuvent rester ouverts mais les boutons Retour/Valider restent fixés au bas de l’écran et masquent la fin de la liste ; l’utilisateur ne voit pas tous les dossiers ouverts avant de choisir une action.",
      cause:"Le cadre maître utilisait pour toutes les pages une grille fixe en trois lignes 82px / centre flexible / 60px. Ce modèle est adapté aux pages courtes mais incompatible avec un contenu accordéon dont la hauteur dépend librement du nombre de dossiers ouverts.",
      detection:"Si une page à contenu extensible conserve le footer visible pendant que le dernier élément de contenu passe dessous, vérifier grid-template-rows du cadre maître et si le footer est dans une ligne fixe indépendante du flux.",
      repair:"Pour v224-onboarding-needs uniquement, rendre le shell lui-même défilant avec des lignes 82px / auto / auto, laisser mainContent prendre sa hauteur naturelle et garder le header sticky. Le footer reste alors après la liste et n’apparaît qu’en fin de parcours.",
      files:["libcomlair-v224-master-frame-integration-v1.css","libcomlair-v224-frame-fixes-v6.css"],
      commits:["fb0cbe36452ad17f067914c58ef032eca06e7b93","c589b39b8e37d663c6634e74b385ccfe48d13e50"],
      validation:"Correctif structurel v6.6 publié le 01/10/2026 ; validation Samsung Browser en attente.",
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
  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-36.1",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();