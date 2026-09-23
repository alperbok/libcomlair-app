(function(){
  "use strict";
  const runtimeErrors=[];
  window.__libcomlairRuntimeErrors=runtimeErrors;

  function recordError(message,source,line,column){
    runtimeErrors.push({
      message:String(message||"Erreur inconnue").slice(0,300),
      source:String(source||"").slice(0,200),
      line:Number(line)||0,
      column:Number(column)||0
    });
    if(runtimeErrors.length>20)runtimeErrors.shift();
  }

  window.addEventListener("error",e=>{
    recordError(e&&e.message,e&&e.filename,e&&e.lineno,e&&e.colno);
  });

  window.addEventListener("unhandledrejection",e=>{
    const reason=e&&e.reason;
    recordError(reason&&reason.message?reason.message:String(reason||"Promesse rejetée"),"promise",0,0);
  });

  function check(name,ok,detail){
    return {name,ok:!!ok,detail:String(detail||"")};
  }

  function run(){
    const checks=[
      check("Voix",!!(window.LibcomlairVoice&&typeof window.LibcomlairVoice.speak==="function"&&typeof window.LibcomlairVoice.setRecognitionActive==="function"),"moteur vocal"),
      check("Catégories",!!(window.LibcomlairCategories&&Array.isArray(window.LibcomlairCategories.categories)&&window.LibcomlairCategories.categories.length>=8),"listes et sous-catégories"),
      check("Accessibilité",!!(window.LibcomlairAccessibility&&typeof window.LibcomlairAccessibility.read==="function"&&typeof window.LibcomlairAccessibility.save==="function"),"profil et critères"),
      check("Données",!!(window.LibcomlairData&&typeof window.LibcomlairData.isFresh==="function"&&typeof window.LibcomlairData.loadState==="function"),"cache et actualisation"),
      check("Détails",!!(window.LibcomlairDetails&&typeof window.LibcomlairDetails.renderRestaurantPractical==="function"&&typeof window.LibcomlairDetails.enrichRestaurant==="function"),"fiches détaillées"),
      check("Transports",!!(window.LibcomlairTransport&&typeof window.LibcomlairTransport.normalizeNearbyStops==="function"),"normalisation transport"),
      check("Interface",!!(document.getElementById("visionVoiceCommand")&&document.getElementById("restaurantDetails")&&document.getElementById("detail")&&document.getElementById("places")),"éléments essentiels")
    ];
    const failed=checks.filter(x=>!x.ok);
    const result={
      ok:failed.length===0&&runtimeErrors.length===0,
      checks,
      failed,
      runtimeErrors:[...runtimeErrors],
      version:"v173"
    };
    window.__libcomlairLastDiagnostic=result;

    const box=document.getElementById("systemDiagnosticResult");
    if(box){
      if(result.ok){
        box.textContent="✓ Diagnostic réussi : les 7 contrôles principaux sont opérationnels.";
      }else{
        const parts=[];
        if(failed.length)parts.push("Moteurs en échec : "+failed.map(x=>x.name).join(", "));
        if(runtimeErrors.length)parts.push(runtimeErrors.length+" erreur"+(runtimeErrors.length>1?"s":"")+" JavaScript détectée"+(runtimeErrors.length>1?"s":""));
        box.textContent="⚠ "+parts.join(" — ");
      }
    }
    try{
      document.documentElement.dataset.libcomlairDiagnostic=result.ok?"ok":"error";
    }catch(_){}
    return result;
  }

  window.LibcomlairDiagnostics=Object.freeze({
    run,
    getErrors:()=>[...runtimeErrors],
    clearErrors:()=>{runtimeErrors.splice(0,runtimeErrors.length)}
  });

  function bind(){
    const button=document.getElementById("runSystemDiagnostic");
    if(button&&!button.dataset.bound){
      button.dataset.bound="true";
      button.addEventListener("click",run);
    }
    setTimeout(run,700);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});
  else bind();
})();