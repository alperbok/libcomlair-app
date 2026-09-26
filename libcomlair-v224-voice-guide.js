(()=>{
  "use strict";

  const MAX_ITEMS=18;
  const MAX_TEXT=4200;

  const ROLE_TEXT=Object.freeze({
    welcome:"Cette page vous souhaite la bienvenue dans Libcomlair et permet de poursuivre vers le choix de vos besoins d’accessibilité.",
    profile:"Cette page permet de choisir les adaptations de Libcomlair correspondant à vos besoins. Vous pouvez sélectionner plusieurs profils ou continuer sans adaptation particulière.",
    home:"Cette page permet de démarrer Libcomlair, modifier votre profil d’accessibilité, écouter la présentation et accéder aux aides et réglages.",
    search:"Cette page permet de rechercher un lieu ou une ville et de choisir une grande catégorie.",
    category:"Cette page présente les sous-catégories de la catégorie sélectionnée.",
    subcategory:"Cette page donne accès aux outils de la recherche en cours : Carte, Favoris, Filtres et tri, Contribuer et Résultats.",
    map:"Cette page permet d’utiliser la carte et la recherche autour de vous. La carte reste facultative.",
    favorites:"Cette page regroupe les lieux enregistrés en favoris.",
    filters:"Cette page permet d’activer ou retirer des filtres et de choisir l’ordre de tri des résultats.",
    contribute:"Cette page permet d’ajouter ou signaler un lieu accessible et de renseigner ses informations.",
    results:"Cette page présente les lieux correspondant à la recherche en cours.",
    detail:"Cette page présente la fiche détaillée du lieu sélectionné.",
    dictation:"Vous êtes dans une étape de dictée vocale."
  });

  function norm(s){
    return String(s||"").replace(/\s+/g," ").trim();
  }

  function visible(el){
    if(!el||el.nodeType!==1)return false;
    if(el.hidden||el.hasAttribute("hidden")||el.getAttribute("aria-hidden")==="true")return false;
    if(el.style&&el.style.display==="none")return false;
    try{
      const cs=getComputedStyle(el);
      if(cs.display==="none"||cs.visibility==="hidden"||Number(cs.opacity)===0)return false;
    }catch(_){}
    return true;
  }

  function labelFor(el){
    if(!el)return "";
    const aria=norm(el.getAttribute&&el.getAttribute("aria-label"));
    if(aria)return aria;
    if(el.labels&&el.labels.length){
      const t=norm([...el.labels].map(x=>x.textContent).join(" "));
      if(t)return t;
    }
    const closest=el.closest&&el.closest("label");
    if(closest){
      const clone=closest.cloneNode(true);
      clone.querySelectorAll("input,select,textarea,button").forEach(x=>x.remove());
      const t=norm(clone.textContent);
      if(t)return t;
    }
    if(el.id){
      const linked=document.querySelector('label[for="'+CSS.escape(el.id)+'"]');
      const t=norm(linked&&linked.textContent);
      if(t)return t;
    }
    return norm(el.textContent||el.getAttribute&&el.getAttribute("title")||"");
  }

  function rootCandidates(contextId){
    const byId=id=>document.getElementById(id);
    switch(contextId){
      case "welcome": return [byId("libcomlairSplash")];
      case "profile": return [byId("accessWelcome")];
      case "home": return [byId("accessNeedsSection"),document.querySelector("section.hero.v219-main-zone")];
      case "search": return [byId("v224Page4SearchIntro"),byId("v224Page4Categories")];
      case "map": return [byId("v224ResultTool-map"),byId("v224MapSection")];
      case "favorites": return [byId("v224ResultTool-favorites"),byId("favoritesSection")];
      case "filters": return [byId("v224ResultTool-filters"),byId("v224FiltersContent"),byId("placesFilters")];
      case "contribute": return [byId("v224ResultTool-contribute"),byId("v224ContributeSection")];
      case "results": return [byId("v224ResultTool-results"),byId("v224ResultsSection")];
      case "detail": return [byId("detail")];
      case "category":
      case "subcategory": return [byId("v224Page4Categories")];
      default:return [document.getElementById("mainContent")];
    }
  }

  function uniqueVisibleRoots(contextId){
    const seen=new Set();
    return rootCandidates(contextId).filter(el=>{
      if(!el||seen.has(el)||!visible(el))return false;
      seen.add(el);
      return true;
    });
  }

  function insideRoots(el,roots){
    return roots.some(root=>root===el||root.contains(el));
  }

  function controlsFor(contextId){
    const roots=uniqueVisibleRoots(contextId);
    if(!roots.length)return [];
    const selector='input:not([type="hidden"]), textarea, select, button, a[href], summary, [role="button"], [role="radio"], [role="checkbox"]';
    const nodes=[...document.querySelectorAll(selector)].filter(el=>insideRoots(el,roots)&&visible(el));
    const seen=new Set();
    const rows=[];
    for(const el of nodes){
      if(seen.has(el))continue;
      seen.add(el);

      const id=el.id||"";
      if(/^(v222ProfileMic|v224Page3Mic|v224Page4Mic|v224Page5Mic|visionVoiceCommand)$/.test(id))continue;
      if(el.closest&&el.closest('[aria-hidden="true"]'))continue;

      const tag=el.tagName.toLowerCase();
      const type=norm(el.getAttribute&&el.getAttribute("type")).toLowerCase();
      const label=labelFor(el);
      if(!label)continue;

      if(tag==="input"&&(type==="checkbox"||type==="radio")){
        rows.push({
          kind:type==="radio"?"choix":"case",
          label,
          state:el.checked?"coché":"non coché",
          disabled:!!el.disabled
        });
        continue;
      }

      if((el.getAttribute&&el.getAttribute("role")==="checkbox")||(el.getAttribute&&el.getAttribute("role")==="radio")){
        rows.push({
          kind:el.getAttribute("role")==="radio"?"choix":"case",
          label,
          state:el.getAttribute("aria-checked")==="true"?"coché":"non coché",
          disabled:el.getAttribute("aria-disabled")==="true"
        });
        continue;
      }

      if(tag==="select"){
        const options=[...el.options].filter(o=>!o.disabled).map(o=>norm(o.textContent)).filter(Boolean);
        rows.push({
          kind:"liste",
          label,
          state:norm(el.selectedOptions&&el.selectedOptions[0]&&el.selectedOptions[0].textContent),
          options
        });
        continue;
      }

      if(tag==="textarea"||(tag==="input"&&!["button","submit","reset"].includes(type))){
        rows.push({
          kind:"champ",
          label,
          state:el.value?("renseigné : "+norm(el.value)):"vide",
          placeholder:norm(el.getAttribute("placeholder"))
        });
        continue;
      }

      if(tag==="summary"){
        const parent=el.parentElement;
        rows.push({
          kind:"rubrique",
          label,
          state:parent&&parent.tagName==="DETAILS"?(parent.open?"ouverte":"fermée"):""
        });
        continue;
      }

      rows.push({
        kind:"action",
        label,
        state:el.getAttribute&&el.getAttribute("aria-pressed")==="true"?"activée":""
      });
    }
    return rows.slice(0,MAX_ITEMS);
  }

  function explanationsFor(contextId){
    const roots=uniqueVisibleRoots(contextId);
    if(!roots.length)return [];
    const nodes=[...document.querySelectorAll('[role="note"], .data-note, details > summary, .v219-info-card > summary, .v219-support-card > summary')]
      .filter(el=>insideRoots(el,roots)&&visible(el));
    const out=[];
    const seen=new Set();
    for(const el of nodes){
      let t=norm(el.textContent);
      if(!t||seen.has(t))continue;
      if(t.length>180)t=t.slice(0,177)+"…";
      seen.add(t);
      const low=t.toLowerCase();
      if(/micro vocal|répondre au micro/.test(low))continue;
      out.push(t);
      if(out.length>=8)break;
    }
    return out;
  }

  function sentenceForControl(row,discovery){
    if(row.kind==="case"||row.kind==="choix"){
      return row.label+", "+row.state+".";
    }
    if(row.kind==="liste"){
      if(discovery&&row.options&&row.options.length){
        return row.label+". Choix actuel : "+(row.state||"non défini")+". Options : "+row.options.join(", ")+".";
      }
      return row.label+", choix actuel : "+(row.state||"non défini")+".";
    }
    if(row.kind==="champ"){
      if(discovery){
        const extra=row.placeholder&&row.state==="vide"?" Exemple : "+row.placeholder+".":"";
        return "Champ "+row.label+", "+row.state+"."+extra;
      }
      return "Champ "+row.label+".";
    }
    if(row.kind==="rubrique"){
      return "Rubrique "+row.label+(row.state?", "+row.state:"")+".";
    }
    return "Action "+row.label+(row.state?", "+row.state:"")+".";
  }

  function build(contextOverride){
    const contextEngine=window.LibcomlairVoiceContext;
    const ctx=contextOverride||(contextEngine&&typeof contextEngine.current==="function"?contextEngine.current():{id:"home",title:"Libcomlair"});
    const mode=contextEngine&&typeof contextEngine.getMode==="function"?contextEngine.getMode():"simplified";
    const discovery=mode==="discovery";
    const controls=controlsFor(ctx.id);
    const explanations=explanationsFor(ctx.id);

    const parts=[];
    parts.push("Vous êtes dans "+(ctx.title||"Libcomlair")+".");
    const role=ROLE_TEXT[ctx.id];
    if(role)parts.push(role);

    if(discovery){
      if(explanations.length){
        parts.push(explanations.length===1
          ?"Une information explicative est disponible : "+explanations[0]+"."
          :"Des informations explicatives sont disponibles : "+explanations.join(". ")+".");
        parts.push("Vous pouvez dire lire l’explication, lire les informations ou explique cette page.");
      }

      if(controls.length){
        parts.push("Voici les éléments disponibles.");
        controls.forEach(row=>parts.push(sentenceForControl(row,true)));
      }else{
        parts.push("Aucun contrôle supplémentaire n’est actuellement disponible sur cette page.");
      }

      parts.push("Vous pouvez utiliser le micro pour répondre. Vous pouvez aussi dire quels sont mes choix, aide, répète ou retour lorsque retour est disponible.");
    }else{
      const important=controls.slice(0,7);
      if(important.length){
        parts.push("Choix principaux : "+important.map(x=>x.label).join(", ")+".");
      }
      if(explanations.length){
        parts.push("Une explication est disponible si vous souhaitez l’écouter.");
      }
      parts.push("Dites quels sont mes choix ou explique cette page pour obtenir davantage d’informations.");
    }

    const text=norm(parts.join(" "));
    return Object.freeze({
      context:ctx,
      mode,
      controls:Object.freeze(controls.map(x=>Object.freeze({...x}))),
      explanations:Object.freeze([...explanations]),
      text:text.length>MAX_TEXT?text.slice(0,MAX_TEXT-1)+"…":text
    });
  }

  function speakText(text,options){
    const engine=window.LibcomlairVoice;
    if(engine&&engine.available&&typeof engine.speak==="function"){
      return !!engine.speak(text,{rate:0.9,...(options||{})});
    }
    if(!("speechSynthesis" in window))return false;
    try{
      window.speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.lang="fr-FR";
      u.rate=.9;
      window.__libcomlairFallbackVoice=u;
      window.speechSynthesis.speak(u);
      return true;
    }catch(_){return false}
  }

  function readCurrent(options){
    const built=build();
    const prompt=document.getElementById("visionGuidePrompt");
    if(prompt)prompt.textContent=built.text;
    const ok=speakText(built.text,options);
    try{
      window.dispatchEvent(new CustomEvent("libcomlair-voice-guide-read",{
        detail:{contextId:built.context.id,mode:built.mode,ok}
      }));
    }catch(_){}
    return ok;
  }

  function describe(){
    const built=build();
    return {
      contextId:built.context.id,
      title:built.context.title,
      mode:built.mode,
      controls:built.controls.map(x=>({...x})),
      explanations:[...built.explanations],
      text:built.text
    };
  }

  window.LibcomlairVoiceGuide=Object.freeze({
    version:"v224-1",
    build,
    readCurrent,
    describe
  });
})();