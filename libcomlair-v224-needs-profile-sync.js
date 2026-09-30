(()=>{
  "use strict";

  const ORDER=["mobility","vision","hearing","cognitive","assistance"];
  const FALLBACK_LABELS={
    mobility:"Mobilité",
    vision:"Vision",
    hearing:"Audition",
    cognitive:"Compréhension / cognition",
    assistance:"Assistance / accompagnement"
  };

  const body=document.body;
  const apply=document.getElementById("applyAccessProfile");
  const skip=document.getElementById("skipAccessProfile");
  const status=document.getElementById("activeAccessProfile");

  function labels(){return window.LibcomlairAccessibility?.labels||FALLBACK_LABELS}

  function checkedNeeds(){
    return [...document.querySelectorAll('input[name="accessProfile"]:checked')]
      .map(input=>input.value)
      .filter(value=>ORDER.includes(value));
  }

  function storedNeeds(){
    try{
      const profile=window.LibcomlairAccessibility?.read?.();
      if(profile&&Array.isArray(profile.needs))return profile.needs.filter(value=>ORDER.includes(value));
    }catch(_){}
    try{
      const profile=JSON.parse(localStorage.getItem("libcomlair-access-profile-v1")||"null");
      if(profile&&Array.isArray(profile.needs))return profile.needs.filter(value=>ORDER.includes(value));
    }catch(_){}
    return [];
  }

  function saveNeeds(needs){
    const clean=[...new Set((Array.isArray(needs)?needs:[]).filter(value=>ORDER.includes(value)))];
    try{
      if(window.LibcomlairAccessibility?.save?.(clean))return clean;
    }catch(_){}
    try{localStorage.setItem("libcomlair-access-profile-v1",JSON.stringify({needs:clean}))}catch(_){}
    return clean;
  }

  function updateStatus(needs){
    if(!status)return;
    const map=labels();
    const names=needs.map(key=>map[key]||key);
    if(!names.length){
      status.textContent="Aucune adaptation particulière sélectionnée.";
      return;
    }
    status.textContent=(names.length===1?"Profil actif : ":"Profils actifs : ")+names.join(", ")+".";
  }

  function updateFolderText(details,key,selected){
    const map=labels();
    const label=map[key]||key;
    const note=details.querySelector(".v224-needs-folder-body .data-note");
    if(note){
      note.textContent=selected
        ?"Critères d’accessibilité pour le handicap "+label+". Voici les choix proposés."
        :"Critères d’accessibilité associés au handicap "+label+".";
      note.dataset.voiceExplain="true";
    }
    const summary=details.querySelector(":scope > summary");
    if(summary){
      summary.setAttribute("aria-label","Critères pour le handicap "+label+(details.open?", ouverts":", fermés"));
    }
  }

  /*
    Le profil enregistré décide uniquement quels dossiers sont ouverts à l'entrée.
    Ensuite l'utilisateur peut ouvrir/fermer autant de dossiers qu'il veut.
    Aucun changement de classe du cadre ne doit resynchroniser `open`.
  */
  function syncNeedsPage(){
    const needs=storedNeeds();
    const selected=new Set(needs);
    document.querySelectorAll("#v224NeedsFolders details[data-need]").forEach(details=>{
      const key=details.dataset.need||"";
      const active=selected.has(key);
      details.open=active;
      updateFolderText(details,key,active);
      if(!details.dataset.v224IndependentToggle){
        details.dataset.v224IndependentToggle="true";
        details.addEventListener("toggle",()=>{
          updateFolderText(details,key,active);
          try{window.LibcomlairMasterFrameIntegration?.refresh?.()}catch(_){}
        });
      }
    });
    updateStatus(needs);
    body?.classList.toggle("v224-needs-multiple",needs.length>1);
    if(body?.classList.contains("v224-onboarding-needs")){
      requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:"auto"}));
    }
    try{window.dispatchEvent(new CustomEvent("libcomlair-needs-profile-synced",{detail:{needs:[...needs]}}))}catch(_){}
    return needs;
  }

  apply?.addEventListener("click",()=>{
    saveNeeds(checkedNeeds());
  },true);

  skip?.addEventListener("click",()=>{
    saveNeeds([]);
  },true);

  document.querySelectorAll('input[name="accessProfile"]').forEach(input=>{
    input.addEventListener("change",()=>{
      if(body?.classList.contains("v221-profile-step"))updateStatus(checkedNeeds());
    });
  });

  window.addEventListener("libcomlair-onboarding-step",event=>{
    if(event?.detail?.id!=="needs")return;
    setTimeout(syncNeedsPage,0);
    setTimeout(syncNeedsPage,120);
  });

  window.addEventListener("pageshow",()=>{
    if(body?.classList.contains("v224-onboarding-needs"))setTimeout(syncNeedsPage,50);
  });

  window.LibcomlairNeedsProfileSync=Object.freeze({
    version:"v224-2-independent-accordions",
    sync:syncNeedsPage,
    saveFromProfile:()=>saveNeeds(checkedNeeds()),
    read:storedNeeds
  });
})();