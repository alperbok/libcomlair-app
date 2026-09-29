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
      detection:"Ouvrir Présentation Libcomlair et vérifier qu’un titre visible reste affiché près du micro sans chevaucher le logo ni le micro.",
      repair:"Abandonner la coque v1. Utiliser libcomlair-v224-presentation-screen-v2.js : créer le titre dans le conteneur principal de la page, indépendant de l’en-tête historique, puis le positionner dans la zone libre à gauche du micro avec sa propre feuille de style v2.",
      files:["libcomlair-v224-presentation-screen-v2.js","libcomlair-v224-presentation-screen-v2.css","test-v224-voice-contextual-v7.html"],
      commits:["385a52277bc1dc730c228d59afd2cc2aaac1de11","c46caf535271614da01d7c5f1bfdbd78dd3695f2","ce524c751a6cd49fe967fd7dbb1c6db61a10dfae"],
      validation:"La coque v1 n’a pas corrigé le problème lors du test utilisateur de 15:22 le 29/09/2026. Reconstruction v2 installée ; validation utilisateur attendue.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"presentation-accordion-page-still-too-tall",
      area:"layout",
      status:"confirmed",
      symptom:"Les dix rubriques fermées de Présentation Libcomlair nécessitent encore un léger défilement et Retour / Suivant restent partiellement hors écran.",
      cause:"La première feuille compacte n’a pas réellement pris la priorité sur le téléphone : les anciennes règles conservaient des cartes nettement plus hautes que la hauteur prévue.",
      detection:"Avec les dix rubriques fermées, vérifier que Retour et Suivant sont entièrement visibles sans défilement sur téléphone.",
      repair:"Appliquer la compacité directement au composant avec libcomlair-v224-presentation-screen-v2.js : hauteur fermée de 38 px pour details et summary, espaces verticaux réduits, boutons de 46 px, sans réduire la taille du texte principal. Une rubrique ouverte reprend automatiquement une hauteur libre.",
      files:["libcomlair-v224-presentation-screen-v2.js","libcomlair-v224-presentation-screen-v2.css","test-v224-voice-contextual-v7.html"],
      commits:["385a52277bc1dc730c228d59afd2cc2aaac1de11","c46caf535271614da01d7c5f1bfdbd78dd3695f2","ce524c751a6cd49fe967fd7dbb1c6db61a10dfae"],
      validation:"La coque v1 restait trop haute lors du test utilisateur de 15:22 le 29/09/2026. Compacité v2 appliquée directement ; validation utilisateur attendue.",
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

  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-12",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();