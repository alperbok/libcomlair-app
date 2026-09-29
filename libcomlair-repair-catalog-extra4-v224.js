(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;
  if(!base)return;

  const EXTRA=Object.freeze([
    Object.freeze({
      id:"voice-screen-rebuilt-after-overlay-regressions",
      area:"layout",
      status:"confirmed",
      symptom:"Navigation vocale continue à afficher brièvement l’ancienne et la nouvelle présentation malgré plusieurs correctifs de masquage et de mise en page.",
      cause:"Plusieurs anciennes couches de présentation modifiaient encore le même conteneur historique visionVoiceControls. Les correctifs successifs se superposaient au lieu de supprimer la source du conflit.",
      detection:"Ouvrir plusieurs fois Navigation vocale et rechercher tout double rendu, déplacement ou ancienne carte avant l’affichage final.",
      repair:"Ne plus charger les anciennes couches voice-mode-cards, voice-mode-layout-v2 et voice-mode-layout-v3 dans la v7. Masquer définitivement l’ancien conteneur pendant cette étape et utiliser le nouveau module indépendant libcomlair-v224-voice-screen-fresh avec son propre DOM et sa propre feuille de style.",
      files:["libcomlair-v224-voice-screen-fresh.js","libcomlair-v224-voice-screen-fresh.css","test-v224-voice-contextual-v7.html"],
      commits:["e5d05248f91e73ee853203c5f7b085d922d5187a","43b1546e0adf1c5b699b9464ec67df1ef3775e0c","0bf6eed42919d2997ad5210df7a470e6edee719d"],
      validation:"Nouvelle architecture installée le 29/09/2026. Validation utilisateur attendue.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"guided-assistance-not-starting-on-onboarding",
      area:"voice",
      status:"confirmed",
      symptom:"En mode Découverte guidée, l’assistance vocale ne démarre pas toujours automatiquement sur Navigation vocale ou Présentation Libcomlair.",
      cause:"Le présentateur automatique peut manquer une transition si le contexte vocal et le nouvel écran ne sont pas encore tous deux prêts au moment de son premier déclenchement.",
      detection:"Entrer dans Navigation vocale puis Présentation Libcomlair en mode Découverte et vérifier qu’une seule lecture démarre automatiquement dans chaque écran.",
      repair:"Le nouvel écran attend le présentateur existant puis, après un court délai, force presentCurrent uniquement si aucune lecture n’est en cours. Ne jamais lancer une seconde VoiceGuide en parallèle.",
      files:["libcomlair-v224-voice-screen-fresh.js","libcomlair-v224-guided-presenter.js","libcomlair-v224-page-coherence.js"],
      commits:["baf04d1b8e445241cc569ed60227ca6ad085efde"],
      validation:"Sécurité de déclenchement ajoutée le 29/09/2026. Test vocal utilisateur à venir.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"presentation-final-compact-project-sections",
      area:"content",
      status:"confirmed",
      symptom:"Présentation Libcomlair doit pouvoir accueillir les futures fonctions Profil et Carte/GPS tout en tenant au maximum sur un seul écran lorsque les rubriques sont fermées.",
      cause:"Le titre occupait une ligne dédiée et les accordéons étaient encore trop hauts. Une case générique Fonctions en préparation regroupait deux projets différents.",
      detection:"Sur téléphone, vérifier que le titre est remonté sans passer sous le micro, que les textes restent lisibles, que les rubriques fermées sont compactes et que Profil enregistré et Carte/GPS accessible ont chacune leur case.",
      repair:"Remonter le titre dans l’espace disponible à gauche du micro, réduire uniquement les marges et hauteurs des accordéons, conserver la taille du texte, supprimer la case générique et créer deux rubriques Projet distinctes : Profil enregistré et Carte / GPS accessible.",
      files:["libcomlair-v224-page-coherence.css","libcomlair-v224-page-coherence.js"],
      commits:["9db56dbee8d55276bd678b094daf0c870448dacf","7a4ae1b09132d9f72edf7c728696bf7e5d134437"],
      validation:"Structure finale préparée le 29/09/2026. Validation visuelle utilisateur attendue.",
      safeAutoRepair:false
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
    const recent=all();
    const items=combined();
    return {totalKnown:items.length,recent:recent.length,validated:recent.filter(x=>x.status==="repaired-and-validated").length,pendingValidation:recent.filter(x=>x.status!=="repaired-and-validated").length,safeAutoRepair:recent.filter(x=>x.safeAutoRepair).length};
  }

  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-9",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();
