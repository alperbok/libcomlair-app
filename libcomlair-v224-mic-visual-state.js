(()=>{
  "use strict";

  const MIC_IDS=["v222ProfileMic","v224Page3Mic","v224Page4Mic","v224Page5Mic","visionVoiceCommand"];

  function recognitionActive(){
    try{return !!window.LibcomlairVoice?.isRecognitionActive?.()}catch(_){return false}
  }

  function buttons(){
    return MIC_IDS.map(id=>document.getElementById(id)).filter(Boolean);
  }

  function sync(){
    const active=recognitionActive();
    let updated=0;
    for(const button of buttons()){
      button.dataset.micListening=active?"true":"false";
      button.setAttribute("aria-pressed",active?"true":"false");
      button.setAttribute("data-mic-state",active?"listening":"idle");
      updated++;
    }
    try{document.documentElement.dataset.libcomlairMicVisualState=active?"listening":"idle"}catch(_){}
    return {ok:updated>0,active,buttons:updated};
  }

  function diagnose(){
    const active=recognitionActive();
    const list=buttons();
    const mismatched=list.filter(button=>(button.dataset.micListening==="true")!==active);
    return {
      ok:list.length>0&&mismatched.length===0,
      active,
      buttons:list.length,
      mismatched:mismatched.map(button=>button.id),
      version:"v224-1"
    };
  }

  function repair(){
    const before=diagnose();
    const result=sync();
    const after=diagnose();
    return {ok:after.ok,before,after,result};
  }

  window.addEventListener("libcomlair-voice-status",sync);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")sync()});
  document.addEventListener("DOMContentLoaded",sync,{once:true});
  setTimeout(sync,500);

  window.LibcomlairMicVisualState=Object.freeze({version:"v224-1",sync,diagnose,repair});
})();
