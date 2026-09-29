(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;
  if(!base)return;

  const OVERRIDES=Object.freeze([
    Object.freeze({
      id:"presentation-replays-after-complete",
      area:"voice-presentation-ui",
      status:"repaired-and-validated",
      symptom:"Après lecture des 10 rubriques, Présentation Libcomlair recommençait automatiquement depuis 1 sur 10.",
      cause:"Plusieurs événements de la même page pouvaient redemander la présentation après sa fin.",
      detection:"Laisser la Présentation aller jusqu’à 10 sur 10 sans toucher l’écran et vérifier qu’elle ne repart pas.",
      repair:"Utiliser un présentateur unique qui mémorise l’identité de la page déjà lue et une carte de présentation passive.",
      files:["libcomlair-v224-guided-presenter-v9.js","libcomlair-v224-presentation-voice-card-v3.js","test-v224-voice-contextual-v11.html"],
      commits:["6a1b4ba7e5486c02d18e2a5b944016d118960ec2","b92a2db154755cc76386c22e87747fc4de7de3d9"],
      validation:"Validé par l’utilisateur le 29/09/2026 sur v11 : plus aucun replay après la présentation.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"profile-voice-silent-after-v10",
      area:"voice-navigation",
      status:"repaired-and-validated",
      symptom:"Sur v10, la page Profil n’avait plus d’annonce vocale automatique.",
      cause:"Le Profil dépendait encore d’un ancien chemin indirect de lecture.",
      detection:"Depuis Bienvenue, passer au Profil et vérifier qu’une annonce vocale naturelle démarre.",
      repair:"Faire lire le Profil directement par le présentateur unique v9.",
      files:["libcomlair-v224-guided-presenter-v9.js","test-v224-voice-contextual-v11.html"],
      commits:["6a1b4ba7e5486c02d18e2a5b944016d118960ec2","b92a2db154755cc76386c22e87747fc4de7de3d9"],
      validation:"Validé par l’utilisateur le 29/09/2026 sur v11 : l’assistance vocale est revenue sur le Profil.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-stops-on-search-categories-and-deep-pages",
      area:"voice-navigation",
      status:"repaired-and-validated",
      symptom:"La voix disparaissait dès Recherche/Catégories puis restait absente jusqu’à la fiche détaillée.",
      cause:"Le contexte profond et le déclenchement vocal étaient répartis entre plusieurs couches.",
      detection:"Parcourir Recherche/Catégories → catégorie → sous-catégorie → résultats → fiche détaillée et vérifier une annonce à chaque transition.",
      repair:"Utiliser le contexte profond v11 et un présentateur unique v9 qui lit directement toutes les pages profondes avec la voix naturelle Render.",
      files:["libcomlair-v224-deep-context-v11.js","libcomlair-v224-guided-presenter-v9.js","test-v224-voice-contextual-v11.html"],
      commits:["1583d8fbfc37e36f4491a817abe88b2b43a8ba94","6a1b4ba7e5486c02d18e2a5b944016d118960ec2","b92a2db154755cc76386c22e87747fc4de7de3d9"],
      validation:"Validé par l’utilisateur le 29/09/2026 sur v11 : assistance vocale active jusqu’à la fiche détaillée.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-first-screen-silent-android-audio-locked",
      area:"voice-audio",
      status:"confirmed",
      symptom:"La première page d’accueil/Bienvenue reste silencieuse alors que le parcours suivant fonctionne.",
      cause:"Android peut bloquer Web Audio avant le premier geste utilisateur.",
      detection:"Au premier écran, vérifier si aucune voix ne démarre avant interaction alors que Render fonctionne ensuite.",
      repair:"Ne jamais utiliser une voix robotique. Sur v12, le premier appui sur Suivant déverrouille Render, lit l’accueil avec la voix naturelle, puis ouvre le Profil. Un second appui pendant la lecture permet de passer immédiatement.",
      files:["libcomlair-v224-welcome-natural-voice-v12.js","libcomlair-render-voice-v196.js","test-v224-voice-contextual-v12.html"],
      commits:["a9a0581722d880a3b52aaf40c7ab54008a78c2be"],
      validation:"Correctif v12 installé le 29/09/2026 ; validation utilisateur attendue.",
      safeAutoRepair:true
    })
  ]);

  const EXTRA=Object.freeze([
    Object.freeze({
      id:"presentation-navigation-choices-not-announced",
      area:"voice-presentation-ui",
      status:"confirmed",
      symptom:"La Présentation se termine correctement mais l’assistance ne propose pas vocalement Suivant ou Précédent/Retour alors que les boutons sont visibles.",
      cause:"La carte vocale terminait la séquence directement après 10 sur 10 sans annoncer les actions de navigation disponibles.",
      detection:"Laisser la Présentation se terminer et écouter si les boutons visibles Suivant et Retour/Précédent sont proposés.",
      repair:"Après 10 sur 10, annoncer : Suivant pour continuer, Précédent ou Retour pour revenir. Le routeur vocal possède déjà ces commandes courtes.",
      files:["libcomlair-v224-presentation-voice-card-v4.js","libcomlair-v224-voice-router.js","test-v224-voice-contextual-v12.html"],
      commits:["037f249f51e7df1d5991c1317e5f545c43a4b96f"],
      validation:"Correctif v12 installé le 29/09/2026 ; validation utilisateur attendue.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"settings-menu-opened-without-voice-guidance",
      area:"voice-menu",
      status:"confirmed",
      symptom:"Le menu Assistance et réglages est accessible visuellement et au micro, mais son ouverture manuelle n’annonce pas ses choix.",
      cause:"L’ancienne version ne parlait automatiquement que lorsque le menu était ouvert par la commande vocale Réglages.",
      detection:"Ouvrir le menu avec le bouton trois tirets en profil Vision et vérifier si les choix visibles sont annoncés.",
      repair:"À chaque ouverture du menu pour le profil Vision, annoncer les choix visibles. En Découverte guidée, lire la liste ; en Simplifié, annoncer une consigne courte. Les boutons restent commandables par leur nom grâce au routeur vocal.",
      files:["libcomlair-v224-global-assistance.js","libcomlair-v224-voice-router.js","test-v224-voice-contextual-v12.html"],
      commits:["7c75e7dece1cfe704968fd83ef8bca42152f1b94"],
      validation:"Correctif v12 installé le 29/09/2026 ; validation utilisateur attendue.",
      safeAutoRepair:true
    })
  ]);

  function clone(x){return {...x,files:[...(x.files||[])],commits:[...(x.commits||[])]};}
  function all(){const map=new Map(base.all().map(x=>[x.id,clone(x)]));OVERRIDES.forEach(x=>map.set(x.id,clone(x)));EXTRA.forEach(x=>map.set(x.id,clone(x)));return [...map.values()]}
  function byId(id){return all().find(x=>x.id===id)||null}
  function byStatus(status){return all().filter(x=>x.status===status)}
  function validated(){return byStatus("repaired-and-validated")}
  function autoRepairable(){return all().filter(x=>x.safeAutoRepair)}
  function pendingValidation(){return all().filter(x=>x.status!=="repaired-and-validated"&&x.status!=="investigated-not-root-cause")}
  function historical(){return base.historical?.()||[]}
  function combined(){const map=new Map();historical().forEach(x=>map.set(x.id,x));all().forEach(x=>map.set(x.id,{...x,source:"repair-catalog"}));return [...map.values()]}
  function summary(){const recent=all(),items=combined();return {totalKnown:items.length,recent:recent.length,validated:validated().length,pendingValidation:pendingValidation().length,safeAutoRepair:autoRepairable().length,investigatedNotRootCause:recent.filter(x=>x.status==="investigated-not-root-cause").length}}
  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-20",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();