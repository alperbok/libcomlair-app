(()=>{
  "use strict";
  const body=document.body;
  const main=document.getElementById("mainContent");
  const apply=document.getElementById("applyAccessProfile");
  const skip=document.getElementById("skipAccessProfile");
  const change=document.getElementById("changeAccessProfile");
  const next=document.getElementById("v224Page3Next");
  const page3Mic=document.getElementById("v224Page3Mic");
  const page4Mic=document.getElementById("v224Page4Mic");
  const page5Mic=document.getElementById("v224Page5Mic");
  const page4Back=document.getElementById("v224Page4Back");
  const page5Back=document.getElementById("v224Page5Back");
  const page5Header=document.getElementById("v224Page5Header");
  const page5Title=document.getElementById("v224Page5Title");
  const page5TutorialText=document.getElementById("v224Page5TutorialText");

  const profile=document.getElementById("accessNeedsSection");
  const start=document.querySelector("section.hero.v219-main-zone");
  const categories=document.getElementById("v224Page4Categories");
  const searchIntro=document.getElementById("v224Page4SearchIntro");
  const resultsSection=document.getElementById("places")?.closest("section")||null;
  if(resultsSection&&!resultsSection.id)resultsSection.id="v224ResultsSection";
  const page5Tutorial=document.getElementById("v224Page5Tutorial");
  const mapSection=document.getElementById("v224MapSection");
  const favoritesSection=document.getElementById("favoritesSection");
  const contributeSection=document.getElementById("v224ContributeSection");
  const detailSection=document.getElementById("detail");
  const resultsActions=document.getElementById("v224ResultsActions");
  const resultToolAccordions={};
  const placesFilters=document.getElementById("placesFilters");
  const resultsCount=document.getElementById("resultsCount");
  const activeFiltersText=document.getElementById("activeFilters");
  let lastPage5Details=null;
  let lastResultsLabel="Résultats";

  const categoryIds=[
    "shopDetails","barDetails","hotelDetails","restaurantDetails",
    "leisureDetails","serviceDetails","transportDetails"
  ];
  const categoryPanels=categoryIds.map(id=>document.getElementById(id)).filter(Boolean);

  function forceShow(el,display="block"){
    if(!el)return;
    el.hidden=false;
    el.removeAttribute("hidden");
    el.style.setProperty("display",display,"important");
    el.style.removeProperty("visibility");
    el.style.removeProperty("opacity");
  }

  function forceHide(el){
    if(!el)return;
    el.style.setProperty("display","none","important");
  }

  function clearDisplay(el){
    if(!el)return;
    el.style.removeProperty("display");
  }

  function directSections(){
    return main ? [...main.children].filter(el=>el.tagName==="SECTION") : [];
  }

  function showOnlySections(allowed){
    const keep=new Set(allowed.filter(Boolean));
    directSections().forEach(section=>{
      if(keep.has(section)) forceShow(section);
      else forceHide(section);
    });
  }

  function clearAllSectionDisplays(){
    directSections().forEach(clearDisplay);
  }

  function prepareResultAccordions(){
    if(!resultsActions||resultsActions.dataset.ready==="2")return;
    resultsActions.dataset.ready="2";
    resultsActions.replaceChildren();

    // Cadre Filtres et tri : on retire le filtre de la liste des résultats
    // et on l'affiche dans son propre accordéon.
    let filtersContent=document.getElementById("v224FiltersContent");
    if(!filtersContent){
      filtersContent=document.createElement("div");
      filtersContent.id="v224FiltersContent";
      if(activeFiltersText)filtersContent.appendChild(activeFiltersText);
      if(placesFilters){
        placesFilters.open=true;
        filtersContent.appendChild(placesFilters);
      }
    }

    // Cadre Résultats : compteur court puis liste seulement à l'ouverture.
    let resultsContent=document.getElementById("v224ResultsContent");
    if(!resultsContent){
      resultsContent=document.createElement("div");
      resultsContent.id="v224ResultsContent";

      const countCard=document.createElement("div");
      countCard.id="v224ResultsCountCard";
      countCard.setAttribute("aria-live","polite");
      if(resultsCount)countCard.appendChild(resultsCount);

      const oldTitle=[...resultsSection.children].find(el=>el.tagName==="H2");
      if(oldTitle)oldTitle.style.display="none";

      resultsContent.appendChild(countCard);
      resultsContent.appendChild(resultsSection);
    }

    const tools=[
      {key:"map",label:"🗺 Carte",content:mapSection,voice:"carte"},
      {key:"favorites",label:"★ Favoris",content:favoritesSection,voice:"favoris"},
      {key:"filters",label:"⚙ Filtres et tri",content:filtersContent,voice:"filtres"},
      {key:"contribute",label:"＋ Contribuer",content:contributeSection,voice:"contribuer"},
      {key:"results",label:"📋 Résultats",content:resultsContent,voice:"resultats"}
    ];

    tools.forEach(item=>{
      if(!item.content)return;

      if(item.content.tagName==="SECTION"){
        item.content.style.removeProperty("display");
        item.content.hidden=false;
        item.content.removeAttribute("hidden");
      }

      const details=document.createElement("details");
      details.id="v224ResultTool-"+item.key;
      details.className="v224-result-tool";
      details.dataset.voiceTarget=item.voice;

      const summary=document.createElement("summary");
      summary.innerHTML="<strong>"+item.label+"</strong>";

      const frame=document.createElement("div");
      frame.className="v224-result-tool-frame";
      frame.appendChild(item.content);

      details.append(summary,frame);
      resultsActions.appendChild(details);
      resultToolAccordions[item.key]=details;

      details.addEventListener("toggle",()=>{
        if(!details.open)return;
        Object.entries(resultToolAccordions).forEach(([key,other])=>{
          if(key!==item.key)other.open=false;
        });

        if(item.key==="favorites"){
          const inner=favoritesSection?.querySelector("details");
          if(inner)inner.open=true;
        }

        if(item.key==="filters"&&placesFilters){
          placesFilters.open=true;
        }

        if(item.key==="map"){
          setTimeout(()=>{
            try{window.dispatchEvent(new Event("resize"))}catch(_){}
          },250);
          setTimeout(()=>{
            try{window.dispatchEvent(new Event("resize"))}catch(_){}
          },700);
        }

        requestAnimationFrame(()=>details.scrollIntoView({block:"start",behavior:"smooth"}));
      });
    });
  }

  function openResultAccordion(kind){
    const openIt=()=>{
      const target=resultToolAccordions[kind];
      if(!target)return;
      Object.values(resultToolAccordions).forEach(x=>x.open=false);
      target.open=true;
    };

    if(body.classList.contains("v224-results-step")){
      openIt();
      return;
    }

    if(lastPage5Details){
      showResultsPage(lastPage5Details,lastResultsLabel);
      setTimeout(openIt,0);
    }
  }

  prepareResultAccordions();

  function clearPage5State(){
    body.classList.remove("v224-results-step","v224-utility-step","v224-utility-map","v224-utility-favorites","v224-utility-contribute","v224-utility-detail");
    lastPage5Details=null;
    categoryPanels.forEach(el=>{
      el.classList.remove("v224-page5-active");
      el.open=false;
      el.style.removeProperty("display");
    });
    if(page5Header){
      page5Header.hidden=true;
      page5Header.setAttribute("hidden","");
      page5Header.style.removeProperty("display");
    }
    if(page5Back){
      page5Back.hidden=true;
      page5Back.setAttribute("hidden","");
      page5Back.style.removeProperty("display");
      page5Back.textContent="← Retour aux catégories";
    }
    if(page5Tutorial)page5Tutorial.style.removeProperty("display");
  }

  function closeCategoryAccordions(){
    categoryPanels.forEach(el=>{
      el.hidden=false;
      el.removeAttribute("hidden");
      el.open=false;
      el.classList.remove("v224-page5-active");
      el.style.removeProperty("display");
    });
  }

  function showPage3(){
    body.classList.remove("v221-profile-step","v221-onboarding","v224-page4-step","v224-page5-step");
    body.classList.add("v224-page3-step");
    clearPage5State();
    showOnlySections([profile,start]);
    forceShow(start,"block");

    requestAnimationFrame(()=>{
      window.scrollTo({top:0,left:0,behavior:"auto"});
      profile?.scrollIntoView({block:"start"});
    });
  }

  function showPage4(scrollTarget="search"){
    body.classList.remove("v221-profile-step","v221-onboarding","v224-page3-step","v224-page5-step");
    body.classList.add("v224-page4-step");

    clearPage5State();

    if(page5Header){
      page5Header.hidden=true;
      page5Header.setAttribute("hidden","");
      page5Header.style.setProperty("display","none","important");
    }
    if(page5Back){
      page5Back.hidden=true;
      page5Back.setAttribute("hidden","");
      page5Back.style.setProperty("display","none","important");
    }

    showOnlySections([start,categories]);
    forceShow(start,"flex");
    start?.style.setProperty("flex-direction","column","important");
    forceShow(categories,"grid");

    if(searchIntro){
      searchIntro.hidden=false;
      searchIntro.removeAttribute("hidden");
      searchIntro.style.removeProperty("display");
    }

    closeCategoryAccordions();
    categoryPanels.forEach(el=>{
      el.hidden=false;
      el.removeAttribute("hidden");
      el.open=false;
      el.classList.remove("v224-page5-active");
      el.style.removeProperty("display");
    });

    requestAnimationFrame(()=>{
      if(scrollTarget==="categories"){
        const title=categories ? [...categories.children].find(el=>el.tagName==="H2") : null;
        (title||categories)?.scrollIntoView({block:"start",behavior:"auto"});
      }else{
        window.scrollTo({top:0,left:0,behavior:"auto"});
        searchIntro?.scrollIntoView({block:"start"});
      }
    });
  }

  function returnToCategories(event){
    if(event){
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation==="function")event.stopImmediatePropagation();
    }
    showPage4("categories");
  }

  function categoryName(details){
    const summary=[...details.children].find(el=>el.tagName==="SUMMARY");
    const raw=(summary&&summary.textContent) || "Catégorie";
    return raw.replace(/[▸▶▼]/g,"").trim();
  }

  function categoryTutorial(details){
    const id=details&&details.id;
    const texts={
      shopDetails:"Les magasins sont classés selon leur activité principale. Si vous hésitez, choisissez « Tous les magasins ».",
      barDetails:"Les établissements sont classés selon leur activité principale. Si vous hésitez, choisissez « Tous les débits de boissons ».",
      hotelDetails:"Les hébergements sont classés selon leur type principal. Si vous hésitez, choisissez « Tous les hébergements ».",
      restaurantDetails:"Les restaurants sont classés selon leur type de cuisine ou d’établissement. Si vous hésitez, choisissez « Tous les restaurants ».",
      leisureDetails:"Les activités sont classées selon leur activité principale. Si vous hésitez, choisissez « Toutes les activités ».",
      serviceDetails:"Les services sont classés selon leur fonction principale. Si vous hésitez, choisissez « Tous les services ».",
      transportDetails:"Les transports sont classés selon leur mode principal. Si vous hésitez, choisissez « Tous les transports »."
    };
    return texts[id]||"Choisissez la sous-catégorie qui correspond à votre recherche.";
  }

  function showPage5(details){
    if(!details)return;
    lastPage5Details=details;
    body.classList.remove("v221-profile-step","v221-onboarding","v224-page3-step","v224-page4-step","v224-results-step","v224-utility-step","v224-utility-map","v224-utility-favorites","v224-utility-contribute","v224-utility-detail");
    body.classList.add("v224-page5-step");

    showOnlySections([categories]);
    forceShow(categories,"block");

    categoryPanels.forEach(el=>{
      el.classList.toggle("v224-page5-active",el===details);
      if(el===details){
        el.hidden=false;
        el.removeAttribute("hidden");
        el.open=true;
        el.style.setProperty("display","block","important");
      }else{
        el.open=false;
        el.style.setProperty("display","none","important");
      }
    });

    if(page5Title) page5Title.textContent=categoryName(details);
    if(page5TutorialText) page5TutorialText.textContent=categoryTutorial(details);
    if(page5Tutorial)page5Tutorial.style.removeProperty("display");
    if(page5Back)page5Back.textContent="← Retour aux catégories";
    forceShow(page5Header,"block");
    forceShow(page5Back,"block");

    requestAnimationFrame(()=>{
      window.scrollTo({top:0,left:0,behavior:"auto"});
      page5Header?.scrollIntoView({block:"start"});
    });
  }

  function returnLabel(details){
    const labels={
      shopDetails:"magasins",
      barDetails:"débits de boissons",
      hotelDetails:"hébergements",
      restaurantDetails:"restaurants",
      leisureDetails:"activités et sorties",
      serviceDetails:"services",
      transportDetails:"transports"
    };
    return labels[details?.id]||"sous-catégories";
  }

  function showResultsPage(details,label){
    if(!details||!resultsSection)return;
    lastPage5Details=details;
    body.classList.remove("v221-profile-step","v221-onboarding","v224-page3-step","v224-page4-step","v224-utility-step","v224-utility-map","v224-utility-favorites","v224-utility-contribute","v224-utility-detail");
    body.classList.add("v224-page5-step","v224-results-step");

    showOnlySections([categories]);
    forceShow(categories,"block");

    categoryPanels.forEach(el=>{
      el.open=false;
      el.classList.remove("v224-page5-active");
      el.style.setProperty("display","none","important");
    });

    lastResultsLabel=String(label||categoryName(details)).replace(/^[^A-Za-zÀ-ÿ0-9]+\s*/,"").trim();
    if(page5Title)page5Title.textContent=lastResultsLabel;
    if(page5Tutorial)page5Tutorial.style.setProperty("display","none","important");
    prepareResultAccordions();
    if(resultsActions)resultsActions.style.removeProperty("display");
    Object.values(resultToolAccordions).forEach(x=>x.open=false);
    if(placesFilters)placesFilters.open=true;
    if(page5Back)page5Back.textContent="← Retour aux "+returnLabel(details);
    forceShow(page5Header,"block");
    forceShow(page5Back,"block");

    requestAnimationFrame(()=>{
      window.scrollTo({top:0,left:0,behavior:"auto"});
      page5Header?.scrollIntoView({block:"start"});
    });
  }

  function prepareDetailPresentation(){
    if(!detailSection)return;

    // 1. Lignes et directions : accordéon principal.
    const wrapDirections=()=>{
      const directions=document.getElementById("idfmDirectionDetailsV153");
      if(!directions)return;
      let box=document.getElementById("v224DirectionsDetails");
      if(!box){
        box=document.createElement("details");
        box.id="v224DirectionsDetails";
        box.className="v224-detail-fold";
        box.dataset.voiceTarget="directions";
        const summary=document.createElement("summary");
        summary.innerHTML="<strong>🚌 Lignes et directions</strong>";
        directions.insertAdjacentElement("beforebegin",box);
        box.append(summary,directions);
      }
      box.open=false;
      box.hidden=directions.hidden;
      const title=[...directions.children].find(el=>el.tagName==="H3"&&/lignes et directions/i.test(el.textContent||""));
      if(title)title.style.display="none";
      if(!directions.dataset.v224Observer){
        directions.dataset.v224Observer="1";
        const observer=new MutationObserver(()=>{
          box.hidden=directions.hidden;
          const h=[...directions.children].find(el=>el.tagName==="H3"&&/lignes et directions/i.test(el.textContent||""));
          if(h)h.style.display="none";
        });
        observer.observe(directions,{attributes:true,childList:true,subtree:true});
      }
    };
    wrapDirections();
    setTimeout(wrapDirections,250);
    setTimeout(wrapDirections,900);

    // 2. Informations pratiques.
    if(!document.getElementById("v224PracticalDetails")){
      const practicalTitle=[...detailSection.children].find(el=>el.tagName==="H3"&&/informations pratiques/i.test(el.textContent||""));
      const actions=document.getElementById("detailActions");
      if(practicalTitle&&actions){
        const box=document.createElement("details");
        box.id="v224PracticalDetails";
        box.className="v224-detail-fold";
        box.dataset.voiceTarget="pratique";
        const summary=document.createElement("summary");
        summary.innerHTML="<strong>ℹ️ Informations pratiques</strong>";
        const content=document.createElement("div");
        content.className="v224-detail-fold-body";
        practicalTitle.insertAdjacentElement("beforebegin",box);
        box.append(summary,content);
        let node=practicalTitle.nextSibling;
        practicalTitle.remove();
        while(node&&node!==actions){
          const nextNode=node.nextSibling;
          content.appendChild(node);
          node=nextNode;
        }
      }
    }
    const practical=document.getElementById("v224PracticalDetails");
    if(practical)practical.open=false;

    // 3. Actions / 4. Signalement / 5. Avis.
    const actions=document.getElementById("detailActions");
    const report=document.getElementById("placeReportSection");
    const feedback=document.getElementById("placeFeedback");
    if(actions){actions.classList.add("v224-detail-fold");actions.dataset.voiceTarget="actions";actions.open=false;}
    if(report){report.classList.add("v224-detail-fold");report.dataset.voiceTarget="signalement";report.open=false;}
    if(feedback){feedback.classList.add("v224-detail-fold");feedback.dataset.voiceTarget="avis";feedback.open=false;}

    // 6. Accessibilité : un accordéon principal contenant les 5 profils.
    const profileBox=document.getElementById("accessibilityProfile");
    if(profileBox){
      let accessMain=document.getElementById("v224AccessibilityDetails");
      if(!accessMain){
        const accessTitle=[...detailSection.children].find(el=>el.tagName==="H3"&&/^accessibilité$/i.test((el.textContent||"").trim()));
        if(accessTitle){
          accessMain=document.createElement("details");
          accessMain.id="v224AccessibilityDetails";
          accessMain.className="v224-detail-fold";
          accessMain.dataset.voiceTarget="accessibilite";
          const summary=document.createElement("summary");
          summary.innerHTML="<strong>♿ Accessibilité</strong>";
          const content=document.createElement("div");
          content.className="v224-detail-fold-body";
          accessTitle.insertAdjacentElement("beforebegin",accessMain);
          accessMain.append(summary,content);
          accessTitle.remove();
          content.appendChild(profileBox);

          const nonRenseigne=[...detailSection.children].find(el=>el.tagName==="P"&&/Non renseigné.*signifie/i.test(el.textContent||""));
          if(nonRenseigne)content.appendChild(nonRenseigne);

          const detailAccess=document.getElementById("detailAccess");
          const commentBox=document.getElementById("detailCommentBox");
          const sourceNote=document.getElementById("detailSourceNote");
          if(detailAccess)content.appendChild(detailAccess);
          if(commentBox)content.appendChild(commentBox);
          if(sourceNote)content.appendChild(sourceNote);
        }
      }
      if(accessMain)accessMain.open=false;

      const sections=[...profileBox.children].filter(el=>el.tagName==="SECTION");
      const hasPriority=sections.some(section=>section.classList.contains("access-priority"));
      sections.forEach((section,index)=>{
        const title=[...section.children].find(el=>el.tagName==="H4");
        if(!title)return;
        let bodyBox=[...section.children].find(el=>el.classList&&el.classList.contains("v224-access-body"))||null;
        if(!bodyBox){
          bodyBox=document.createElement("div");
          bodyBox.className="v224-access-body";
          bodyBox.id="v224AccessBody"+index;
          let node=title.nextSibling;
          while(node){
            const nextNode=node.nextSibling;
            bodyBox.appendChild(node);
            node=nextNode;
          }
          section.appendChild(bodyBox);
        }
        let toggle=title.querySelector(".v224-access-toggle");
        if(!toggle){
          const label=title.textContent.trim();
          title.textContent="";
          toggle=document.createElement("button");
          toggle.type="button";
          toggle.className="v224-access-toggle";
          toggle.setAttribute("aria-controls",bodyBox.id);
          toggle.dataset.voiceTarget=(bodyBox.querySelector("ul")?.id||"").replace(/^access/,"").toLowerCase();
          toggle.innerHTML='<span class="v224-access-arrow" aria-hidden="true">▶</span><span>'+label+'</span>';
          title.appendChild(toggle);
          toggle.addEventListener("click",()=>{
            const expanded=toggle.getAttribute("aria-expanded")==="true";
            toggle.setAttribute("aria-expanded",expanded?"false":"true");
            bodyBox.hidden=expanded;
          });
        }
        const expanded=section.classList.contains("access-priority")||(!hasPriority&&index===0);
        toggle.setAttribute("aria-expanded",expanded?"true":"false");
        bodyBox.hidden=!expanded;
      });
    }
  }

  function showUtilityPage(kind){
    if(!lastPage5Details)return;
    const screens={
      map:{section:mapSection,title:"Carte",cls:"v224-utility-map"},
      favorites:{section:favoritesSection,title:"Favoris",cls:"v224-utility-favorites"},
      contribute:{section:contributeSection,title:"Contribuer",cls:"v224-utility-contribute"},
      detail:{section:detailSection,title:"Fiche détaillée",cls:"v224-utility-detail"}
    };
    const screen=screens[kind];
    if(!screen||!screen.section)return;

    body.classList.remove("v224-results-step","v224-utility-map","v224-utility-favorites","v224-utility-contribute","v224-utility-detail");
    body.classList.add("v224-page5-step","v224-utility-step",screen.cls);

    showOnlySections([categories,screen.section]);
    forceShow(categories,"block");
    forceShow(screen.section,"block");

    categoryPanels.forEach(el=>{
      el.open=false;
      el.classList.remove("v224-page5-active");
      el.style.setProperty("display","none","important");
    });

    if(page5Title)page5Title.textContent=screen.title;
    if(page5Tutorial)page5Tutorial.style.setProperty("display","none","important");
    if(resultsActions)resultsActions.style.setProperty("display","none","important");
    if(page5Back)page5Back.textContent="← Retour aux résultats";
    forceShow(page5Header,"block");
    forceShow(page5Back,"block");

    if(kind==="detail"){
      prepareDetailPresentation();
    }

    if(kind==="favorites"){
      const d=favoritesSection.querySelector("details");
      if(d)d.open=true;
    }

    if(kind==="contribute"){
      const panel=document.getElementById("addPlacePanel");
      if(panel&&panel.hasAttribute("hidden"))document.getElementById("addPlaceBtn")?.click();
    }

    requestAnimationFrame(()=>{
      window.scrollTo({top:0,left:0,behavior:"auto"});
      page5Header?.scrollIntoView({block:"start"});
      if(kind==="map"){
        setTimeout(()=>{
          try{window.dispatchEvent(new Event("resize"))}catch(_){}
        },250);
        setTimeout(()=>{
          try{window.dispatchEvent(new Event("resize"))}catch(_){}
        },700);
      }
    });
  }

  function showResultsAgain(){
    if(lastPage5Details)showResultsPage(lastPage5Details,lastResultsLabel);
  }

  function handlePage5Back(event){
    if(event){
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation==="function")event.stopImmediatePropagation();
    }
    if(body.classList.contains("v224-utility-step")){
      showResultsAgain();
      return;
    }
    if(body.classList.contains("v224-results-step")&&lastPage5Details){
      showPage5(lastPage5Details);
      return;
    }
    showPage4("categories");
  }

  apply?.addEventListener("click",()=>setTimeout(showPage3,20));
  skip?.addEventListener("click",()=>setTimeout(showPage3,20));

  change?.addEventListener("click",()=>{
    body.classList.remove("v224-page3-step","v224-page4-step","v224-page5-step");
    body.classList.add("v221-profile-step");
    clearPage5State();
    clearAllSectionDisplays();
    requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:"auto"}));
  });

  next?.addEventListener("click",showPage4);
  page4Back?.addEventListener("click",showPage3);
  page5Back?.addEventListener("click",handlePage5Back,true);

  document.addEventListener("click",event=>{
    const target=event.target&&event.target.closest?event.target.closest("#v224Page5Back"):null;
    if(!target)return;
    handlePage5Back(event);
  },true);

  window.addEventListener("libcomlair-detail-opened",()=>{
    prepareDetailPresentation();
    if(body.classList.contains("v224-results-step"))showUtilityPage("detail");
  });

  document.addEventListener("click",event=>{
    const target=event.target&&event.target.closest?event.target.closest(".show-on-map,#detailMap"):null;
    if(!target)return;
    if(!body.classList.contains("v224-page5-step"))return;
    setTimeout(()=>openResultAccordion("map"),0);
  });

  document.addEventListener("click",event=>{
    const target=event.target&&event.target.closest?event.target.closest(".favorite-details"):null;
    if(!target)return;
    if(!body.classList.contains("v224-results-step"))return;
    setTimeout(()=>showUtilityPage("detail"),0);
  });

  categoryPanels.forEach(details=>{
    const summary=[...details.children].find(el=>el.tagName==="SUMMARY");

    // Ouverture tactile : prendre la main avant l'ancien accordéon.
    summary?.addEventListener("click",event=>{
      if(!body.classList.contains("v224-page4-step"))return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      showPage5(details);
    },true);

    // Ouverture vocale / ancienne logique : si un moteur ouvre directement
    // le <details>, convertir immédiatement cet état en véritable écran 5.
    details.addEventListener("toggle",()=>{
      if(!body.classList.contains("v224-page4-step"))return;
      if(!details.open)return;
      showPage5(details);
    });

    // Sous-catégorie : le clic manuel et le clic déclenché par la voix
    // ouvrent exactement le même écran de résultats.
    details.addEventListener("click",event=>{
      if(!body.classList.contains("v224-page5-step")||body.classList.contains("v224-results-step"))return;
      const button=event.target&&event.target.closest?event.target.closest("button.category"):null;
      if(!button)return;
      const grid=button.parentElement;
      if(!grid||!/Types$/.test(grid.id||""))return;
      const label=button.textContent.trim();
      setTimeout(()=>showResultsPage(details,label),0);
    });
  });

  function activateMic(){
    const voiceControls=document.getElementById("visionVoiceControls");
    const realMic=document.getElementById("visionVoiceCommand");
    const announce=document.getElementById("visionReadPage");
    if(voiceControls && !voiceControls.hidden && realMic){
      realMic.click();
      return;
    }
    announce?.click();
  }

  function showCategoryById(id){
    const details=document.getElementById(id);
    if(!details)return false;
    showPage5(details);
    return true;
  }

  window.LibcomlairPageFlow=Object.freeze({
    showCategories:()=>showPage4("categories"),
    showSearch:()=>showPage4("search"),
    showCategory:showCategoryById,
    showResults:(id,label)=>{
      const details=document.getElementById(id);
      if(!details)return false;
      showResultsPage(details,label);
      return true;
    },
    showUtility:showUtilityPage,
    openResultAccordion,
    showResultsAgain,
    currentCategory:()=>lastPage5Details?.id||categoryPanels.find(el=>el.classList.contains("v224-page5-active"))?.id||""
  });

  page3Mic?.addEventListener("click",activateMic);
  page4Mic?.addEventListener("click",activateMic);
  page5Mic?.addEventListener("click",activateMic);
})();