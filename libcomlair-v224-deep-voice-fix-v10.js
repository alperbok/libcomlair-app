(()=>{
  "use strict";

  const PURPOSE=Object.freeze({
    search:"Cette page permet de choisir une catégorie de lieux.",
    category:"Cette page présente les sous-catégories de la catégorie choisie.",
    subcategory:"Cette page présente les outils disponibles pour la recherche en cours.",
    map:"Cette page présente la carte et la recherche autour de vous.",
    favorites:"Cette page présente vos lieux enregistrés en favoris.",
    filters:"Cette page permet d’affiner et de trier les résultats.",
    contribute:"Cette page permet d’ajouter ou de signaler des informations sur un lieu.",
    results:"Cette page présente les lieux correspondant à votre recherche.",
    detail:"Cette page présente toutes les informations connues sur le lieu sélectionné."
  });

  const DEEP_IDS=new Set(Object.keys(PURPOSE));
  let contextBase=null;
  let guideBase=null;
  let coherenceBase=null;

  function text(el){return String(el?.textContent||"").replace(/\s+/g," ").trim()}

  function forcedContext(){
    const base=contextBase;
    let ctx={};
    try{ctx=base?.detect?.()||base?.current?.()||{}}catch(_){}
    const body=document.body;
    if(!body)return ctx;
    const title=text(document.getElementById("v224Page5Title"));

    const make=(id,label,pageId,extra={})=>Object.freeze({...ctx,...extra,id,title:label,pageId});

    if(body.classList.contains("v224-utility-detail"))
      return make("detail","Fiche détaillée","page-13-fiche-detaillee");
    if(body.classList.contains("v224-result-tool-map")||body.classList.contains("v224-utility-map"))
      return make("map","Carte","page-10-carte");
    if(body.classList.contains("v224-result-tool-favorites")||body.classList.contains("v224-utility-favorites"))
      return make("favorites","Favoris","page-10-favoris");
    if(body.classList.contains("v224-result-tool-filters"))
      return make("filters","Filtres et tri","page-10-filtres");
    if(body.classList.contains("v224-result-tool-contribute")||body.classList.contains("v224-utility-contribute"))
      return make("contribute","Contribuer","page-10-contribuer");
    if(body.classList.contains("v224-result-tool-results"))
      return make("results","Résultats","page-12-resultats");
    if(body.classList.contains("v224-page5-step")&&body.classList.contains("v224-results-step"))
      return make("subcategory",title||"Sous-catégorie","page-09-sous-categorie",{subcategoryLabel:title||ctx.subcategoryLabel||""});
    if(body.classList.contains("v224-page5-step"))
      return make("category",title||ctx.categoryLabel||"Catégorie","page-08-categorie");
    if(body.classList.contains("v224-page4-step"))
      return make("search","Recherche et catégories","page-07-categories");
    return ctx;
  }

  function patchContext(){
    const current=window.LibcomlairVoiceContext;
    if(!current||current.__v224DeepContextFix)return;
    contextBase=current;
    const wrapped=Object.freeze({
      ...current,
      __v224DeepContextFix:true,
      version:String(current.version||"")+"+deep10",
      detect:forcedContext,
      current:forcedContext,
      describe:()=>{const c=forcedContext();return {...c,commands:[...(c.commands||[])]}}
    });
    window.LibcomlairVoiceContext=wrapped;
  }

  function controlsText(){
    try{
      const d=guideBase?.describe?.();
      const labels=(d?.controls||[]).map(x=>String(x?.label||"").trim()).filter(Boolean).slice(0,12);
      if(labels.length)return "Choix disponibles : "+labels.join(", ")+".";
    }catch(_){}
    return "";
  }

  function ending(id){
    if(id==="search")return "Dites le nom d’une catégorie, ou utilisez Retour.";
    if(id==="category")return "Dites le nom de la sous-catégorie souhaitée, ou Retour aux catégories.";
    if(id==="subcategory")return "Dites Carte, Favoris, Filtres et tri, Contribuer, Résultats ou Retour.";
    if(id==="map")return "Vous pouvez dire Autour de moi, Résultats ou Retour.";
    if(id==="favorites")return "Dites le nom d’un dossier ou d’un lieu, ou Retour.";
    if(id==="filters")return "Dites le nom d’un filtre, demandez le tri souhaité, ou Retour.";
    if(id==="contribute")return "Dites le nom du champ souhaité. À la fin, dites Enregistrer, Annuler ou Retour.";
    if(id==="results")return "Vous pouvez demander Lire les résultats, Résultat suivant, Résultat précédent, Ouvrir un lieu, Nouvelle recherche ou Retour.";
    if(id==="detail")return "Vous pouvez dire Lire la fiche, le nom d’une rubrique ou Retour aux résultats.";
    return "";
  }

  function directDeep(options){
    const ctx=forcedContext();
    if(!DEEP_IDS.has(ctx?.id))return null;
    const engine=window.LibcomlairVoice;
    if(!engine?.speak)return false;
    const parts=["Vous êtes dans "+(ctx.title||"Libcomlair")+".",PURPOSE[ctx.id]||"",controlsText(),ending(ctx.id)].filter(Boolean);
    return !!engine.speak(parts.join(" "),{
      rate:.9,
      onend:()=>{try{options?.oncomplete?.()}catch(_){}},
      onerror:error=>{try{options?.onerror?.(error)}catch(_){}}
    });
  }

  function patchGuide(){
    const current=window.LibcomlairVoiceGuide;
    if(!current||current.__v224DeepDirectFix)return;
    guideBase=current;
    try{
      const proxy=new Proxy(current,{
        get(target,prop,receiver){
          if(prop==="__v224DeepDirectFix")return true;
          if(prop==="readCurrent")return options=>{
            const ctx=forcedContext();
            if(DEEP_IDS.has(ctx?.id))return directDeep(options);
            return target.readCurrent(options);
          };
          const value=Reflect.get(target,prop,receiver);
          return typeof value==="function"?value.bind(target):value;
        }
      });
      window.LibcomlairVoiceGuide=proxy;
    }catch(_){}
  }

  function centeredPresentation(options){
    const card=window.LibcomlairPresentationVoiceCard;
    if(!card?.start)return coherenceBase?.speakPresentation?.(options)||false;
    document.body?.classList.add("v224-presentation-reading");
    const opts=options||{};
    return card.start({
      oncomplete:()=>{document.body?.classList.remove("v224-presentation-reading");try{opts.oncomplete?.()}catch(_){}},
      onerror:error=>{document.body?.classList.remove("v224-presentation-reading");try{opts.onerror?.(error)}catch(_){}}
    });
  }

  function patchCoherence(){
    const current=window.LibcomlairPageCoherence;
    if(!current||current.__v224CenteredPresentationFix)return;
    coherenceBase=current;
    window.LibcomlairPageCoherence=Object.freeze({
      ...current,
      __v224CenteredPresentationFix:true,
      version:String(current.version||"")+"+centered10",
      speakPresentation:centeredPresentation
    });
  }

  function refreshDeep(reason){
    patchContext();patchGuide();patchCoherence();
    const ctx=forcedContext();
    if(!DEEP_IDS.has(ctx?.id))return;
    try{window.LibcomlairIdentity?.refresh?.("deep10:"+reason)}catch(_){}
  }

  const schedule=(()=>{let t=0;return reason=>{clearTimeout(t);t=setTimeout(()=>refreshDeep(reason),90)}})();
  try{new MutationObserver(()=>schedule("body")).observe(document.body,{attributes:true,attributeFilter:["class"]})}catch(_){}
  const title=document.getElementById("v224Page5Title");
  if(title){try{new MutationObserver(()=>schedule("title")).observe(title,{childList:true,characterData:true,subtree:true})}catch(_){}}
  ["libcomlair-detail-opened","libcomlair-nearme-result","libcomlair-onboarding-step","pageshow","popstate"].forEach(name=>window.addEventListener(name,()=>schedule(name)));

  function init(){patchContext();patchGuide();patchCoherence();schedule("initial")}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,0),{once:true});else setTimeout(init,0);

  window.LibcomlairDeepVoiceFix=Object.freeze({version:"v224-10",forcedContext,refresh:()=>refreshDeep("manual")});
})();