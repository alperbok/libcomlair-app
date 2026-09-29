(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;
  if(!base)return;

  const OVERRIDES=Object.freeze([
    Object.freeze({
      id:"presentation-auto-opens-accordions-instead-of-centered-card",
      area:"voice-presentation-ui",
      status:"repaired-and-validated",
      symptom:"Pendant la lecture automatique de Présentation Libcomlair, les accordéons s’ouvraient dans la page au lieu d’afficher une seule explication au centre.",
      cause:"Le chemin de lecture utilisait PageCoherence au lieu de donner priorité à la carte vocale centrée.",
      detection:"Entrer dans Présentation Libcomlair en Découverte guidée et vérifier qu’une seule carte centrale 1 sur 10 est visible, avec Retour et Suivant accessibles.",
      repair:"Utiliser LibcomlairPresentationVoiceCard pour afficher une rubrique à la fois au centre et garder les boutons Retour/Suivant visibles.",
      files:["libcomlair-v224-presentation-voice-card.js","libcomlair-v224-presentation-voice-card-v3.js","libcomlair-v224-presentation-reading-fix-v10.css","test-v224-voice-contextual-v10.html","test-v224-voice-contextual-v11.html"],
      commits:["7a3bbd2be0e0f8cc448f1bc65bd01b321b397a1b","586b0ea930d239f2ac0c30b71b8795683cd74864","a40f1dd91e06ce1365bf11f0ce2bec39fccb93d2"],
      validation:"Validé par l’utilisateur le 29/09/2026 sur v10 : lecture et affichage centrés corrects, avec Retour/Suivant visibles. Un replay après 10/10 subsistait et est enregistré séparément.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-stops-on-search-categories-and-deep-pages",
      area:"voice-navigation",
      status:"confirmed",
      symptom:"La voix disparaît dès l’écran Recherche/Catégories puis reste absente dans catégories, sous-catégories, résultats et fiche détaillée.",
      cause:"Le contexte profond pouvait être correctement forcé sans que le présentateur ne lance réellement une nouvelle lecture. La v10 corrigeait surtout le contexte et le vieux readCurrent, mais la relance automatique restait dépendante de plusieurs couches.",
      detection:"Parcourir jusqu’à Recherche/Catégories. Si l’écran est visible sans annonce, puis que les écrans profonds restent silencieux, la panne est présente.",
      repair:"Utiliser un contexte profond fondé sur l’état réel de l’écran et un présentateur unique qui lit directement search/category/subcategory/map/favorites/filters/contribute/results/detail via la voix naturelle Render. Ne plus déléguer ces pages à readCurrent ni à un second orchestrateur.",
      files:["libcomlair-v224-deep-context-v11.js","libcomlair-v224-guided-presenter-v9.js","test-v224-voice-contextual-v11.html"],
      commits:["1583d8fbfc37e36f4491a817abe88b2b43a8ba94","6a1b4ba7e5486c02d18e2a5b944016d118960ec2","b92a2db154755cc76386c22e87747fc4de7de3d9"],
      validation:"v10 testée le 29/09/2026 : échec confirmé, la voix disparaît toujours dès Recherche/Catégories. Correctif v11 installé ; validation utilisateur attendue.",
      safeAutoRepair:true
    })
  ]);

  const EXTRA=Object.freeze([
    Object.freeze({
      id:"presentation-replays-after-complete",
      area:"voice-presentation-ui",
      status:"confirmed",
      symptom:"Après avoir lu les 10 rubriques de Présentation Libcomlair, l’assistance vocale recommence automatiquement toute la présentation depuis le début sans action de l’utilisateur.",
      cause:"La carte de présentation et le présentateur pouvaient tous deux tenter un démarrage automatique, et des événements tardifs de la même page pouvaient être interprétés comme une nouvelle demande de lecture.",
      detection:"Laisser la Présentation aller jusqu’à 10 sur 10 sans toucher l’écran. Si elle repart à 1 sur 10, la panne est présente.",
      repair:"La carte vocale v3 devient un composant passif piloté uniquement par le présentateur. Le présentateur v9 mémorise la dernière identité de page lue et ignore les événements répétés tant que l’utilisateur n’a pas quitté la page.",
      files:["libcomlair-v224-presentation-voice-card-v3.js","libcomlair-v224-guided-presenter-v9.js","test-v224-voice-contextual-v11.html"],
      commits:["a40f1dd91e06ce1365bf11f0ce2bec39fccb93d2","6a1b4ba7e5486c02d18e2a5b944016d118960ec2","b92a2db154755cc76386c22e87747fc4de7de3d9"],
      validation:"Panne confirmée par l’utilisateur le 29/09/2026 sur v10. Correctif v11 installé ; validation utilisateur attendue.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"profile-voice-silent-after-v10",
      area:"voice-navigation",
      status:"confirmed",
      symptom:"Sur v10, la page Profil n’a plus d’annonce vocale automatique alors que plusieurs pages d’onboarding fonctionnent.",
      cause:"Le Profil restait sur l’ancien chemin VoiceGuide.readCurrent tandis que les écrans réparés utilisaient déjà une lecture directe. Les couches ajoutées en v10 ont rendu ce chemin indirect à nouveau fragile.",
      detection:"Depuis Bienvenue, passer au Profil et vérifier si aucune annonce ne démarre alors que le moteur naturel fonctionne ensuite sur d’autres pages.",
      repair:"Faire lire le Profil directement par le présentateur v9, avec le texte et les choix fournis par le guide mais envoyés au moteur naturel Render sans dépendre de readCurrent.",
      files:["libcomlair-v224-guided-presenter-v9.js","test-v224-voice-contextual-v11.html"],
      commits:["6a1b4ba7e5486c02d18e2a5b944016d118960ec2","b92a2db154755cc76386c22e87747fc4de7de3d9"],
      validation:"Régression confirmée par l’utilisateur le 29/09/2026 sur v10. Correctif v11 installé ; validation utilisateur attendue.",
      safeAutoRepair:true
    })
  ]);

  function clone(x){return {...x,files:[...(x.files||[])],commits:[...(x.commits||[])]};}
  function all(){
    const map=new Map(base.all().map(item=>[item.id,clone(item)]));
    OVERRIDES.forEach(item=>map.set(item.id,clone(item)));
    EXTRA.forEach(item=>map.set(item.id,clone(item)));
    return [...map.values()];
  }
  function byId(id){return all().find(x=>x.id===id)||null}
  function byStatus(status){return all().filter(x=>x.status===status)}
  function validated(){return byStatus("repaired-and-validated")}
  function autoRepairable(){return all().filter(x=>x.safeAutoRepair)}
  function pendingValidation(){return all().filter(x=>x.status!=="repaired-and-validated"&&x.status!=="investigated-not-root-cause")}
  function historical(){return base.historical?.()||[]}
  function combined(){
    const map=new Map();
    historical().forEach(item=>map.set(item.id,item));
    all().forEach(item=>map.set(item.id,{...item,source:"repair-catalog"}));
    return [...map.values()];
  }
  function summary(){
    const recent=all(),items=combined();
    return {totalKnown:items.length,recent:recent.length,validated:validated().length,pendingValidation:pendingValidation().length,safeAutoRepair:autoRepairable().length,investigatedNotRootCause:recent.filter(x=>x.status==="investigated-not-root-cause").length};
  }

  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-19",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();