(()=>{
  "use strict";

  const visited=new Set();
  let timer=null;
  let presenting=false;

  function hasVision(){
    try{
      const p=JSON.parse(localStorage.getItem("libcomlair-access-profile-v1")||"null");
      return !!(p&&Array.isArray(p.needs)&&p.needs.includes("vision"));
    }catch(_){return false}
  }
  function discovery(){return window.LibcomlairVoiceContext?.getMode?.()!=="simplified"}
  function key(ctx){return [ctx?.id||"",ctx?.title||"",ctx?.categoryId||"",ctx?.subcategoryLabel||""].join("|")}

  function ending(ctx){
    const id=ctx?.id||"";
    if(id==="profile")return "Choisissez un ou plusieurs besoins. Ensuite, dites Valider. Si vous ne souhaitez aucune adaptation, dites Sans adaptation.";
    if(id==="onboarding-needs")return "Les dossiers des handicaps choisis sont ouverts automatiquement. Vous pouvez ouvrir ou fermer un autre dossier, cocher ou décocher un critère, puis dire Valider pour continuer, ou Retour.";
    if(id==="onboarding-voice")return "Il y a deux choix. Découverte guidée explique chaque page et ses choix en détail. Simplifié annonce l’essentiel. Choisissez Découverte guidée ou Simplifié, puis dites Valider pour continuer, ou Retour.";
    if(id==="onboarding-tutorial")return "La présentation est terminée. Dites Suivant pour continuer, ou Retour pour revenir à la navigation vocale.";
    if(id==="onboarding-home")return "Pour continuer vers les lieux et les catégories, dites Rechercher. Pour revenir à l’explication précédente, dites Retour.";
    if(id==="search")return "Le champ Rechercher un lieu ou une ville est facultatif pour le moment. Choisissez une catégorie en disant son nom. La catégorie sera sélectionnée, puis vous pourrez dire Valider pour l’ouvrir, ou Retour.";
    if(id==="category")return "Choisissez une sous-catégorie en disant son nom, ou dites Retour pour revenir aux catégories.";
    if(id==="subcategory")return "Vous pouvez choisir Carte, Favoris, Filtres et tri, Contribuer ou Résultats. Dites le choix souhaité, ou Retour.";
    if(id==="map")return "Vous pouvez dire Autour de moi, Résultats ou Retour.";
    if(id==="favorites")return "Vous pouvez ouvrir un dossier de favoris, ouvrir un lieu, ou dire Retour.";
    if(id==="filters")return "Vous pouvez activer ou enlever les filtres annoncés, choisir le tri, ou dire Retour.";
    if(id==="contribute")return "Vous pouvez renseigner les champs avec le micro, puis enregistrer, annuler ou dire Retour.";
    if(id==="results")return "Vous pouvez demander à lire les résultats, ouvrir un lieu, faire une nouvelle recherche ou dire Retour.";
    if(id==="detail")return "Vous pouvez demander Lire la fiche, ouvrir une rubrique de la fiche, effectuer une action, ou dire Retour aux résultats.";
    return "Vous pouvez utiliser le micro pour choisir une action de cette page, ou dire Retour lorsque cette action est disponible.";
  }

  function speak(text){
    const engine=window.LibcomlairVoice;
    if(!engine?.speak||!text)return false;
    return !!engine.speak(text,{rate:.9});
  }

  function present(ctx,force=false){
    if(!ctx||!hasVision()||!discovery())return false;
    const k=key(ctx);if(!force&&visited.has(k))return false;
    visited.add(k);presenting=true;
    try{window.LibcomlairVoiceGuide?.stop?.()}catch(_){}
    const guide=window.LibcomlairVoiceGuide;
    if(!guide?.readCurrent){presenting=false;return speak(ending(ctx))}
    const ok=guide.readCurrent({
      oncomplete:()=>{presenting=false;setTimeout(()=>speak(ending(ctx)),100)},
      onerror:()=>{presenting=false}
    });
    if(!ok){presenting=false;speak(ending(ctx))}
    return !!ok;
  }

  function schedule(ctx,force=false){
    if(timer)clearTimeout(timer);
    timer=setTimeout(()=>{
      const current=ctx||window.LibcomlairVoiceContext?.current?.();
      present(current,force);
    },260);
  }

  window.addEventListener("libcomlair-voice-context-change",event=>schedule(event.detail?.context));
  window.addEventListener("libcomlair-onboarding-step",()=>schedule());
  window.addEventListener("pageshow",()=>schedule());

  const body=document.body;
  if(body){
    try{
      const observer=new MutationObserver(()=>schedule());
      observer.observe(body,{attributes:true,attributeFilter:["class"]});
    }catch(_){}
  }

  setTimeout(()=>schedule(),450);

  window.LibcomlairGuidedPresenter=Object.freeze({
    version:"v224-1",
    presentCurrent:(force=false)=>present(window.LibcomlairVoiceContext?.current?.(),force),
    resetVisited:()=>visited.clear(),
    visited:()=>[...visited],
    isPresenting:()=>presenting
  });
})();