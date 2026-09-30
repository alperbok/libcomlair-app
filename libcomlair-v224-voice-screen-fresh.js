(()=>{
  "use strict";

  const ID="v224VoiceScreenFresh";
  let lastAutoStep="";
  let autoTimer=0;

  function mode(){
    try{return window.LibcomlairVoiceContext?.getMode?.()||"discovery"}catch(_){return "discovery"}
  }

  function setMode(value){
    try{return window.LibcomlairVoiceContext?.setMode?.(value,{announce:true})!==false}catch(_){return false}
  }

  function build(){
    let screen=document.getElementById(ID);
    if(screen)return screen;
    const start=document.querySelector("section.hero.v219-main-zone");
    if(!start)return null;

    screen=document.createElement("section");
    screen.id=ID;
    screen.className="v224-voice-fresh";
    screen.hidden=true;
    screen.setAttribute("aria-label","Navigation vocale");

    const title=document.createElement("h2");
    title.className="v224-voice-fresh-title";
    title.textContent="Navigation vocale";

    const fieldset=document.createElement("fieldset");
    fieldset.className="v224-voice-fresh-fieldset";
    const legend=document.createElement("legend");
    legend.innerHTML="<strong>Niveau d’assistance vocale</strong>";
    fieldset.appendChild(legend);

    const makeOption=(value,label,help)=>{
      const card=document.createElement("label");
      card.className="v224-voice-fresh-card";
      const input=document.createElement("input");
      input.type="radio";
      input.name="v224FreshVoiceMode";
      input.value=value;
      input.setAttribute("aria-label",label);
      const content=document.createElement("span");
      content.className="v224-voice-fresh-content";
      const boxed=document.createElement("strong");
      boxed.className="v224-voice-fresh-boxed";
      boxed.textContent=label;
      const desc=document.createElement("span");
      desc.className="v224-voice-fresh-help";
      desc.textContent=help;
      content.append(boxed,desc);
      card.append(input,content);
      input.addEventListener("change",()=>{if(input.checked){setMode(value);sync()}});
      return card;
    };

    fieldset.append(
      makeOption("discovery","Découverte guidée","Première utilisation — Explication complète des pages et des choix."),
      makeOption("simplified","Simplifié","Utilisation courante — Annonce seulement l’essentiel.")
    );

    const note=document.createElement("p");
    note.className="v224-voice-fresh-note";
    note.textContent="Le mode d’assistance vocale peut être changé à tout moment.";
    const status=document.createElement("p");
    status.id="v224VoiceFreshStatus";
    status.className="v224-voice-fresh-status";
    status.setAttribute("aria-live","polite");
    fieldset.append(note,status);

    const actions=document.createElement("div");
    actions.id="v224VoiceFreshActions";
    actions.className="v224-voice-fresh-actions";
    const back=document.createElement("button");
    back.type="button";back.className="details-btn";back.textContent="Retour";
    const validate=document.createElement("button");
    validate.type="button";validate.className="details-btn";validate.textContent="Valider";
    actions.append(back,validate);
    back.addEventListener("click",()=>document.getElementById("changeAccessProfile")?.click());
    validate.addEventListener("click",()=>window.LibcomlairOnboardingScreens?.showTutorial?.());

    screen.append(title,fieldset,actions);
    const oldTitle=document.getElementById("v224VoiceModeScreenTitle");
    start.insertBefore(screen,oldTitle||start.firstChild);
    return screen;
  }

  function sync(){
    const current=mode();
    const screen=build();
    if(!screen)return;
    screen.querySelectorAll('input[name="v224FreshVoiceMode"]').forEach(input=>input.checked=input.value===current);
    const status=screen.querySelector("#v224VoiceFreshStatus");
    if(status)status.textContent="Mode vocal actif : "+(current==="discovery"?"Découverte guidée":"Simplifié")+".";
  }

  function stopAuto(){
    if(autoTimer){clearTimeout(autoTimer);autoTimer=0}
  }

  function ensureGuidedReading(step){
    stopAuto();
    if(mode()!=="discovery"||lastAutoStep===step)return;
    lastAutoStep=step;
    autoTimer=setTimeout(()=>{
      autoTimer=0;
      const still=step==="voice"?document.body.classList.contains("v224-onboarding-voice"):document.body.classList.contains("v224-onboarding-tutorial");
      if(!still||mode()!=="discovery")return;
      try{
        const presenter=window.LibcomlairGuidedPresenter;
        if(presenter?.isPresenting?.())return;
        presenter?.presentCurrent?.(true);
      }catch(_){}
    },700);
  }

  function render(){
    const screen=build();
    if(!screen)return;
    const inVoice=document.body.classList.contains("v224-onboarding-voice");
    const masterActive=document.body.classList.contains("v224-master-frame-active");
    screen.hidden=!inVoice;
    screen.style.setProperty("display",inVoice?"flex":"none","important");

    const actions=screen.querySelector("#v224VoiceFreshActions");
    if(actions){
      const hideActions=inVoice&&masterActive;
      actions.hidden=hideActions;
      actions.style.setProperty("display",hideActions?"none":"grid","important");
      actions.style.setProperty("visibility",hideActions?"hidden":"visible","important");
    }

    if(inVoice){
      sync();
      requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:"auto"}));
      ensureGuidedReading("voice");
    }else if(document.body.classList.contains("v224-onboarding-tutorial")){
      ensureGuidedReading("tutorial");
    }else{
      stopAuto();
      lastAutoStep="";
    }
  }

  const observer=new MutationObserver(render);
  if(document.body)observer.observe(document.body,{attributes:true,attributeFilter:["class"]});
  window.addEventListener("libcomlair-onboarding-step",render);
  window.addEventListener("libcomlair-voice-mode-change",()=>{sync();render()});
  window.addEventListener("pageshow",render);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();

  window.LibcomlairVoiceScreenFresh=Object.freeze({version:"v224-3-master-frame-actions",build,render,sync});
})();
