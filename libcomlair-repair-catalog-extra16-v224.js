(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;
  if(!base)return;
  const EXTRA=Object.freeze([
    Object.freeze({
      id:"nearby-search-resets-category-to-all",
      area:"map-search-context",
      status:"confirmed",
      symptom:"Depuis une recherche comme « Tous les magasins », ouvrir Carte puis Autour de moi affiche aussi restaurants, services et transports au lieu de conserver uniquement les magasins.",
      cause:"Cause confirmée dans libcomlair-v221-secure.js : le gestionnaire nearMe remet explicitement active=\"Tous\" et efface toutes les sous-catégories avant de charger les données proches.",
      detection:"Entrer dans une catégorie ou sous-catégorie, ouvrir Carte, lancer Autour de moi et vérifier que la liste et les marqueurs restent dans le périmètre choisi.",
      repair:"La couche v31 mémorise la catégorie/sous-catégorie avant Autour de moi puis réapplique le même choix après l’actualisation. Le mode général Carte et GPS conserve volontairement Toutes les catégories.",
      files:["libcomlair-v224-map-gps-hub-v31.js","libcomlair-v224-map-gps-hub-v31.css","test-v224-voice-contextual-v16.html"],
      commits:["ba01db42641e4f4979f1535efc9977cd1de5ceb0","42b374199bf674f0fd561c10f82ba977ea1d274c"],
      validation:"Cause observée par l’utilisateur à Garches le 30/09/2026. Correctif v31 installé ; validation utilisateur en attente.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"nearby-counter-excludes-transport-from-status",
      area:"map-search-count",
      status:"confirmed",
      symptom:"La carte pouvait annoncer par exemple 116 lieux réels autour de vous alors que Résultats affichait 413 éléments.",
      cause:"Le message nearMe utilisait real.length, qui compte les lieux Geoapify, alors que Résultats ajoute aussi les arrêts IDFM et autres éléments du jeu affiché.",
      detection:"Comparer le message sous Autour de moi avec le compteur Résultats après une recherche géolocalisée.",
      repair:"La couche v31 remplace le message final par le compteur réellement affiché : en mode général, total toutes catégories, lieux et transports compris ; en mode catégorie, total de la catégorie restaurée.",
      files:["libcomlair-v224-map-gps-hub-v31.js"],
      commits:["ba01db42641e4f4979f1535efc9977cd1de5ceb0"],
      validation:"Incohérence observée à Garches le 30/09/2026. Correctif en attente de validation utilisateur.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"map-and-accessible-gps-two-mode-hub",
      area:"map-gps-product-flow",
      status:"prototype-awaiting-validation",
      symptom:"La carte était accessible seulement depuis les résultats et mélangeait recherche de proximité, localisation d’un lieu et futur guidage GPS.",
      cause:"Une seule carte devait remplir plusieurs usages sans écran d’entrée ni distinction de mode.",
      detection:"Sur la page de recherche, vérifier la présence de Carte et GPS avant la recherche classique avec deux choix distincts.",
      repair:"Créer un hub Carte et GPS avec Mode Recherche autour de moi et Mode GPS accessible — Projet. Ajouter « Y aller avec le GPS » aux résultats et fiches pour transmettre directement la destination au futur GPS.",
      files:["libcomlair-v224-map-gps-hub-v31.js","libcomlair-v224-map-gps-hub-v31.css","test-v224-voice-contextual-v16.html"],
      commits:["ba01db42641e4f4979f1535efc9977cd1de5ceb0","42b374199bf674f0fd561c10f82ba977ea1d274c"],
      validation:"Architecture approuvée par l’utilisateur le 30/09/2026. Prototype installé ; validation visuelle et fonctionnelle en attente.",
      safeAutoRepair:false
    }),
    Object.freeze({
      id:"idfm-same-stop-name-multiple-points-unclear",
      area:"transport-results",
      status:"confirmed",
      symptom:"Plusieurs fiches Hôpital de Garches apparaissent avec le même nom mais des identifiants différents, donnant une impression de doublons.",
      cause:"Les données IDFM contiennent plusieurs points/identifiants pouvant représenter des quais, directions ou zones d’arrêt différentes. Il ne faut pas les supprimer sans vérifier leur rôle voyageur.",
      detection:"Pour un nom d’arrêt répété, comparer identifiant, commune, adresse, lignes et direction avant tout regroupement.",
      repair:"À concevoir : regrouper visuellement les points appartenant au même arrêt voyageur tout en conservant les identifiants, lignes et directions distincts. Aucun dédoublonnage destructif automatique.",
      files:["libcomlair-v221-secure.js"],
      commits:[],
      validation:"Observation utilisateur à Garches le 30/09/2026. Analyse détaillée et validation du futur regroupement encore à faire.",
      safeAutoRepair:false
    })
  ]);
  function clone(x){return {...x,files:[...(x.files||[])],commits:[...(x.commits||[])]};}
  function all(){const map=new Map(base.all().map(x=>[x.id,clone(x)]));EXTRA.forEach(x=>map.set(x.id,clone(x)));return [...map.values()]}
  function byId(id){return all().find(x=>x.id===id)||null}
  function byStatus(status){return all().filter(x=>x.status===status)}
  function validated(){return byStatus("repaired-and-validated")}
  function autoRepairable(){return all().filter(x=>x.safeAutoRepair)}
  function pendingValidation(){return all().filter(x=>!["repaired-and-validated","investigated-not-root-cause","observed-performance"].includes(x.status))}
  function historical(){return base.historical?.()||[]}
  function combined(){const map=new Map();historical().forEach(x=>map.set(x.id,x));all().forEach(x=>map.set(x.id,{...x,source:"repair-catalog"}));return [...map.values()]}
  function summary(){const recent=all(),items=combined();return {totalKnown:items.length,recent:recent.length,validated:validated().length,pendingValidation:pendingValidation().length,safeAutoRepair:autoRepairable().length,investigatedNotRootCause:recent.filter(x=>x.status==="investigated-not-root-cause").length}}
  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-31",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();