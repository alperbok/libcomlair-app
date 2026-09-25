(()=>{
  "use strict";
  const body=document.body;
  const apply=document.getElementById("applyAccessProfile");
  const skip=document.getElementById("skipAccessProfile");
  const change=document.getElementById("changeAccessProfile");
  const next=document.getElementById("v224Page3Next");
  const page3Mic=document.getElementById("v224Page3Mic");

  function showPage3(){
    body.classList.remove("v221-profile-step","v221-onboarding","v224-page4-step");
    body.classList.add("v224-page3-step");
    requestAnimationFrame(()=>{
      window.scrollTo({top:0,left:0,behavior:"auto"});
      document.getElementById("accessNeedsSection")?.scrollIntoView({block:"start"});
    });
  }

  apply?.addEventListener("click",()=>setTimeout(showPage3,0));
  skip?.addEventListener("click",()=>setTimeout(showPage3,0));

  change?.addEventListener("click",()=>{
    body.classList.remove("v224-page3-step","v224-page4-step");
    body.classList.add("v221-profile-step");
    requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:"auto"}));
  });

  next?.addEventListener("click",()=>{
    body.classList.remove("v224-page3-step");
    body.classList.add("v224-page4-step");
    requestAnimationFrame(()=>{
      document.getElementById("v224Page4SearchIntro")?.scrollIntoView({block:"start"});
    });
  });

  page3Mic?.addEventListener("click",()=>{
    const voiceControls=document.getElementById("visionVoiceControls");
    const realMic=document.getElementById("visionVoiceCommand");
    const announce=document.getElementById("visionReadPage");
    if(voiceControls && !voiceControls.hidden && realMic){
      realMic.click();
      return;
    }
    announce?.click();
  });
})();