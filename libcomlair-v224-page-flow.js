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
  const page5Mic=document.getElementById("v224Page5Mic");
  const page4Back=document.getElementById("v224Page4Back");
  const page5Back=document.getElementById("v224Page5Back");
  const page5Header=document.getElementById("v224Page5Header");
  const page5Title=document.getElementById("v224Page5Title");

  const profile=document.getElementById("accessNeedsSection");
  const start=document.querySelector("section.hero.v219-main-zone");
  const categories=document.getElementById("v224Page4Categories");
  const searchIntro=document.getElementById("v224Page4SearchIntro");

  const categoryIds=[
    "shopDetails","barDetails","hotelDetails","restaurantDetails",
    "leisureDetails","serviceDetails","transportDetails"
  ];
  const categoryPanels=categoryIds.map(id=>document.getElementById(id)).filter(Boolean);

  function forceShow(el,display="block"){
    if(!el)return;
    el.hidden=false;
    el.removeAttribute("hidden");
    el.style.setProperty("display",display,"important");
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

  function clearPage5State(){
    categoryPanels.forEach(el=>{
      el.classList.remove("v224-page5-active");
      el.open=false;
      el.style.removeProperty("display");
    });
    if(page5Header){
      page5Header.hidden=true;
      page5Header.setAttribute("hidden","");
      page5Header.style.removeProperty("display");
    }
    if(page5Back){
      page5Back.hidden=true;
      page5Back.setAttribute("hidden","");
      page5Back.style.removeProperty("display");
    }
  }

  function closeCategoryAccordions(){
    categoryPanels.forEach(el=>{
      el.hidden=false;
      el.removeAttribute("hidden");
      el.open=false;
      el.classList.remove("v224-page5-active");
      el.style.removeProperty("display");
    });
  }

  function showPage3(){
    body.classList.remove("v221-profile-step","v221-onboarding","v224-page4-step","v224-page5-step");
    body.classList.add("v224-page3-step");
    clearPage5State();
    showOnlySections([profile,start]);
    forceShow(start,"block");

    requestAnimationFrame(()=>{
      window.scrollTo({top:0,left:0,behavior:"auto"});
      profile?.scrollIntoView({block:"start"});
    });
  }

  function showPage4(){
    body.classList.remove("v221-profile-step","v221-onboarding","v224-page3-step","v224-page5-step");
    body.classList.add("v224-page4-step");
    clearPage5State();

    showOnlySections([start,categories]);
    forceShow(start,"flex");
    start?.style.setProperty("flex-direction","column","important");
    forceShow(categories,"block");

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

  function categoryName(details){
    const summary=[...details.children].find(el=>el.tagName==="SUMMARY");
    const raw=(summary&&summary.textContent) || "Catégorie";
    return raw.replace(/[▸▶▼]/g,"").trim();
  }

  function showPage5(details){
    if(!details)return;
    body.classList.remove("v221-profile-step","v221-onboarding","v224-page3-step","v224-page4-step");
    body.classList.add("v224-page5-step");

    showOnlySections([categories]);
    forceShow(categories,"block");

    categoryPanels.forEach(el=>{
      el.classList.toggle("v224-page5-active",el===details);
      if(el===details){
        el.hidden=false;
        el.removeAttribute("hidden");
        el.open=true;
        el.style.setProperty("display","block","important");
      }else{
        el.open=false;
        el.style.setProperty("display","none","important");
      }
    });

    if(page5Title) page5Title.textContent=categoryName(details);
    forceShow(page5Header,"block");
    forceShow(page5Back,"block");

    requestAnimationFrame(()=>{
      window.scrollTo({top:0,left:0,behavior:"auto"});
      page5Header?.scrollIntoView({block:"start"});
    });
  }

  apply?.addEventListener("click",()=>setTimeout(showPage3,20));
  skip?.addEventListener("click",()=>setTimeout(showPage3,20));

  change?.addEventListener("click",()=>{
    body.classList.remove("v224-page3-step","v224-page4-step","v224-page5-step");
    body.classList.add("v221-profile-step");
    clearPage5State();
    clearAllSectionDisplays();
    requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:"auto"}));
  });

  next?.addEventListener("click",showPage4);
  page4Back?.addEventListener("click",showPage3);
  page5Back?.addEventListener("click",showPage4);

  categoryPanels.forEach(details=>{
    const summary=[...details.children].find(el=>el.tagName==="SUMMARY");
    summary?.addEventListener("click",event=>{
      if(!body.classList.contains("v224-page4-step"))return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      showPage5(details);
    },true);
  });

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
  page5Mic?.addEventListener("click",activateMic);
})();