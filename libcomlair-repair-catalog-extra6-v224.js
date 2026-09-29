(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;
  if(!base)return;

  const EXTRA=Object.freeze([
    Object.freeze({
      id:"presentation-voice-did-not-auto-start",
      area:"voice",
      status:"confirmed",
      symptom:"L’assistance vocale ne démarre pas automatiquement à l’ouverture de Présentation Libcomlair malgré le mode Découverte guidée.",
      cause:"Le présentateur pouvait considérer la page comme déjà visitée alors que le moteur vocal n’était pas encore prêt au premier essai, ce qui empêchait une nouvelle tentative.",
      detection:"Ouvrir Présentation Libcomlair en mode Découverte guidée et vérifier que la lecture commence automatiquement après l’affichage de la page.",
      repair:"Utiliser libcomlair-v224-presentation-voice-card.js : attendre que le moteur vocal et le présentateur soient prêts, puis relancer une présentation forcée uniquement si aucune lecture n’est déjà en cours. Réessayer plusieurs fois en cas de démarrage trop précoce.",
      files:["libcomlair-v224-presentation-voice-card.js","test-v224-voice-contextual-v7.html"],
      commits:["8ecad889be01a343fd0124be38156bf4700ec993","4620633333c3f28708a9a2c9302f1175fb97a005"],
      validation:"Correction installée le 29/09/2026. Validation utilisateur attendue.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"presentation-voice-accordion-opening-replaced-by-centered-card",
      area:"voice-layout",
      status:"confirmed",
      symptom:"La lecture vocale de Présentation ouvrait successivement les accordéons, ce qui déplaçait le contenu et rendait le suivi visuel moins stable.",
      cause:"La première conception utilisait directement les accordéons de consultation manuelle comme support visuel de la lecture automatique.",
      detection:"Pendant la lecture vocale de Présentation, vérifier qu’aucune rubrique de la liste ne s’ouvre automatiquement et qu’un seul cadre central affiche la rubrique en cours.",
      repair:"Conserver les accordéons uniquement pour la consultation manuelle. Afficher pendant la lecture un cadre central indépendant indiquant le titre, le texte et la progression de la rubrique en cours, puis le masquer à la fin.",
      files:["libcomlair-v224-presentation-voice-card.js","libcomlair-v224-presentation-voice-card.css","test-v224-voice-contextual-v7.html"],
      commits:["8ecad889be01a343fd0124be38156bf4700ec993","c2a57d6ea62de1d2452f832a4325b043fc5268eb","4620633333c3f28708a9a2c9302f1175fb97a005"],
      validation:"Nouveau cadre central installé le 29/09/2026. Validation utilisateur attendue.",
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
    const recent=all(),items=combined();
    return {totalKnown:items.length,recent:recent.length,validated:recent.filter(x=>x.status==="repaired-and-validated").length,pendingValidation:recent.filter(x=>x.status!=="repaired-and-validated").length,safeAutoRepair:recent.filter(x=>x.safeAutoRepair).length};
  }

  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-13",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();