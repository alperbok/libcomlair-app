(()=>{
  "use strict";

  const PURPOSE=Object.freeze({
    welcome:"Cette page vous souhaite la bienvenue dans Libcomlair et permet de poursuivre vers le choix de vos besoins d’accessibilité.",
    profile:"Cette page permet de choisir un ou plusieurs besoins d’accessibilité.",
    "onboarding-needs":"Cette page permet de choisir les critères d’accessibilité qui comptent pour vous.",
    "onboarding-voice":"Cette page permet de choisir le niveau d’assistance vocale.",
    "onboarding-tutorial":"Cette page présente le fonctionnement général de Libcomlair.",
    "onboarding-home":"Cette page permet de commencer une recherche de lieu accessible.",
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

  let timer=null;
  let presenting=false;
  let activeKey="";
  let lastAutoKey="";
  let generation=0;
  let lastAttempt={time:0,contextId:"",pageId:"",result:"idle",reason:""};
  const history=[];

  function profileNeeds(){
    try{
      const p=JSON.parse(localStorage.getItem("libcomlair-access-profile-v1")||"null");
      return p&&Array.isArray(p.needs)?p.needs:[];
    }catch(_){return []}
  }
  function hasVision(){return profileNeeds().includes("vision")}
  function mode(){try{return window.LibcomlairVoiceContext?.getMode?.()||"simplified"}catch(_){return "simplified"}}
  function current(){try{return window.LibcomlairVoiceContext?.current?.()||null}catch(_){return null}}
  function key(ctx){return [ctx?.pageId||ctx?.id||"",ctx?.id||"",ctx?.title||"",ctx?.categoryId||"",ctx?.subcategoryLabel||"",mode(),hasVision()?"vision":"standard"].join("|")}
  function mark(ctx,result,reason){lastAttempt={time:Date.now(),contextId:ctx?.id||"",pageId:ctx?.pageId||"",result:String(result||""),reason:String(reason||"")}}

  function ending(ctx){
    const id=ctx?.id||"";
    if(id==="welcome")return "Pour continuer, choisissez Suivant.";
    if(id==="profile")return hasVision()?"Avec le micro, dites le nom du besoin souhaité. Vous pouvez en choisir plusieurs. Quand vos choix sont terminés, dites Valider. Vous pouvez aussi dire Sans adaptation.":"Choisissez un ou plusieurs besoins, puis utilisez Valider.";
    if(id==="onboarding-needs")return "Dites le nom d’un dossier pour l’ouvrir ou le fermer, puis le nom d’un critère pour le cocher ou le décocher. Quand vous avez terminé, dites Valider. Vous pouvez aussi dire Retour.";
    if(id==="onboarding-voice")return "Choisissez Découverte guidée pour les explications complètes ou Simplifié pour les annonces essentielles. Dites ensuite Valider. Vous pouvez aussi dire Retour.";
    if(id==="onboarding-tutorial")return "La présentation est terminée. Dites Suivant pour continuer, ou Retour pour revenir à Navigation vocale.";
    if(id==="onboarding-home")return "Pour commencer la recherche, dites Rechercher. Pour revenir, dites Retour.";
    if(id==="search")return "Dites le nom d’une catégorie, ou utilisez Retour.";
    if(id==="category")return "Dites le nom de la sous-catégorie souhaitée, ou Retour aux catégories.";
    if(id==="subcategory")return "Dites Carte, Favoris, Filtres et tri, Contribuer, Résultats ou Retour.";
    if(id==="map")return "Vous pouvez dire Autour de moi, Résultats ou Retour.";
    if(id==="favorites")return "Dites le nom d’un dossier ou d’un lieu, ou Retour.";
    if(id==="filters")return "Dites le nom d’un filtre, demandez le tri souhaité, ou Retour.";
    if(id==="contribute")return "Dites le nom du champ souhaité. À la fin, dites Enregistrer, Annuler ou Retour.";
    if(id==="results")return "Vous pouvez demander Lire les résultats, Résultat suivant, Résultat précédent, Ouvrir un lieu, Nouvelle recherche ou Retour.";
    if(id==="detail")return "Vous pouvez dire Lire la fiche, le nom d’une rubrique ou Retour aux résultats.";
    return "Dites Aide pour entendre les possibilités de cette page.";
  }

  function controlsText(limit){
    try{
      const d=window.LibcomlairVoiceGuide?.describe?.();
      const labels=(d?.controls||[]).map(x=>String(x?.label||"").replace(/\s+/g," ").trim()).filter(Boolean).slice(0,limit||10);
      if(labels.length)return "Choix disponibles : "+labels.join(", ")+".";
    }catch(_){}
    return "";
  }

  function directText(ctx){
    const parts=["Vous êtes dans "+(ctx?.title||"Libcomlair")+".",PURPOSE[ctx?.id]||""];
    if(mode()==="discovery"){
      try{
        const described=window.LibcomlairVoiceGuide?.describe?.();
        const full=String(described?.text||"").replace(/\s+/g," ").trim();
        if(full&&full.length>30)parts.push(full);
        else parts.push(controlsText(12));
      }catch(_){parts.push(controlsText(12))}
    }else parts.push(controlsText(6));
    parts.push(ending(ctx));
    return parts.filter(Boolean).join(" ");
  }

  function cancelCurrent(){
    clearTimeout(timer);timer=null;
    generation+=1;
    presenting=false;
    activeKey="";
    try{window.LibcomlairPresentationVoiceCard?.stop?.()}catch(_){}
    try{window.LibcomlairVoice?.cancel?.()}catch(_){}
  }

  function finish(token,ctx,result,reason){
    if(token!==generation)return;
    presenting=false;
    activeKey="";
    if(result)mark(ctx,result,reason);
  }

  function speakDirect(ctx){
    const engine=window.LibcomlairVoice;
    if(!engine?.speak){mark(ctx,"failed","engine-unavailable");return false}
    const token=++generation;
    presenting=true;
    activeKey=key(ctx);
    const ok=engine.speak(directText(ctx),{
      rate:.9,
      onstart:()=>mark(ctx,"speaking","direct-v9"),
      onend:()=>finish(token,ctx,"ended","direct-v9"),
      onerror:error=>finish(token,ctx,"error",error?.error||error?.message||error)
    });
    if(ok===false){finish(token,ctx,"failed","engine-speak-false");return false}
    mark(ctx,"accepted","direct-v9");
    return true;
  }

  function speakTutorial(ctx){
    const card=window.LibcomlairPresentationVoiceCard;
    if(!card?.start){mark(ctx,"failed","presentation-card-unavailable");return false}
    const token=++generation;
    presenting=true;
    activeKey=key(ctx);
    const ok=card.start({
      oncomplete:()=>finish(token,ctx,"ended","centered-card-v3"),
      onerror:error=>finish(token,ctx,"error","centered-card-v3:"+String(error||"error"))
    });
    if(!ok){finish(token,ctx,"failed","presentation-card-start-false");return false}
    mark(ctx,"accepted","centered-card-v3");
    return true;
  }

  function present(ctx,force=false){
    if(!ctx){mark(null,"failed","no-context");return false}
    const k=key(ctx);
    if(!force&&k===lastAutoKey){mark(ctx,"skipped","same-page-already-presented");return false}
    if(!force&&presenting&&k===activeKey){mark(ctx,"skipped","same-page-speaking");return false}

    if(presenting||window.LibcomlairPresentationVoiceCard?.isRunning?.())cancelCurrent();
    if(!force)lastAutoKey=k;
    else lastAutoKey=k;
    history.push(k);if(history.length>100)history.shift();

    if(ctx.id==="onboarding-tutorial")return speakTutorial(ctx);
    return speakDirect(ctx);
  }

  function schedule(reason,force=false,delay=430){
    clearTimeout(timer);
    timer=setTimeout(()=>{
      timer=null;
      const ctx=current();
      if(!ctx){mark(null,"failed","no-context:"+reason);return}
      const k=key(ctx);
      if(!force&&k===lastAutoKey){
        if(presenting&&k===activeKey)return;
        mark(ctx,"skipped","same-page-event:"+reason);
        return;
      }
      present(ctx,force);
    },delay);
  }

  function transition(reason,force=false){schedule(reason,force,430)}

  window.addEventListener("libcomlair-voice-context-change",()=>transition("context-change"));
  window.addEventListener("libcomlair-onboarding-step",()=>transition("onboarding-step"));
  window.addEventListener("libcomlair-identity-page-change",()=>transition("identity-page-change"));
  window.addEventListener("libcomlair-voice-mode-change",()=>{cancelCurrent();schedule("mode-change",true,600)});
  ["libcomlair-detail-opened","libcomlair-nearme-result","popstate","pageshow"].forEach(name=>window.addEventListener(name,()=>transition(name)));

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>schedule("initial",true,600),{once:true});
  else schedule("initial",true,600);

  window.LibcomlairGuidedPresenter=Object.freeze({
    version:"v224-9",
    presentCurrent:(force=false)=>present(current(),force),
    cancelCurrent,
    restartCurrent:()=>{cancelCurrent();return present(current(),true)},
    resetVisited:()=>{lastAutoKey="";history.length=0},
    visited:()=>[...new Set(history)],
    profileMode:()=>hasVision()?"vision-complete":"standard-guided",
    isPresenting:()=>presenting,
    currentMode:mode,
    lastAttempt:()=>({...lastAttempt}),
    currentKey:()=>activeKey,
    lastAutoKey:()=>lastAutoKey
  });
})();