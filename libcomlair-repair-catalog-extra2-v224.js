(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;
  if(!base)return;

  const ISSUES=Object.freeze([
    Object.freeze({
      id:"onboarding-javascript-class-observer-loop",
      area:"performance",
      status:"confirmed",
      symptom:"La page d’accueil devient totalement non réactive et Samsung Browser affiche « La page ne répond plus ». Le bouton Suivant ne peut alors plus fonctionner.",
      cause:"Une couche de cohérence observait les changements de classe du body tout en retirant puis réajoutant elle-même une classe de mise en page. Sur certaines transitions, cette interaction pouvait produire une boucle JavaScript continue.",
      detection:"Vérifier qu’aucun MutationObserver de classe ne déclenche une fonction qui modifie à nouveau les mêmes classes sans garde. Contrôler aussi qu’une ouverture simple de la page reste fluide avant tout clic.",
      repair:"Supprimer l’observation permanente des classes pour cette couche, rendre la stabilisation idempotente, ne modifier v224-voice-layout-ready que si nécessaire et déclencher les synchronisations uniquement sur les événements d’onboarding/pageshow.",
      files:["libcomlair-v224-page-coherence.js","test-v224-voice-contextual-v7.html"],
      commits:["74a8c2f0d1052bf10e8a7fd5f68744cfcd85ea3b"],
      validation:"Cause corrigée le 29/09/2026 après capture utilisateur montrant le message Samsung Browser « La page ne répond plus ».",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"welcome-profile-click-through",
      area:"navigation",
      status:"confirmed",
      symptom:"Après Suivant, la page de choix du profil apparaît une fraction de seconde puis l’application passe immédiatement à Navigation vocale sans laisser le temps de choisir un handicap.",
      cause:"Le correctif de transition ouvrait le profil dès pointerup. Le navigateur générait ensuite le click du même geste à la même position, qui pouvait activer Valider ou Sans adaptation sur la nouvelle page.",
      detection:"Après Suivant, vérifier que le profil reste affiché jusqu’à une action explicite sur Valider ou Sans adaptation et qu’aucune transition ne se produit dans les 650 ms suivant son ouverture.",
      repair:"Supprimer le gestionnaire pointerup, conserver uniquement le click de Suivant et bloquer brièvement les actions de profil immédiatement après l’ouverture pour empêcher tout clic traversant.",
      files:["libcomlair-v224-welcome-transition-hotfix.js","test-v224-voice-contextual-v7.html"],
      commits:["216c7ee9a3ba95999d96a85cbd696a8e0d089328","408c47963b67b0d4f3e5487d8874869236c9446d"],
      validation:"Correction installée le 29/09/2026 ; validation utilisateur immédiate attendue.",
      safeAutoRepair:true
    })
  ]);

  function clone(x){return {...x,files:[...(x.files||[])],commits:[...(x.commits||[])]};}
  function all(){
    const items=base.all().map(clone);
    ISSUES.forEach(issue=>{if(!items.some(x=>x.id===issue.id))items.push(clone(issue));});
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
