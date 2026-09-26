(()=>{
  "use strict";

  function menuHeaderOk(){
    const button=document.getElementById("libcomlairGlobalMenuButton");
    if(!button)return false;
    try{
      const style=getComputedStyle(button);
      const parent=button.parentElement;
      const parentOk=!!(parent&&(
        parent.classList.contains("v222-app-brand")||
        parent.id==="v224Page4Brand"||
        parent.id==="v224Page5Brand"
      ));
      return parentOk&&style.position==="absolute"&&style.left!=="auto"&&style.top!=="auto";
    }catch(_){return false}
  }

  function snapshot(){
    const checks=[
      {name:"Routeur micro contextuel",ok:!!(window.LibcomlairVoiceRouter&&window.LibcomlairVoiceRouter.version==="v224-5"&&typeof window.LibcomlairVoiceRouter.start==="function")},
      {name:"Contexte vocal",ok:!!(window.LibcomlairVoiceContext&&typeof window.LibcomlairVoiceContext.current==="function")},
      {name:"Guide vocal",ok:!!(window.LibcomlairVoiceGuide&&typeof window.LibcomlairVoiceGuide.readCurrent==="function")},
      {name:"Menu Assistance et réglages",ok:!!(window.LibcomlairGlobalAssistance&&window.LibcomlairGlobalAssistance.version==="v224-3"&&typeof window.LibcomlairGlobalAssistance.open==="function")},
      {name:"Bouton réglages global",ok:!!document.getElementById("libcomlairGlobalMenuButton")},
      {name:"Menu rattaché à l’en-tête du logo",ok:menuHeaderOk()},
      {name:"Reconnaissance vocale navigateur",ok:!!(window.SpeechRecognition||window.webkitSpeechRecognition)}
    ];
    return {ok:checks.every(x=>x.ok),checks,version:"v224-6"};
  }

  function appendToDiagnostic(){
    const result=snapshot();
    window.__libcomlairVoiceRegression=result;
    const box=document.getElementById("systemDiagnosticResult");
    if(box){
      const failed=result.checks.filter(x=>!x.ok);
      const suffix=result.ok
        ?" Contrôle vocal anti-régression : routeur, contexte, guide et menu réglages sont chargés ; le bouton réglages est rattaché à l’en-tête du logo."
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

  window.LibcomlairRegressionGuard=Object.freeze({version:"v224-6",run:appendToDiagnostic,snapshot});
})();