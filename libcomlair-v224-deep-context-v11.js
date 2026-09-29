(()=>{
  "use strict";

  const original=window.LibcomlairVoiceContext;
  if(!original)return;
  let lastSignature="";

  function text(el){return String(el?.textContent||"").replace(/\s+/g," ").trim()}

  function baseContext(){
    try{return original.detect?.()||original.current?.()||{}}catch(_){return {}}
  }

  function current(){
    const ctx=baseContext();
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

  function signature(ctx){
    return [ctx?.pageId||"",ctx?.id||"",ctx?.title||"",ctx?.categoryId||"",ctx?.subcategoryLabel||"",ctx?.assistanceMode||""].join("|");
  }

  function dispatch(reason){
    const ctx=current();
    const sig=signature(ctx);
    if(sig===lastSignature)return ctx;
    const previous=lastSignature;
    lastSignature=sig;
    try{
      window.dispatchEvent(new CustomEvent("libcomlair-voice-context-change",{
        detail:{context:ctx,reason:"deep-context-v11:"+String(reason||"refresh"),previous}
      }));
    }catch(_){}
    return ctx;
  }

  function refresh(reason){
    try{original.refresh?.("deep-context-base:"+String(reason||"refresh"))}catch(_){}
    return dispatch(reason||"refresh");
  }

  window.LibcomlairVoiceContext=Object.freeze({
    ...original,
    version:String(original.version||"v224")+"+deep11",
    detect:current,
    current,
    refresh,
    describe:()=>{const c=current();return {...c,commands:[...(c.commands||[])]}}
  });

  const schedule=(()=>{let timer=0;return reason=>{clearTimeout(timer);timer=setTimeout(()=>dispatch(reason),120)}})();
  try{new MutationObserver(()=>schedule("body-class")).observe(document.body,{attributes:true,attributeFilter:["class"]})}catch(_){}
  const title=document.getElementById("v224Page5Title");
  if(title){try{new MutationObserver(()=>schedule("page-title")).observe(title,{childList:true,characterData:true,subtree:true})}catch(_){}}
  ["libcomlair-onboarding-step","libcomlair-detail-opened","libcomlair-nearme-result","pageshow","popstate"].forEach(name=>window.addEventListener(name,()=>schedule(name)));
  setTimeout(()=>dispatch("initial"),0);

  window.LibcomlairDeepContext=Object.freeze({version:"v224-11",current,refresh,signature:()=>signature(current())});
})();