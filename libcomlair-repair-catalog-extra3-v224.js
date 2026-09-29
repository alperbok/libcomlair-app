(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;
  if(!base)return;

  const EXTRA=Object.freeze([
    Object.freeze({
      id:"voice-mode-legacy-render-overlap-persistent",
      area:"layout",
      status:"confirmed",
      symptom:"À l’ouverture de Navigation vocale, l’ancienne présentation apparaît encore brièvement derrière la nouvelle avant que la version finale prenne sa place.",
      cause:"Le conteneur vocal historique pouvait être rendu avant que la classe de sous-écran et la mise en page finale soient complètement appliquées.",
      detection:"Ouvrir Navigation vocale plusieurs fois et observer si un ancien texte, ancien positionnement ou double rendu apparaît pendant la transition.",
      repair:"Masquer entièrement visionVoiceControls tant que v224-voice-layout-ready n’est pas présent, cacher ce conteneur sur les autres sous-écrans de la page 3, appliquer la mise en page finale puis rendre le conteneur visible après deux frames d’affichage.",
      files:["libcomlair-v224-page-coherence.css","libcomlair-v224-page-coherence.js"],
      commits:["01c37957695aa4733c8d4e03ed7f57f2b95cb594","b1094dc770efe00dde3beaeab5724ad80aada721"],
      validation:"Correction renforcée le 29/09/2026 après nouvelle capture utilisateur. Validation visuelle encore nécessaire.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"presentation-page-long-scroll",
      area:"content",
      status:"confirmed",
      symptom:"Présentation Libcomlair devient très longue lorsque toutes les explications restent ouvertes en permanence et nécessite un défilement important.",
      cause:"Chaque rubrique était affichée comme un bloc complet au lieu d’être consultable à la demande.",
      detection:"Compter les rubriques visibles simultanément et vérifier si le contenu complet de chacune est affiché sans action de l’utilisateur.",
      repair:"Transformer les rubriques en accordéons compacts. Pendant la lecture vocale, ouvrir automatiquement une rubrique, la lire, la refermer puis ouvrir la suivante. Permettre l’ajout futur de nouvelles rubriques sans allonger fortement la page.",
      files:["libcomlair-v224-page-coherence.js","libcomlair-v224-page-coherence.css"],
      commits:["01c37957695aa4733c8d4e03ed7f57f2b95cb594","b1094dc770efe00dde3beaeab5724ad80aada721"],
      validation:"Nouvelle structure installée le 29/09/2026 ; validation utilisateur attendue.",
      safeAutoRepair:false
    }),
    Object.freeze({
      id:"home-search-underfilled-screen",
      area:"layout",
      status:"confirmed",
      symptom:"Accueil / Recherche laisse une grande zone vide sous les actions alors que le contenu explicatif pourrait mieux occuper la page.",
      cause:"La notice a été compactée fortement lors de la suppression des anciens raccourcis et ne possède plus de hauteur minimale adaptée à l’écran mobile.",
      detection:"Sur téléphone, vérifier si une grande zone blanche reste inutilisée sous Retour / Rechercher alors que les deux boutons tiennent encore confortablement à l’écran.",
      repair:"Augmenter légèrement la hauteur minimale, le padding et l’interligne de la notice sans repousser les actions hors de l’écran.",
      files:["libcomlair-v224-page-coherence.css"],
      commits:["b1094dc770efe00dde3beaeab5724ad80aada721"],
      validation:"Ajustement installé le 29/09/2026 ; validation utilisateur attendue.",
      safeAutoRepair:false
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
    return {
      totalKnown:items.length,
      recent:recent.length,
      validated:recent.filter(x=>x.status==="repaired-and-validated").length,
      pendingValidation:recent.filter(x=>x.status!=="repaired-and-validated").length,
      safeAutoRepair:recent.filter(x=>x.safeAutoRepair).length
    };
  }

  window.LibcomlairRepairCatalog=Object.freeze({
    version:"v224-8",
    all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary
  });
})();