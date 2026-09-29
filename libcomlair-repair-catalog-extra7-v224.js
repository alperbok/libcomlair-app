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
      cause:"Le module de Présentation appelait stop() alors que le moteur vocal v189 expose cancel(). De plus, l’arrêt n’était pas centralisé au niveau du changement de page.",
      detection:"Lancer une lecture, appuyer sur Suivant avant la fin et vérifier que la voix s’arrête immédiatement avant l’affichage ou la lecture de la nouvelle page.",
      repair:"Utiliser LibcomlairVoice.cancel() et LibcomlairVoiceGuide.stop() à chaque changement d’écran. Charger libcomlair-v224-voice-page-lifecycle.js en dernier afin de centraliser l’arrêt de la page précédente et le lancement de la suivante.",
      files:["libcomlair-v224-presentation-voice-card.js","libcomlair-v224-voice-page-lifecycle.js","test-v224-voice-contextual-v7.html"],
      commits:["7d6372b6962b77425ec194a7422761f98bce438c","bb25c1614c19218f1ffaac53b91fdec4fe57bc2a","9a51b7683dd37534050e46a931788dd826bdf631"],
      validation:"Correction installée le 29/09/2026. Validation utilisateur attendue.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-only-starts-on-profile-not-following-pages",
      area:"voice-navigation",
      status:"confirmed",
      symptom:"L’assistance vocale fonctionne sur le choix du profil handicap mais ne se lance pas automatiquement sur les pages suivantes.",
      cause:"Les déclenchements automatiques étaient répartis entre plusieurs modules et dépendaient de leur état local, de la notion de page déjà visitée et du moment où le moteur vocal devenait prêt.",
      detection:"Parcourir successivement Profil, Navigation vocale, Présentation Libcomlair, Mes besoins d’accessibilité, Accueil / Recherche puis les pages de recherche et vérifier qu’une assistance correspondant à chaque page démarre automatiquement.",
      repair:"Centraliser le cycle vocal dans libcomlair-v224-voice-page-lifecycle.js. À chaque nouveau contexte : arrêter toute lecture, rafraîchir le contexte, neutraliser l’ancien déclenchement automatique de cette page, puis appeler le guide vocal de la nouvelle page. Pour Présentation Libcomlair, utiliser le cadre central dédié.",
      files:["libcomlair-v224-voice-page-lifecycle.js","libcomlair-v224-presentation-voice-card.js","test-v224-voice-contextual-v7.html"],
      commits:["bb25c1614c19218f1ffaac53b91fdec4fe57bc2a","7d6372b6962b77425ec194a7422761f98bce438c","9a51b7683dd37534050e46a931788dd826bdf631"],
      validation:"Gestionnaire central installé le 29/09/2026. Validation utilisateur attendue.",
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

  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-14",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();