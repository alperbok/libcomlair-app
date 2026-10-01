(()=>{
  "use strict";

  const STORAGE_KEY="libcomlair-voice-independence-catalog-v1";
  const MAX_FIXED=1200;
  const MAX_DYNAMIC=200;
  const DYNAMIC_CONTEXTS=new Set(["results","detail","map","favorites","contribute"]);
  let installed=false;
  let originalSpeak=null;
  let lastScan=0;

  function clean(value){return String(value||"").replace(/\s+/g," ").trim()}
  function context(){try{return window.LibcomlairVoiceContext?.current?.()||null}catch(_){return null}}
  function hash(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,"0")}
  function blank(){return {version:1,createdAt:Date.now(),updatedAt:Date.now(),fixed:{},dynamic:{},visible:{}}}
  function load(){
    try{
      const data=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
      if(data&&data.version===1)return data;
    }catch(_){}
    return blank();
  }
  function save(data){
    try{data.updatedAt=Date.now();localStorage.setItem(STORAGE_KEY,JSON.stringify(data));return true}catch(_){return false}
  }
  function trimMap(map,max){
    const entries=Object.entries(map||{});
    if(entries.length<=max)return map;
    entries.sort((a,b)=>(Number(b[1]?.lastSeen)||0)-(Number(a[1]?.lastSeen)||0));
    return Object.fromEntries(entries.slice(0,max));
  }
  function dynamicContext(ctx){return DYNAMIC_CONTEXTS.has(String(ctx?.id||""))}

  function recordFixed(text,source){
    const t=clean(text);if(!t)return false;
    const data=load(),key=hash(t),now=Date.now();
    const old=data.fixed[key]||{};
    data.fixed[key]={text:t,source:String(source||old.source||"speech"),count:(Number(old.count)||0)+1,firstSeen:Number(old.firstSeen)||now,lastSeen:now};
    data.fixed=trimMap(data.fixed,MAX_FIXED);
    return save(data);
  }

  function recordDynamic(text,ctx,source){
    const t=clean(text);if(!t)return false;
    const data=load(),id=String(ctx?.id||"unknown"),key=id+":"+hash(t),now=Date.now();
    const old=data.dynamic[key]||{};
    data.dynamic[key]={contextId:id,source:String(source||"speech"),count:(Number(old.count)||0)+1,characters:t.length,firstSeen:Number(old.firstSeen)||now,lastSeen:now};
    data.dynamic=trimMap(data.dynamic,MAX_DYNAMIC);
    return save(data);
  }

  function recordSpeech(text){
    const t=clean(text);if(!t)return;
    const ctx=context();
    if(dynamicContext(ctx))recordDynamic(t,ctx,"spoken-dynamic");
    else recordFixed(t,"spoken-fixed");
    scheduleDiagnosticRefresh();
  }

  function visible(el){
    if(!el||el.hidden||el.hasAttribute?.("hidden")||el.getAttribute?.("aria-hidden")==="true")return false;
    try{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0}catch(_){return false}
  }

  function accessibleText(el){
    return clean(el?.getAttribute?.("aria-label")||el?.innerText||el?.textContent||"");
  }

  function scanVisible(){
    const data=load(),now=Date.now();
    const selector="button,summary,label,h1,h2,h3,h4,[role='button']";
    document.querySelectorAll(selector).forEach(el=>{
      if(!visible(el))return;
      const text=accessibleText(el);
      if(!text||text.length>220)return;
      const key=hash(text),old=data.visible[key]||{};
      data.visible[key]={text,count:(Number(old.count)||0)+1,firstSeen:Number(old.firstSeen)||now,lastSeen:now,tag:String(el.tagName||"").toLowerCase()};
    });
    data.visible=trimMap(data.visible,MAX_FIXED);
    lastScan=now;
    save(data);
    scheduleDiagnosticRefresh();
    return statsFrom(data);
  }

  function statsFrom(data){
    return {
      fixedPhrases:Object.keys(data.fixed||{}).length,
      dynamicPatterns:Object.keys(data.dynamic||{}).length,
      visibleTexts:Object.keys(data.visible||{}).length,
      createdAt:data.createdAt||0,
      updatedAt:data.updatedAt||0,
      lastScan
    };
  }
  function stats(){return statsFrom(load())}

  function installSpeakCollector(){
    const engine=window.LibcomlairVoice;
    if(!engine||typeof engine.speak!=="function")return false;
    if(engine.speak.__libcomlairIndependenceCollector)return true;
    originalSpeak=engine.speak.bind(engine);
    const wrapped=function(text,options){recordSpeech(text);return originalSpeak(text,options)};
    Object.defineProperty(wrapped,"__libcomlairIndependenceCollector",{value:true});
    try{engine.speak=wrapped;return true}catch(_){return false}
  }

  let refreshTimer=null;
  function scheduleDiagnosticRefresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(renderDiagnostic,120)}

  async function renderDiagnostic(){
    const box=document.getElementById("v224VoiceIndependenceDiagnosticText");
    if(!box)return;
    const s=stats();
    let library={available:false,entries:0,megabytes:0};
    try{library=await window.LibcomlairRenderVoice?.voiceLibraryStatus?.()||library}catch(_){}
    const lines=[
      "Phrases fixes recensées : "+s.fixedPhrases+".",
      "Textes d’interface recensés : "+s.visibleTexts+".",
      "Structures dynamiques rencontrées : "+s.dynamicPatterns+".",
      "Audios conservés localement : "+(Number(library.entries)||0)+" ("+(Number(library.megabytes)||0)+" Mo).",
      library.available?"Bibliothèque audio locale : active.":"Bibliothèque audio locale : non disponible sur ce navigateur.",
      "Objectif : navigation vocale essentielle utilisable sans Render ni service externe."
    ];
    box.textContent=lines.join(" ");
  }

  function installDiagnostic(){
    if(document.getElementById("v224VoiceIndependenceDiagnostic"))return true;
    const anchor=document.getElementById("systemDiagnosticResult")||document.getElementById("systemDiagnosticPanel");
    if(!anchor)return false;
    const details=document.createElement("details");
    details.id="v224VoiceIndependenceDiagnostic";
    details.innerHTML='<summary class="details-btn"><strong>🎙️ Autonomie vocale</strong></summary><div class="detail"><p id="v224VoiceIndependenceDiagnosticText" class="data-note" aria-live="polite">Inventaire vocal en préparation…</p><button id="v224VoiceIndependenceRefresh" class="details-btn" type="button">Actualiser l’inventaire vocal</button></div>';
    anchor.insertAdjacentElement("afterend",details);
    details.addEventListener("toggle",()=>{if(details.open){scanVisible();renderDiagnostic()}});
    details.querySelector("#v224VoiceIndependenceRefresh")?.addEventListener("click",()=>{scanVisible();renderDiagnostic()});
    renderDiagnostic();
    return true;
  }

  function exportCatalog(){return JSON.parse(JSON.stringify(load()))}

  function install(){
    installSpeakCollector();
    installDiagnostic();
    scanVisible();
    if(installed)return true;
    installed=true;
    ["pageshow","libcomlair-voice-context-change","libcomlair-onboarding-step","libcomlair-identity-page-change","libcomlair-map-gps-page","libcomlair-detail-opened","libcomlair-nearme-result"].forEach(name=>window.addEventListener(name,()=>setTimeout(()=>{installSpeakCollector();installDiagnostic();scanVisible()},180)));
    document.addEventListener("click",()=>setTimeout(scanVisible,220),false);
    window.addEventListener("libcomlair-voice-library-updated",renderDiagnostic);
    return true;
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
  setTimeout(install,700);

  window.LibcomlairVoiceIndependence=Object.freeze({
    version:"v224-1-catalog-local-audio",
    install,
    scanVisible,
    recordSpeech,
    stats,
    exportCatalog,
    renderDiagnostic
  });
})();