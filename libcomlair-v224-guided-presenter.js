(()=>{
  "use strict";

  const visited=new Set();
  let timer=null;
  let presenting=false;

  function profileNeeds(){
    try{
      const p=JSON.parse(localStorage.getItem("libcomlair-access-profile-v1")||"null");
      return p&&Array.isArray(p.needs)?p.needs:[];
    }catch(_){return []}
  }
  function hasVision(){return profileNeeds().includes("vision")}
  function discovery(){return window.LibcomlairVoiceContext?.getMode?.()!=="simplified"}
  function key(ctx){return [hasVision()?"vision":"standard",ctx?.id||"",ctx?.title||"",ctx?.categoryId||"",ctx?.subcategoryLabel||""].join("|")}

  const PURPOSE=Object.freeze({
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
    if(id==="profile")return vision
      ?"Pour choisir, attendez la fin de l’annonce, appuyez sur le bouton Micro en haut à droite et dites le nom du besoin. Vous pouvez en choisir plusieurs. Quand vos choix sont terminés, dites Valider. Vous pouvez aussi dire Sans adaptation."
      :"Choisissez un ou plusieurs besoins, puis utilisez Valider. Vous pouvez aussi choisir Sans adaptation.";
    if(id==="onboarding-needs")return vision
      ?"Les dossiers correspondant aux handicaps choisis sont ouverts automatiquement. Avec le micro, vous pouvez dire le nom d’un dossier pour l’ouvrir ou le fermer, puis dire le nom d’un critère pour le cocher ou le décocher. Quand vous avez terminé, dites Valider. Pour revenir au choix des handicaps, dites Retour."
      :"Les dossiers choisis sont ouverts automatiquement. Vous pouvez modifier les critères, puis choisir Valider ou Retour.";
    if(id==="onboarding-voice")return vision
      ?"Il y a deux choix. Découverte guidée est le mode d’apprentissage complet : Libcomlair décrit chaque page, explique les choix et vous indique quoi dire au micro. Simplifié annonce seulement l’essentiel lorsque vous connaissez déjà l’application. Dites Découverte guidée ou Simplifié, puis dites Valider. Vous pouvez aussi dire Retour."
      :"Choisissez Découverte guidée pour une présentation détaillée, ou Simplifié pour des annonces plus courtes. Puis choisissez Valider ou Retour.";
    if(id==="onboarding-tutorial")return vision
      ?"La présentation est terminée. Dites Suivant pour continuer, ou Retour pour revenir à Navigation vocale."
      :"La présentation est terminée. Choisissez Suivant pour continuer, ou Retour.";
    if(id==="onboarding-home")return vision
      ?"Pour commencer la recherche, dites Rechercher. Pour revenir à la page précédente, dites Retour."
      :"Pour commencer la recherche, choisissez Rechercher. Vous pouvez aussi utiliser Retour.";
    if(id==="search")return vision
      ?"Le champ Rechercher un lieu ou une ville est facultatif pour le moment. Les catégories disponibles sont annoncées sur cette page. Dites le nom d’une catégorie, par exemple Restaurants ou Transports. Libcomlair vous confirmera la catégorie sélectionnée. Dites ensuite Valider pour l’ouvrir, ou Retour pour revenir à l’accueil."
      :"La recherche par lieu ou ville est facultative pour le moment. Choisissez une catégorie, puis Valider, ou utilisez Retour.";
    if(id==="category")return vision
      ?"Les sous-catégories visibles viennent d’être annoncées. Dites le nom de celle que vous souhaitez ouvrir. Si vous hésitez, vous pouvez choisir la sous-catégorie Tous. Dites Retour pour revenir aux catégories."
      :"Choisissez une sous-catégorie, ou Retour.";
    if(id==="subcategory")return vision
      ?"Les outils disponibles sont Carte, Favoris, Filtres et tri, Contribuer et Résultats. Dites le nom de l’outil que vous souhaitez utiliser, ou Retour."
      :"Choisissez Carte, Favoris, Filtres et tri, Contribuer ou Résultats, ou utilisez Retour.";
    if(id==="map")return vision?"Vous pouvez dire Autour de moi pour utiliser votre position, Résultats pour revenir à la liste, ou Retour.":"Utilisez Autour de moi, Résultats ou Retour.";
    if(id==="favorites")return vision?"Les dossiers de favoris et leurs actions viennent d’être annoncés. Dites le nom du dossier ou du lieu à ouvrir, ou Retour.":"Ouvrez un favori ou utilisez Retour.";
    if(id==="filters")return vision?"Les filtres et leurs états viennent d’être annoncés. Dites le nom d’un filtre pour le modifier, demandez le tri souhaité, ou dites Retour.":"Modifiez les filtres ou le tri, puis utilisez Retour.";
    if(id==="contribute")return vision?"Les champs disponibles viennent d’être annoncés. Dites le nom d’un champ pour le sélectionner, appuyez ensuite sur Micro et dictez votre réponse. À la fin, dites Enregistrer, Annuler ou Retour.":"Renseignez les champs, puis utilisez Enregistrer, Annuler ou Retour.";
    if(id==="results")return vision?"Les résultats et actions disponibles viennent d’être annoncés. Vous pouvez demander Lire les résultats, Résultat suivant, Résultat précédent, Ouvrir un lieu, Nouvelle recherche ou Retour.":"Parcourez les résultats, ouvrez un lieu ou utilisez Retour.";
    if(id==="detail")return vision?"La fiche est organisée en rubriques. Vous pouvez dire Lire la fiche, Lignes et directions, Informations pratiques, Actions possibles, Signalement, Avis et commentaires ou Accessibilité. Les actions disponibles dans chaque rubrique seront annoncées. Dites Retour aux résultats pour revenir.":"Consultez les rubriques de la fiche et utilisez Retour aux résultats pour revenir.";
    return vision?"Attendez la fin de l’annonce, appuyez sur Micro en haut à droite, puis dites l’action souhaitée. Dites Aide pour réentendre les possibilités.":"Utilisez les actions de cette page ou Retour lorsqu’il est disponible.";
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
    parts.push(ending(ctx,false));
    return parts.filter(Boolean).join(" ");
  }

  function present(ctx,force=false){
    if(!ctx||!discovery())return false;
    const k=key(ctx);if(!force&&visited.has(k))return false;
    visited.add(k);presenting=true;
    try{window.LibcomlairVoiceGuide?.stop?.()}catch(_){}

    const guide=window.LibcomlairVoiceGuide;

    /* Présentation Libcomlair : toujours lire les accordéons l’un après l’autre,
       quel que soit le profil sélectionné. */
    if(ctx.id==="onboarding-tutorial"&&guide?.readCurrent){
      const ok=guide.readCurrent({
        oncomplete:()=>{
          setTimeout(()=>{
            const spoken=speak(ending(ctx,hasVision()),{onend:()=>{presenting=false},onerror:()=>{presenting=false}});
            if(!spoken)presenting=false;
          },100);
        },
        onerror:()=>{presenting=false}
      });
      if(!ok){
        const spoken=speak((PURPOSE[ctx.id]||"")+" "+ending(ctx,hasVision()),{onend:()=>{presenting=false},onerror:()=>{presenting=false}});
        if(!spoken)presenting=false;
      }
      return !!ok;
    }

    if(!hasVision()){
      const ok=speak(standardPresentation(ctx),{onend:()=>{presenting=false},onerror:()=>{presenting=false}});
      if(!ok)presenting=false;
      return ok;
    }

    if(!guide?.readCurrent){
      const ok=speak((PURPOSE[ctx.id]||"")+" "+ending(ctx,true),{onend:()=>{presenting=false},onerror:()=>{presenting=false}});
      if(!ok)presenting=false;
      return ok;
    }
    const ok=guide.readCurrent({
      oncomplete:()=>{
        setTimeout(()=>{
          const spoken=speak(ending(ctx,true),{onend:()=>{presenting=false},onerror:()=>{presenting=false}});
          if(!spoken)presenting=false;
        },100);
      },
      onerror:()=>{presenting=false}
    });
    if(!ok){
      const spoken=speak(ending(ctx,true),{onend:()=>{presenting=false},onerror:()=>{presenting=false}});
      if(!spoken)presenting=false;
    }
    return !!ok;
  }

  function schedule(force=false){
    if(timer)clearTimeout(timer);
    timer=setTimeout(()=>present(window.LibcomlairVoiceContext?.current?.(),force),280);
  }

  window.addEventListener("libcomlair-voice-context-change",()=>schedule());
  window.addEventListener("libcomlair-voice-mode-change",()=>schedule());
  window.addEventListener("libcomlair-onboarding-step",()=>schedule());
  window.addEventListener("pageshow",()=>schedule());

  const body=document.body;
  if(body){
    try{new MutationObserver(()=>schedule()).observe(body,{attributes:true,attributeFilter:["class"]})}catch(_){}
  }
  setTimeout(()=>schedule(),500);

  window.LibcomlairGuidedPresenter=Object.freeze({
    version:"v224-4",
    presentCurrent:(force=false)=>present(window.LibcomlairVoiceContext?.current?.(),force),
    resetVisited:()=>visited.clear(),
    visited:()=>[...visited],
    profileMode:()=>hasVision()?"vision-complete":"standard-guided",
    isPresenting:()=>presenting
  });
})();
