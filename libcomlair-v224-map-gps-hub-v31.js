(()=>{
  "use strict";
  const DEST_KEY="libcomlair-gps-destination-v31";
  const CAT_LABELS={
    shopDetails:"Magasins",
    barDetails:"Débits de boissons",
    hotelDetails:"Hébergements",
    restaurantDetails:"Restaurants",
    leisureDetails:"Activités et sorties",
    serviceDetails:"Services",
    transportDetails:"Transports"
  };
  let globalMode=false;
  let pendingContext=null;
  let mapHome=null;
  let mapNext=null;

  const norm=s=>String(s||"").replace(/\s+/g," ").trim();
  const by=id=>document.getElementById(id);
  function speak(text){try{window.LibcomlairVoice?.speak?.(text,{rate:.9})}catch(_){}}
  function currentCategoryId(){try{return window.LibcomlairPageFlow?.currentCategory?.()||""}catch(_){return ""}}
  function currentContext(){
    const id=currentCategoryId();
    if(!id||!CAT_LABELS[id])return null;
    const root=by(id);
    const pressed=root?.querySelector('.category[aria-pressed="true"]');
    return {id,buttonText:norm(pressed?.textContent),label:CAT_LABELS[id]};
  }
  function saveDestination(data){
    const value={name:norm(data?.name),address:norm(data?.address),meta:norm(data?.meta),route:norm(data?.route),savedAt:Date.now()};
    try{sessionStorage.setItem(DEST_KEY,JSON.stringify(value))}catch(_){}
    return value;
  }
  function loadDestination(){try{return JSON.parse(sessionStorage.getItem(DEST_KEY)||"null")}catch(_){return null}}

  function buildHub(){
    const intro=by("v224Page4SearchIntro");
    if(!intro||by("v224MapGpsHub"))return;
    const brand=by("v224Page4Brand");
    const hub=document.createElement("section");
    hub.id="v224MapGpsHub";
    hub.setAttribute("aria-labelledby","v224MapGpsTitle");
    hub.innerHTML=`<h2 id="v224MapGpsTitle">Carte et GPS</h2>
      <p>Choisissez comment utiliser la carte.</p>
      <div class="v224-map-gps-modes">
        <button id="v224NearbyMode" class="v224-map-gps-mode" type="button"><strong>⌖ Mode Recherche autour de moi</strong><small>Découvrir tous les lieux et transports proches de votre position.</small></button>
        <button id="v224GpsMode" class="v224-map-gps-mode" data-project="true" type="button"><strong>🧭 Mode GPS accessible — Projet</strong><small>Préparer un trajet vers un lieu choisi depuis votre position.</small></button>
      </div>
      <div id="v224GlobalNearbyPanel" class="v224-map-gps-panel" hidden>
        <h3>Recherche autour de moi</h3><p id="v224GlobalNearbyStatus" class="data-note" aria-live="polite">La carte affichera toutes les catégories proches.</p>
        <div id="v224GlobalMapHost"></div>
        <div class="v224-map-gps-actions"><button id="v224CloseGlobalMap" class="details-btn" type="button">← Retour à la recherche</button></div>
      </div>
      <div id="v224GpsPanel" class="v224-map-gps-panel" hidden>
        <h3>GPS accessible — Projet</h3>
        <p id="v224GpsDestination" class="v224-gps-destination">Aucune destination sélectionnée.</p>
        <p class="v224-gps-project-note">Cette zone préparera le guidage accessible. Depuis une recherche ou une fiche détaillée, le bouton « Y aller avec le GPS » transmettra directement le lieu ici.</p>
        <div class="v224-map-gps-actions"><button id="v224GpsBack" class="details-btn" type="button">← Retour</button></div>
      </div>`;
    if(brand?.nextSibling)intro.insertBefore(hub,brand.nextSibling);else intro.prepend(hub);
    by("v224NearbyMode")?.addEventListener("click",openGlobalNearby);
    by("v224GpsMode")?.addEventListener("click",()=>openGpsPanel(loadDestination(),true));
    by("v224CloseGlobalMap")?.addEventListener("click",closeGlobalNearby);
    by("v224GpsBack")?.addEventListener("click",closeGpsPanel);
    updateGpsPanel();
  }

  function rememberMapHome(){
    const mapSection=by("v224MapSection");
    if(mapSection&&!mapHome){mapHome=mapSection.parentNode;mapNext=mapSection.nextSibling}
  }
  function restoreMapHome(){
    const mapSection=by("v224MapSection");
    if(!mapSection||!mapHome)return;
    if(mapSection.parentNode!==mapHome){
      if(mapNext&&mapNext.parentNode===mapHome)mapHome.insertBefore(mapSection,mapNext);else mapHome.appendChild(mapSection);
    }
    mapSection.style.removeProperty("display");
    setTimeout(()=>{try{window.dispatchEvent(new Event("resize"))}catch(_){}},80);
  }
  function openGlobalNearby(){
    buildHub();rememberMapHome();
    const panel=by("v224GlobalNearbyPanel"),host=by("v224GlobalMapHost"),mapSection=by("v224MapSection");
    if(!panel||!host||!mapSection)return;
    closeGpsPanel();
    globalMode=true;pendingContext=null;
    panel.hidden=false;host.appendChild(mapSection);mapSection.style.setProperty("display","block","important");
    updateNearMeLabel();
    const status=by("v224GlobalNearbyStatus");if(status)status.textContent="Recherche de votre position et de tout ce qui se trouve autour de vous…";
    requestAnimationFrame(()=>panel.scrollIntoView({block:"start",behavior:"smooth"}));
    setTimeout(()=>{try{window.dispatchEvent(new Event("resize"))}catch(_){}},120);
    by("nearMe")?.click();
    speak("Mode Recherche autour de moi. Recherche de tous les lieux et transports proches de votre position.");
  }
  function closeGlobalNearby(){
    globalMode=false;pendingContext=null;restoreMapHome();
    const panel=by("v224GlobalNearbyPanel");if(panel)panel.hidden=true;
    updateNearMeLabel();
    by("v224MapGpsHub")?.scrollIntoView({block:"start",behavior:"smooth"});
  }
  function closeGpsPanel(){const p=by("v224GpsPanel");if(p)p.hidden=true}
  function updateGpsPanel(){
    const el=by("v224GpsDestination");if(!el)return;
    const d=loadDestination();
    if(d?.name){el.textContent="Destination prête : "+d.name+(d.address?" — "+d.address:"");el.parentElement?.classList.add("v224-gps-ready")}
    else{el.textContent="Aucune destination sélectionnée.";el.parentElement?.classList.remove("v224-gps-ready")}
  }
  function openGpsPanel(destination,announce){
    buildHub();closeGlobalNearby();
    if(destination?.name)saveDestination(destination);
    updateGpsPanel();
    const panel=by("v224GpsPanel");if(panel){panel.hidden=false;requestAnimationFrame(()=>panel.scrollIntoView({block:"start",behavior:"smooth"}))}
    if(announce){const d=loadDestination();speak(d?.name?"Mode GPS accessible. Destination sélectionnée : "+d.name+". Le guidage accessible est encore en projet.":"Mode GPS accessible. Le guidage est encore en projet. Choisissez d’abord un lieu dans la recherche.")}
  }

  function addGoButtons(){
    document.querySelectorAll("#places article.card").forEach(card=>{
      if(card.querySelector(".v224-gps-go"))return;
      const btn=document.createElement("button");btn.type="button";btn.className="details-btn v224-gps-go";btn.textContent="🧭 Y aller avec le GPS";
      btn.addEventListener("click",()=>{
        const name=norm(card.querySelector("h3")?.textContent);
        const address=[...card.querySelectorAll(".data-note")].map(x=>norm(x.textContent)).find(x=>x.startsWith("📍"))?.replace(/^📍\s*/,"")||"";
        const meta=norm(card.querySelector("h3")?.nextElementSibling?.textContent);
        const d=saveDestination({name,address,meta});
        window.LibcomlairPageFlow?.showSearch?.();setTimeout(()=>openGpsPanel(d,true),80);
      });
      const mapBtn=card.querySelector(".show-on-map");if(mapBtn)mapBtn.insertAdjacentElement("afterend",btn);else card.appendChild(btn);
    });
    const detailMap=by("detailMap");
    if(detailMap&&!by("v224DetailGps")){
      const btn=document.createElement("button");btn.id="v224DetailGps";btn.type="button";btn.className="details-btn";btn.textContent="🧭 Y aller avec le GPS";
      btn.addEventListener("click",()=>{
        const d=saveDestination({name:norm(by("detailTitle")?.textContent),address:norm(by("detailMeta")?.textContent),route:norm(by("detailRoute")?.href)});
        window.LibcomlairPageFlow?.showSearch?.();setTimeout(()=>openGpsPanel(d,true),80);
      });
      detailMap.insertAdjacentElement("afterend",btn);
    }
  }

  function updateNearMeLabel(){
    const btn=by("nearMe");if(!btn)return;
    if(globalMode){btn.textContent="⌖ Tout autour de moi";return}
    const ctx=currentContext();btn.textContent=ctx?"⌖ "+ctx.label+" autour de moi":"⌖ Autour de moi";
  }
  function captureContext(){
    if(globalMode){pendingContext=null;return}
    pendingContext=currentContext();
  }
  function restoreContext(){
    if(globalMode){
      const total=norm(by("resultsCount")?.textContent);
      const msg=total?total+" autour de vous, toutes catégories confondues, lieux et transports compris.":"Recherche autour de vous terminée.";
      if(by("locationStatus"))by("locationStatus").textContent=msg;
      if(by("v224GlobalNearbyStatus"))by("v224GlobalNearbyStatus").textContent=msg;
      addGoButtons();return;
    }
    const ctx=pendingContext;pendingContext=null;
    if(!ctx)return;
    const root=by(ctx.id);let target=null;
    if(ctx.buttonText)target=[...root?.querySelectorAll(".category")||[]].find(b=>norm(b.textContent)===ctx.buttonText);
    if(!target)target=[...root?.querySelectorAll(".category")||[]].find(b=>/^Tous|^Toutes/i.test(norm(b.textContent)));
    if(target)target.click();
    setTimeout(()=>{
      const total=norm(by("resultsCount")?.textContent);
      const status=by("locationStatus");if(status)status.textContent=total?total+" dans "+ctx.label.toLowerCase()+" autour de vous.":"Recherche "+ctx.label.toLowerCase()+" autour de vous terminée.";
      updateNearMeLabel();addGoButtons();
    },80);
  }

  function init(){
    buildHub();rememberMapHome();addGoButtons();updateNearMeLabel();
    by("nearMe")?.addEventListener("click",captureContext,true);
    window.addEventListener("libcomlair-nearme-result",()=>setTimeout(restoreContext,20));
    try{new MutationObserver(()=>{buildHub();addGoButtons();updateNearMeLabel();if(!document.body.classList.contains("v224-page4-step")&&globalMode){globalMode=false;restoreMapHome();const p=by("v224GlobalNearbyPanel");if(p)p.hidden=true}}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class","aria-pressed"]})}catch(_){}
    window.LibcomlairMapGpsHub=Object.freeze({version:"v224-31",openNearby:openGlobalNearby,openGps:()=>openGpsPanel(loadDestination(),true),destination:loadDestination,currentContext});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,0),{once:true});else setTimeout(init,0);
})();