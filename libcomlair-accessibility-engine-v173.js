(function(){
  "use strict";
  const KEY="libcomlair-access-profile-v1";
  const allowed=["mobility","vision","hearing","cognitive","assistance"];
  const labels={
    mobility:"Mobilité",
    vision:"Vision",
    hearing:"Audition",
    cognitive:"Compréhension / cognition",
    assistance:"Assistance / accompagnement"
  };
  const filterGroups={
    mobility:["Entrée sans marche","Toilettes accessibles","Ascenseur","Stationnement adapté","Chambre accessible"],
    vision:["Guidage tactile","Bandes d’éveil à la vigilance","Balises sonores","Braille ou relief","Chien guide / d’assistance accepté"],
    hearing:["Information visuelle","Boucle magnétique"],
    cognitive:["Signalétique simplifiée","Orientation facilitée","Espace calme disponible"],
    assistance:["Personnel disponible","Assistance sur demande","Chien guide / d’assistance accepté"]
  };
  function read(){
    try{
      const v=JSON.parse(localStorage.getItem(KEY)||"null");
      if(!v||!Array.isArray(v.needs))return null;
      return {needs:[...new Set(v.needs.filter(x=>allowed.includes(x)))]};
    }catch(_){return null}
  }
  function save(needs){
    const input=Array.isArray(needs)?needs:[];
    const clean=[...new Set(input.filter(x=>allowed.includes(x)))];
    try{localStorage.setItem(KEY,JSON.stringify({needs:clean}));return true}catch(_){return false}
  }
  function filtersFor(needs){
    return [...new Set((Array.isArray(needs)?needs:[]).flatMap(n=>filterGroups[n]||[]))];
  }
  window.LibcomlairAccessibility=Object.freeze({KEY,allowed:Object.freeze(allowed),labels:Object.freeze(labels),filterGroups:Object.freeze(filterGroups),read,save,filtersFor});
})();