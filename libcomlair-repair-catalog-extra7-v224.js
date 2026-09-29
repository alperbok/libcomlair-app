(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;
  if(!base)return;

  const EXTRA=Object.freeze([
    Object.freeze({
      id:"voice-continues-after-page-change",
      area:"voice-navigation",
      status:"confirmed",
      symptom:"Une assistance vocale commencée sur une page continue de parler après avoir appuyé sur Suivant ou après avoir changé d’écran.",
      cause:"La lecture de l’écran précédent n’était pas interrompue assez tôt. Une première correction avait aussi créé un second pilote de lecture automatique, en concurrence avec le présentateur guidé.",
      detection:"Lancer une lecture, changer de page avant la fin et vérifier que l’ancienne voix s’arrête immédiatement puis que seule la nouvelle page est annoncée.",
      repair:"Conserver LibcomlairGuidedPresenter comme unique propriétaire du cycle vocal. Le module de cycle de page intercepte seulement le début de navigation et délègue l’arrêt et la relance au présentateur.",
      files:["libcomlair-v224-guided-presenter.js","libcomlair-v224-presentation-voice-card.js","libcomlair-v224-voice-page-lifecycle.js","test-v224-voice-contextual-v7.html"],
      commits:["7d6372b6962b77425ec194a7422761f98bce438c","3b52ab9e77793d053648f1d5a46f1cd28a9c4e47","12b59a220b386e38d49f52ab72bb1a619a66fca9","5881641789e8fd7b26e54f34c41a6f85708a41c0"],
      validation:"Architecture v6/v3 installée le 29/09/2026. Validation utilisateur attendue.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-only-starts-on-profile-not-following-pages",
      area:"voice-navigation",
      status:"confirmed",
      symptom:"L’assistance vocale fonctionne sur la page Profil mais les pages suivantes deviennent silencieuses.",
      cause:"Deux causes peuvent se cumuler : l’état interne du présentateur restait parfois marqué comme lecture en cours après une annulation, et le mode Simplifié était traité comme absence de lecture automatique alors qu’il doit annoncer l’essentiel.",
      detection:"Parcourir Bienvenue, Profil, Navigation vocale, Présentation Libcomlair, Mes besoins d’accessibilité, Accueil / Recherche puis les pages de recherche. Vérifier qu’une annonce démarre sur chaque page en Découverte guidée et qu’une annonce courte démarre aussi en Simplifié.",
      repair:"Remettre explicitement l’état du présentateur à zéro lors d’une navigation, laisser un seul orchestrateur gérer les événements de changement de page et faire du mode Simplifié une annonce courte plutôt qu’un silence.",
      files:["libcomlair-v224-guided-presenter.js","libcomlair-v224-voice-page-lifecycle.js","libcomlair-v224-voice-context.js","test-v224-voice-contextual-v7.html"],
      commits:["12b59a220b386e38d49f52ab72bb1a619a66fca9","5881641789e8fd7b26e54f34c41a6f85708a41c0","233299ac8ed01b074bfdf8fde860241529d14a81"],
      validation:"Régression reproduite le 29/09/2026. Le présentateur v7 a rétabli la lecture sur plusieurs pages ; la panne résiduelle a ensuite été localisée à Recherche/Catégories.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-silent-all-pages-after-lifecycle-race",
      area:"voice-navigation",
      status:"confirmed",
      symptom:"Après une modification du gestionnaire de cycle vocal, aucune assistance vocale ne se fait entendre sur les pages du parcours.",
      cause:"Plusieurs orchestrateurs pilotaient la même lecture et pouvaient annuler une annonce immédiatement après son démarrage.",
      detection:"Après avoir choisi Vision et un mode vocal, vérifier si plusieurs pages successives restent toutes silencieuses alors que le moteur vocal est disponible.",
      repair:"Un seul orchestrateur doit gérer les changements de contexte. Le module secondaire ne doit jamais écouter les mêmes événements pour annuler une nouvelle lecture.",
      files:["libcomlair-v224-voice-page-lifecycle.js","libcomlair-v224-guided-presenter.js","test-v224-voice-contextual-v7.html"],
      commits:["3b52ab9e77793d053648f1d5a46f1cd28a9c4e47","12b59a220b386e38d49f52ab72bb1a619a66fca9","5881641789e8fd7b26e54f34c41a6f85708a41c0"],
      validation:"Correctif de concurrence installé. Validation utilisateur attendue.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-first-screen-silent-android-audio-locked",
      area:"voice-audio",
      status:"confirmed",
      symptom:"La première page Bienvenue peut rester silencieuse alors que l’assistance vocale fonctionne dès la page suivante.",
      cause:"Sur certains appareils Android, le contexte Web Audio utilisé par la voix naturelle reste suspendu avant le premier geste de l’utilisateur.",
      detection:"À l’ouverture de Libcomlair, vérifier l’état audio. Si Bienvenue est silencieuse avec Web Audio suspended/audio-locked puis que la voix fonctionne après un premier geste, cette panne est reconnue.",
      repair:"Déverrouiller le contexte audio naturel au premier geste utilisateur et relancer l’annonce si l’utilisateur reste sur Bienvenue. Ne jamais basculer vers une voix locale robotique pour contourner ce verrouillage.",
      files:["libcomlair-render-voice-v195.js","libcomlair-voice-engine-v189.js","libcomlair-v224-guided-presenter.js","LIBCOMLAIR-INSTALLATION-MAP.md"],
      commits:["ef0114d3bed81e2040c3a451275b2326b70d25b2"],
      validation:"Panne historique confirmée à nouveau le 29/09/2026. La limitation avant premier geste reste à traiter uniquement avec une solution de voix naturelle.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-presenter-refuses-restart-ok-false",
      area:"voice-navigation",
      status:"repaired-and-validated",
      symptom:"La page Navigation vocale est correctement reconnue et Render est disponible, mais la relance de sécurité affiche safety-restart ok=false et aucune annonce automatique ne démarre.",
      cause:"Le présentateur dépendait de VoiceGuide.readCurrent() sur certains écrans ; cet appel pouvait renvoyer false avant le démarrage de la lecture alors que Render et Web Audio étaient disponibles.",
      detection:"Dans Diagnostic vocal du parcours : page et contexte corrects, audio=running, moteur idle/Render ended, puis safety-restart ok=false.",
      repair:"Pour les écrans d’onboarding concernés, préparer le texte avec le guide puis l’envoyer directement au moteur naturel Render. Conserver lastAttempt dans le diagnostic pour connaître accepted/speaking/failed et la raison.",
      files:["libcomlair-v224-guided-presenter.js","libcomlair-v224-guided-presenter-v8.js","libcomlair-v224-voice-path-diagnostic.js","test-v224-voice-contextual-v8.html","test-v224-voice-contextual-v9.html"],
      commits:[],
      validation:"Validé par test utilisateur le 29/09/2026 : après chargement réel du présentateur v224-7, plusieurs pages successives ont retrouvé l’assistance vocale.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-stale-script-cache-presenter-v6",
      area:"cache-deployment",
      status:"repaired-and-validated",
      symptom:"Une correction est présente dans GitHub mais le diagnostic du téléphone continue d’afficher une ancienne version du présentateur, par exemple v224-6 au lieu de v224-7.",
      cause:"Le navigateur mobile/GitHub Pages peut conserver l’ancienne page ou ses scripts malgré un simple paramètre de requête ajouté au même fichier HTML.",
      detection:"Comparer la version attendue dans le dépôt avec la ligne Présentateur du diagnostic. Si elles diffèrent, le test ne valide pas le nouveau correctif.",
      repair:"Créer une nouvelle page de test avec un nouveau nom de fichier et augmenter les versions de cache des scripts principaux. Vérifier la publication GitHub Pages avant de transmettre le lien.",
      files:["test-v224-voice-contextual-v8.html","test-v224-voice-contextual-v9.html"],
      commits:[],
      validation:"Validé le 29/09/2026 : la nouvelle page v8 a ensuite affiché Présentateur v224-7 dans le diagnostic.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-render-cancel-race-investigated-not-root-cause",
      area:"voice-render",
      status:"investigated-not-root-cause",
      symptom:"Hypothèse : une ancienne annulation Render pourrait tuer la préparation de la voix de la page suivante.",
      cause:"Hypothèse testée après la panne page 2 puis silence. Render v196 et moteur v190 ont reçu des identifiants de requête pour isoler les annulations.",
      detection:"Tester en coupant la lecture puis en laissant aussi la lecture de la page 2 se terminer complètement. Contrôler Render, Web Audio et les événements preparing/generating/speaking.",
      repair:"Ne pas recommencer par Render pour ce symptôme si le diagnostic montre audio=running et Render capable de passer preparing-render, generating-render puis speaking. Chercher d’abord le présentateur et le contexte de page.",
      files:["libcomlair-render-voice-v196.js","libcomlair-voice-engine-v190.js"],
      commits:[],
      validation:"Écarté comme cause principale le 29/09/2026 : même après fin complète de la lecture page 2, la page suivante restait silencieuse ; le diagnostic a ensuite localisé le refus dans le présentateur.",
      safeAutoRepair:false
    }),
    Object.freeze({
      id:"presentation-auto-opens-accordions-instead-of-centered-card",
      area:"voice-presentation-ui",
      status:"confirmed",
      symptom:"Pendant la lecture automatique de Présentation Libcomlair, les accordéons de la page s’ouvrent dans le flux et font descendre les boutons alors que chaque explication doit apparaître seule au centre de l’écran.",
      cause:"Le présentateur v8 a réutilisé le chemin speakPresentation de PageCoherence, qui peut piloter les accordéons, au lieu de donner priorité au module PresentationVoiceCard déjà conçu pour la lecture centrée.",
      detection:"Entrer dans Présentation Libcomlair en Découverte guidée. Si une rubrique de l’accordéon s’ouvre dans la page au lieu d’une carte centrale 1 sur 10, la panne est présente.",
      repair:"Donner priorité à LibcomlairPresentationVoiceCard.start(), fermer les accordéons pendant la lecture, afficher une seule carte centrée et conserver les boutons Retour/Suivant visibles et accessibles en bas.",
      files:["libcomlair-v224-presentation-voice-card.js","libcomlair-v224-presentation-voice-card.css","libcomlair-v224-presentation-reading-fix-v10.css","libcomlair-v224-deep-voice-fix-v10.js","test-v224-voice-contextual-v10.html"],
      commits:["7a3bbd2be0e0f8cc448f1bc65bd01b321b397a1b","586b0ea930d239f2ac0c30b71b8795683cd74864","8069ecd3f22ef6ffccea0959da6707c05087e2ab"],
      validation:"Correction v10 installée le 29/09/2026. Validation utilisateur attendue.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-stops-on-search-categories-and-deep-pages",
      area:"voice-navigation",
      status:"confirmed",
      symptom:"Le parcours vocal fonctionne jusqu’aux écrans précédents puis disparaît dès l’arrivée sur Recherche et catégories ; les catégories, sous-catégories, résultats et fiches détaillées restent ensuite sans relance automatique.",
      cause:"La transition vers v224-page4-step et les pages profondes dépendait encore d’un contexte pouvant être désynchronisé et du vieux chemin VoiceGuide.readCurrent(). Le risque de désynchronisation état de page/catégorie active était déjà documenté dans la carte d’installation.",
      detection:"Parcourir dans l’ordre réel jusqu’à Recherche et catégories. Si l’écran est visible mais qu’aucune annonce ne démarre, contrôler les classes v224-page4-step/v224-page5-step, la catégorie active, contextId et pageId. Continuer ensuite catégorie → sous-catégorie → résultats → fiche pour vérifier la propagation.",
      repair:"Forcer le contexte depuis l’état réel de l’écran pour search/category/subcategory/map/favorites/filters/contribute/results/detail et faire lire ces pages par le chemin direct de la voix naturelle Render au lieu de dépendre de readCurrent(). Rafraîchir l’identité à chaque transition profonde.",
      files:["libcomlair-v224-deep-voice-fix-v10.js","libcomlair-v224-page-state-guard.js","libcomlair-v224-identity-registry.js","libcomlair-v224-voice-context.js","test-v224-voice-contextual-v10.html"],
      commits:["7a3bbd2be0e0f8cc448f1bc65bd01b321b397a1b","8069ecd3f22ef6ffccea0959da6707c05087e2ab"],
      validation:"Panne localisée par l’utilisateur le 29/09/2026 : la voix disparaît dès l’écran Recherche/Catégories de la seconde capture. Correctif v10 installé ; validation utilisateur attendue.",
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
  function pendingValidation(){return all().filter(x=>x.status!=="repaired-and-validated"&&x.status!=="investigated-not-root-cause");}
  function historical(){return base.historical();}
  function combined(){
    const map=new Map();
    historical().forEach(item=>map.set(item.id,item));
    all().forEach(item=>map.set(item.id,{...item,source:"repair-catalog"}));
    return [...map.values()];
  }
  function summary(){
    const recent=all(),items=combined();
    return {totalKnown:items.length,recent:recent.length,validated:recent.filter(x=>x.status==="repaired-and-validated").length,pendingValidation:pendingValidation().length,safeAutoRepair:recent.filter(x=>x.safeAutoRepair).length,investigatedNotRootCause:recent.filter(x=>x.status==="investigated-not-root-cause").length};
  }

  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-18",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();