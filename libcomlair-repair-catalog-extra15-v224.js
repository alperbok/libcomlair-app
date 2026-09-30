(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;
  if(!base)return;

  const OVERRIDES=Object.freeze([
    Object.freeze({
      id:"presentation-navigation-choices-not-announced",
      area:"voice-presentation-ui",
      status:"repaired-and-validated",
      symptom:"À la fin de Présentation Libcomlair, les boutons Retour et Suivant étaient visibles mais l’assistance vocale ne proposait pas ces choix.",
      cause:"La v16 chargeait encore libcomlair-v224-presentation-voice-card-v3.js alors que l’annonce finale Suivant / Précédent / Retour était déjà présente dans v4.",
      detection:"Laisser la Présentation aller jusqu’à 10 sur 10 et vérifier qu’une annonce finale propose Suivant pour continuer et Précédent ou Retour pour revenir.",
      repair:"Charger libcomlair-v224-presentation-voice-card-v4.js dans la v16 sans modifier le présentateur v9 ni le reste du parcours validé.",
      files:["libcomlair-v224-presentation-voice-card-v4.js","test-v224-voice-contextual-v16.html"],
      commits:["d1ce3054fb501579a9ba90cc3e638665c20d303f"],
      validation:"Validation utilisateur le 30/09/2026 : « Tout fonctionne ». L’annonce Suivant / Retour est bien proposée après la Présentation.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-pronounces-libcomlair-as-lib-con-lair",
      area:"voice-pronunciation",
      status:"repaired-and-validated",
      symptom:"La voix naturelle prononçait Libcomlair comme « lib con l’air » au lieu de « Lib comme l’air ».",
      cause:"Le moteur envoyait l’orthographe Libcomlair telle quelle à Render, qui devait deviner la prononciation du nom inventé.",
      detection:"Écouter toute annonce contenant Libcomlair et vérifier que la voix dit clairement « Lib comme l’air ».",
      repair:"Conserver l’écriture visuelle Libcomlair. Dans le moteur vocal v191, remplacer uniquement pour la synthèse le mot Libcomlair par « Lib comme l’air ».",
      files:["libcomlair-voice-engine-v191.js","test-v224-voice-contextual-v16.html"],
      commits:["0e36fc2f3cc8eeed29e3a08fcf45dfa98741697c","d1ce3054fb501579a9ba90cc3e638665c20d303f"],
      validation:"Validation auditive utilisateur le 30/09/2026 : « Tout fonctionne ». La prononciation officielle « Lib comme l’air » est correcte.",
      safeAutoRepair:true
    })
  ]);

  const EXTRA=Object.freeze([
    Object.freeze({
      id:"welcome-first-natural-voice-startup-delay",
      area:"voice-performance",
      status:"observed-performance",
      symptom:"Lors de la toute première utilisation, après appui sur Écouter, le message naturel de Bienvenue peut demander environ 2 à 5 secondes avant de commencer. Une réouverture suivante du lien démarre nettement plus vite.",
      cause:"Cause non confirmée. Le comportement est compatible avec un premier chargement à froid : initialisation du chemin Render, première requête réseau et mise en mémoire locale ou distante. Ne pas assimiler ce délai à la panne AudioContext suspended tant que la voix démarre bien après quelques secondes.",
      detection:"Tester après une ouverture réellement à froid puis réouvrir le même lien. Relever le temps entre l’appui sur Écouter et le début réel de la voix. Si le premier démarrage reste autour de 2 à 5 secondes et les suivants sont plus rapides, classer comme performance à surveiller. Si la voix ne démarre pas du tout, utiliser le diagnostic AudioContext/Render existant.",
      repair:"Aucune modification de la voix validée pour l’instant. Conserver la voix naturelle et le flux Écouter → Suivant. Toute optimisation future doit préserver la fiabilité, l’absence de voix robotique et les fonctions déjà validées.",
      files:["libcomlair-render-voice-v196.js","libcomlair-voice-engine-v191.js","libcomlair-v224-welcome-listen-first-v16.js","test-v224-voice-contextual-v16.html"],
      commits:[],
      validation:"Observation utilisateur le 30/09/2026 : première utilisation environ 2 à 5 secondes avant lecture ; seconde réouverture du lien lue assez rapidement. Fonctionnement jugé correct.",
      safeAutoRepair:false
    })
  ]);

  function clone(x){return {...x,files:[...(x.files||[])],commits:[...(x.commits||[])]};}
  function all(){const map=new Map(base.all().map(x=>[x.id,clone(x)]));OVERRIDES.forEach(x=>map.set(x.id,clone(x)));EXTRA.forEach(x=>map.set(x.id,clone(x)));return [...map.values()]}
  function byId(id){return all().find(x=>x.id===id)||null}
  function byStatus(status){return all().filter(x=>x.status===status)}
  function validated(){return byStatus("repaired-and-validated")}
  function autoRepairable(){return all().filter(x=>x.safeAutoRepair)}
  function pendingValidation(){return all().filter(x=>x.status!=="repaired-and-validated"&&x.status!=="investigated-not-root-cause"&&x.status!=="observed-performance")}
  function historical(){return base.historical?.()||[]}
  function combined(){const map=new Map();historical().forEach(x=>map.set(x.id,x));all().forEach(x=>map.set(x.id,{...x,source:"repair-catalog"}));return [...map.values()]}
  function summary(){const recent=all(),items=combined();return {totalKnown:items.length,recent:recent.length,validated:validated().length,pendingValidation:pendingValidation().length,safeAutoRepair:autoRepairable().length,observedPerformance:recent.filter(x=>x.status==="observed-performance").length,investigatedNotRootCause:recent.filter(x=>x.status==="investigated-not-root-cause").length}}

  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-29",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();
