(()=>{
 "use strict";

 const MIC_IDS=new Set(["v222ProfileMic","v224Page3Mic","v224Page4Mic","v224Page5Mic","visionVoiceCommand"]);
 const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 let activeRecognition=null;
 let lastSpokenHelp="";

 function normalize(value){
   return String(value||"")
     .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
     .toLowerCase()
     .replace(/[★☆▶►▼◀←→🎙🔊ℹ️⚙️🗺️📋＋+♿👁👂🧭🤝]/g," ")
     .replace(/[^a-z0-9à-ÿ' -]/g," ")
     .replace(/\b(le|la|les|un|une|des|du|de|d|au|aux)\b/g," ")
     .replace(/\s+/g," ")
     .trim();
 }

 function visible(el){
   if(!el||el.nodeType!==1||el.hidden||el.hasAttribute("hidden"))return false;
   if(el.getAttribute("aria-hidden")==="true")return false;
   try{
     const cs=getComputedStyle(el);
     if(cs.display==="none"||cs.visibility==="hidden"||Number(cs.opacity)===0)return false;
   }catch(_){}
   const rect=el.getBoundingClientRect();
   return rect.width>0&&rect.height>0;
 }

 function speak(message){
   const text=String(message||"").trim();
   if(!text)return false;
   lastSpokenHelp=text;
   const status=document.getElementById("voiceStatus");
   const panel=document.getElementById("voiceStatusPanel");
   if(panel)panel.hidden=false;
   if(status)status.textContent=text;
   const engine=window.LibcomlairVoice;
   if(engine&&engine.available&&typeof engine.speak==="function"){
     try{return !!engine.speak(text,{rate:.9})}catch(_){}
   }
   if("speechSynthesis" in window){
     try{
       speechSynthesis.cancel();
       const u=new SpeechSynthesisUtterance(text);
       u.lang="fr-FR";u.rate=.9;
       speechSynthesis.speak(u);
       return true;
     }catch(_){}
   }
   return false;
 }

 function labelOf(el){
   if(!el)return "";
   const aria=(el.getAttribute("aria-label")||"").trim();
   if(aria&&!/micro vocal|répondre au micro/i.test(aria))return aria;
   if(el.labels&&el.labels.length){
     const t=[...el.labels].map(x=>x.textContent||"").join(" ").replace(/\s+/g," ").trim();
     if(t)return t;
   }
   const closest=el.closest&&el.closest("label");
   if(closest){
     const clone=closest.cloneNode(true);
     clone.querySelectorAll("input,select,textarea,button").forEach(x=>x.remove());
     const t=(clone.textContent||"").replace(/\s+/g," ").trim();
     if(t)return t;
   }
   if(el.id){
     try{
       const linked=document.querySelector('label[for="'+CSS.escape(el.id)+'"]');
       if(linked){
         const t=(linked.textContent||"").replace(/\s+/g," ").trim();
         if(t)return t;
       }
     }catch(_){}
   }
   return (el.textContent||el.title||"").replace(/\s+/g," ").trim();
 }

 function currentRoots(){
   const roots=[];
   const add=el=>{if(el&&visible(el)&&!roots.includes(el))roots.push(el)};
   [
     "libcomlairSplash","accessWelcome","accessNeedsSection","v224Page4SearchIntro",
     "v224Page4Categories","v224ResultTool-map","v224ResultTool-favorites",
     "v224ResultTool-filters","v224ResultTool-contribute","v224ResultTool-results","detail"
   ].forEach(id=>add(document.getElementById(id)));
   document.querySelectorAll("section.hero.v219-main-zone, details.v224-page5-active").forEach(add);
   return roots.length?roots:[document.getElementById("mainContent")].filter(Boolean);
 }

 function inCurrentRoots(el,roots){
   return roots.some(root=>root===el||root.contains(el));
 }

 function aliasesFor(label){
   const base=normalize(label);
   const set=new Set([base]);
   const stripped=base.replace(/^(afficher|ouvrir|lire|choisir|selectionner|cocher|activer|desactiver|modifier|utiliser|continuer|rechercher|retour a|retour aux|retour)\s+/,"").trim();
   if(stripped)set.add(stripped);
   if(base.includes("comprehension cognition")){set.add("comprehension");set.add("cognition")}
   if(base.includes("assistance accompagnement")){set.add("assistance");set.add("accompagnement")}
   if(base.includes("decouverte guidee")){set.add("decouverte");set.add("mode decouverte")}
   if(base.includes("simplifie")){set.add("mode simplifie")}
   if(base.includes("presentation libcomlair")){set.add("presentation");set.add("presentation libcomlair")}
   if(base.includes("comment fonctionne libcomlair")){set.add("comment fonctionne libcomlair");set.add("tutoriel");set.add("explication")}
   if(base.includes("assistance et reglages")){set.add("reglages");set.add("assistance reglages")}
   if(base.includes("filtres et tri")){set.add("filtres");set.add("tri")}
   return [...set].filter(Boolean);
 }

 function collectCandidates(){
   const roots=currentRoots();
   const selector='button, summary, input[type="checkbox"], input[type="radio"], select, a[href]';
   const out=[];
   const seen=new Set();
   for(const el of document.querySelectorAll(selector)){
     if(!visible(el)||!inCurrentRoots(el,roots)||seen.has(el))continue;
     if(MIC_IDS.has(el.id))continue;
     if(el.closest('[aria-hidden="true"]'))continue;
     seen.add(el);
     if(el.tagName==="SELECT"){
       [...el.options].forEach(option=>{
         if(option.disabled)return;
         const label=(option.textContent||"").trim();
         if(!label)return;
         out.push({type:"option",label,aliases:aliasesFor(label),el,option});
       });
       continue;
     }
     const label=labelOf(el);
     if(!label)continue;
     const type=(el.type||"").toLowerCase();
     out.push({
       type:type==="checkbox"?"checkbox":type==="radio"?"radio":el.tagName==="SUMMARY"?"summary":"action",
       label,aliases:aliasesFor(label),el
     });
   }
   return out;
 }

 function words(s){return new Set(normalize(s).split(" ").filter(x=>x.length>1))}
 function similarity(a,b){
   a=normalize(a);b=normalize(b);
   if(!a||!b)return 0;
   if(a===b)return 1;
   if(a.includes(b)||b.includes(a))return Math.min(a.length,b.length)>=4?.94:.78;
   const A=words(a),B=words(b);
   let common=0;A.forEach(w=>{if(B.has(w))common++});
   const union=new Set([...A,...B]).size||1;
   return common/union;
 }

 function bestCandidate(alternatives,candidates){
   let best=null,bestScore=0;
   for(const raw of alternatives){
     const spoken=normalize(raw)
       .replace(/^(je veux|je voudrais|choisis|choisir|selectionne|selectionner|coche|cocher|ouvre|ouvrir|lire|lis|active|activer)\s+/,"")
       .trim();
     for(const c of candidates){
       for(const alias of c.aliases){
         const score=Math.max(similarity(spoken,alias),similarity(normalize(raw),alias));
         if(score>bestScore){bestScore=score;best=c}
       }
     }
   }
   return bestScore>=.58?{candidate:best,score:bestScore}:null;
 }

 function confirmCandidate(c){
   if(c.type==="checkbox")return c.label+" "+(c.el.checked?"coché":"décoché")+".";
   if(c.type==="radio")return c.label+" sélectionné.";
   if(c.type==="option")return c.label+" sélectionné.";
   if(c.type==="summary")return c.label+" ouvert.";
   return c.label+".";
 }

 function activate(c){
   if(!c)return false;
   try{
     if(c.type==="checkbox"){
       c.el.checked=!c.el.checked;
       c.el.dispatchEvent(new Event("input",{bubbles:true}));
       c.el.dispatchEvent(new Event("change",{bubbles:true}));
     }else if(c.type==="radio"){
       c.el.checked=true;
       c.el.dispatchEvent(new Event("input",{bubbles:true}));
       c.el.dispatchEvent(new Event("change",{bubbles:true}));
     }else if(c.type==="option"){
       c.el.value=c.option.value;
       c.el.dispatchEvent(new Event("input",{bubbles:true}));
       c.el.dispatchEvent(new Event("change",{bubbles:true}));
     }else{
       c.el.click();
     }
     setTimeout(()=>speak(confirmCandidate(c)),80);
     return true;
   }catch(_){return false}
 }

 function universalCommand(alternatives){
   const joined=normalize(alternatives.join(" | "));
   const ctx=window.LibcomlairVoiceContext;
   const guide=window.LibcomlairVoiceGuide;
   if(/\b(mode )?decouverte\b/.test(joined)&&ctx?.setMode){ctx.setMode("discovery");return true}
   if(/\b(mode )?simplifie\b/.test(joined)&&ctx?.setMode){ctx.setMode("simplified");return true}
   if(/\b(explique cette page|lire les informations|lire tout|quels sont mes choix|aide)\b/.test(joined)&&guide?.readCurrent){guide.readCurrent();return true}
   if(/\b(repete|repeter)\b/.test(joined)&&lastSpokenHelp){speak(lastSpokenHelp);return true}
   if(/\b(arreter la lecture|stop lecture|silence)\b/.test(joined)){
     try{window.LibcomlairVoice?.cancel?.()}catch(_){}
     try{speechSynthesis.cancel()}catch(_){}
     return true;
   }
   return false;
 }

 function notUnderstood(candidates){
   const labels=[];
   for(const c of candidates){
     if(!labels.includes(c.label))labels.push(c.label);
     if(labels.length>=8)break;
   }
   const tail=labels.length?" Sur cette page, vous pouvez dire : "+labels.join(", ")+".":" Dites aide pour entendre les choix disponibles.";
   speak("Je n’ai pas compris votre choix."+tail);
 }

 function startRecognition(){
   if(!SpeechRecognition){
     speak("La reconnaissance vocale n’est pas disponible dans ce navigateur.");
     return;
   }
   try{activeRecognition?.abort?.()}catch(_){}
   try{window.LibcomlairVoice?.cancel?.()}catch(_){}

   const r=new SpeechRecognition();
   activeRecognition=r;
   r.lang="fr-FR";
   r.interimResults=false;
   r.continuous=false;
   r.maxAlternatives=7;
   try{window.LibcomlairVoice?.setRecognitionActive?.(true)}catch(_){}
   const status=document.getElementById("voiceStatus"),panel=document.getElementById("voiceStatusPanel");
   if(panel)panel.hidden=false;
   if(status)status.textContent="Microphone activé. Dites un choix de cette page.";

   r.onresult=event=>{
     const result=event.results?.[event.resultIndex??0]||event.results?.[0];
     const alternatives=result?Array.from(result).slice(0,7).map(x=>x?.transcript||"").filter(Boolean):[];
     if(!alternatives.length){notUnderstood(collectCandidates());return}
     if(universalCommand(alternatives))return;
     const candidates=collectCandidates();
     const match=bestCandidate(alternatives,candidates);
     if(match&&activate(match.candidate))return;
     notUnderstood(candidates);
   };
   r.onerror=event=>{
     const err=String(event?.error||"");
     if(err!=="aborted")speak(err==="no-speech"?"Je n’ai rien entendu. Appuyez sur le micro et réessayez.":"Le micro n’a pas pu reconnaître votre demande. Réessayez.");
   };
   r.onend=()=>{
     activeRecognition=null;
     try{window.LibcomlairVoice?.setRecognitionActive?.(false)}catch(_){}
   };
   try{r.start()}catch(_){speak("Le microphone n’a pas pu démarrer. Réessayez.")}
 }

 document.addEventListener("click",event=>{
   const target=event.target?.closest?.("button");
   if(!target||!MIC_IDS.has(target.id))return;
   if(!SpeechRecognition)return;
   event.preventDefault();
   event.stopPropagation();
   if(typeof event.stopImmediatePropagation==="function")event.stopImmediatePropagation();
   startRecognition();
 },true);

 window.LibcomlairVoiceRouter=Object.freeze({
   version:"v224-1",
   start:startRecognition,
   candidates:()=>collectCandidates().map(c=>({type:c.type,label:c.label,aliases:[...c.aliases]}))
 });
})();