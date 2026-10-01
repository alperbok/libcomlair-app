(()=>{
  "use strict";

  const KEYS=Object.freeze({
    geo:"libcomlair-geoapify-nearby-v3",
    idfm:"libcomlair-idfm-nearby-v138",
    proposals:"libcomlair-proposals-v13"
  });
  const FIXED_SEARCH_RESULTS=3; // gares officielles actuellement intégrées directement au catalogue
  const registeredSources=new Map();

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

  function normalize(value){
    return String(value||"").toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
  }

  function looksLikePlace(item){
    if(!item||typeof item!=="object"||Array.isArray(item))return false;
    const name=String(item.name||"").trim();
    if(!name)return false;
    return !!(item.city||item.commune||item.town||item.address||item.category||item.geoapify||item.idfm||Number.isFinite(Number(item.lat))||Number.isFinite(Number(item.lon)));
  }

  function placeKey(item){
    const stable=String(item.id||item.place_id||item.placeId||item.osm_id||"").trim();
    if(stable)return "id:"+stable;
    const lat=Number(item.lat),lon=Number(item.lon);
    return [normalize(item.name),normalize(item.city||item.commune||item.town),Number.isFinite(lat)?lat.toFixed(5):"",Number.isFinite(lon)?lon.toFixed(5):""].join("|");
  }

  function obsoleteNearbyKey(key){
    return (/^libcomlair-geoapify-nearby-/.test(key)&&key!==KEYS.geo)||(/^libcomlair-idfm-nearby-/.test(key)&&key!==KEYS.idfm);
  }

  function storedCatalogue(){
    const seen=new Set();
    const sourceCounts=[];
    try{
      for(let i=0;i<localStorage.length;i++){
        const key=localStorage.key(i);
        if(!key||obsoleteNearbyKey(key))continue;
        let value=null;
        try{value=JSON.parse(localStorage.getItem(key)||"null")}catch(_){continue}
        if(!Array.isArray(value))continue;
        let added=0;
        value.forEach(item=>{
          if(!looksLikePlace(item))return;
          const id=placeKey(item);
          if(!id||seen.has(id))return;
          seen.add(id);added++;
        });
        if(added)sourceCounts.push([key,added]);
      }
    }catch(_){}
    const registered=[...registeredSources.entries()].filter(([,count])=>Number(count)>0);
    const registeredTotal=registered.reduce((sum,[,count])=>sum+Number(count||0),0);
    return {stored:seen.size,sourceCounts,registered,registeredTotal,total:FIXED_SEARCH_RESULTS+seen.size+registeredTotal};
  }

  function snapshot(){
    const geo=readArray(KEYS.geo);
    const idfm=readArray(KEYS.idfm);
    const proposals=readArray(KEYS.proposals);
    const proximityStored=geo.length+idfm.length;
    const catalogue=storedCatalogue();
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
    return {
      geo:geo.length,idfm:idfm.length,proposals:proposals.length,
      proximityStored,catalogueStored:catalogue.stored,catalogueTotal:catalogue.total,
      fixedSearchResults:FIXED_SEARCH_RESULTS,registeredSources:catalogue.registered,
      displayed,displayedText,domCards,currentPlaces,currentTotal,cities
    };
  }

  function formatCities(cities){
    if(!cities.length)return "aucune ville enregistrée";
    return cities.slice(0,12).map(([city,count])=>city+" : "+count).join(" • ");
  }

  function searchNoteText(s){
    return s.catalogueTotal+" résultat"+(s.catalogueTotal>1?"s":"")+" disponible"+(s.catalogueTotal>1?"s":"")+" dans Recherche — catalogue Libcomlair.";
  }

  function renderSearchNote(){
    const note=document.getElementById("v224StoredResultsNote");
    if(!note)return null;
    const s=snapshot();
    note.textContent=searchNoteText(s);
    return s;
  }

  function installSearchNote(){
    if(document.getElementById("v224StoredResultsNote"))return true;
    const search=document.getElementById("search");
    if(!search)return false;
    const note=document.createElement("p");
    note.id="v224StoredResultsNote";
    note.className="data-note";
    note.setAttribute("aria-live","polite");
    note.style.margin="4px 0 0";
    note.style.fontSize="0.78rem";
    note.style.lineHeight="1.15";
    note.style.opacity="0.82";
    search.insertAdjacentElement("afterend",note);
    renderSearchNote();
    return true;
  }

  function render(){
    const box=document.getElementById("v224DataCountersResult");
    const s=snapshot();
    renderSearchNote();
    if(!box)return s;
    const lines=[
      "Lieux Geoapify de la dernière zone enregistrée : "+s.geo+".",
      "Transports / arrêts IDFM de la dernière zone enregistrée : "+s.idfm+".",
      "Total de proximité enregistré (lieux + transports) : "+s.proximityStored+".",
      "Propositions personnelles : "+s.proposals+".",
      "Éléments fixes actuellement intégrés à Recherche : "+s.fixedSearchResults+".",
      "Total du catalogue disponible dans Recherche : "+s.catalogueTotal+".",
      "Répartition de la dernière zone par ville : "+formatCities(s.cities)+"."
    ];
    if(s.registeredSources.length)lines.push("Listes supplémentaires enregistrées dans le compteur Recherche : "+s.registeredSources.map(([id,count])=>id+" : "+count).join(" • ")+".");
    if(s.currentPlaces!==null)lines.push("Dernière recherche autour de moi — lieux : "+s.currentPlaces+".");
    if(s.currentTotal!==null)lines.push("Dernière recherche autour de moi — total de proximité avec transports : "+s.currentTotal+".");
    if(s.displayed!==null)lines.push("Compteur de la liste Résultats actuellement affichée : "+s.displayed+".");
    else if(s.domCards)lines.push("Fiches actuellement visibles dans Résultats : "+s.domCards+".");
    lines.push("Règle : « Autour de moi » compte seulement la dernière recherche de proximité. « Recherche » compte tout le catalogue réellement disponible. Les futures listes téléchargées doivent être enregistrées dans le compteur lorsqu'elles sont intégrées à la recherche.");
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
    intro.textContent="Sépare la dernière recherche autour de moi du catalogue complet disponible dans Recherche.";
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

  function registerSource(id,count){
    const key=String(id||"").trim();
    const n=Math.max(0,Number(count)||0);
    if(!key)return false;
    if(n)registeredSources.set(key,n);else registeredSources.delete(key);
    renderSearchNote();
    return true;
  }

  function init(){
    if(!install())setTimeout(install,250);
    if(!installSearchNote())setTimeout(installSearchNote,250);
    document.addEventListener("click",event=>{
      if(event.target?.closest?.("#runSystemDiagnostic"))setTimeout(render,220);
      if(event.target?.closest?.("#v224Page3Next"))setTimeout(renderSearchNote,120);
    });
    window.addEventListener("libcomlair-nearme-result",()=>setTimeout(()=>{render();renderSearchNote()},120));
    window.addEventListener("pageshow",()=>setTimeout(renderSearchNote,80));
  }

  window.LibcomlairDataCountDiagnostic=Object.freeze({
    version:"v224-3-separate-nearby-catalogue",
    snapshot,render,install,installSearchNote,renderSearchNote,registerSource,
    nearbyTotal:()=>snapshot().proximityStored,
    catalogueTotal:()=>snapshot().catalogueTotal
  });
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
