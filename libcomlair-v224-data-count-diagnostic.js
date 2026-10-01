(()=>{
  "use strict";

  const KEYS=Object.freeze({
    geo:"libcomlair-geoapify-nearby-v3",
    idfm:"libcomlair-idfm-nearby-v138",
    proposals:"libcomlair-proposals-v13"
  });

  function readArray(key){
    try{
      const value=JSON.parse(localStorage.getItem(key)||"[]");
      return Array.isArray(value)?value:[];
    }catch(_){return []}
  }

  function numberFromText(value){
    const m=String(value||"").match(/\b(\d+)\b/);
    return m?Number(m[1]):null;
  }

  function cityName(item){
    return String(item?.city||item?.commune||item?.town||"").trim()||"Ville non renseignée";
  }

  function cityBreakdown(items){
    const counts=new Map();
    items.forEach(item=>{
      const city=cityName(item);
      counts.set(city,(counts.get(city)||0)+1);
    });
    return [...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],"fr"));
  }

  function snapshot(){
    const geo=readArray(KEYS.geo);
    const idfm=readArray(KEYS.idfm);
    const proposals=readArray(KEYS.proposals);
    const proximityStored=geo.length+idfm.length;
    const localTotal=proximityStored+proposals.length;
    const displayedText=String(document.getElementById("resultsCount")?.textContent||"").trim();
    const displayed=numberFromText(displayedText);
    const domCards=document.querySelectorAll("#places article.card").length;
    let currentPlaces=null,currentTotal=null;
    try{
      const sync=window.LibcomlairNearbyCountSync;
      if(sync&&typeof sync.placeCount==="function")currentPlaces=numberFromText(sync.placeCount());
      if(sync&&typeof sync.totalCount==="function")currentTotal=numberFromText(sync.totalCount());
    }catch(_){}
    const cities=cityBreakdown([...geo,...idfm]);
    return {geo:geo.length,idfm:idfm.length,proposals:proposals.length,proximityStored,localTotal,displayed,displayedText,domCards,currentPlaces,currentTotal,cities};
  }

  function formatCities(cities){
    if(!cities.length)return "aucune ville enregistrée";
    return cities.slice(0,12).map(([city,count])=>city+" : "+count).join(" • ");
  }

  function render(){
    const box=document.getElementById("v224DataCountersResult");
    if(!box)return null;
    const s=snapshot();
    const lines=[
      "Lieux Geoapify enregistrés sur cet appareil : "+s.geo+".",
      "Transports / arrêts IDFM enregistrés : "+s.idfm+".",
      "Données de proximité enregistrées : "+s.proximityStored+".",
      "Propositions personnelles enregistrées : "+s.proposals+".",
      "Total local enregistré : "+s.localTotal+".",
      "Répartition des données de proximité par ville : "+formatCities(s.cities)+"."
    ];
    if(s.currentPlaces!==null)lines.push("Dernière recherche autour de moi — lieux : "+s.currentPlaces+".");
    if(s.currentTotal!==null)lines.push("Dernière recherche autour de moi — total affiché avec transports : "+s.currentTotal+".");
    if(s.displayed!==null)lines.push("Compteur Résultats actuellement affiché : "+s.displayed+".");
    else if(s.domCards)lines.push("Fiches actuellement visibles dans Résultats : "+s.domCards+".");
    lines.push("Remarque : les données enregistrées sont des caches locaux. Une nouvelle recherche réussie doit remplacer les anciennes données Geoapify et IDFM ; la répartition par ville permet de vérifier immédiatement si plusieurs zones restent mélangées.");
    box.textContent=lines.join("\n");
    return s;
  }

  function install(){
    const diagnosticResult=document.getElementById("systemDiagnosticResult");
    if(!diagnosticResult||document.getElementById("v224DataCounters"))return false;

    const details=document.createElement("details");
    details.id="v224DataCounters";
    details.className="v219-info-card";

    const summary=document.createElement("summary");
    summary.className="details-btn";
    const strong=document.createElement("strong");
    strong.textContent="📊 Compteurs des données enregistrées";
    summary.appendChild(strong);

    const content=document.createElement("div");
    content.className="detail";
    const intro=document.createElement("p");
    intro.className="data-note";
    intro.textContent="Affiche séparément les lieux, les transports et les données conservées sur cet appareil afin d’éviter de confondre recherche actuelle et résultats enregistrés.";

    const refresh=document.createElement("button");
    refresh.id="v224RefreshDataCounters";
    refresh.type="button";
    refresh.className="details-btn";
    refresh.textContent="Actualiser les compteurs";

    const result=document.createElement("p");
    result.id="v224DataCountersResult";
    result.className="data-note";
    result.setAttribute("aria-live","polite");
    result.style.whiteSpace="pre-line";

    refresh.addEventListener("click",render);
    details.addEventListener("toggle",()=>{if(details.open)render()});
    content.append(intro,refresh,result);
    details.append(summary,content);
    diagnosticResult.insertAdjacentElement("afterend",details);
    return true;
  }

  function init(){
    if(!install())setTimeout(install,250);
    document.addEventListener("click",event=>{
      if(event.target?.closest?.("#runSystemDiagnostic"))setTimeout(render,220);
    });
    window.addEventListener("libcomlair-nearme-result",()=>setTimeout(render,120));
  }

  window.LibcomlairDataCountDiagnostic=Object.freeze({version:"v224-1",snapshot,render,install});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
