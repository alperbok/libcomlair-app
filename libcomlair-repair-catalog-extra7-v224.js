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
      validation:"Régression reproduite le 29/09/2026 : Profil vocal OK, pages suivantes silencieuses. Correctif installé ; validation utilisateur attendue.",
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
    const recent=all(),items=combined();
    return {totalKnown:items.length,recent:recent.length,validated:recent.filter(x=>x.status==="repaired-and-validated").length,pendingValidation:recent.filter(x=>x.status!=="repaired-and-validated").length,safeAutoRepair:recent.filter(x=>x.safeAutoRepair).length};
  }

  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-17",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();