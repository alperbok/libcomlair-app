(()=>{
  "use strict";

  function snapshot(){
    const checks=[
      {name:"Routeur micro contextuel",ok:!!(window.LibcomlairVoiceRouter&&window.LibcomlairVoiceRouter.version==="v224-2"&&typeof window.LibcomlairVoiceRouter.start==="function")},
      {name:"Contexte vocal",ok:!!(window.LibcomlairVoiceContext&&typeof window.LibcomlairVoiceContext.current==="function")},
      {name:"Guide vocal",ok:!!(window.LibcomlairVoiceGuide&&typeof window.LibcomlairVoiceGuide.readCurrent==="function")},
      {name:"Menu Assistance et réglages",ok:!!(window.LibcomlairGlobalAssistance&&typeof window.LibcomlairGlobalAssistance.open==="function")},
      {name:"Bouton réglages global",ok:!!document.getElementById("libcomlairGlobalMenuButton")},
      {name:"Reconnaissance vocale navigateur",ok:!!(window.SpeechRecognition||window.webkitSpeechRecognition)}
    ];
    return {ok:checks.every(x=>x.ok),checks,version:"v224-1"};
  }

  function appendToDiagnostic(){
    const result=snapshot();
    window.__libcomlairVoiceRegression=result;
    const box=document.getElementById("systemDiagnosticResult");
    if(box){
      const failed=result.checks.filter(x=>!x.ok);
      const suffix=result.ok
        ?" Contrôle vocal anti-régression : routeur, contexte, guide et menu réglages sont chargés."
        :" Contrôle vocal anti-régression en échec : "+failed.map(x=>x.name).join(", ")+".";
      if(!box.textContent.includes("Contrôle vocal anti-régression"))box.textContent+=suffix;
    }
    try{document.documentElement.dataset.libcomlairVoiceRegression=result.ok?"ok":"error"}catch(_){}
    return result;
  }

  document.addEventListener("click",e=>{
    if(e.target?.closest?.("#runSystemDiagnostic"))setTimeout(appendToDiagnostic,180);
  });
  setTimeout(appendToDiagnostic,1100);

  window.LibcomlairRegressionGuard=Object.freeze({version:"v224-1",run:appendToDiagnostic,snapshot});
})();