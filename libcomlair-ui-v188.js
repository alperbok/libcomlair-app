(function(){
  "use strict";

  function bind(){
    const toggle=document.getElementById("toggleSystemDiagnostic");
    const panel=document.getElementById("systemDiagnosticPanel");
    if(toggle&&panel&&!toggle.dataset.bound){
      toggle.dataset.bound="true";
      toggle.addEventListener("click",()=>{
        const willOpen=panel.hidden;
        panel.hidden=!willOpen;
        toggle.setAttribute("aria-expanded",willOpen?"true":"false");
        toggle.textContent=willOpen?"🧪 Masquer le diagnostic":"🧪 Diagnostic de fonctionnement";
        if(willOpen){
          const result=document.getElementById("systemDiagnosticResult");
          if(result&&!result.textContent)result.textContent="Diagnostic prêt.";
        }
      });
    }

    const voiceTest=document.getElementById("visionVoiceTest");
    if(voiceTest&&!voiceTest.dataset.renderUnlock){
      voiceTest.dataset.renderUnlock="true";
      voiceTest.addEventListener("pointerdown",()=>{
        try{
          const p=window.LibcomlairRenderVoice;
          if(p&&typeof p.unlockAudio==="function")p.unlockAudio();
        }catch(_){}
      },{passive:true});
    }
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});
  else bind();
})();