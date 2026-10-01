(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;if(!base)return;
  const OVERRIDES=Object.freeze([
    Object.freeze({
      id:"welcome-voice-loading-blocked-by-render-status-gate",
      area:"welcome-voice-loading",
      status:"repaired-awaiting-validation",
      symptom:"Sur l’écran d’accueil, après avoir appuyé sur Écouter, le bouton reste longtemps sur Chargement de la voix… avant toute lecture.",
      cause:"Le moteur vocal central attendait obligatoirement renderVoice.prepare() avant toute lecture. prepare() interroge /api/tts/v181/status avec un délai pouvant aller jusqu’à 75 secondes. Si Render est en réveil ou lent, la demande utilisateur reste bloquée alors que renderVoice.speak() sait déjà lire un audio local enregistré ou tenter directement la génération TTS.",
      detection:"Dans libcomlair-voice-engine-v191.js, vérifier si runRender() fait await renderVoice.prepare() avant renderVoice.speak(). Vérifier aussi que l’écran Bienvenue reste au stade loading pendant cette attente.",
      repair:"Ne plus utiliser prepare() comme barrière à la lecture. Lancer prepare() en arrière-plan pour le préchauffage/diagnostic, puis appeler immédiatement renderVoice.speak(). Conserver prepareRender() pour les diagnostics explicites.",
      files:["libcomlair-voice-engine-v191.js","test-v224-master-frame-integration-v2.html"],
      commits:["abcb1d21b990c0a5e56b355f5e11e0392403fd7c"],
      validation:"Cause racine vérifiée dans le code le 01/10/2026. Correctif installé ; validation physique Samsung en attente.",
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
  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-39.0",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();