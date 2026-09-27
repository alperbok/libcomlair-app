(()=>{
  "use strict";

  const body=document.body;
  const needsSection=document.getElementById("accessNeedsSection");
  const start=document.querySelector("section.hero.v219-main-zone");
  const voice=document.getElementById("visionVoiceControls");
  const tutorial=document.getElementById("libcomlairTutorial");
  const speech=document.getElementById("speechChoiceControls");
  const next=document.getElementById("v224Page3Next");
  const apply=document.getElementById("applyAccessProfile");
  const skip=document.getElementById("skipAccessProfile");
  const change=document.getElementById("changeAccessProfile");
  const page4Back=document.getElementById("v224Page4Back");
  const accessFilters=document.getElementById("accessFilters");

  if(!body||!needsSection||!start||!voice||!tutorial||!next)return;

  let current="";
  let criteriaObserver=null;

  const FALLBACK_GROUPS=Object.freeze({
    mobility:["Entrée sans marche","Toilettes accessibles","Ascenseur","Stationnement adapté","Chambre accessible"],
    vision:["Guidage tactile","Bandes d’éveil à la vigilance","Balises sonores","Braille ou relief","Chien guide / d’assistance accepté"],
    hearing:["Information visuelle","Boucle magnétique"],
    cognitive:["Signalétique simplifiée","Orientation facilitée","Espace calme disponible"],
    assistance:["Personnel disponible","Assistance sur demande","Chien guide / d’assistance accepté"]
  });
  const FALLBACK_LABELS=Object.freeze({
    mobility:"Mobilité",vision:"Vision",hearing:"Audition",
    cognitive:"Compréhension / cognition",assistance:"Assistance / accompagnement"
  });
  const ICONS=Object.freeze({mobility:"♿",vision:"👁",hearing:"👂",cognitive:"🧭",assistance:"🤝"});

  function show(el,display="block"){
    if(!el)return;
    el.hidden=false;
    el.removeAttribute("hidden");
    el.style.setProperty("display",display,"important");
  }
  function hide(el){if(el)el.style.setProperty("display","none","important")}
  function norm(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim().toLowerCase()}
  function clearSubstepClasses(){
    body.classList.remove("v224-onboarding-needs","v224-onboarding-voice","v224-onboarding-tutorial","v224-onboarding-home");
  }
  function makeButton(id,text){
    let button=document.getElementById(id);
    if(button)return button;
    button=document.createElement("button");
    button.id=id;button.type="button";button.className="details-btn v224-onboarding-action";button.textContent=text;
    return button;
  }
  function selectedNeeds(){
    try{
      const p=window.LibcomlairAccessibility?.read?.();
      if(p&&Array.isArray(p.needs))return p.needs;
    }catch(_){}
    return [...document.querySelectorAll('input[name="accessProfile"]:checked')].map(x=>x.value);
  }
  function filterGroups(){return window.LibcomlairAccessibility?.filterGroups||FALLBACK_GROUPS}
  function labels(){return window.LibcomlairAccessibility?.labels||FALLBACK_LABELS}

  function originalFilterFor(text){
    const target=norm(text);
    for(const input of document.querySelectorAll('#accessFilters input[type="checkbox"]')){
      const label=input.closest("label")||document.querySelector('label[for="'+CSS.escape(input.id||"")+'"]');
      if(norm(label?.textContent)===target)return input;
    }
    return null;
  }
  function syncProxy(proxy){
    if(!proxy)return;
    const original=originalFilterFor(proxy.dataset.filterLabel||"");
    if(original)proxy.checked=!!original.checked;
  }
  function syncAllProxies(){document.querySelectorAll('#v224NeedsFolders input[data-filter-label]').forEach(syncProxy)}
  function changeProxy(proxy){
    const original=originalFilterFor(proxy.dataset.filterLabel||"");
    if(!original)return;
    original.checked=proxy.checked;
    original.dispatchEvent(new Event("input",{bubbles:true}));
    original.dispatchEvent(new Event("change",{bubbles:true}));
  }

  function ensureNeedsFolders(){
    let folders=document.getElementById("v224NeedsFolders");
    if(!folders){
      folders=document.createElement("div");
      folders.id="v224NeedsFolders";
      folders.className="v224-needs-folders";
      const status=document.getElementById("activeAccessProfile");
      (status||needsSection.querySelector("h2"))?.insertAdjacentElement("afterend",folders);

      const groupData=filterGroups(),labelData=labels();
      ["mobility","vision","hearing","cognitive","assistance"].forEach(key=>{
        const details=document.createElement("details");
        details.id="v224NeedFolder-"+key;
        details.className="v224-needs-folder";
        details.dataset.need=key;
        const summary=document.createElement("summary");
        summary.className="details-btn";
        summary.innerHTML="<strong>"+(ICONS[key]||"")+" "+(labelData[key]||key)+"</strong>";
        const bodyBox=document.createElement("div");
        bodyBox.className="v224-needs-folder-body";
        const note=document.createElement("p");
        note.className="data-note";
        note.textContent="Critères d’accessibilité associés à ce besoin.";
        bodyBox.appendChild(note);
        (groupData[key]||[]).forEach(text=>{
          const label=document.createElement("label");
          label.className="v224-needs-criterion";
          const input=document.createElement("input");
          input.type="checkbox";
          input.dataset.filterLabel=text;
          input.setAttribute("aria-label",text);
          label.append(input,document.createTextNode(" "+text));
          input.addEventListener("change",()=>changeProxy(input));
          bodyBox.appendChild(label);
        });
        details.append(summary,bodyBox);
        folders.appendChild(details);
      });
    }

    let actions=document.getElementById("v224NeedsActions");
    if(!actions){
      actions=document.createElement("div");
      actions.id="v224NeedsActions";
      actions.className="v224-onboarding-actions";
      const back=change||makeButton("v224NeedsBack","Retour");
      back.textContent="Retour";
      back.setAttribute("aria-label","Retour");
      const validate=makeButton("v224NeedsValidate","Valider");
      actions.append(back,validate);
      needsSection.appendChild(actions);
      validate.addEventListener("click",()=>showVoice());
    }

    if(accessFilters&&!criteriaObserver){
      criteriaObserver=new MutationObserver(()=>syncAllProxies());
      criteriaObserver.observe(accessFilters,{childList:true,subtree:true,attributes:true,attributeFilter:["checked"]});
    }
    updateNeedsFolders();
  }

  function updateNeedsFolders(){
    const chosen=new Set(selectedNeeds());
    document.querySelectorAll("#v224NeedsFolders details[data-need]").forEach(d=>{d.open=chosen.has(d.dataset.need)});
    syncAllProxies();
  }

  function normalizeAssistanceOptionLabels(){
    const fieldset=document.getElementById("visionAssistanceMode");
    if(!fieldset)return;
    fieldset.querySelectorAll("label").forEach(label=>{
      if(label.querySelector(".v224-assistance-option-text"))return;
      const input=label.querySelector('input[type="radio"]');
      if(!input)return;
      const span=document.createElement("span");
      span.className="v224-assistance-option-text";
      [...label.childNodes].forEach(node=>{if(node!==input)span.appendChild(node)});
      label.appendChild(span);
    });
  }

  function ensureStructure(){
    ensureNeedsFolders();
    let voiceTitle=document.getElementById("v224VoiceModeScreenTitle");
    if(!voiceTitle){voiceTitle=document.createElement("h2");voiceTitle.id="v224VoiceModeScreenTitle";voiceTitle.className="v224-onboarding-screen-title";voiceTitle.textContent="Navigation vocale";start.insertBefore(voiceTitle,voice)}
    let tutorialTitle=document.getElementById("v224TutorialScreenTitle");
    if(!tutorialTitle){tutorialTitle=document.createElement("h2");tutorialTitle.id="v224TutorialScreenTitle";tutorialTitle.className="v224-onboarding-screen-title";tutorialTitle.textContent="Comment fonctionne Libcomlair ?";start.insertBefore(tutorialTitle,tutorial)}
    let homeTitle=document.getElementById("v224HomeSearchTitle");
    if(!homeTitle){homeTitle=document.createElement("h2");homeTitle.id="v224HomeSearchTitle";homeTitle.className="v224-onboarding-screen-title";homeTitle.textContent="Accueil / Recherche";start.insertBefore(homeTitle,start.firstChild)}

    normalizeAssistanceOptionLabels();

    let voiceActions=document.getElementById("v224VoiceModeActions");
    if(!voiceActions){
      voiceActions=document.createElement("div");voiceActions.id="v224VoiceModeActions";voiceActions.className="v224-onboarding-actions";
      const back=makeButton("v224VoiceModeBack","Retour"),validate=makeButton("v224VoiceModeValidate","Valider");
      voiceActions.append(back,validate);voice.appendChild(voiceActions);
      back.addEventListener("click",()=>showNeeds());
      validate.addEventListener("click",()=>showTutorial());
    }

    let tutorialActions=document.getElementById("v224TutorialActions");
    if(!tutorialActions){
      tutorialActions=document.createElement("div");tutorialActions.id="v224TutorialActions";tutorialActions.className="v224-onboarding-actions";
      const back=makeButton("v224TutorialBack","Retour"),onward=makeButton("v224TutorialNext","Suivant");
      tutorialActions.append(back,onward);tutorial.appendChild(tutorialActions);
      back.addEventListener("click",()=>showVoice());onward.addEventListener("click",()=>showHome());
    }

    const read=document.getElementById("readLibcomlairTutorial");
    if(read){read.textContent="🔊 Lire";read.setAttribute("aria-label","Lire")}

    let compact=document.getElementById("v224OnboardingCompactChoices");
    if(!compact){
      compact=document.createElement("div");compact.id="v224OnboardingCompactChoices";compact.className="v224-onboarding-compact";
      const voiceCompact=makeButton("v224ReopenVoiceMode","Navigation vocale"),tutorialCompact=makeButton("v224ReopenTutorial","Comment fonctionne Libcomlair ?");
      compact.append(voiceCompact,tutorialCompact);start.insertBefore(compact,next);
      voiceCompact.addEventListener("click",()=>showVoice());tutorialCompact.addEventListener("click",()=>showTutorial());
    }

    let homeActions=document.getElementById("v224HomeActions");
    if(!homeActions){
      homeActions=document.createElement("div");homeActions.id="v224HomeActions";homeActions.className="v224-onboarding-actions";
      const back=makeButton("v224HomeBack","Retour");
      next.textContent="Rechercher";next.setAttribute("aria-label","Rechercher");
      homeActions.append(back,next);start.appendChild(homeActions);
      back.addEventListener("click",()=>showTutorial());
    }
    updateCompactMode();
  }

  function updateCompactMode(){
    const button=document.getElementById("v224ReopenVoiceMode");if(!button)return;
    let mode="Découverte guidée";
    try{mode=window.LibcomlairVoiceContext?.getMode?.()==="simplified"?"Simplifié":"Découverte guidée"}catch(_){}
    button.textContent="Navigation vocale — "+mode;button.setAttribute("aria-label","Navigation vocale, mode "+mode);
  }
  function hideStartChildren(){[...start.children].forEach(hide)}
  function preparePage3Shell(){show(needsSection,"block");show(start,"flex");start.style.setProperty("flex-direction","column","important");window.scrollTo({top:0,left:0,behavior:"auto"})}
  function notify(step){
    setTimeout(()=>{
      try{window.LibcomlairVoiceContext?.refresh?.("onboarding-"+step)}catch(_){}
      try{window.dispatchEvent(new CustomEvent("libcomlair-onboarding-step",{detail:{id:step}}))}catch(_){}
    },90);
  }

  function showNeeds(){
    ensureStructure();current="needs";clearSubstepClasses();body.classList.add("v224-onboarding-needs");
    preparePage3Shell();hide(start);updateNeedsFolders();
    [...needsSection.children].forEach(el=>show(el,el.id==="v224NeedsActions"?"grid":"block"));
    const brand=needsSection.querySelector(".v222-app-brand");if(brand)show(brand,"flex");
    notify("needs");
  }

  function showVoice(){
    ensureStructure();normalizeAssistanceOptionLabels();current="voice";clearSubstepClasses();body.classList.add("v224-onboarding-voice");
    preparePage3Shell();hideStartChildren();show(document.getElementById("v224VoiceModeScreenTitle"));show(voice,"flex");voice.hidden=false;
    ["visionGuideStart","visionGuidePrompt","visionVoiceCommand"].forEach(id=>hide(document.getElementById(id)));
    setTimeout(()=>{const fieldset=document.getElementById("visionAssistanceMode");if(fieldset)show(fieldset,"flex");show(document.getElementById("v224VoiceModeActions"),"grid");notify("voice")},30);
  }

  function showTutorial(){
    ensureStructure();current="tutorial";clearSubstepClasses();body.classList.add("v224-onboarding-tutorial");
    preparePage3Shell();hideStartChildren();show(document.getElementById("v224TutorialScreenTitle"));tutorial.open=true;show(tutorial,"flex");
    const summary=tutorial.querySelector(":scope > summary");if(summary)hide(summary);
    show(document.getElementById("libcomlairTutorialText"),"flex");show(document.getElementById("v224TutorialActions"),"grid");
    const read=document.getElementById("readLibcomlairTutorial");
    const guided=window.LibcomlairVoiceContext?.getMode?.()!=="simplified";
    if(read){if(guided)hide(read);else show(read,"block")}
    notify("tutorial");
  }

  function showHome(){
    ensureStructure();current="home";clearSubstepClasses();body.classList.add("v224-onboarding-home");
    preparePage3Shell();hideStartChildren();updateCompactMode();show(document.getElementById("v224HomeSearchTitle"));
    if(speech)show(speech,"block");show(document.getElementById("v224OnboardingCompactChoices"),"grid");show(document.getElementById("v224HomeActions"),"grid");show(next,"block");notify("home");
  }

  function clearOnboardingArtifactsForSearch(){
    ["v224HomeSearchTitle","v224VoiceModeScreenTitle","v224TutorialScreenTitle","v224OnboardingCompactChoices","v224VoiceModeActions","v224TutorialActions","v224HomeActions","v224Page3Next"].forEach(id=>hide(document.getElementById(id)));
    if(speech)hide(speech);hide(voice);hide(tutorial);hide(needsSection);
  }

  apply?.addEventListener("click",()=>setTimeout(()=>{if(body.classList.contains("v224-page3-step"))showNeeds()},35));
  skip?.addEventListener("click",()=>setTimeout(()=>{if(body.classList.contains("v224-page3-step"))showVoice()},35));
  change?.addEventListener("click",()=>{current="";clearSubstepClasses()});
  next.addEventListener("click",()=>{current="";clearSubstepClasses();requestAnimationFrame(clearOnboardingArtifactsForSearch)});

  page4Back?.addEventListener("click",event=>{
    if(!body.classList.contains("v224-page4-step"))return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();showHome();
  },true);

  window.addEventListener("libcomlair-voice-mode-change",()=>{updateCompactMode();if(current==="tutorial")showTutorial()});

  ensureStructure();
  window.LibcomlairOnboardingScreens=Object.freeze({
    version:"v224-5",current:()=>current,showNeeds,showVoice,showTutorial,showHome,updateCompactMode
  });
})();