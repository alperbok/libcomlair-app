(()=>{
  "use strict";
  const body=document.body;
  const apply=document.getElementById("applyAccessProfile");
  const skip=document.getElementById("skipAccessProfile");
  const change=document.getElementById("changeAccessProfile");
  const next=document.getElementById("v224Page3Next");
  const page3Mic=document.getElementById("v224Page3Mic");

  function forceShow(el){
    if(!el)return;
    el.hidden=false;
    el.removeAttribute("hidden");
    el.style.setProperty("display","block","important");
    el.style.removeProperty("visibility");
    el.style.removeProperty("opacity");
  }

  function showPage3(){
    body.classList.remove("v221-profile-step","v221-onboarding","v224-page4-step");
    body.classList.add("v224-page3-step");

    const profile=document.getElementById("accessNeedsSection");
    const start=document.querySelector("section.hero.v219-main-zone");
    forceShow(profile);
    forceShow(start);

    requestAnimationFrame(()=>{
      window.scrollTo({top:0,left:0,behavior:"auto"});
      profile?.scrollIntoView({block:"start"});
    });
  }

  apply?.addEventListener("click",()=>setTimeout(showPage3,20));
  skip?.addEventListener("click",()=>setTimeout(showPage3,20));

  change?.addEventListener("click",()=>{
    body.classList.remove("v224-page3-step","v224-page4-step");
    body.classList.add("v221-profile-step");
    const profile=document.getElementById("accessNeedsSection");
    const start=document.querySelector("section.hero.v219-main-zone");
    if(profile)profile.style.removeProperty("display");
    if(start)start.style.removeProperty("display");
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