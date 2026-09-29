(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;
  if(!base)return;

  const EXTRA=Object.freeze([
    Object.freeze({
      id:"presentation-title-disappeared-after-reposition",
      area:"layout",
      status:"confirmed",
      symptom:"Le titre Présentation Libcomlair disparaît après avoir été remonté vers la zone située à gauche du micro.",
      cause:"Le titre historique puis la première coque indépendante restaient encore dépendants de l’en-tête historique et pouvaient être masqués ou remplacés par des règles plus anciennes.",
      detection:"Ouvrir Présentation Libcomlair et vérifier qu’un titre visible reste affiché sous l’en-tête sans chevaucher le logo ni le micro.",
      repair:"Abandonner le positionnement artificiel au-dessus du contenu. Utiliser libcomlair-v224-presentation-screen-v2.js pour créer un titre indépendant dans le conteneur principal, puis l’afficher dans le flux normal comme les autres titres de page.",
      files:["libcomlair-v224-presentation-screen-v2.js","libcomlair-v224-presentation-screen-v2.css","test-v224-voice-contextual-v7.html"],
      commits:["385a52277bc1dc730c228d59afd2cc2aaac1de11","c46caf535271614da01d7c5f1bfdbd78dd3695f2","ce524c751a6cd49fe967fd7dbb1c6db61a10dfae","a654c261d7c99f2e9e2b5eecba9be54b86df4b86"],
      validation:"Le titre v2 est visible au test utilisateur de 16:39 le 29/09/2026, mais trop proche du logo. Réglage commun dans le flux normal installé ; validation utilisateur attendue.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"presentation-accordion-page-still-too-tall",
      area:"layout",
      status:"confirmed",
      symptom:"Les dix rubriques fermées de Présentation Libcomlair doivent tenir sur un écran avec Retour / Suivant visibles, tout en évitant une page excessivement compacte.",
      cause:"La v1 était trop haute ; la première v2 a corrigé le défilement mais a comprimé la page au point de laisser beaucoup de vide sous les boutons.",
      detection:"Avec les dix rubriques fermées, vérifier que Retour et Suivant sont entièrement visibles sans défilement et que la page utilise harmonieusement la hauteur disponible.",
      repair:"Appliquer la hauteur directement au composant. Utiliser 42 px par rubrique fermée, 3 px d’espacement et des boutons de 50 px. Ne pas réduire la taille du texte. Une rubrique ouverte reprend automatiquement une hauteur libre.",
      files:["libcomlair-v224-presentation-screen-v2.js","libcomlair-v224-presentation-screen-v2.css","test-v224-voice-contextual-v7.html"],
      commits:["385a52277bc1dc730c228d59afd2cc2aaac1de11","c46caf535271614da01d7c5f1bfdbd78dd3695f2","ce524c751a6cd49fe967fd7dbb1c6db61a10dfae","a89e1a8a05a54a692e72f3c6bf621e43a5849e91"],
      validation:"La première v2 tient dans l’écran au test utilisateur de 16:39 le 29/09/2026 mais est trop compacte. Rééquilibrage 42 px installé ; validation utilisateur attendue.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"common-page-title-spacing-standard",
      area:"layout-standard",
      status:"confirmed",
      symptom:"Les titres de page n’ont pas toujours le même espace sous le logo et peuvent paraître collés ou décalés d’un écran à l’autre.",
      cause:"Plusieurs écrans utilisent des structures historiques différentes et certains titres ont été positionnés avec des coordonnées absolues.",
      detection:"Comparer Navigation vocale, Présentation Libcomlair, Mes besoins d’accessibilité et Accueil / Recherche : le titre doit être centré, sous l’en-tête, avec un espacement visuel comparable.",
      repair:"Adopter comme règle commune : titre dans le flux normal, centré, même hiérarchie typographique, marge haute légère sous l’en-tête et marge basse régulière avant le contenu. Éviter les positions absolues pour les titres de page sauf contrainte exceptionnelle documentée.",
      files:["libcomlair-v224-presentation-screen-v2.css","libcomlair-v224-onboarding-screens.css"],
      commits:["a654c261d7c99f2e9e2b5eecba9be54b86df4b86"],
      validation:"Règle de présentation commune enregistrée le 29/09/2026. À réutiliser sur tous les nouveaux écrans et lors des prochaines harmonisations.",
      safeAutoRepair:false
    }),
    Object.freeze({
      id:"idfm-refresh-cadence-too-slow",
      area:"data-updates",
      status:"repaired-and-validated",
      symptom:"La mise à jour des directions IDFM était annoncée comme devant être faite toutes les 3 heures mais n’était programmée que trois fois par jour, avec de longues périodes sans actualisation.",
      cause:"Le cron historique était limité à 06:17, 12:17 et 16:17 UTC au lieu d’utiliser un intervalle régulier de trois heures.",
      detection:"Contrôler le cron de update-idfm-directions.yml et l’historique GitHub Actions. Une exécution IDFM doit être prévue toutes les trois heures et une alerte doit apparaître si aucune réussite récente n’est disponible.",
      repair:"Programmer IDFM avec le cron 17 */3 * * *, soit huit exécutions par jour. Régler le watchdog sur une ancienneté maximale de 5 heures afin de tolérer un petit retard GitHub tout en détectant rapidement une exécution manquée ou en échec.",
      files:[".github/workflows/update-idfm-directions.yml",".github/workflows/watch-data-updates.yml"],
      commits:["e02c5c652c4c4481b146c73224a619e012feae4b","ed6a8995b81d1b77a41880567bbf1283a09d5844"],
      validation:"Le changement de cadence a déclenché une mise à jour IDFM réelle qui a produit et enregistré de nouvelles données le 29/09/2026. Le watchdog ajusté a terminé son contrôle avec succès.",
      safeAutoRepair:true
    })
  ]);

  function clone(x){return {...x,files:[...(x.files||[])],commits:[...(x.commits||[])]};}
  function all(){
    const items=base.all().map(clone);
    EXTRA.forEach(issue=>{if(!items.some(x=>x.id===issue.id))items.push(clone(issue))});
    return items;
  }
  function byId(id){return all().find(x=>x.id===id)||null;}
  function byStatus(status){return all().filter(x=>x.status===status);}
  function validated(){return byStatus("repaired-and-validated");}
  function autoRepairable(){return all().filter(x=>x.safeAutoRepair);}
  function pendingValidation(){return all().filter(x=>x.status!=="repaired-and-validated");}
  function historical(){return base.historical();}
  function combined(){
    const map=new Map();
    historical().forEach(item=>map.set(item.id,item));
    all().forEach(item=>map.set(item.id,{...item,source:"repair-catalog"}));
    return [...map.values()];
  }
  function summary(){
    const recent=all();
    const items=combined();
    return {totalKnown:items.length,recent:recent.length,validated:recent.filter(x=>x.status==="repaired-and-validated").length,pendingValidation:recent.filter(x=>x.status!=="repaired-and-validated").length,safeAutoRepair:recent.filter(x=>x.safeAutoRepair).length};
  }

  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-14",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();