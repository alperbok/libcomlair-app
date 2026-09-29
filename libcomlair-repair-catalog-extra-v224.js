(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;
  if(!base)return;

  const EXTRA=Object.freeze([
    Object.freeze({
      id:"onboarding-page-order-and-content-leak",
      area:"navigation",
      status:"repaired-and-validated",
      symptom:"La page Mes besoins d’accessibilité ou son contenu reste visible au-dessus d’autres écrans et l’ordre du parcours devient incohérent.",
      cause:"Les écrans d’onboarding partageaient des conteneurs dont la visibilité n’était pas suffisamment isolée.",
      detection:"Vérifier qu’un seul écran d’onboarding est visible et que l’ordre Profil → Navigation vocale → Présentation → Mes besoins → Accueil/Recherche est respecté.",
      repair:"Masquer explicitement les sections non actives et faire piloter l’ordre par le gestionnaire d’onboarding.",
      files:["libcomlair-v224-onboarding-screens.js","libcomlair-v224-onboarding-visibility-guard.js"],
      commits:[],
      validation:"Ordre et séparation visuelle vérifiés par les captures utilisateur de septembre 2026.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"onboarding-header-hidden-on-voice-tutorial",
      area:"layout",
      status:"repaired-and-validated",
      symptom:"Menu, logo et micro disparaissent sur Navigation vocale et Présentation Libcomlair.",
      cause:"L’en-tête commun était inclus dans une section masquée lorsque le contenu Mes besoins était caché.",
      detection:"Sur chaque écran d’onboarding après le profil, vérifier la présence du menu, du logo et du micro.",
      repair:"Conserver l’en-tête commun visible indépendamment du contenu spécifique de Mes besoins.",
      files:["libcomlair-v224-page3-header-guard.js","libcomlair-v224-onboarding-visibility-guard.js"],
      commits:[],
      validation:"Captures utilisateur suivantes montrant le menu, le logo et le micro sur Navigation vocale.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"header-logo-left-artifact",
      area:"layout",
      status:"repaired-and-validated",
      symptom:"Une tache ou un morceau bleu apparaît à gauche du logo dans les en-têtes.",
      cause:"Le fichier de logo historique contient une zone parasite et les recadrages CSS successifs pouvaient aussi couper le début du logo.",
      detection:"Comparer le logo d’en-tête avec le logo de référence : aucune tache, aucune lettre coupée et aucun rectangle bleu ne doivent être visibles.",
      repair:"Générer/afficher une copie propre du logo pour les en-têtes au lieu d’empiler des recadrages CSS.",
      files:["libcomlair-v224-clean-logo.js","libcomlair-v224-logo-cleanup.css"],
      commits:[],
      validation:"Logo propre observé sur les captures utilisateur du 29/09/2026.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"needs-page-mobile-overflow",
      area:"layout",
      status:"confirmed",
      symptom:"La page Mes besoins d’accessibilité dépasse la hauteur de l’écran alors qu’un seul handicap est ouvert.",
      cause:"Espacements, hauteurs des lignes de critères et boutons trop grands pour la hauteur mobile disponible.",
      detection:"Avec un seul besoin ouvert, comparer scrollHeight à la hauteur utile de l’écran ; plusieurs besoins peuvent volontairement défiler.",
      repair:"Compacter légèrement les espacements et hauteurs tout en conservant de grandes cibles tactiles ; autoriser le défilement lorsque plusieurs handicaps sont sélectionnés.",
      files:["libcomlair-v224-needs-step.css","libcomlair-v224-needs-scroll.css"],
      commits:[],
      validation:"Correction installée ; validation finale de toutes les combinaisons encore nécessaire.",
      safeAutoRepair:false
    }),
    Object.freeze({
      id:"needs-profile-selection-not-propagated",
      area:"navigation",
      status:"confirmed",
      symptom:"Après avoir choisi Vision ou plusieurs handicaps, Mes besoins affiche Aucune adaptation et les dossiers correspondants restent fermés.",
      cause:"La sélection du profil n’était pas toujours enregistrée avant le changement d’écran.",
      detection:"Comparer les cases cochées du profil avec LibcomlairAccessibility.read().needs et les dossiers ouverts de Mes besoins.",
      repair:"Synchroniser le profil au clic Valider/Sans adaptation puis ouvrir automatiquement les dossiers correspondant aux besoins enregistrés.",
      files:["libcomlair-v224-needs-profile-sync.js","libcomlair-v224-onboarding-screens.js"],
      commits:[],
      validation:"Correction installée ; test multi-handicap complet encore nécessaire.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-mode-old-new-layout-flash",
      area:"layout",
      status:"confirmed",
      symptom:"À l’ouverture de Navigation vocale, l’ancienne présentation apparaît brièvement derrière la nouvelle.",
      cause:"L’ancienne structure est rendue avant que les scripts de mise en page finale aient terminé leur transformation.",
      detection:"Ouvrir Navigation vocale plusieurs fois et vérifier qu’aucun ancien texte ou ancien positionnement ne clignote avant la version finale.",
      repair:"Masquer la zone de choix pendant la transformation et ne la rendre visible qu’après application de la mise en page finale.",
      files:["libcomlair-v224-page-coherence.css","libcomlair-v224-page-coherence.js","libcomlair-v224-voice-mode-layout-v3.js"],
      commits:[],
      validation:"Correction installée le 29/09/2026 ; validation utilisateur encore nécessaire.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"home-search-page-redundant-controls",
      area:"layout",
      status:"confirmed",
      symptom:"Accueil / Recherche est trop long et répète Présentation Libcomlair, Arrêter la lecture, Navigation vocale et Comment fonctionne Libcomlair.",
      cause:"Des raccourcis historiques sont restés sur la page alors que ces fonctions ont désormais leurs propres écrans ou le menu.",
      detection:"Sur Accueil / Recherche, vérifier qu’il ne reste qu’une notice d’utilisation et les actions Retour/Rechercher.",
      repair:"Retirer les blocs redondants et afficher une notice courte dédiée au but et à l’utilisation de la page.",
      files:["libcomlair-v224-home-notice.js","libcomlair-v224-page-coherence.js","libcomlair-v224-page-coherence.css"],
      commits:[],
      validation:"Nouvelle structure installée ; validation utilisateur encore nécessaire.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"presentation-page-incomplete-and-undersized",
      area:"content",
      status:"confirmed",
      symptom:"La page Comment fonctionne Libcomlair occupe peu d’espace et ne constitue pas une présentation complète de l’application.",
      cause:"Le contenu historique était conçu comme un petit encart d’aide et non comme une page dédiée.",
      detection:"Vérifier le titre Présentation Libcomlair et la présence de sections sur le but, le profil, la recherche, les informations, l’assistance vocale et les mises à jour.",
      repair:"Transformer l’ancien encart en page Présentation Libcomlair plus complète, sans détailler les critères qui appartiennent à Mes besoins.",
      files:["libcomlair-v224-page-coherence.js","libcomlair-v224-page-coherence.css"],
      commits:[],
      validation:"Nouvelle présentation installée ; validation utilisateur encore nécessaire.",
      safeAutoRepair:false
    }),
    Object.freeze({
      id:"voice-page-context-cross-talk",
      area:"voice",
      status:"confirmed",
      symptom:"L’assistance vocale parle de critères d’accessibilité sur une page qui ne les présente pas.",
      cause:"Les explications vocales étaient trop générales et réutilisaient du contenu provenant d’autres écrans.",
      detection:"Comparer le texte lu au contenu visible : Accueil parle de recherche, Navigation vocale des modes, Présentation du fonctionnement général et Mes besoins des critères.",
      repair:"Attribuer un texte vocal contextuel propre à chaque écran et réserver le détail des critères à Mes besoins d’accessibilité.",
      files:["libcomlair-v224-page-coherence.js","libcomlair-v224-needs-voice-groups.js","libcomlair-v224-voice-completeness.js"],
      commits:[],
      validation:"Règles installées ; audit vocal page par page prévu après validation visuelle.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"global-menu-help-technical-mixed-and-tall",
      area:"layout",
      status:"confirmed",
      symptom:"Les fonctions d’aide et les outils techniques sont mélangés et le menu dépasse la hauteur de l’écran.",
      cause:"Absence de regroupement fonctionnel et espacements hérités trop importants.",
      detection:"Vérifier deux cadres distincts Aide et utilisation / Outils techniques et contrôler que le menu tient mieux sur mobile.",
      repair:"Encadrer les quatre fonctions d’aide séparément des outils techniques et réduire marges, gaps et hauteurs sans réduire les cibles tactiles sous un niveau accessible.",
      files:["libcomlair-v224-menu-groups.js","libcomlair-v224-menu-compact.css"],
      commits:[],
      validation:"Correction installée ; validation utilisateur encore nécessaire.",
      safeAutoRepair:false
    }),
    Object.freeze({
      id:"welcome-next-button-blocked",
      area:"navigation",
      status:"confirmed",
      symptom:"Sur la grande page d’accueil illustrée, le bouton Suivant ne produit plus aucun changement d’écran.",
      cause:"Le gestionnaire historique du bouton n’est plus garanti dans toutes les combinaisons de scripts de la v7.",
      detection:"Cliquer libcomlairSplashNext et vérifier que libcomlairSplash est masqué, que body reçoit v221-profile-step et que accessWelcome devient visible.",
      repair:"Ajouter un gestionnaire de transition indépendant et idempotent qui ouvre directement la page de choix du profil ; conserver l’ancien gestionnaire comme compatibilité.",
      files:["libcomlair-v224-welcome-transition-hotfix.js","test-v224-voice-contextual-v7.html"],
      commits:["b79f05c8c91a269ee0b7c10c164cb9badb22f916","3eb80f5024e1a4e671918da16232cab411e00dc1"],
      validation:"Correction installée le 29/09/2026 ; validation utilisateur immédiate attendue.",
      safeAutoRepair:true
    })
  ]);

  function clone(x){return {...x,files:[...(x.files||[])],commits:[...(x.commits||[])]};}
  function all(){return [...base.all().map(clone),...EXTRA.map(clone)];}
  function byId(id){const x=all().find(item=>item.id===id);return x||null;}
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
    version:"v224-6",
    all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary
  });
})();
