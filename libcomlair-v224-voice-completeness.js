(()=>{
  "use strict";

  const baseContext=window.LibcomlairVoiceContext;
  const baseGuide=window.LibcomlairVoiceGuide;
  if(!baseContext||!baseGuide)return;

  const MIC_IDS=new Set(["v222ProfileMic","v224Page3Mic","v224Page4Mic","v224Page5Mic","visionVoiceCommand"]);
  let lastCustomSignature="";
  let readGeneration=0;

  const CUSTOM_COMMANDS=Object.freeze({
    "onboarding-voice":["découverte","simplifié","valider","retour","aide","quels sont mes choix","répète"],
    "onboarding-tutorial":["lire","suivant","retour","aide","lire les informations","répète"],
    "onboarding-home":["rechercher","retour","aide","quels sont mes choix","répète"]
  });

  const ROLE_TEXT=Object.freeze({
    "onboarding-voice":"Cette page permet de choisir le niveau d’assistance vocale. Découverte guidée explique davantage chaque page, ses choix, ses cases et ses informations. Simplifié annonce l’essentiel.",
    "onboarding-tutorial":"Cette page explique le fonctionnement de Libcomlair avant d’entrer dans la recherche.",
    "onboarding-home":"Cette page permet de poursuivre vers la recherche de lieux accessibles.",
    welcome:"Cette page vous souhaite la bienvenue dans Libcomlair et permet de poursuivre vers le choix de vos besoins d’accessibilité.",
    profile:"Cette page permet de choisir les adaptations de Libcomlair correspondant à vos besoins. Vous pouvez sélectionner plusieurs profils ou continuer sans adaptation particulière.",
    home:"Cette page permet de démarrer Libcomlair et d’accéder à ses aides.",
    search:"Cette page permet de rechercher un lieu ou une ville et de choisir une grande catégorie.",
    category:"Cette page présente les sous-catégories de la catégorie sélectionnée.",
    subcategory:"Cette page donne accès aux outils de la recherche en cours : Carte, Favoris, Filtres et tri, Contribuer et Résultats.",
    map:"Cette page permet d’utiliser la carte et la recherche autour de vous. La carte reste facultative.",
    favorites:"Cette page regroupe les lieux enregistrés en favoris.",
    filters:"Cette page permet d’activer ou retirer des filtres et de choisir l’ordre de tri des résultats.",
    contribute:"Cette page permet d’ajouter ou signaler un lieu accessible et de renseigner ses informations.",
    results:"Cette page présente les lieux correspondant à la recherche en cours.",
    detail:"Cette page présente la fiche détaillée du lieu sélectionné.",
    dictation:"Vous êtes dans une étape de dictée vocale."
  });

  function norm(s){return String(s||"").replace(/\s+/g," ").trim()}
  function visible(el){
    if(!el||el.nodeType!==1||el.hidden||el.hasAttribute("hidden")||el.getAttribute("aria-hidden")==="true")return false;
    try{const cs=getComputedStyle(el);if(cs.display==="none"||cs.visibility==="hidden"||Number(cs.opacity)===0)return false}catch(_){}
    return true;
  }
  function customContext(){
    const b=document.body;
    if(!b)return null;
    let id="",title="";
    if(b.classList.contains("v224-onboarding-voice")){id="onboarding-voice";title="Navigation vocale"}
    else if(b.classList.contains("v224-onboarding-tutorial")){id="onboarding-tutorial";title="Comment fonctionne Libcomlair ?"}
    else if(b.classList.contains("v224-onboarding-home")){id="onboarding-home";title="Accueil / Recherche"}
    if(!id)return null;
    return Object.freeze({
      id,title,categoryId:"",categoryLabel:"",subcategoryLabel:"",fieldId:"",
      commands:Object.freeze([...(CUSTOM_COMMANDS[id]||[])]),
      assistanceMode:baseContext.getMode?.()||"simplified",
      assistanceModeExplicit:!!baseContext.hasExplicitMode?.()
    });
  }
  function detect(){return customContext()||baseContext.detect()}
  function refresh(reason){
    const custom=customContext();
    if(!custom)return baseContext.refresh(reason);
    const sig=[custom.id,custom.title,custom.assistanceMode].join("|");
    if(sig!==lastCustomSignature){
      const previous=lastCustomSignature;lastCustomSignature=sig;
      try{window.dispatchEvent(new CustomEvent("libcomlair-voice-context-change",{detail:{context:custom,reason:String(reason||"refresh"),previous}}))}catch(_){}
    }
    return custom;
  }
  function current(){return detect()}
  function describeContext(){const c=current();return{id:c.id,title:c.title,categoryId:c.categoryId||"",categoryLabel:c.categoryLabel||"",subcategoryLabel:c.subcategoryLabel||"",fieldId:c.fieldId||"",commands:[...(c.commands||[])],assistanceMode:c.assistanceMode,assistanceModeExplicit:c.assistanceModeExplicit}}

  window.LibcomlairVoiceContext=Object.freeze({
    version:"v224-4",
    detect,refresh,current,
    commands:()=>[...(current().commands||[])],
    describe:describeContext,
    getMode:(...a)=>baseContext.getMode(...a),
    setMode:(...a)=>baseContext.setMode(...a),
    resetMode:(...a)=>baseContext.resetMode(...a),
    hasExplicitMode:(...a)=>baseContext.hasExplicitMode(...a),
    modeLabel:(...a)=>baseContext.modeLabel(...a),
    ensureModeControls:(...a)=>baseContext.ensureModeControls(...a),
    syncModeControls:(...a)=>baseContext.syncModeControls(...a),
    categoryLabels:baseContext.categoryLabels
  });

  function rootsFor(id){
    const by=id=>document.getElementById(id);
    switch(id){
      case "welcome":return [by("libcomlairSplash")];
      case "profile":return [by("accessWelcome"),by("accessNeedsSection")];
      case "home":case "onboarding-voice":case "onboarding-tutorial":case "onboarding-home":return [by("accessNeedsSection"),document.querySelector("section.hero.v219-main-zone")];
      case "search":return [by("v224Page4Brand"),by("v224Page4SearchIntro"),by("v224Page4Categories")];
      case "map":return [by("v224Page5Header"),by("v224ResultTool-map"),by("v224MapSection")];
      case "favorites":return [by("v224Page5Header"),by("v224ResultTool-favorites"),by("favoritesSection")];
      case "filters":return [by("v224Page5Header"),by("v224ResultTool-filters"),by("v224FiltersContent"),by("placesFilters")];
      case "contribute":return [by("v224Page5Header"),by("v224ResultTool-contribute"),by("v224ContributeSection")];
      case "results":return [by("v224Page5Header"),by("v224ResultTool-results"),by("v224ResultsSection")];
      case "detail":return [by("v224Page5Header"),by("detail")];
      case "category":case "subcategory":return [by("v224Page5Header"),by("v224Page4Categories")];
      default:return [by("mainContent")];
    }
  }
  function roots(id){const seen=new Set();return rootsFor(id).filter(el=>el&&!seen.has(el)&&visible(el)&&(seen.add(el)||true))}
  function inside(el,rs){return rs.some(r=>r===el||r.contains(el))}
  function labelFor(el){
    const aria=norm(el.getAttribute?.("aria-label"));if(aria)return aria;
    if(el.labels?.length){const t=norm([...el.labels].map(x=>x.textContent).join(" "));if(t)return t}
    const closest=el.closest?.("label");if(closest){const c=closest.cloneNode(true);c.querySelectorAll("input,select,textarea,button").forEach(x=>x.remove());const t=norm(c.textContent);if(t)return t}
    if(el.id){try{const linked=document.querySelector('label[for="'+CSS.escape(el.id)+'"]');const t=norm(linked?.textContent);if(t)return t}catch(_){}}
    return norm(el.textContent||el.title||el.placeholder||"");
  }
  function controlsFor(id){
    const rs=roots(id);if(!rs.length)return [];
    const selector='input:not([type="hidden"]),textarea,select,button,a[href],summary,[role="button"],[role="radio"],[role="checkbox"],[data-voice-command]';
    const seen=new Set(),rows=[];
    for(const el of document.querySelectorAll(selector)){
      if(seen.has(el)||!inside(el,rs)||!visible(el)||el.closest?.('[aria-hidden="true"]'))continue;
      seen.add(el);if(MIC_IDS.has(el.id))continue;
      const tag=el.tagName.toLowerCase(),type=norm(el.getAttribute?.("type")).toLowerCase(),role=norm(el.getAttribute?.("role")).toLowerCase(),label=labelFor(el);if(!label)continue;
      if(type==="checkbox"||role==="checkbox"){rows.push({kind:"case",label,state:('checked' in el?el.checked:el.getAttribute("aria-checked")==="true")?"coché":"non coché"});continue}
      if(type==="radio"||role==="radio"){rows.push({kind:"choix",label,state:('checked' in el?el.checked:el.getAttribute("aria-checked")==="true")?"coché":"non coché"});continue}
      if(tag==="select"){rows.push({kind:"liste",label,state:norm(el.selectedOptions?.[0]?.textContent),options:[...el.options].filter(o=>!o.disabled).map(o=>norm(o.textContent)).filter(Boolean)});continue}
      if(tag==="textarea"||(tag==="input"&&!['button','submit','reset','checkbox','radio'].includes(type))){rows.push({kind:"champ",label,state:el.value?("renseigné : "+norm(el.value)):"vide",placeholder:norm(el.placeholder)});continue}
      if(tag==="summary"){rows.push({kind:"rubrique",label,state:el.parentElement?.tagName==="DETAILS"?(el.parentElement.open?"ouverte":"fermée"):""});continue}
      rows.push({kind:"action",label,state:el.getAttribute?.("aria-pressed")==="true"?"activée":""});
    }
    return rows;
  }
  function explanationsFor(id){
    const rs=roots(id);if(!rs.length)return [];
    const selector='p,[role="note"],.data-note,.v219-info-card,.v219-support-card,[data-voice-explain],.v224-page5-tutorial';
    const seen=new Set(),out=[];
    for(const el of document.querySelectorAll(selector)){
      if(!inside(el,rs)||!visible(el)||el.closest?.('[aria-hidden="true"]'))continue;
      if(el.id==="voiceStatus"||el.id==="voiceEngineMode"||el.closest?.("button,label,summary"))continue;
      let t=norm(el.textContent);if(!t||seen.has(t))continue;
      seen.add(t);out.push(t);
    }
    return out;
  }
  function sentence(row,discovery){
    if(row.kind==="case"||row.kind==="choix")return row.label+", "+row.state+".";
    if(row.kind==="liste")return discovery&&row.options?.length?row.label+". Choix actuel : "+(row.state||"non défini")+". Options : "+row.options.join(", ")+".":row.label+", choix actuel : "+(row.state||"non défini")+".";
    if(row.kind==="champ")return "Champ "+row.label+", "+row.state+(discovery&&row.placeholder&&row.state==="vide"?". Exemple : "+row.placeholder:"")+".";
    if(row.kind==="rubrique")return "Rubrique "+row.label+(row.state?", "+row.state:"")+".";
    return "Action "+row.label+(row.state?", "+row.state:"")+".";
  }
  function build(contextOverride){
    const ctx=contextOverride||window.LibcomlairVoiceContext.current();
    const mode=window.LibcomlairVoiceContext.getMode?.()||"simplified",discovery=mode==="discovery";
    const controls=controlsFor(ctx.id),explanations=explanationsFor(ctx.id),parts=[];
    parts.push("Vous êtes dans "+(ctx.title||"Libcomlair")+".");
    if(ROLE_TEXT[ctx.id])parts.push(ROLE_TEXT[ctx.id]);
    if(discovery){
      if(explanations.length){parts.push("Voici les informations visibles sur cette page.");explanations.forEach(t=>parts.push(t+"."))}
      if(controls.length){parts.push("Voici tous les éléments utilisables actuellement.");controls.forEach(r=>parts.push(sentence(r,true)))}else parts.push("Aucun contrôle supplémentaire n’est actuellement disponible sur cette page.");
      parts.push("Vous pouvez utiliser le micro pour choisir une action, cocher ou décocher une case, sélectionner un choix, ouvrir une rubrique ou renseigner un champ.");
    }else{
      if(controls.length)parts.push("Choix principaux : "+controls.slice(0,7).map(x=>x.label).join(", ")+".");
      if(explanations.length)parts.push("Des informations explicatives sont disponibles si vous souhaitez les écouter.");
      parts.push("Dites quels sont mes choix ou explique cette page pour obtenir davantage d’informations.");
    }
    return Object.freeze({context:ctx,mode,controls:Object.freeze(controls.map(x=>Object.freeze({...x}))),explanations:Object.freeze([...explanations]),text:norm(parts.join(" "))});
  }
  function chunks(text,max=1250){
    const sentences=String(text||"").split(/(?<=[.!?])\s+/),out=[];let current="";
    for(const s of sentences){if(!s)continue;if((current+" "+s).trim().length>max&&current){out.push(current.trim());current=s}else current=(current+" "+s).trim()}
    if(current)out.push(current.trim());return out.length?out:[String(text||"")];
  }
  function speakSequence(text,options){
    const engine=window.LibcomlairVoice;if(!engine?.speak)return false;
    const seq=chunks(text),token=++readGeneration;let i=0;
    const next=()=>{if(token!==readGeneration||i>=seq.length)return;const part=seq[i++];engine.speak(part,{rate:.9,...(options||{}),onend:()=>next()})};
    next();return true;
  }
  function readCurrent(options){const built=build();const prompt=document.getElementById("visionGuidePrompt");if(prompt)prompt.textContent=built.text;const ok=speakSequence(built.text,options);try{window.dispatchEvent(new CustomEvent("libcomlair-voice-guide-read",{detail:{contextId:built.context.id,mode:built.mode,ok,controls:built.controls.length,explanations:built.explanations.length}}))}catch(_){}return ok}
  function describe(){const b=build();return{contextId:b.context.id,title:b.context.title,mode:b.mode,controls:b.controls.map(x=>({...x})),explanations:[...b.explanations],text:b.text}}
  function audit(){const d=describe();return{ok:true,version:"v224-2",contextId:d.contextId,controls:d.controls.length,explanations:d.explanations.length,controlLabels:d.controls.map(x=>x.label),explanationTexts:[...d.explanations]}}

  window.LibcomlairVoiceGuide=Object.freeze({version:"v224-2",build,readCurrent,describe,auditCurrent:audit,stop:()=>{readGeneration++;try{window.LibcomlairVoice?.cancel?.()}catch(_){}}});
  refresh("voice-completeness-loaded");
})();