(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;
  if(!base)return;
  const EXTRA=Object.freeze([
    Object.freeze({
      id:"map-gps-v31-freezes-samsung-browser",
      area:"map-gps-performance",
      status:"repaired-and-validated",
      symptom:"Après l’installation de Carte et GPS v31, Samsung Browser affiche « La page ne répond plus » puis « L’onglet ne répond pas » dès l’ouverture de Libcomlair.",
      cause:"Le MutationObserver de la couche v31 surveillait les changements du DOM et updateNearMeLabel réécrivait le texte du bouton Autour de moi à chaque passage. Cette réécriture déclenchait une nouvelle observation et créait une boucle continue.",
      detection:"Sur Samsung Browser, ouvrir la v16 et vérifier que la page reste réactive au lancement. Dans le code v31, contrôler que le texte du bouton n’est réécrit que lorsqu’il change réellement.",
      repair:"Correctif v31.1 : comparer le libellé souhaité au texte actuel avant toute modification du bouton. Le cache de la v16 a été incrémenté pour empêcher le téléphone de réutiliser l’ancien script.",
      files:["libcomlair-v224-map-gps-hub-v31.js","test-v224-voice-contextual-v16.html"],
      commits:["ec85a456307c1da776bd78d1f71792c6156dbeb8","36fe9be9c33d6113c1942310954dcf83338d9391"],
      validation:"Validation utilisateur le 30/09/2026 : après le correctif, Libcomlair s’ouvre de nouveau et la page Carte et GPS s’affiche sans blocage du navigateur.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"map-gps-hub-overlaps-search-page",
      area:"map-gps-layout",
      status:"repaired-awaiting-validation",
      symptom:"Carte et GPS apparaît au-dessus de Trouvez un lieu accessible et des catégories sur le même écran, donnant l’impression que deux pages se chevauchent et laissant le menu, le logo et le micro trop proches du contenu.",
      cause:"La première version du hub était injectée directement dans v224Page4SearchIntro sans créer une étape de navigation distincte.",
      detection:"Depuis Accueil / Recherche, choisir Rechercher. Carte et GPS doit occuper seul l’écran applicatif avec le menu, le logo et le micro en haut et Retour / Suivant en bas. La recherche classique et les catégories ne doivent pas être visibles simultanément.",
      repair:"La couche v32 transforme le hub existant en étape séparée. Retour revient à Accueil / Recherche. Suivant masque Carte et GPS et révèle la recherche classique. Les modes Recherche autour de moi et GPS restent accessibles dans cette étape.",
      files:["libcomlair-v224-map-gps-page-v32.js","libcomlair-v224-map-gps-page-v32.css","test-v224-voice-contextual-v16.html"],
      commits:["436348449e3eaf8f1c9b088dc1ddc7f8cb6e08f1","38dda978c81ec0382e8bced605ba65882f4aae7c"],
      validation:"Correction v32 installée le 30/09/2026 ; validation visuelle utilisateur en attente.",
      safeAutoRepair:false
    }),
    Object.freeze({
      id:"guided-home-reads-summary-instead-of-full-visible-explanation",
      area:"voice-guided-discovery",
      status:"repaired-awaiting-validation",
      symptom:"Sur Accueil / Recherche, le mode Découverte guidée ne lit qu’un résumé alors que plusieurs paragraphes explicatifs sont affichés à l’écran.",
      cause:"libcomlair-v224-page-coherence.js remplaçait la description de onboarding-home par PAGE_VOICE, une phrase vocale raccourcie, quel que soit le niveau d’assistance.",
      detection:"Activer Découverte guidée, ouvrir Accueil / Recherche et comparer mot à mot les paragraphes visibles avec l’annonce vocale. Tous les paragraphes doivent être lus avant les actions finales.",
      repair:"La couche v32 fournit deux contenus distincts : en Découverte guidée, HOME_TEXT complet est envoyé au moteur naturel Render ; en Simplifié, un résumé court est conservé.",
      files:["libcomlair-v224-gps-explanations-v32.js","test-v224-voice-contextual-v16.html"],
      commits:["2f9d83007cb3b79e26e0a9bd53eb15cd8eff1aeb"],
      validation:"Correctif installé le 30/09/2026 ; validation vocale utilisateur en attente.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"gps-role-missing-from-presentation-and-home-explanations",
      area:"guided-content",
      status:"repaired-awaiting-validation",
      symptom:"Les écrans Présentation Libcomlair et Accueil / Recherche décrivent encore l’ancienne recherche et n’expliquent pas le nouveau rôle de Carte et GPS, Recherche autour de moi et Y aller avec le GPS.",
      cause:"Les textes pédagogiques ont été créés avant l’architecture Carte/GPS v31-v32.",
      detection:"Vérifier la rubrique Carte / GPS accessible dans Présentation et les paragraphes d’Accueil / Recherche. Les deux usages doivent être expliqués avec un niveau de détail adapté à chaque écran.",
      repair:"Présentation reçoit une explication détaillée affichée dans un cadre central et lue par la voix. Accueil / Recherche reçoit une version plus courte conçue pour tenir sur l’écran. La page Carte/GPS possède aussi sa propre annonce vocale contextuelle.",
      files:["libcomlair-v224-gps-explanations-v32.js","libcomlair-v224-presentation-voice-card-v5.js","libcomlair-v224-presentation-detail-v32.js","libcomlair-v224-presentation-detail-v32.css","libcomlair-v224-map-gps-voice-v32.js"],
      commits:["2f9d83007cb3b79e26e0a9bd53eb15cd8eff1aeb","fb706a706ced2704129508d75c210cffc6dff585","104779fe885d10e5d9ac068d6b6aa854385cc4ce","379e92810356c04430a445a8cb451b0f953326b3","a0cde52236c0f2e774a6a35b1d371eb259a5a5ce"],
      validation:"Contenu v32 installé le 30/09/2026 ; validation utilisateur en attente.",
      safeAutoRepair:false
    })
  ]);
  function clone(x){return {...x,files:[...(x.files||[])],commits:[...(x.commits||[])]}}
  function all(){const map=new Map(base.all().map(x=>[x.id,clone(x)]));EXTRA.forEach(x=>map.set(x.id,clone(x)));return [...map.values()]}
  function byId(id){return all().find(x=>x.id===id)||null}
  function byStatus(status){return all().filter(x=>x.status===status)}
  function validated(){return byStatus("repaired-and-validated")}
  function autoRepairable(){return all().filter(x=>x.safeAutoRepair)}
  function pendingValidation(){return all().filter(x=>!["repaired-and-validated","investigated-not-root-cause","observed-performance"].includes(x.status))}
  function historical(){return base.historical?.()||[]}
  function combined(){const map=new Map();historical().forEach(x=>map.set(x.id,x));all().forEach(x=>map.set(x.id,{...x,source:"repair-catalog"}));return [...map.values()]}
  function summary(){const recent=all(),items=combined();return {totalKnown:items.length,recent:recent.length,validated:validated().length,pendingValidation:pendingValidation().length,safeAutoRepair:autoRepairable().length,investigatedNotRootCause:recent.filter(x=>x.status==="investigated-not-root-cause").length}}
  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-32",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();