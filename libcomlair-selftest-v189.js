(function(){
  "use strict";
  const runtimeErrors=[];
  window.__libcomlairRuntimeErrors=runtimeErrors;

  function recordError(message,source,line,column){
    runtimeErrors.push({message:String(message||"Erreur inconnue").slice(0,300),source:String(source||"").slice(0,200),line:Number(line)||0,column:Number(column)||0});
    if(runtimeErrors.length>20)runtimeErrors.shift();
  }
  window.addEventListener("error",e=>recordError(e&&e.message,e&&e.filename,e&&e.lineno,e&&e.colno));
  window.addEventListener("unhandledrejection",e=>{const reason=e&&e.reason;recordError(reason&&reason.message?reason.message:String(reason||"Promesse rejetée"),"promise",0,0)});
  function check(name,ok,detail){return {name,ok:!!ok,detail:String(detail||"")}}

  function run(){
    const voiceEngine=window.LibcomlairVoice;
    let voiceState=null;
    try{voiceState=voiceEngine&&typeof voiceEngine.status==="function"?voiceEngine.status():null}catch(_){}
    const voiceHadFailure=!!(voiceState&&voiceState.lastOutcome&&voiceState.lastOutcome.ok===false);
    let voiceMode="moteur vocal prêt";
    if(voiceState&&voiceState.activeEngine==="render")voiceMode="voix française Render active";
    else if(voiceState&&voiceState.activeEngine==="mespeak")voiceMode="voix de secours meSpeak active";
    else if(voiceState&&voiceState.activeEngine==="web")voiceMode="voix système active";
    else if(voiceState&&voiceState.lastOutcome&&voiceState.lastOutcome.ok===true&&voiceState.lastOutcome.engine==="render")voiceMode="voix française Render validée";
    else if(voiceHadFailure)voiceMode="dernière lecture vocale en échec";

    const knownIssuesEngine=window.LibcomlairKnownIssues;
    let knownIssues=[];
    try{knownIssues=knownIssuesEngine&&typeof knownIssuesEngine.detect==="function"?knownIssuesEngine.detect():[]}catch(_){knownIssues=["known-issues-engine-error"]}

    const router=window.LibcomlairVoiceRouter;
    const globalMenu=window.LibcomlairGlobalAssistance;
    const checks=[
      check("Voix",!!(voiceEngine&&voiceEngine.version==="v189"&&typeof voiceEngine.speak==="function"&&typeof voiceEngine.testDetailed==="function"&&!voiceHadFailure),voiceMode),
      check("Routeur micro",!!(router&&router.version==="v224-2"&&typeof router.start==="function"&&typeof router.candidates==="function"),router?("version : "+router.version):"routeur absent"),
      check("Menu assistance",!!(globalMenu&&globalMenu.version==="v224-1"&&typeof globalMenu.open==="function"&&typeof globalMenu.close==="function"),globalMenu?("version : "+globalMenu.version):"menu absent"),
      check("Contexte vocal",!!(window.LibcomlairVoiceContext&&typeof window.LibcomlairVoiceContext.detect==="function"&&typeof window.LibcomlairVoiceContext.current==="function"&&typeof window.LibcomlairVoiceContext.getMode==="function"&&["discovery","simplified"].includes(window.LibcomlairVoiceContext.getMode())),window.LibcomlairVoiceContext?("écran : "+window.LibcomlairVoiceContext.current().id+" — mode : "+window.LibcomlairVoiceContext.getMode()):"moteur absent"),
      check("Guide vocal",!!(window.LibcomlairVoiceGuide&&typeof window.LibcomlairVoiceGuide.build==="function"&&typeof window.LibcomlairVoiceGuide.readCurrent==="function"),window.LibcomlairVoiceGuide?("mode : "+window.LibcomlairVoiceContext.getMode()):"guide absent"),
      check("Catégories",!!(window.LibcomlairCategories&&Array.isArray(window.LibcomlairCategories.categories)&&window.LibcomlairCategories.categories.length>=8),"listes et sous-catégories"),
      check("Accessibilité",!!(window.LibcomlairAccessibility&&typeof window.LibcomlairAccessibility.read==="function"&&typeof window.LibcomlairAccessibility.save==="function"),"profil et critères"),
      check("Données",!!(window.LibcomlairData&&typeof window.LibcomlairData.isFresh==="function"&&typeof window.LibcomlairData.loadState==="function"),"cache et actualisation"),
      check("Détails",!!(window.LibcomlairDetails&&typeof window.LibcomlairDetails.renderRestaurantPractical==="function"&&typeof window.LibcomlairDetails.enrichRestaurant==="function"),"fiches détaillées"),
      check("Transports",!!(window.LibcomlairTransport&&typeof window.LibcomlairTransport.normalizeNearbyStops==="function"),"normalisation transport"),
      check("Interface",!!(document.getElementById("visionVoiceCommand")&&document.getElementById("restaurantDetails")&&document.getElementById("detail")&&document.getElementById("places")),"éléments essentiels"),
      check("Réparation",!!(window.LibcomlairRepair&&typeof window.LibcomlairRepair.repair==="function"),"réparation automatique"),
      check("Pannes connues",!!(knownIssuesEngine&&typeof knownIssuesEngine.detect==="function"&&knownIssues.length===0),knownIssues.length?knownIssues.join(", "):"aucune panne connue détectée")
    ];

    const failed=checks.filter(x=>!x.ok);
    const result={ok:failed.length===0&&runtimeErrors.length===0,checks,failed,knownIssues:[...knownIssues],runtimeErrors:[...runtimeErrors],version:"v189-voice-router-global-menu"};
    window.__libcomlairLastDiagnostic=result;
    const box=document.getElementById("systemDiagnosticResult");
    if(box){
      if(result.ok)box.textContent="✓ Diagnostic réussi : les "+checks.length+" contrôles sont opérationnels. Aucune panne connue détectée. Voix : "+voiceMode+".";
      else{
        const parts=[];
        if(failed.length)parts.push("Moteurs en échec : "+failed.map(x=>x.name).join(", "));
        if(runtimeErrors.length)parts.push(runtimeErrors.length+" erreur"+(runtimeErrors.length>1?"s":"")+" JavaScript détectée"+(runtimeErrors.length>1?"s":""));
        if(knownIssues.length)parts.push("Pannes connues : "+knownIssues.join(", "));
        box.textContent="⚠ "+parts.join(" — ")+" — Une réparation automatique est disponible ci-dessous.";
      }
    }
    try{document.documentElement.dataset.libcomlairDiagnostic=result.ok?"ok":"error"}catch(_){}
    return result;
  }

  window.LibcomlairDiagnostics=Object.freeze({run,getErrors:()=>[...runtimeErrors],clearErrors:()=>runtimeErrors.splice(0,runtimeErrors.length)});
  function bind(){
    const button=document.getElementById("runSystemDiagnostic"),box=document.getElementById("systemDiagnosticResult");
    if(button&&!button.dataset.bound){button.dataset.bound="true";button.addEventListener("click",()=>{if(box)box.textContent="Diagnostic lancé…";setTimeout(()=>run(),60)})}
    const repairButton=document.getElementById("runSystemRepair"),repairBox=document.getElementById("systemRepairResult");
    if(repairButton&&!repairButton.dataset.bound){repairButton.dataset.bound="true";repairButton.addEventListener("click",()=>{if(repairBox)repairBox.textContent="Réparation automatique en cours…";if(window.LibcomlairRepair&&typeof window.LibcomlairRepair.repair==="function")window.LibcomlairRepair.repair();else if(repairBox)repairBox.textContent="⚠ Le moteur de réparation n’est pas chargé."})}
    if(box&&!box.textContent)box.textContent="Diagnostic prêt.";
    if(repairBox&&!repairBox.textContent)repairBox.textContent="Réparation disponible si nécessaire.";
    setTimeout(()=>run(),700);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
})();