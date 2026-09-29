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
      cause:"Le titre historique v224TutorialScreenTitle dépend de l’ancien écran d’onboarding et peut être masqué ou déplacé par plusieurs couches de visibilité et de mise en page.",
      detection:"Ouvrir Présentation Libcomlair et vérifier qu’un titre visible reste affiché dans l’en-tête sans chevaucher le micro ni le logo.",
      repair:"Ne plus utiliser le titre historique pour l’affichage. Créer v224PresentationFreshTitle dans le bloc d’en-tête actif avec le module indépendant libcomlair-v224-presentation-shell-fresh.js et le positionner avec sa propre feuille de style.",
      files:["libcomlair-v224-presentation-shell-fresh.js","libcomlair-v224-presentation-shell-fresh.css","test-v224-voice-contextual-v7.html"],
      commits:["11519350e127592ed6ced4c8dd86759f863844df","ecaf0b1f762d7fc1d0da94fe086a253e310578da","0c3ae300f4f9c0226aa1c02e1816a077ef6e3f45"],
      validation:"Nouvelle coque installée le 29/09/2026. Validation utilisateur attendue.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"presentation-accordion-page-still-too-tall",
      area:"layout",
      status:"confirmed",
      symptom:"Les dix rubriques fermées de Présentation Libcomlair nécessitent encore un léger défilement malgré la réduction des marges.",
      cause:"Les anciennes règles peuvent conserver une hauteur minimale supérieure à la hauteur réellement nécessaire pour une rubrique fermée.",
      detection:"Avec les dix rubriques fermées, vérifier si Retour et Suivant restent entièrement visibles sans défilement sur téléphone.",
      repair:"Imposer une hauteur fermée compacte aux details et summary, réduire seulement les espaces verticaux et conserver la taille de texte lisible. Une rubrique ouverte reprend automatiquement une hauteur libre.",
      files:["libcomlair-v224-presentation-shell-fresh.css"],
      commits:["ecaf0b1f762d7fc1d0da94fe086a253e310578da"],
      validation:"Hauteur compacte installée le 29/09/2026. Validation utilisateur attendue.",
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

  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-11",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();