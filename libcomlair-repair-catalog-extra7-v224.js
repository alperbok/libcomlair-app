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
      cause:"La lecture de l’écran précédent n’était pas interrompue assez tôt au début de la navigation. Une première correction a ensuite créé un second pilote de lecture automatique, en concurrence avec le présentateur guidé déjà existant.",
      detection:"Lancer une lecture, appuyer sur Suivant avant la fin et vérifier que l’ancienne voix s’arrête immédiatement puis que seule la nouvelle page est annoncée.",
      repair:"Conserver LibcomlairGuidedPresenter comme unique propriétaire de la lecture automatique. Le module libcomlair-v224-voice-page-lifecycle.js doit seulement appeler les fonctions d’arrêt au début de la navigation et lors du changement de contexte ; il ne doit pas relire lui-même la nouvelle page.",
      files:["libcomlair-v224-guided-presenter.js","libcomlair-v224-presentation-voice-card.js","libcomlair-v224-voice-page-lifecycle.js","test-v224-voice-contextual-v7.html"],
      commits:["7d6372b6962b77425ec194a7422761f98bce438c","bb25c1614c19218f1ffaac53b91fdec4fe57bc2a","3b52ab9e77793d053648f1d5a46f1cd28a9c4e47","96dd35cae24f412287da586edecf84571402ab97"],
      validation:"Architecture corrigée en v2 le 29/09/2026. Validation utilisateur attendue.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-only-starts-on-profile-not-following-pages",
      area:"voice-navigation",
      status:"confirmed",
      symptom:"L’assistance vocale fonctionne sur le choix du profil handicap mais ne se lance pas automatiquement sur les pages suivantes.",
      cause:"Les déclenchements automatiques étaient répartis entre plusieurs modules et dépendaient de leur état local, de la notion de page déjà visitée et du moment où le moteur vocal devenait prêt.",
      detection:"Parcourir successivement Profil, Navigation vocale, Présentation Libcomlair, Mes besoins d’accessibilité, Accueil / Recherche puis les pages de recherche et vérifier qu’une assistance correspondant à chaque page démarre automatiquement.",
      repair:"Utiliser LibcomlairGuidedPresenter comme orchestrateur unique de la lecture automatique. Le cycle de page ne fait qu’interrompre l’ancienne lecture ; les événements de contexte déjà écoutés par le présentateur déclenchent ensuite la lecture de la nouvelle page.",
      files:["libcomlair-v224-guided-presenter.js","libcomlair-v224-voice-page-lifecycle.js","libcomlair-v224-presentation-voice-card.js","test-v224-voice-contextual-v7.html"],
      commits:["bb25c1614c19218f1ffaac53b91fdec4fe57bc2a","3b52ab9e77793d053648f1d5a46f1cd28a9c4e47","96dd35cae24f412287da586edecf84571402ab97"],
      validation:"Architecture simplifiée en v2 le 29/09/2026. Validation utilisateur attendue.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-silent-all-pages-after-lifecycle-race",
      area:"voice-navigation",
      status:"confirmed",
      symptom:"Après l’ajout du gestionnaire de cycle vocal, aucune assistance vocale ne se fait entendre sur les pages du parcours.",
      cause:"Deux orchestrateurs pilotaient la même lecture : LibcomlairGuidedPresenter et la première version de LibcomlairVoicePageLifecycle. Tous deux arrêtaient et relançaient le moteur sur les mêmes événements, ce qui pouvait annuler la lecture immédiatement après son démarrage.",
      detection:"Après avoir choisi le profil Vision et le mode Découverte guidée, vérifier si plusieurs pages successives restent toutes silencieuses alors que le moteur vocal et le guide sont chargés.",
      repair:"Supprimer toute logique de lecture, de nouvelle tentative et de marquage des pages dans LibcomlairVoicePageLifecycle. Garder uniquement l’arrêt anticipé de l’ancienne page ; laisser LibcomlairGuidedPresenter relancer la nouvelle page avec ses événements existants.",
      files:["libcomlair-v224-voice-page-lifecycle.js","libcomlair-v224-guided-presenter.js","test-v224-voice-contextual-v7.html"],
      commits:["3b52ab9e77793d053648f1d5a46f1cd28a9c4e47","96dd35cae24f412287da586edecf84571402ab97"],
      validation:"Correctif v2 installé le 29/09/2026 après constat utilisateur du silence total. Nouvelle validation utilisateur attendue.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-first-screen-silent-android-audio-locked",
      area:"voice-audio",
      status:"confirmed",
      symptom:"La première page Bienvenue peut rester silencieuse alors que l’assistance vocale fonctionne dès la page suivante.",
      cause:"Sur certains appareils Android, le contexte Web Audio utilisé par la voix naturelle reste suspendu avant le premier geste de l’utilisateur. Ce problème avait déjà été rencontré dans les versions v187/v188 et était connu dans la carte d’installation, mais n’était pas enregistré comme panne autonome dans le catalogue de réparation.",
      detection:"À l’ouverture de Libcomlair, vérifier l’état audio du moteur naturel. Si la première page est silencieuse et que l’état Web Audio est suspended ou audio-locked, puis que la voix fonctionne après un premier toucher ou sur la page suivante, cette panne est reconnue.",
      repair:"Déverrouiller le contexte audio naturel au premier geste utilisateur puis relancer l’annonce de la page Bienvenue si elle n’a pas commencé. Ne jamais basculer vers une synthèse vocale locale ou robotique pour contourner ce verrouillage. Conserver uniquement une voix naturelle et prévoir plusieurs fournisseurs naturels de secours.",
      files:["libcomlair-render-voice-v195.js","libcomlair-voice-engine-v189.js","libcomlair-v224-guided-presenter.js","libcomlair-ui-v187.js","LIBCOMLAIR-INSTALLATION-MAP.md"],
      commits:["ef0114d3bed81e2040c3a451275b2326b70d25b2"],
      validation:"Panne historique confirmée le 29/09/2026 après nouvelle observation utilisateur. Correction de démarrage naturel encore à valider sur la page Bienvenue.",
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

  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-16",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();