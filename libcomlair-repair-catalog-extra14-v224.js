(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;
  if(!base)return;

  const OVERRIDES=Object.freeze([
    Object.freeze({
      id:"presentation-navigation-choices-not-announced",
      area:"voice-presentation-ui",
      status:"confirmed",
      symptom:"À la fin de Présentation Libcomlair, les boutons Retour et Suivant sont visibles mais l’assistance vocale ne propose toujours pas ces choix.",
      cause:"Cause confirmée le 30/09/2026 : le fichier libcomlair-v224-presentation-voice-card-v4.js contient bien l’annonce finale Suivant / Précédent / Retour, mais test-v224-voice-contextual-v16.html chargeait encore libcomlair-v224-presentation-voice-card-v3.js.",
      detection:"Sur Présentation Libcomlair, laisser la lecture aller jusqu’à 10 sur 10. Après la dernière rubrique, vérifier qu’une annonce finale propose Suivant pour continuer et Précédent ou Retour pour revenir.",
      repair:"Charger la carte vocale v4 dans la version de test active. Ne modifier ni le présentateur v9 ni le parcours déjà validé. La carte v4 effectue l’annonce de navigation avant de signaler la fin de la présentation.",
      files:["libcomlair-v224-presentation-voice-card-v4.js","test-v224-voice-contextual-v16.html"],
      commits:[],
      validation:"Cause confirmée par test utilisateur le 30/09/2026 : Suivant et Retour ne sont toujours pas proposés avec la v16 qui charge v3. Correctif de chargement v4 installé ; validation utilisateur en attente.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-pronounces-libcomlair-as-lib-con-lair",
      area:"voice-pronunciation",
      status:"confirmed",
      symptom:"La voix naturelle prononce le nom Libcomlair comme « lib con l’air » d’une traite, alors que le nom est l’abréviation de « libre comme l’air » et doit se prononcer « Lib comme l’air ».",
      cause:"Le moteur vocal envoyait l’orthographe visible Libcomlair telle quelle à Render. La synthèse devait donc deviner la prononciation d’un nom inventé et choisissait une lecture incorrecte.",
      detection:"Écouter toute phrase contenant Libcomlair, notamment le message d’accueil ou l’introduction de Présentation Libcomlair. Vérifier que la voix dit clairement « Lib comme l’air ».",
      repair:"Conserver l’écriture visuelle Libcomlair partout. Dans le moteur vocal v191, normaliser uniquement le texte envoyé à Render en remplaçant le mot Libcomlair par « Lib comme l’air ». Cette règle s’applique globalement à toutes les annonces naturelles sans modifier les textes affichés ni les données.",
      files:["libcomlair-voice-engine-v191.js","test-v224-voice-contextual-v16.html"],
      commits:["0e36fc2f3cc8eeed29e3a08fcf45dfa98741697c"],
      validation:"Prononciation souhaitée définie par l’utilisateur le 30/09/2026. Correctif v191 installé ; validation auditive utilisateur en attente.",
      safeAutoRepair:true
    })
  ]);

  function clone(x){return {...x,files:[...(x.files||[])],commits:[...(x.commits||[])]};}
  function all(){const map=new Map(base.all().map(x=>[x.id,clone(x)]));OVERRIDES.forEach(x=>map.set(x.id,clone(x)));return [...map.values()]}
  function byId(id){return all().find(x=>x.id===id)||null}
  function byStatus(status){return all().filter(x=>x.status===status)}
  function validated(){return byStatus("repaired-and-validated")}
  function autoRepairable(){return all().filter(x=>x.safeAutoRepair)}
  function pendingValidation(){return all().filter(x=>x.status!=="repaired-and-validated"&&x.status!=="investigated-not-root-cause")}
  function historical(){return base.historical?.()||[]}
  function combined(){const map=new Map();historical().forEach(x=>map.set(x.id,x));all().forEach(x=>map.set(x.id,{...x,source:"repair-catalog"}));return [...map.values()]}
  function summary(){const recent=all(),items=combined();return {totalKnown:items.length,recent:recent.length,validated:validated().length,pendingValidation:pendingValidation().length,safeAutoRepair:autoRepairable().length,investigatedNotRootCause:recent.filter(x=>x.status==="investigated-not-root-cause").length}}

  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-28",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();
