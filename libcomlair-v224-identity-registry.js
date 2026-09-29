(()=>{
  "use strict";

  /*
    Registre d'identité Libcomlair.
    But : une page, une case, une catégorie ou une sous-catégorie doit garder
    un identifiant technique stable pour la voix, le diagnostic et les tests.
  */

  const CATEGORY_LABELS=Object.freeze({
    shopDetails:"magasins",
    barDetails:"debits-de-boissons",
    hotelDetails:"hebergements",
    restaurantDetails:"restaurants",
    leisureDetails:"activites-sorties",
    serviceDetails:"services",
    transportDetails:"transports"
  });

  const PAGE_COMMANDS=Object.freeze({
    "onboarding-voice":["découverte","simplifié","valider","retour","aide","répète"],
    "onboarding-tutorial":["suivant","retour","aide","lire les informations","répète"],
    "onboarding-needs":["mobilité","vision","audition","compréhension","assistance","valider","retour","aide","répète"],
    "onboarding-home":["rechercher","retour","aide","répète"]
  });

  function norm(v){
    return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"element";
  }
  function text(el){return String(el?.textContent||"").replace(/\s+/g," ").trim()}
  function visible(el){
    if(!el||el.hidden||el.hasAttribute?.("hidden")||el.getAttribute?.("aria-hidden")==="true")return false;
    try{const cs=getComputedStyle(el);return cs.display!=="none"&&cs.visibility!=="hidden"}catch(_){return true}
  }
  function labelFor(el){
    const aria=String(el?.getAttribute?.("aria-label")||"").trim();if(aria)return aria;
    if(el?.labels?.length){const t=[...el.labels].map(text).join(" ").trim();if(t)return t}
    const label=el?.closest?.("label");if(label){const t=text(label);if(t)return t}
    return text(el)||String(el?.value||el?.name||el?.id||"");
  }

  function currentPage(){
    const b=document.body;
    if(!b)return {id:"page-00-inconnue",contextId:"home",title:"Libcomlair"};

    if(visible(document.getElementById("libcomlairSplash")))
      return {id:"page-01-bienvenue",contextId:"welcome",title:"Bienvenue"};

    const profile=document.getElementById("accessWelcome");
    if(visible(profile)||b.classList.contains("v221-profile-step"))
      return {id:"page-02-profil",contextId:"profile",title:"Profil d’accessibilité"};

    if(b.classList.contains("v224-onboarding-voice"))
      return {id:"page-03-navigation-vocale",contextId:"onboarding-voice",title:"Navigation vocale"};
    if(b.classList.contains("v224-onboarding-tutorial"))
      return {id:"page-04-presentation-libcomlair",contextId:"onboarding-tutorial",title:"Présentation Libcomlair"};
    if(b.classList.contains("v224-onboarding-needs"))
      return {id:"page-05-besoins-accessibilite",contextId:"onboarding-needs",title:"Mes besoins d’accessibilité"};
    if(b.classList.contains("v224-onboarding-home"))
      return {id:"page-06-accueil-recherche",contextId:"onboarding-home",title:"Accueil / Recherche"};

    if(b.classList.contains("v224-page4-step"))
      return {id:"page-07-categories",contextId:"search",title:"Recherche et catégories"};

    const base=window.LibcomlairVoiceContext?.detect?.();
    if(base?.id==="category"){
      const cat=norm(base.categoryId||base.categoryLabel||base.title);
      return {id:"page-08-categorie-"+cat,contextId:"category",title:base.title||"Catégorie"};
    }
    if(base?.id==="subcategory"){
      const cat=norm(base.categoryId||base.categoryLabel||"");
      const sub=norm(base.subcategoryLabel||base.title||"");
      return {id:"page-09-sous-categorie-"+cat+"-"+sub,contextId:"subcategory",title:base.title||"Sous-catégorie"};
    }
    if(base?.id&&base.id!=="home")
      return {id:"page-"+norm(base.id)+"-"+norm(base.title||base.id),contextId:base.id,title:base.title||base.id};

    return {id:"page-06-accueil-recherche",contextId:"onboarding-home",title:"Accueil / Recherche"};
  }

  function annotateCategories(){
    Object.entries(CATEGORY_LABELS).forEach(([id,label])=>{
      const el=document.getElementById(id);if(!el)return;
      el.dataset.libcomlairCategoryId="categorie-"+label;
      const summary=el.querySelector(":scope > summary");
      if(summary)summary.dataset.libcomlairCategoryId=el.dataset.libcomlairCategoryId;

      el.querySelectorAll("details").forEach(sub=>{
        if(sub===el||/tutorial/i.test(sub.id||""))return;
        const ownSummary=sub.querySelector(":scope > summary");
        const labelText=text(ownSummary)||sub.id;
        if(!labelText)return;
        const sid="sous-categorie-"+label+"-"+norm(labelText);
        sub.dataset.libcomlairSubcategoryId=sid;
        if(ownSummary)ownSummary.dataset.libcomlairSubcategoryId=sid;
      });
    });
  }

  function annotateChoices(){
    document.querySelectorAll('input[type="checkbox"],input[type="radio"]').forEach(input=>{
      if(input.dataset.libcomlairItemId)return;
      let id="";
      if(input.name==="accessProfile") id="case-profil-"+norm(input.value||labelFor(input));
      else if(input.dataset.filterLabel) id="case-critere-"+norm(input.dataset.filterLabel);
      else if(input.name==="visionAssistanceModeChoice") id="choix-navigation-vocale-"+norm(input.value||labelFor(input));
      else id=(input.type==="radio"?"choix-":"case-")+norm(labelFor(input));
      input.dataset.libcomlairItemId=id;
      input.closest("label")?.setAttribute("data-libcomlair-item-id",id);
    });
  }

  function annotateActions(){
    document.querySelectorAll("button,a[href],summary").forEach(el=>{
      if(el.dataset.libcomlairActionId)return;
      const raw=el.id||labelFor(el);if(!raw)return;
      el.dataset.libcomlairActionId="action-"+norm(raw);
    });
  }

  function annotateAll(){
    annotateCategories();annotateChoices();annotateActions();
    const p=currentPage();
    if(document.body)document.body.dataset.libcomlairPageId=p.id;
    return p;
  }

  const previousContext=window.LibcomlairVoiceContext;
  let lastSignature="";

  function contextForPage(){
    const p=currentPage();
    let base={};
    try{base=previousContext?.detect?.()||previousContext?.current?.()||{}}catch(_){}
    const commands=PAGE_COMMANDS[p.contextId]||base.commands||[];
    return Object.freeze({...base,id:p.contextId,title:p.title,pageId:p.id,commands:Object.freeze([...(commands||[])])});
  }

  function dispatchContext(reason){
    const ctx=contextForPage();
    const sig=[ctx.pageId,ctx.id,ctx.title,ctx.categoryId||"",ctx.subcategoryLabel||"",ctx.assistanceMode||""].join("|");
    if(sig===lastSignature)return ctx;
    const previous=lastSignature;lastSignature=sig;
    try{window.dispatchEvent(new CustomEvent("libcomlair-voice-context-change",{detail:{context:ctx,reason:String(reason||"identity"),previous}}))}catch(_){}
    return ctx;
  }

  if(previousContext){
    window.LibcomlairVoiceContext=Object.freeze({
      version:"v224-identity-1",
      detect:contextForPage,
      current:contextForPage,
      refresh:(reason)=>{annotateAll();return dispatchContext(reason||"identity-refresh")},
      commands:()=>[...(contextForPage().commands||[])],
      describe:()=>{const c=contextForPage();return {...c,commands:[...(c.commands||[])]}},
      getMode:(...a)=>previousContext.getMode?.(...a),
      setMode:(...a)=>previousContext.setMode?.(...a),
      resetMode:(...a)=>previousContext.resetMode?.(...a),
      hasExplicitMode:(...a)=>previousContext.hasExplicitMode?.(...a),
      modeLabel:(...a)=>previousContext.modeLabel?.(...a),
      ensureModeControls:(...a)=>previousContext.ensureModeControls?.(...a),
      syncModeControls:(...a)=>previousContext.syncModeControls?.(...a),
      categoryLabels:previousContext.categoryLabels
    });
  }

  let lastPage="";
  function refresh(reason){
    const p=annotateAll();
    if(p.id!==lastPage){
      const old=lastPage;lastPage=p.id;
      try{window.dispatchEvent(new CustomEvent("libcomlair-identity-page-change",{detail:{id:p.id,previous:old,contextId:p.contextId,title:p.title,reason:String(reason||"refresh")}}))}catch(_){}
    }
    dispatchContext(reason||"identity-refresh");
    return p;
  }

  const schedule=(()=>{let t=null;return reason=>{clearTimeout(t);t=setTimeout(()=>refresh(reason),70)}})();
  try{new MutationObserver(()=>schedule("dom-change")).observe(document.body,{attributes:true,attributeFilter:["class"],childList:true,subtree:true})}catch(_){}
  ["libcomlair-onboarding-step","libcomlair-detail-opened","libcomlair-nearme-result","pageshow","popstate"].forEach(name=>window.addEventListener(name,()=>schedule(name)));
  document.addEventListener("change",()=>schedule("choice-change"),true);

  window.LibcomlairIdentity=Object.freeze({version:"v224-1",currentPage,refresh,annotateAll});
  refresh("initial");
})();