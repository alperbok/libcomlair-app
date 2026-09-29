(()=>{
  "use strict";

  const history=[];
  let timer=null;
  let presenting=false;
  let lastPresentedKey="";
  let lastPresentedAt=0;

  function profileNeeds(){
    try{
      const p=JSON.parse(localStorage.getItem("libcomlair-access-profile-v1")||"null");
      return p&&Array.isArray(p.needs)?p.needs:[];
    }catch(_){return []}
  }
  function hasVision(){return profileNeeds().includes("vision")}
  function mode(){
    try{return window.LibcomlairVoiceContext?.getMode?.()||"simplified"}catch(_){return "simplified"}
  }
  function key(ctx){return [hasVision()?"vision":"standard",mode(),ctx?.id||"",ctx?.title||"",ctx?.categoryId||"",ctx?.subcategoryLabel||""].join("|")}

  const PURPOSE=Object.freeze({
    welcome:"Cette page vous souhaite la bienvenue dans Libcomlair et permet de poursuivre vers le choix de vos besoins d’accessibilité.",
    profile:"Cette page permet de choisir un ou plusieurs besoins d’accessibilité.",
    "onboarding-needs":"Cette page permet de choisir les critères d’accessibilité qui comptent pour vous.",
    "onboarding-voice":"Cette page permet de choisir le niveau d’assistance vocale.",
    "onboarding-tutorial":"Cette page présente le fonctionnement général de Libcomlair, ses aides et les fonctions prévues pour la suite.",
    "onboarding-home":"Cette page permet de commencer une recherche de lieu accessible.",
    search:"Cette page permet de choisir une catégorie de lieux. La recherche par lieu ou par ville est facultative pour le moment.",
    category:"Cette page présente les sous-catégories de la catégorie choisie.",
    subcategory:"Cette page présente les outils disponibles pour la recherche en cours.",
    map:"Cette page présente la carte et la recherche autour de vous.",
    favorites:"Cette page présente vos lieux enregistrés en favoris.",
    filters:"Cette page permet d’affiner et de trier les résultats.",
    contribute:"Cette page permet d’ajouter ou de signaler des informations sur un lieu.",
    results:"Cette page présente les lieux correspondant à votre recherche.",
    detail:"Cette page présente toutes les informations connues sur le lieu sélectionné."
  });

  function ending(ctx,vision){
    const id=ctx?.id||"";
    if(id==="welcome")return "Pour continuer, choisissez Suivant.";
    if(id==="profile")return vision
      ?"Pour choisir, attendez la fin de l’annonce, appuyez sur le bouton Micro en haut à droite et dites le nom du besoin. Vous pouvez en choisir plusieurs. Quand vos choix sont terminés, dites Valider. Vous pouvez aussi dire Sans adaptation."
      :"Choisissez un ou plusieurs besoins, puis utilisez Valider. Vous pouvez aussi choisir Sans adaptation.";
    if(id==="onboarding-needs")return vision
      ?"Avec le micro, vous pouvez dire le nom d’un dossier pour l’ouvrir ou le fermer, puis le nom d’un critère pour le cocher ou le décocher. Quand vous avez terminé, dites Valider. Vous pouvez aussi dire Retour."
      :"Modifiez les critères utiles, puis choisissez Valider ou Retour.";
    if(id==="onboarding-voice")return vision
      ?"Choisissez Découverte guidée pour les explications complètes ou Simplifié pour les annonces essentielles. Dites ensuite Valider. Vous pouvez aussi dire Retour."
      :"Choisissez Découverte guidée ou Simplifié, puis Valider ou Retour.";
    if(id==="onboarding-tutorial")return vision
      ?"La présentation est terminée. Dites Suivant pour continuer, ou Retour pour revenir à Navigation vocale."
      :"Choisissez Suivant pour continuer, ou Retour.";
    if(id==="onboarding-home")return vision
      ?"Pour commencer la recherche, dites Rechercher. Pour revenir, dites Retour."
      :"Choisissez Rechercher ou Retour.";
    if(id==="search")return vision
      ?"Dites le nom d’une catégorie, puis Valider, ou dites Retour."
      :"Choisissez une catégorie, puis Valider, ou utilisez Retour.";
    if(id==="category")return vision?"Dites le nom de la sous-catégorie souhaitée, ou Retour aux catégories.":"Choisissez une sous-catégorie, ou Retour.";
    if(id==="subcategory")return vision?"Dites Carte, Favoris, Filtres et tri, Contribuer, Résultats ou Retour.":"Choisissez un outil ou Retour.";
    if(id==="map")return vision?"Vous pouvez dire Autour de moi, Résultats ou Retour.":"Utilisez Autour de moi, Résultats ou Retour.";
    if(id==="favorites")return vision?"Dites le nom d’un dossier ou d’un lieu, ou Retour.":"Ouvrez un favori ou utilisez Retour.";
    if(id==="filters")return vision?"Dites le nom d’un filtre, demandez le tri souhaité, ou dites Retour.":"Modifiez les filtres ou le tri, puis utilisez Retour.";
    if(id==="contribute")return vision?"Dites le nom du champ souhaité. À la fin, dites Enregistrer, Annuler ou Retour.":"Renseignez les champs, puis utilisez Enregistrer, Annuler ou Retour.";
    if(id==="results")return vision?"Vous pouvez demander Lire les résultats, Résultat suivant, Résultat précédent, Ouvrir un lieu, Nouvelle recherche ou Retour.":"Parcourez les résultats, ouvrez un lieu ou utilisez Retour.";
    if(id==="detail")return vision?"Vous pouvez dire Lire la fiche, le nom d’une rubrique ou Retour aux résultats.":"Consultez les rubriques ou utilisez Retour aux résultats.";
    return vision?"Appuyez sur Micro puis dites l’action souhaitée. Dites Aide pour réentendre les possibilités.":"Utilisez les actions de cette page ou Retour lorsqu’il est disponible.";
  }

  function speak(text,options){
    const engine=window.LibcomlairVoice;
    if(!engine?.speak||!text)return false;
    return !!engine.speak(text,{rate:.9,...(options||{})});
  }

  function standardPresentation(ctx){
    const guide=window.LibcomlairVoiceGuide;
    let controls=[];
    try{controls=guide?.describe?.().controls||[]}catch(_){}
    const main=controls.slice(0,6).map(x=>x.label).filter(Boolean);
    const parts=["Vous êtes dans "+(ctx?.title||"Libcomlair")+".",PURPOSE[ctx?.id]||""];
    if(main.length)parts.push("Actions principales : "+main.join(", ")+".");
    parts.push(ending(ctx,hasVision()));
    return parts.filter(Boolean).join(" ");
  }

  function finish(){presenting=false}

  function cancelCurrent(){
    clearTimeout(timer);
    timer=null;
    presenting=false;
    try{window.LibcomlairPresentationVoiceCard?.stop?.()}catch(_){}
    try{window.LibcomlairVoiceGuide?.stop?.()}catch(_){}
  }

  function present(ctx,force=false){
    if(!ctx)return false;
    const k=key(ctx),now=Date.now();
    if(!force&&k===lastPresentedKey&&now-lastPresentedAt<900)return false;
    lastPresentedKey=k;
    lastPresentedAt=now;
    history.push(k);
    if(history.length>100)history.shift();
    presenting=true;

    const currentMode=mode();
    const guide=window.LibcomlairVoiceGuide;

    /* Simplifié signifie annonce courte, jamais silence. */
    if(currentMode==="simplified"){
      const ok=speak(standardPresentation(ctx),{onend:finish,onerror:finish});
      if(!ok)finish();
      return ok;
    }

    /* Sans profil Vision, conserver une annonce courte et utilisable. */
    if(!hasVision()){
      const ok=speak(standardPresentation(ctx),{onend:finish,onerror:finish});
      if(!ok)finish();
      return ok;
    }

    /* Présentation Libcomlair : le proxy du guide utilise la carte centrale. */
    if(ctx.id==="onboarding-tutorial"&&guide?.readCurrent){
      const ok=guide.readCurrent({
        oncomplete:()=>setTimeout(()=>{
          const spoken=speak(ending(ctx,true),{onend:finish,onerror:finish});
          if(!spoken)finish();
        },100),
        onerror:finish
      });
      if(!ok){
        const spoken=speak((PURPOSE[ctx.id]||"")+" "+ending(ctx,true),{onend:finish,onerror:finish});
        if(!spoken)finish();
      }
      return !!ok;
    }

    if(!guide?.readCurrent){
      const ok=speak((PURPOSE[ctx.id]||"")+" "+ending(ctx,true),{onend:finish,onerror:finish});
      if(!ok)finish();
      return ok;
    }

    const ok=guide.readCurrent({
      oncomplete:()=>setTimeout(()=>{
        const spoken=speak(ending(ctx,true),{onend:finish,onerror:finish});
        if(!spoken)finish();
      },100),
      onerror:finish
    });
    if(!ok){
      const spoken=speak(ending(ctx,true),{onend:finish,onerror:finish});
      if(!spoken)finish();
    }
    return !!ok;
  }

  function schedule(reason,force=false,delay=320){
    clearTimeout(timer);
    timer=setTimeout(()=>{
      timer=null;
      let ctx=null;
      try{ctx=window.LibcomlairVoiceContext?.current?.()}catch(_){}
      present(ctx,force);
    },delay);
  }

  function transition(reason,force=false){
    cancelCurrent();
    schedule(reason,force,340);
  }

  window.addEventListener("libcomlair-voice-context-change",()=>transition("context-change"));
  window.addEventListener("libcomlair-onboarding-step",()=>transition("onboarding-step"));
  window.addEventListener("libcomlair-voice-mode-change",()=>{
    cancelCurrent();
    schedule("mode-change",true,650);
  });
  ["libcomlair-detail-opened","libcomlair-nearme-result","popstate","pageshow"].forEach(name=>{
    window.addEventListener(name,()=>transition(name));
  });

  const body=document.body;
  if(body){
    try{new MutationObserver(()=>schedule("body-class",false,380)).observe(body,{attributes:true,attributeFilter:["class"]})}catch(_){}
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>schedule("initial",true,550),{once:true});
  else schedule("initial",true,550);

  window.LibcomlairGuidedPresenter=Object.freeze({
    version:"v224-6",
    presentCurrent:(force=false)=>present(window.LibcomlairVoiceContext?.current?.(),force),
    cancelCurrent,
    restartCurrent:()=>transition("manual-restart",true),
    resetVisited:()=>{history.length=0;lastPresentedKey="";lastPresentedAt=0},
    visited:()=>[...new Set(history)],
    profileMode:()=>hasVision()?"vision-complete":"standard-guided",
    isPresenting:()=>presenting,
    currentMode:mode
  });
})();