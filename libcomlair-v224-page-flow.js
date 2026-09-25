(()=>{
  "use strict";
  const body=document.body;
  const main=document.getElementById("mainContent");
  const apply=document.getElementById("applyAccessProfile");
  const skip=document.getElementById("skipAccessProfile");
  const change=document.getElementById("changeAccessProfile");
  const next=document.getElementById("v224Page3Next");
  const page3Mic=document.getElementById("v224Page3Mic");
  const page4Mic=document.getElementById("v224Page4Mic");
  const page4Back=document.getElementById("v224Page4Back");

  const profile=document.getElementById("accessNeedsSection");
  const start=document.querySelector("section.hero.v219-main-zone");
  const categories=document.getElementById("v224Page4Categories");
  const searchIntro=document.getElementById("v224Page4SearchIntro");

  function forceShow(el){
    if(!el)return;
    el.hidden=false;
    el.removeAttribute("hidden");
    el.style.setProperty("display","block","important");
    el.style.removeProperty("visibility");
    el.style.removeProperty("opacity");
  }

  function forceHide(el){
    if(!el)return;
    el.style.setProperty("display","none","important");
  }

  function clearDisplay(el){
    if(!el)return;
    el.style.removeProperty("display");
  }

  function directSections(){
    return main ? [...main.children].filter(el=>el.tagName==="SECTION") : [];
  }

  function showOnlySections(allowed){
    const keep=new Set(allowed.filter(Boolean));
    directSections().forEach(section=>{
      if(keep.has(section)) forceShow(section);
      else forceHide(section);
    });
  }

  function clearAllSectionDisplays(){
    directSections().forEach(clearDisplay);
  }

  function closeCategoryAccordions(){
    ["shopDetails","barDetails","hotelDetails","restaurantDetails","leisureDetails","serviceDetails","transportDetails"].forEach(id=>{
      const el=document.getElementById(id);
      if(!el)return;
      el.hidden=false;
      el.removeAttribute("hidden");
      el.open=false;
      el.style.removeProperty("display");
    });
  }

  function showPage3(){
    body.classList.remove("v221-profile-step","v221-onboarding","v224-page4-step");
    body.classList.add("v224-page3-step");

    showOnlySections([profile,start]);

    requestAnimationFrame(()=>{
      window.scrollTo({top:0,left:0,behavior:"auto"});
      profile?.scrollIntoView({block:"start"});
    });
  }

  function showPage4(){
    body.classList.remove("v221-profile-step","v221-onboarding","v224-page3-step");
    body.classList.add("v224-page4-step");

    showOnlySections([start,categories]);

    if(searchIntro){
      searchIntro.hidden=false;
      searchIntro.removeAttribute("hidden");
      searchIntro.style.removeProperty("display");
    }

    closeCategoryAccordions();

    requestAnimationFrame(()=>{
      window.scrollTo({top:0,left:0,behavior:"auto"});
      searchIntro?.scrollIntoView({block:"start"});
    });
  }

  apply?.addEventListener("click",()=>setTimeout(showPage3,20));
  skip?.addEventListener("click",()=>setTimeout(showPage3,20));

  change?.addEventListener("click",()=>{
    body.classList.remove("v224-page3-step","v224-page4-step");
    body.classList.add("v221-profile-step");
    clearAllSectionDisplays();
    requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:"auto"}));
  });

  next?.addEventListener("click",showPage4);
  page4Back?.addEventListener("click",showPage3);

  function activateMic(){
    const voiceControls=document.getElementById("visionVoiceControls");
    const realMic=document.getElementById("visionVoiceCommand");
    const announce=document.getElementById("visionReadPage");
    if(voiceControls && !voiceControls.hidden && realMic){
      realMic.click();
      return;
    }
    announce?.click();
  }

  page3Mic?.addEventListener("click",activateMic);
  page4Mic?.addEventListener("click",activateMic);
})();