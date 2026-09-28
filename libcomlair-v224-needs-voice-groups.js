(()=>{
  "use strict";

  const base=window.LibcomlairVoiceGuide;
  if(!base)return;

  const ORDER=["mobility","vision","hearing","cognitive","assistance"];
  const FALLBACK_LABELS={
    mobility:"Mobilité",
    vision:"Vision",
    hearing:"Audition",
    cognitive:"Compréhension / cognition",
    assistance:"Assistance / accompagnement"
  };
  const FALLBACK_GROUPS={
    mobility:["Entrée sans marche","Toilettes accessibles","Ascenseur","Stationnement adapté","Chambre accessible"],
    vision:["Guidage tactile","Bandes d’éveil à la vigilance","Balises sonores","Braille ou relief","Chien guide / d’assistance accepté"],
    hearing:["Information visuelle","Boucle magnétique"],
    cognitive:["Signalétique simplifiée","Orientation facilitée","Espace calme disponible"],
    assistance:["Personnel disponible","Assistance sur demande","Chien guide / d’assistance accepté"]
  };

  function needs(){
    try{
      const value=window.LibcomlairNeedsProfileSync?.read?.();
      if(Array.isArray(value))return value.filter(key=>ORDER.includes(key));
    }catch(_){}
    try{
      const profile=window.LibcomlairAccessibility?.read?.();
      if(profile&&Array.isArray(profile.needs))return profile.needs.filter(key=>ORDER.includes(key));
    }catch(_){}
    return [];
  }

  function groupedDescribe(){
    const original=base.describe?.()||{};
    const context=window.LibcomlairVoiceContext?.current?.();
    if(context?.id!=="onboarding-needs")return original;

    const labelMap=window.LibcomlairAccessibility?.labels||FALLBACK_LABELS;
    const groupMap=window.LibcomlairAccessibility?.filterGroups||FALLBACK_GROUPS;
    const selected=needs();
    const controls=[];

    selected.forEach(key=>{
      const title=labelMap[key]||key;
      const details=document.getElementById("v224NeedFolder-"+key);
      let criteria=[];
      if(details){
        criteria=[...details.querySelectorAll('input[data-filter-label]')].map(input=>{
          const name=input.dataset.filterLabel||input.getAttribute("aria-label")||"Critère";
          return name+", "+(input.checked?"coché":"non coché");
        });
      }
      if(!criteria.length)criteria=(groupMap[key]||[]).map(name=>name+", non coché");
      controls.push({
        kind:"groupe",
        label:"Pour le handicap "+title+", les choix proposés sont : "+criteria.join(", "),
        state:""
      });
    });

    controls.push({kind:"action",label:"Valider ou Retour",state:""});
    return {
      ...original,
      controls,
      text:original.text||""
    };
  }

  const wrapped={...base,describe:groupedDescribe};
  window.LibcomlairVoiceGuide=Object.freeze(wrapped);
  window.LibcomlairNeedsVoiceGroups=Object.freeze({version:"v224-1",describe:groupedDescribe});
})();