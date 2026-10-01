(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;if(!base)return;
  const OVERRIDES=Object.freeze([
    Object.freeze({
      id:"diagnostic-false-failure-from-provider-and-exact-version-checks",
      area:"diagnostic-local-first",
      status:"repaired-awaiting-validation",
      symptom:"Le Diagnostic peut annoncer une panne de Libcomlair alors que les fonctions locales marchent, notamment après une évolution de version ou une indisponibilité de Render.",
      cause:"L'ancien auto-test mélangeait l'état de services externes avec l'état local de l'application et exigeait plusieurs numéros de versions exacts. Une nouvelle version valide pouvait donc être classée en panne et un échec Render pouvait faire échouer le diagnostic général.",
      detection:"Lancer le Diagnostic avec Render indisponible ou en mode services externes coupés. Vérifier que les fonctions locales sont contrôlées par capacités et que l'état externe est affiché séparément.",
      repair:"Rendre le Diagnostic capability-based et local-first : aucune requête réseau nécessaire, aucune version exacte exigée pour valider une capacité, erreurs réseau classées dans l'état externe, résultat local indépendant de Render.",
      files:["libcomlair-selftest-v189.js","libcomlair-v224-external-services-test-v1.js","libcomlair-v224-autonomy-dashboard-v1.js","libcomlair-v224-technical-menu-access-v1.js","test-v224-master-frame-integration-v2.html"],
      commits:["8cf895537706b4a6b3c233ba17418d127512bab7","6c43e01d99c2ce9f4434821f4553f38205c27e70","acdb4a214357bcc036346d5bd9fb51d7a934d89f","1da2407c67f62c96b83b75091a5b8518618e75c8"],
      validation:"Correction source installée le 01/10/2026. À valider dans Maintenance avancée : activer le test sans services externes puis lancer le Diagnostic local.",
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
  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-41.0",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();
