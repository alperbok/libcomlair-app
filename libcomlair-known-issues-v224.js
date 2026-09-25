(()=>{
  "use strict";

  /*
    Registre des pannes déjà rencontrées dans Libcomlair.
    Objectif :
    - ne pas redécouvrir les mêmes causes ;
    - permettre au diagnostic de les identifier ;
    - appliquer automatiquement les réparations sûres ;
    - laisser les correctifs structurels au code de la version courante,
      puis forcer le navigateur à recharger cette version proprement.
  */

  const ISSUE_DEFINITIONS = Object.freeze([
    {
      id:"stale-browser-cache",
      title:"Ancienne version CSS/JavaScript encore affichée",
      symptom:"Une modification est publiée mais rien ne change visuellement.",
      cause:"Cache navigateur, cache applicatif ou service worker conservant une ancienne ressource.",
      repair:"Vider les caches techniques, actualiser les service workers et recharger avec une URL propre."
    },
    {
      id:"inline-display-overrides-css",
      title:"Style inline qui écrase la mise en page",
      symptom:"Le CSS est correct mais la page reste identique ou une grille ne s'applique pas.",
      cause:"Un script a posé display:block!important ou display:none!important directement sur un élément.",
      repair:"Supprimer ou normaliser le style inline avant de laisser la feuille CSS courante décider de la mise en page."
    },
    {
      id:"empty-screen-hidden-sections",
      title:"Cadre visible mais écran vide",
      symptom:"Le cadre de la page apparaît sans son contenu.",
      cause:"Une ancienne règle hidden/display:none reste active après le changement d'écran.",
      repair:"Réinitialiser les attributs hidden et les styles inline des sections attendues selon l'écran actif."
    },
    {
      id:"page-state-visual-state-desync",
      title:"Navigation logique et affichage désynchronisés",
      symptom:"L'application change d'étape mais l'ancien écran ou des blocs d'une autre page restent visibles.",
      cause:"Classes de page et visibilité DOM non synchronisées.",
      repair:"Normaliser la classe d'écran active et masquer/afficher explicitement les sections correspondantes."
    },
    {
      id:"return-categories-intermediate-screen",
      title:"Retour aux catégories incomplet",
      symptom:"Après Retour aux catégories, le titre et le tutoriel de l'ancienne catégorie restent visibles sans les sous-catégories.",
      cause:"Le retour ferme l'accordéon actif mais ne restaure pas complètement l'état visuel de l'écran 4.",
      repair:"Réinitialiser explicitement l'écran 5, réafficher toutes les grandes catégories et revenir directement au titre Catégories."
    },
    {
      id:"voice-return-command-too-generic",
      title:"Commandes vocales de retour confondues",
      symptom:"Retour aux transports et Retour aux catégories mènent au même écran intermédiaire ou à une catégorie sans sous-catégories.",
      cause:"Le moteur vocal traitait toute phrase contenant retour avec une seule règle générale.",
      repair:"Distinguer explicitement les destinations de retour et appeler le nouveau gestionnaire de pages pour restaurer soit la catégorie complète, soit les 7 grandes catégories."
    },
    {
      id:"voice-category-opens-inline",
      title:"Commande vocale ouvre une catégorie dans la page courante",
      symptom:"Après une demande vocale comme Transports, les sous-catégories s'affichent sous les grandes catégories et l'en-tête dédié n'apparaît pas.",
      cause:"L'ancien moteur vocal ouvre directement le <details> de la catégorie et contourne le gestionnaire de clic qui ouvre l'écran 5.",
      repair:"Écouter aussi l'événement toggle des grandes catégories et convertir toute ouverture directe en véritable écran 5."
    },
    {
      id:"legacy-details-open",
      title:"Ancien accordéon ouvert au lieu d'une nouvelle page",
      symptom:"Une grande catégorie se déplie dans l'écran courant au lieu d'ouvrir l'écran suivant.",
      cause:"Le comportement natif ou un ancien écouteur de <details> s'exécute avant la nouvelle navigation.",
      repair:"Fermer les accordéons hérités et laisser la navigation de la version courante reprendre la main."
    },
    {
      id:"duplicate-brand",
      title:"Logo Libcomlair affiché deux fois",
      symptom:"Deux logos apparaissent sur la même page.",
      cause:"Un ancien en-tête reste visible en même temps que l'en-tête du nouvel écran.",
      repair:"Conserver uniquement l'en-tête correspondant à l'écran actif."
    },
    {
      id:"layout-overflow-mobile",
      title:"Contenu plus long que le cadre mobile",
      symptom:"Le cadre est correct mais il faut défiler pour voir la fin d'une page conçue pour tenir à l'écran.",
      cause:"Répartition intérieure trop haute ou ancienne règle de padding/hauteur prioritaire.",
      repair:"Conserver le cadre validé et réinitialiser les surcharges transitoires ; la version courante fournit la disposition intérieure corrigée."
    },
    {
      id:"leaflet-gray-map",
      title:"Carte Leaflet partiellement grise",
      symptom:"Seule une bande de tuiles de carte apparaît et le reste reste gris.",
      cause:"Leaflet a calculé sa taille lorsque le conteneur était masqué ou n'avait pas encore sa largeur finale.",
      repair:"Recalculer la taille de la carte après affichage et recharger les tuiles avec le conteneur visible."
    },
    {
      id:"voice-state-stuck",
      title:"Commande ou lecture vocale dans un état bloqué",
      symptom:"Le bouton vocal existe mais la lecture/commande ne correspond plus à l'écran courant.",
      cause:"État vocal précédent conservé après navigation ou erreur.",
      repair:"Annuler la lecture vocale en cours puis réinitialiser l'état de l'écran."
    }
  ]);

  const CATEGORY_IDS=[
    "shopDetails","barDetails","hotelDetails","restaurantDetails",
    "leisureDetails","serviceDetails","transportDetails"
  ];

  function currentPageClass(){
    const classes=[
      "v221-profile-step","v224-page3-step","v224-page4-step","v224-page5-step"
    ];
    return classes.find(x=>document.body.classList.contains(x))||"";
  }

  function directSections(){
    const main=document.getElementById("mainContent");
    return main ? [...main.children].filter(el=>el.tagName==="SECTION") : [];
  }

  function visibleBrandCount(){
    const logos=[...document.querySelectorAll(".v222-brand-logo")];
    return logos.filter(el=>{
      const cs=getComputedStyle(el);
      const rect=el.getBoundingClientRect();
      return cs.display!=="none"&&cs.visibility!=="hidden"&&rect.width>0&&rect.height>0;
    }).length;
  }

  function detect(){
    const found=[];
    const page=currentPageClass();

    const categories=document.getElementById("v224Page4Categories");
    if(page==="v224-page4-step"&&categories){
      const inline=categories.style.getPropertyValue("display");
      if(inline&&inline!=="grid"){
        found.push("inline-display-overrides-css");
      }
    }

    if(page==="v224-page3-step"){
      const profile=document.getElementById("accessNeedsSection");
      const start=document.querySelector("section.hero.v219-main-zone");
      const bad=[profile,start].some(el=>!el||el.hidden||getComputedStyle(el).display==="none");
      if(bad)found.push("empty-screen-hidden-sections");
    }

    if(page==="v224-page4-step"){
      const start=document.querySelector("section.hero.v219-main-zone");
      const cats=document.getElementById("v224Page4Categories");
      const bad=[start,cats].some(el=>!el||el.hidden||getComputedStyle(el).display==="none");
      if(bad)found.push("empty-screen-hidden-sections");
      const opened=CATEGORY_IDS.some(id=>document.getElementById(id)?.open);
      if(opened)found.push("legacy-details-open");
    }

    if(visibleBrandCount()>1)found.push("duplicate-brand");

    const bodyWidth=Math.max(document.documentElement.clientWidth||0,window.innerWidth||0);
    if(document.documentElement.scrollWidth>bodyWidth+3){
      found.push("layout-overflow-mobile");
    }

    return [...new Set(found)];
  }

  function normalizeInlineDisplay(){
    const categories=document.getElementById("v224Page4Categories");
    if(document.body.classList.contains("v224-page4-step")&&categories){
      categories.style.removeProperty("display");
    }
  }

  function normalizeDetails(){
    if(!document.body.classList.contains("v224-page4-step"))return;
    CATEGORY_IDS.forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.open=false;
    });
  }

  function normalizeScreenVisibility(){
    const page=currentPageClass();
    const sections=directSections();
    const profile=document.getElementById("accessNeedsSection");
    const start=document.querySelector("section.hero.v219-main-zone");
    const categories=document.getElementById("v224Page4Categories");

    function clear(el){
      if(!el)return;
      el.hidden=false;
      el.removeAttribute("hidden");
      el.style.removeProperty("display");
      el.style.removeProperty("visibility");
      el.style.removeProperty("opacity");
    }

    if(page==="v224-page3-step"){
      [profile,start].forEach(clear);
    }else if(page==="v224-page4-step"){
      [start,categories].forEach(clear);
      sections.forEach(section=>{
        if(section!==start&&section!==categories){
          section.style.setProperty("display","none","important");
        }
      });
    }
  }

  function repairSafe(){
    const before=detect();
    try{normalizeInlineDisplay()}catch(_){}
    try{normalizeDetails()}catch(_){}
    try{normalizeScreenVisibility()}catch(_){}
    try{
      if(window.LibcomlairVoice&&typeof window.LibcomlairVoice.cancel==="function"){
        window.LibcomlairVoice.cancel();
      }
    }catch(_){}

    const after=detect();
    return {
      before,
      after,
      repaired:before.filter(id=>!after.includes(id)),
      remaining:after
    };
  }

  function definitions(){
    return ISSUE_DEFINITIONS.map(x=>({...x}));
  }

  window.LibcomlairKnownIssues=Object.freeze({
    version:"v224-1",
    definitions,
    detect,
    repairSafe
  });
})();