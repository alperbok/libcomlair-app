(()=>{
  "use strict";

  function menuPositionOk(){
    const button=document.getElementById("libcomlairGlobalMenuButton");
    if(!button)return false;
    try{
      const style=getComputedStyle(button);
      return style.position==="fixed"&&style.left!=="auto"&&style.top!=="auto";
    }catch(_){return false}
  }

  function snapshot(){
    const checks=[
      {name:"Routeur micro contextuel",ok:!!(window.LibcomlairVoiceRouter&&window.LibcomlairVoiceRouter.version==="v224-2"&&typeof window.LibcomlairVoiceRouter.start==="function")},
      {name:"Contexte vocal",ok:!!(window.LibcomlairVoiceContext&&typeof window.LibcomlairVoiceContext.current==="function")},
      {name:"Guide vocal",ok:!!(window.LibcomlairVoiceGuide&&typeof window.LibcomlairVoiceGuide.readCurrent==="function")},
      {name:"Menu Assistance et réglages",ok:!!(window.LibcomlairGlobalAssistance&&window.LibcomlairGlobalAssistance.version==="v224-2"&&typeof window.LibcomlairGlobalAssistance.open==="function")},
      {name:"Bouton réglages global",ok:!!document.getElementById("libcomlairGlobalMenuButton")},
      {name:"Position fixe du menu réglages",ok:menuPositionOk()},
      {name:"Reconnaissance vocale navigateur",ok:!!(window.SpeechRecognition||window.webkitSpeechRecognition)}
    ];
    return {ok:checks.every(x=>x.ok),checks,version:"v224-2"};
  }

  function appendToDiagnostic(){
    const result=snapshot();
    window.__libcomlairVoiceRegression=result;
    const box=document.getElementById("systemDiagnosticResult");
    if(box){
      const failed=result.checks.filter(x=>!x.ok);
      const suffix=result.ok
        ?" Contrôle vocal anti-régression : routeur, contexte, guide, menu réglages et position fixe sont chargés correctement."
        :" Contrôle vocal anti-régression en échec : "+failed.map(x=>x.name).join(", ")+".";
      box.textContent=box.textContent.replace(/ Contrôle vocal anti-régression[^]*$/m,"");
      box.textContent+=suffix;
    }
    try{document.documentElement.dataset.libcomlairVoiceRegression=result.ok?"ok":"error"}catch(_){}
    return result;
  }

  document.addEventListener("click",e=>{
    if(e.target?.closest?.("#runSystemDiagnostic"))setTimeout(appendToDiagnostic,180);
  });
  setTimeout(appendToDiagnostic,1100);

  window.LibcomlairRegressionGuard=Object.freeze({version:"v224-2",run:appendToDiagnostic,snapshot});
})();