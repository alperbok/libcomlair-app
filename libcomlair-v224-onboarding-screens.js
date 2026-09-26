(()=>{
  "use strict";

  const body=document.body;
  const profile=document.getElementById("accessNeedsSection");
  const start=document.querySelector("section.hero.v219-main-zone");
  const voice=document.getElementById("visionVoiceControls");
  const tutorial=document.getElementById("libcomlairTutorial");
  const speech=document.getElementById("speechChoiceControls");
  const next=document.getElementById("v224Page3Next");
  const apply=document.getElementById("applyAccessProfile");
  const skip=document.getElementById("skipAccessProfile");
  const change=document.getElementById("changeAccessProfile");

  if(!body||!profile||!start||!voice||!tutorial||!next)return;

  let current="";
  let tutorialAutoRead=true;

  function show(el,display="block"){
    if(!el)return;
    el.hidden=false;
    el.removeAttribute("hidden");
    el.style.setProperty("display",display,"important");
  }

  function hide(el){
    if(!el)return;
    el.style.setProperty("display","none","important");
  }

  function clearSubstepClasses(){
    body.classList.remove("v224-onboarding-voice","v224-onboarding-tutorial","v224-onboarding-home");
  }

  function makeButton(id,text){
    let button=document.getElementById(id);
    if(button)return button;
    button=document.createElement("button");
    button.id=id;
    button.type="button";
    button.className="details-btn v224-onboarding-action";
    button.textContent=text;
    return button;
  }

  function ensureStructure(){
    let voiceTitle=document.getElementById("v224VoiceModeScreenTitle");
    if(!voiceTitle){
      voiceTitle=document.createElement("h2");
      voiceTitle.id="v224VoiceModeScreenTitle";
      voiceTitle.className="v224-onboarding-screen-title";
      voiceTitle.textContent="Navigation vocale";
      start.insertBefore(voiceTitle,voice);
    }

    let tutorialTitle=document.getElementById("v224TutorialScreenTitle");
    if(!tutorialTitle){
      tutorialTitle=document.createElement("h2");
      tutorialTitle.id="v224TutorialScreenTitle";
      tutorialTitle.className="v224-onboarding-screen-title";
      tutorialTitle.textContent="Comment fonctionne Libcomlair ?";
      start.insertBefore(tutorialTitle,tutorial);
    }

    let homeTitle=document.getElementById("v224HomeSearchTitle");
    if(!homeTitle){
      homeTitle=document.createElement("h2");
      homeTitle.id="v224HomeSearchTitle";
      homeTitle.className="v224-onboarding-screen-title";
      homeTitle.textContent="Accueil / Recherche";
      start.insertBefore(homeTitle,start.firstChild);
    }

    let voiceActions=document.getElementById("v224VoiceModeActions");
    if(!voiceActions){
      voiceActions=document.createElement("div");
      voiceActions.id="v224VoiceModeActions";
      voiceActions.className="v224-onboarding-actions";
      const back=makeButton("v224VoiceModeBack","Retour");
      const validate=makeButton("v224VoiceModeValidate","Valider");
      voiceActions.append(back,validate);
      voice.appendChild(voiceActions);
      back.addEventListener("click",()=>{
        current="";
        clearSubstepClasses();
        change?.click();
      });
      validate.addEventListener("click",()=>showTutorial({autoRead:true}));
    }

    let tutorialActions=document.getElementById("v224TutorialActions");
    if(!tutorialActions){
      tutorialActions=document.createElement("div");
      tutorialActions.id="v224TutorialActions";
      tutorialActions.className="v224-onboarding-actions";
      const back=makeButton("v224TutorialBack","Retour");
      const onward=makeButton("v224TutorialNext","Suivant");
      tutorialActions.append(back,onward);
      tutorial.appendChild(tutorialActions);
      back.addEventListener("click",()=>showVoice());
      onward.addEventListener("click",()=>showHome());
    }

    const read=document.getElementById("readLibcomlairTutorial");
    if(read){
      read.textContent="🔊 Lire";
      read.setAttribute("aria-label","Lire");
    }

    let compact=document.getElementById("v224OnboardingCompactChoices");
    if(!compact){
      compact=document.createElement("div");
      compact.id="v224OnboardingCompactChoices";
      compact.className="v224-onboarding-compact";

      const voiceCompact=makeButton("v224ReopenVoiceMode","Navigation vocale");
      const tutorialCompact=makeButton("v224ReopenTutorial","Comment fonctionne Libcomlair ?");
      compact.append(voiceCompact,tutorialCompact);
      start.insertBefore(compact,next);
      voiceCompact.addEventListener("click",()=>showVoice());
      tutorialCompact.addEventListener("click",()=>showTutorial({autoRead:false}));
    }

    next.textContent="Rechercher";
    next.setAttribute("aria-label","Rechercher");
    updateCompactMode();
  }

  function updateCompactMode(){
    const button=document.getElementById("v224ReopenVoiceMode");
    if(!button)return;
    let mode="Découverte guidée";
    try{
      mode=window.LibcomlairVoiceContext?.getMode?.()==="simplified"?"Simplifié":"Découverte guidée";
    }catch(_){}
    button.textContent="Navigation vocale — "+mode;
    button.setAttribute("aria-label","Navigation vocale, mode "+mode);
  }

  function hideStartChildren(){
    [...start.children].forEach(hide);
  }

  function preparePage3Shell(){
    show(profile,"block");
    show(start,"flex");
    start.style.setProperty("flex-direction","column","important");
    window.scrollTo({top:0,left:0,behavior:"auto"});
  }

  function showVoice(){
    ensureStructure();
    current="voice";
    clearSubstepClasses();
    body.classList.add("v224-onboarding-voice");
    preparePage3Shell();
    hideStartChildren();
    show(document.getElementById("v224VoiceModeScreenTitle"));
    show(voice,"block");
    voice.hidden=false;
    const oldStart=document.getElementById("visionGuideStart");
    if(oldStart)hide(oldStart);
    const oldPrompt=document.getElementById("visionGuidePrompt");
    if(oldPrompt)hide(oldPrompt);
    const legacy=document.getElementById("visionVoiceCommand");
    if(legacy)hide(legacy);
    setTimeout(()=>{
      const fieldset=document.getElementById("visionAssistanceMode");
      if(fieldset)show(fieldset,"block");
      show(document.getElementById("v224VoiceModeActions"),"grid");
      window.LibcomlairVoiceContext?.refresh?.("onboarding-voice-screen");
    },30);
  }

  function hasVisionProfile(){
    try{
      const profileData=JSON.parse(localStorage.getItem("libcomlair-access-profile-v1")||"null");
      return !!(profileData&&Array.isArray(profileData.needs)&&profileData.needs.includes("vision"));
    }catch(_){return false}
  }

  function showTutorial(options){
    ensureStructure();
    current="tutorial";
    tutorialAutoRead=!(options&&options.autoRead===false);
    clearSubstepClasses();
    body.classList.add("v224-onboarding-tutorial");
    preparePage3Shell();
    hideStartChildren();
    show(document.getElementById("v224TutorialScreenTitle"));
    tutorial.open=true;
    show(tutorial,"block");
    const summary=tutorial.querySelector(":scope > summary");
    if(summary)hide(summary);
    show(document.getElementById("libcomlairTutorialText"),"block");
    show(document.getElementById("v224TutorialActions"),"grid");
    setTimeout(()=>{
      window.LibcomlairVoiceContext?.refresh?.("onboarding-tutorial-screen");
      if(tutorialAutoRead&&hasVisionProfile()){
        const read=document.getElementById("readLibcomlairTutorial");
        if(read)read.click();
      }
    },160);
  }

  function showHome(){
    ensureStructure();
    current="home";
    clearSubstepClasses();
    body.classList.add("v224-onboarding-home");
    preparePage3Shell();
    hideStartChildren();
    updateCompactMode();
    show(document.getElementById("v224HomeSearchTitle"));
    if(speech)show(speech,"block");
    show(document.getElementById("v224OnboardingCompactChoices"),"grid");
    show(next,"block");
    window.LibcomlairVoiceContext?.refresh?.("onboarding-home-screen");
  }

  function beginAfterProfile(){
    setTimeout(()=>{
      if(body.classList.contains("v224-page3-step"))showVoice();
    },30);
  }

  apply?.addEventListener("click",beginAfterProfile);
  skip?.addEventListener("click",beginAfterProfile);
  change?.addEventListener("click",()=>{
    current="";
    clearSubstepClasses();
  });
  next.addEventListener("click",()=>{
    current="";
    clearSubstepClasses();
  });

  window.addEventListener("libcomlair-voice-mode-change",()=>updateCompactMode());

  ensureStructure();

  window.LibcomlairOnboardingScreens=Object.freeze({
    version:"v224-1",
    current:()=>current,
    showVoice,
    showTutorial:()=>showTutorial({autoRead:false}),
    showHome,
    updateCompactMode
  });
})();
