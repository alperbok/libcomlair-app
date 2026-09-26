(()=>{
  "use strict";

  const VOICE_MODE_KEY="libcomlair-voice-assistance-mode-v1";

  const CATEGORY_IDS=[
    "shopDetails","barDetails","hotelDetails","restaurantDetails",
    "leisureDetails","serviceDetails","transportDetails"
  ];

  const CONTEXT_COMMANDS=Object.freeze({
    welcome:["suivant","continuer","aide","répète"],
    profile:["mobilité","vision","audition","compréhension","assistance","utiliser mes choix","continuer sans adaptation","aide","répète"],
    home:["modifier mon profil","commencer","présentation libcomlair","arrêter la lecture","comment fonctionne libcomlair","assistance et réglages","tester l’assistance vocale","diagnostic","réparation automatique","rechercher un lieu accessible","aide","répète"],
    search:["rechercher","ouvrir les critères","magasins","débits de boissons","hébergements","restaurants","activités et sorties","services","transports","retour","aide","répète"],
    category:["tous","lire l’explication","retour aux catégories","quels sont mes choix","aide","répète"],
    subcategory:["carte","favoris","filtres et tri","contribuer","résultats","retour","quels sont mes choix","aide","répète"],
    map:["autour de moi","lire le statut","résultats","retour","quels sont mes choix","aide","répète"],
    favorites:["lire mes favoris","ouvrir un dossier","fermer un dossier","ouvrir un lieu","retour","quels sont mes choix","aide","répète"],
    filters:["favoris uniquement","mes propositions uniquement","lieux présents sur la carte","lieux avec site internet","lieux avec téléphone","enlever un filtre","réinitialiser les filtres","trier","quels sont mes filtres","retour","aide","répète"],
    contribute:["commencer la contribution","champ suivant","champ précédent","relire ma réponse","modifier ma réponse","recommencer","passer","utiliser ma position","lire le récapitulatif","enregistrer","annuler","retour","aide","répète"],
    results:["lire les résultats","résultat suivant","résultat précédent","ouvrir un lieu","lire ce résultat","nouvelle recherche","retour","aide","répète"],
    detail:["lire la fiche","lignes et directions","informations pratiques","actions possibles","signalement","avis et commentaires","accessibilité","appeler","ouvrir le site","itinéraire","voir sur la carte","partager","copier l’adresse","ajouter aux favoris","retirer des favoris","signaler une erreur","retour aux résultats","aide","répète"],
    dictation:["valider","modifier","recommencer","passer","relire ma réponse","annuler"]
  });

  const CATEGORY_LABELS=Object.freeze({
    shopDetails:"Magasins",
    barDetails:"Débits de boissons",
    hotelDetails:"Hébergements",
    restaurantDetails:"Restaurants",
    leisureDetails:"Activités et sorties",
    serviceDetails:"Services",
    transportDetails:"Transports"
  });

  function hasVisionProfile(){
    try{
      const profile=JSON.parse(localStorage.getItem("libcomlair-access-profile-v1")||"null");
      return !!(profile&&Array.isArray(profile.needs)&&profile.needs.includes("vision"));
    }catch(_){return false}
  }

  function readVoiceMode(){
    try{
      const stored=localStorage.getItem(VOICE_MODE_KEY);
      if(stored==="discovery"||stored==="simplified")return stored;
    }catch(_){}
    return hasVisionProfile()?"discovery":"simplified";
  }

  function hasExplicitVoiceMode(){
    try{
      const stored=localStorage.getItem(VOICE_MODE_KEY);
      return stored==="discovery"||stored==="simplified";
    }catch(_){return false}
  }

  function setVoiceMode(mode){
    const clean=String(mode||"").toLowerCase();
    if(clean!=="discovery"&&clean!=="simplified")return false;
    try{localStorage.setItem(VOICE_MODE_KEY,clean)}catch(_){return false}
    try{
      window.dispatchEvent(new CustomEvent("libcomlair-voice-mode-change",{
        detail:{mode:clean,explicit:true}
      }));
    }catch(_){}
    refresh("voice-mode");
    return true;
  }

  function resetVoiceMode(){
    try{localStorage.removeItem(VOICE_MODE_KEY)}catch(_){}
    const mode=readVoiceMode();
    try{
      window.dispatchEvent(new CustomEvent("libcomlair-voice-mode-change",{
        detail:{mode,explicit:false}
      }));
    }catch(_){}
    refresh("voice-mode-reset");
    return mode;
  }

  let lastSignature="";
  let lastContext=null;

  function text(el){
    return String(el&&el.textContent||"").replace(/\s+/g," ").trim();
  }

  function visible(el){
    if(!el||el.hidden||el.hasAttribute("hidden"))return false;
    if(el.style&&el.style.display==="none")return false;
    try{
      const cs=getComputedStyle(el);
      if(cs.display==="none"||cs.visibility==="hidden")return false;
    }catch(_){}
    return true;
  }

  function activeCategory(){
    try{
      const id=window.LibcomlairPageFlow&&typeof window.LibcomlairPageFlow.currentCategory==="function"
        ? window.LibcomlairPageFlow.currentCategory()
        : "";
      if(id&&CATEGORY_IDS.includes(id))return id;
    }catch(_){}
    const el=CATEGORY_IDS.map(id=>document.getElementById(id))
      .find(x=>x&&x.classList.contains("v224-page5-active"));
    return el?el.id:"";
  }

  function pageTitle(){
    return text(document.getElementById("v224Page5Title"));
  }

  function baseContext(id,title,extra){
    const categoryId=activeCategory();
    const categoryLabel=CATEGORY_LABELS[categoryId]||"";
    const commands=[...(CONTEXT_COMMANDS[id]||[])];
    return Object.freeze({
      id,
      title:title||id,
      categoryId,
      categoryLabel,
      commands:Object.freeze(commands),
      assistanceMode:readVoiceMode(),
      assistanceModeExplicit:hasExplicitVoiceMode(),
      ...(extra||{})
    });
  }

  function detect(){
    const body=document.body;
    if(!body)return baseContext("welcome","Bienvenue");

    const dictation=document.querySelector('[data-libcomlair-dictation-active="true"]');
    if(dictation){
      return baseContext("dictation","Dictée vocale",{
        fieldId:dictation.id||dictation.getAttribute("data-target")||""
      });
    }

    if(body.classList.contains("v224-utility-detail")){
      return baseContext("detail","Fiche détaillée");
    }

    if(body.classList.contains("v224-result-tool-map")||body.classList.contains("v224-utility-map")){
      return baseContext("map","Carte");
    }
    if(body.classList.contains("v224-result-tool-favorites")||body.classList.contains("v224-utility-favorites")){
      return baseContext("favorites","Favoris");
    }
    if(body.classList.contains("v224-result-tool-filters")){
      return baseContext("filters","Filtres et tri");
    }
    if(body.classList.contains("v224-result-tool-contribute")||body.classList.contains("v224-utility-contribute")){
      return baseContext("contribute","Contribuer");
    }
    if(body.classList.contains("v224-result-tool-results")){
      return baseContext("results","Résultats");
    }

    if(body.classList.contains("v224-page5-step")&&body.classList.contains("v224-results-step")){
      const title=pageTitle()||"Sous-catégorie";
      return baseContext("subcategory",title,{subcategoryLabel:title});
    }

    if(body.classList.contains("v224-page5-step")){
      const categoryId=activeCategory();
      return baseContext("category",CATEGORY_LABELS[categoryId]||pageTitle()||"Catégorie");
    }

    if(body.classList.contains("v224-page4-step")){
      return baseContext("search","Recherche et catégories");
    }

    if(body.classList.contains("v224-page3-step")){
      return baseContext("home","Accueil Libcomlair");
    }

    const splash=document.getElementById("libcomlairSplash");
    if(visible(splash))return baseContext("welcome","Bienvenue");

    const profile=document.getElementById("accessWelcome");
    if(visible(profile)||body.classList.contains("v221-profile-step")){
      return baseContext("profile","Profil d’accessibilité");
    }

    return baseContext("home","Accueil Libcomlair");
  }

  function signature(ctx){
    return [
      ctx.id,
      ctx.title,
      ctx.categoryId||"",
      ctx.subcategoryLabel||"",
      ctx.fieldId||""
    ].join("|");
  }

  function refresh(reason){
    const ctx=detect();
    const sig=signature(ctx);
    lastContext=ctx;
    if(sig===lastSignature)return ctx;
    const previous=lastSignature;
    lastSignature=sig;
    try{
      window.dispatchEvent(new CustomEvent("libcomlair-voice-context-change",{
        detail:{context:ctx,reason:String(reason||"refresh"),previous}
      }));
    }catch(_){}
    return ctx;
  }

  function current(){
    return lastContext||refresh("current");
  }

  function commands(){
    return [...(current().commands||[])];
  }

  function describe(){
    const ctx=current();
    return {
      id:ctx.id,
      title:ctx.title,
      categoryId:ctx.categoryId||"",
      categoryLabel:ctx.categoryLabel||"",
      subcategoryLabel:ctx.subcategoryLabel||"",
      fieldId:ctx.fieldId||"",
      commands:[...(ctx.commands||[])],
      assistanceMode:ctx.assistanceMode,
      assistanceModeExplicit:ctx.assistanceModeExplicit
    };
  }

  function observe(){
    const body=document.body;
    if(!body)return;

    const schedule=(()=>{
      let pending=false;
      return reason=>{
        if(pending)return;
        pending=true;
        requestAnimationFrame(()=>{
          pending=false;
          refresh(reason);
        });
      };
    })();

    try{
      const bodyObserver=new MutationObserver(()=>schedule("body-class"));
      bodyObserver.observe(body,{attributes:true,attributeFilter:["class"]});

      const title=document.getElementById("v224Page5Title");
      if(title){
        const titleObserver=new MutationObserver(()=>schedule("page-title"));
        titleObserver.observe(title,{childList:true,characterData:true,subtree:true});
      }

      CATEGORY_IDS.forEach(id=>{
        const el=document.getElementById(id);
        if(!el)return;
        const observer=new MutationObserver(()=>schedule("category-state"));
        observer.observe(el,{attributes:true,attributeFilter:["class","open","hidden","style"]});
      });
    }catch(_){}

    ["libcomlair-detail-opened","libcomlair-nearme-result","popstate","pageshow"].forEach(eventName=>{
      window.addEventListener(eventName,()=>schedule(eventName));
    });
  }

  window.LibcomlairVoiceContext=Object.freeze({
    version:"v224-2",
    detect,
    refresh,
    current,
    commands,
    describe,
    getMode:readVoiceMode,
    setMode:setVoiceMode,
    resetMode:resetVoiceMode,
    hasExplicitMode:hasExplicitVoiceMode,
    categoryLabels:CATEGORY_LABELS
  });

  observe();
  refresh("initial");
})();