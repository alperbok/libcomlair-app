(function(){
  "use strict";

  const VERSION="v189.2-local-first-capabilities";
  const runtimeErrors=Array.isArray(window.__libcomlairRuntimeErrors)?window.__libcomlairRuntimeErrors:[];
  window.__libcomlairRuntimeErrors=runtimeErrors;
  let lastResult=null;

  function recordError(message,source,line,column){
    runtimeErrors.push({message:String(message||"Erreur inconnue").slice(0,300),source:String(source||"").slice(0,200),line:Number(line)||0,column:Number(column)||0});
    if(runtimeErrors.length>20)runtimeErrors.shift();
  }
  if(document.documentElement.dataset.libcomlairDiagnosticErrorsBound!=="1"){
    document.documentElement.dataset.libcomlairDiagnosticErrorsBound="1";
    window.addEventListener("error",e=>recordError(e&&e.message,e&&e.filename,e&&e.lineno,e&&e.colno));
    window.addEventListener("unhandledrejection",e=>{const reason=e&&e.reason;recordError(reason&&reason.message?reason.message:String(reason||"Promesse rejetée"),"promise",0,0)});
  }

  function check(name,ok,detail){return {name,ok:!!ok,detail:String(detail||"")}}
  function capability(value,methods){return !!value&&methods.every(name=>typeof value[name]==="function")}
  function isExternalRuntimeError(item){
    const text=((item&&item.message)||"")+" "+((item&&item.source)||"");
    return /render|failed to fetch|network|abort|external_service_test|load failed|internet/i.test(text);
  }

  function run(){
    const voice=window.LibcomlairVoice;
    let voiceState=null;
    try{voiceState=voice?.status?.()||null}catch(_){}

    const welcome=window.LibcomlairWelcomeLocalFirst;
    let welcomeState=null;
    try{welcomeState=welcome?.status?.()||null}catch(_){}

    const coverage=window.LibcomlairVoiceLocalCoverage;
    let coverageState=null;
    try{coverageState=coverage?.status?.()||null}catch(_){}

    const knownIssuesEngine=window.LibcomlairKnownIssues;
    let knownIssues=[];
    try{knownIssues=knownIssuesEngine&&typeof knownIssuesEngine.detect==="function"?knownIssuesEngine.detect():[]}catch(_){knownIssues=["known-issues-engine-error"]}

    const router=window.LibcomlairVoiceRouter;
    const globalMenu=window.LibcomlairGlobalAssistance;
    const voiceContext=window.LibcomlairVoiceContext;
    const guide=window.LibcomlairVoiceGuide;
    const repair=window.LibcomlairRepair||window.LibcomlairRepairEngine;

    const checks=[
      check("Moteur vocal central",capability(voice,["speak","status"]),voice?("version : "+String(voice.version||"inconnue")):"moteur absent"),
      check("Entrée dans l’application",!!(welcome&&welcomeState&&welcomeState.navigationBlocked===false&&welcomeState.networkFallback===false),welcomeState?"navigation indépendante de la voix et du réseau":"module d’accueil local absent"),
      check("Couverture vocale locale",capability(coverage,["inspect","status"]),coverageState?.available?(String(coverageState.criticalCoveragePercent||0)+" % des messages critiques empaquetés"):"mesure prête, enregistrements locaux encore incomplets"),
      check("Routeur micro",capability(router,["start","candidates"]),router?("version : "+String(router.version||"inconnue")):"routeur absent"),
      check("Menu assistance",capability(globalMenu,["open","close"]),globalMenu?("version : "+String(globalMenu.version||"inconnue")):"menu absent"),
      check("Contexte vocal",capability(voiceContext,["detect","current"]),voiceContext?("contexte : "+String(voiceContext.current?.()?.id||"disponible")):"moteur absent"),
      check("Guide vocal",capability(guide,["build","readCurrent"]),guide?"guide chargé":"guide absent"),
      check("Catégories",!!(window.LibcomlairCategories&&Array.isArray(window.LibcomlairCategories.categories)&&window.LibcomlairCategories.categories.length>0),"listes de catégories disponibles"),
      check("Accessibilité",capability(window.LibcomlairAccessibility,["read","save"]),"profil et critères"),
      check("Données",capability(window.LibcomlairData,["isFresh","loadState"]),"cache et état local"),
      check("Détails",!!(window.LibcomlairDetails&&typeof window.LibcomlairDetails.renderRestaurantPractical==="function"),"fiches détaillées"),
      check("Transports",!!(window.LibcomlairTransport&&typeof window.LibcomlairTransport.normalizeNearbyStops==="function"),"normalisation transport"),
      check("Interface",!!(document.getElementById("visionVoiceCommand")&&document.getElementById("detail")&&document.getElementById("places")),"éléments essentiels"),
      check("Réparation",!!(repair&&typeof repair.repair==="function"),"réparation automatique"),
      check("Pannes connues",!!(knownIssuesEngine&&typeof knownIssuesEngine.detect==="function"&&knownIssues.length===0),knownIssues.length?knownIssues.join(", "):"aucune panne connue détectée")
    ];

    let renderStatus=null;
    try{renderStatus=window.LibcomlairRenderVoice?.status?.()||null}catch(_){}
    const externalErrors=runtimeErrors.filter(isExternalRuntimeError);
    const localRuntimeErrors=runtimeErrors.filter(x=>!isExternalRuntimeError(x));
    const renderLastError=String(renderStatus?.last?.error||voiceState?.lastOutcome?.reason||"");
    const externalTest=window.LibcomlairExternalServiceTestMode?.status?.()||null;
    const external={
      online:navigator.onLine,
      renderPresent:!!window.LibcomlairRenderVoice,
      renderReady:!!renderStatus?.ready,
      renderLastError,
      testModeActive:!!externalTest?.active,
      blockedRequests:Number(externalTest?.blockedCount)||0,
      runtimeErrors:externalErrors.map(x=>({...x}))
    };
    const externalDegraded=!navigator.onLine||!!renderLastError||external.testModeActive||externalErrors.length>0;

    const failed=checks.filter(x=>!x.ok);
    const result={
      ok:failed.length===0&&localRuntimeErrors.length===0,
      localOnly:true,
      networkRequired:false,
      externalDegraded,
      checks,
      failed,
      knownIssues:[...knownIssues],
      runtimeErrors:localRuntimeErrors.map(x=>({...x})),
      external,
      version:VERSION,
      time:Date.now()
    };
    lastResult=result;
    window.__libcomlairLastDiagnostic=result;

    const box=document.getElementById("systemDiagnosticResult");
    if(box){
      if(result.ok){
        const externalText=externalDegraded?" Services externes : dégradés ou volontairement coupés, sans bloquer le diagnostic local.":" Services externes : disponibles ou sans erreur détectée.";
        box.textContent="✓ Diagnostic local réussi : "+checks.length+" contrôles de Libcomlair sont opérationnels."+externalText;
      }else{
        const parts=[];
        if(failed.length)parts.push("Fonctions locales en échec : "+failed.map(x=>x.name).join(", "));
        if(localRuntimeErrors.length)parts.push(localRuntimeErrors.length+" erreur"+(localRuntimeErrors.length>1?"s":"")+" JavaScript locale"+(localRuntimeErrors.length>1?"s":""));
        if(knownIssues.length)parts.push("Pannes connues : "+knownIssues.join(", "));
        box.textContent="⚠ "+parts.join(" — ")+" — Les services externes sont diagnostiqués séparément.";
      }
    }
    try{
      document.documentElement.dataset.libcomlairDiagnostic=result.ok?"ok":"error";
      document.documentElement.dataset.libcomlairExternalState=externalDegraded?"degraded":"ok";
    }catch(_){}
    return result;
  }

  function status(){return {version:VERSION,networkRequired:false,last:lastResult?JSON.parse(JSON.stringify(lastResult)):null}}

  window.LibcomlairDiagnostics=Object.freeze({version:VERSION,run,status,getErrors:()=>runtimeErrors.map(x=>({...x})),clearErrors:()=>runtimeErrors.splice(0,runtimeErrors.length)});

  function bind(){
    const button=document.getElementById("runSystemDiagnostic"),box=document.getElementById("systemDiagnosticResult");
    if(button&&!button.dataset.localFirstDiagnosticBound){
      button.dataset.localFirstDiagnosticBound="1";
      button.addEventListener("click",()=>{if(box)box.textContent="Diagnostic local lancé…";setTimeout(()=>run(),60)});
    }
    const repairButton=document.getElementById("runSystemRepair"),repairBox=document.getElementById("systemRepairResult");
    if(repairButton&&!repairButton.dataset.localFirstRepairBound){
      repairButton.dataset.localFirstRepairBound="1";
      repairButton.addEventListener("click",()=>{
        if(repairBox)repairBox.textContent="Réparation automatique en cours…";
        const engine=window.LibcomlairRepair||window.LibcomlairRepairEngine;
        if(engine&&typeof engine.repair==="function")engine.repair();
        else if(repairBox)repairBox.textContent="⚠ Le moteur de réparation n’est pas chargé.";
      });
    }
    if(box&&!box.textContent)box.textContent="Diagnostic local prêt.";
    if(repairBox&&!repairBox.textContent)repairBox.textContent="Réparation disponible si nécessaire.";
    setTimeout(()=>run(),700);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
})();
