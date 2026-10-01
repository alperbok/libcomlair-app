(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;if(!base)return;
  const OVERRIDES=Object.freeze([
    Object.freeze({
      id:"welcome-listen-button-silent-duplicate-owner-and-strict-audio-gate",
      area:"welcome-voice-android",
      status:"repaired-awaiting-validation",
      symptom:"Sur l’écran Bienvenue, le bouton Écouter est visible mais l’appui ne déclenche pas le message vocal.",
      cause:"Deux responsabilités se chevauchaient : GuidedPresenter pouvait encore tenter la présentation automatique de Bienvenue alors que welcome-listen-first devait être l’unique lecteur. En plus, welcome-listen-first abandonnait avant engine.speak si un premier unlockAudio renvoyait momentanément faux sur Android, alors que le moteur Render possède déjà son propre contrôle audio.",
      detection:"Vérifier que GuidedPresenter ne parle pas quand VoiceContext vaut welcome et que LibcomlairWelcomeListenFirst est chargé. Dans welcome-listen-first, rechercher toute condition qui transforme un unlockAudio temporairement faux en abandon avant LibcomlairVoice.speak.",
      repair:"Réserver la page Bienvenue au bouton Écouter, amorcer Web Audio dès pointerdown, précharger le message Render, puis appeler LibcomlairVoice.speak sans utiliser le résultat du premier unlockAudio comme barrière. Le moteur Render reste responsable de la validation finale de l’audio.",
      files:["libcomlair-v224-welcome-listen-first-v16.js","libcomlair-v224-guided-presenter-v10.js","test-v224-master-frame-integration-v2.html"],
      commits:["a486b1e91e2efbb66374e6cfaacdb57ef9e94ea7","982019e03e5610219ca7a836f432bc29c381be03"],
      validation:"Régression signalée par l’utilisateur le 01/10/2026 sur Samsung Android. Correctif source installé ; validation physique Samsung Browser en attente.",
      safeAutoRepair:false
    })
  ]);
  function clone(x){return {...x,files:[...(x.files||[])],commits:[...(x.commits||[])]}}
  function all(){const map=new Map(base.all().map(x=>[x.id,clone(x)]));OVERRIDES.forEach(x=>map.set(x.id,clone(x)));return [...map.values()]}
  function byId(id){return all().find(x=>x.id===id)||null}
  function byStatus(status){return all().filter(x=>x.status===status)}
  function validated(){return byStatus("repaired-and-validated")}
  function autoRepairable(){return all().filter(x=>x.safeAutoRepair)}
  function pendingValidation(){return all().filter(x=>!["repaired-and-validated","investigated-not-root-cause","observed-performance"].includes(x.status))}
  function historical(){return base.historical?.()||[]}
  function combined(){const map=new Map();historical().forEach(x=>map.set(x.id,x));all().forEach(x=>map.set(x.id,{...x,source:"repair-catalog"}));return [...map.values()]}
  function summary(){const recent=all(),items=combined();return {totalKnown:items.length,recent:recent.length,validated:validated().length,pendingValidation:pendingValidation().length,safeAutoRepair:autoRepairable().length,investigatedNotRootCause:recent.filter(x=>x.status==="investigated-not-root-cause").length}}
  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-38.0",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();