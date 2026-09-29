(()=>{
  "use strict";

  let stage="listen";
  let boundButton=null;
  let last={time:0,stage:"listen",result:"idle",audioState:""};

  function visible(el){
    if(!el||el.hidden||el.hasAttribute?.("hidden")||el.getAttribute?.("aria-hidden")==="true")return false;
    try{const cs=getComputedStyle(el),r=el.getBoundingClientRect();return cs.display!=="none"&&cs.visibility!=="hidden"&&r.width>0&&r.height>0}catch(_){return false}
  }

  function isWelcome(){return visible(document.getElementById("libcomlairSplash"))}
  function button(){return document.getElementById("libcomlairSplashNext")}
  function remember(result){
    let audioState="";
    try{audioState=window.LibcomlairRenderVoice?.status?.()?.audioState||""}catch(_){}
    last={time:Date.now(),stage,result:String(result||""),audioState};
  }

  function setListen(){
    const b=button();if(!b)return;
    stage="listen";
    b.dataset.v224WelcomeStage="listen";
    b.classList.add("v224-welcome-listen-first");
    b.removeAttribute("aria-busy");
    b.textContent="Écouter";
    b.setAttribute("aria-label","Écouter le message de bienvenue dans Libcomlair");
    remember("ready-to-listen");
  }

  function setLoading(){
    const b=button();if(!b)return;
    stage="loading";
    b.dataset.v224WelcomeStage="loading";
    b.classList.add("v224-welcome-listen-first");
    b.setAttribute("aria-busy","true");
    b.textContent="Chargement de la voix…";
    b.setAttribute("aria-label","Chargement du message de bienvenue");
    remember("unlocking-audio");
  }

  function setNext(){
    const b=button();if(!b)return;
    stage="next";
    b.dataset.v224WelcomeStage="next";
    b.classList.add("v224-welcome-listen-first");
    b.removeAttribute("aria-busy");
    b.textContent="Suivant";
    b.setAttribute("aria-label","Suivant vers le choix de vos besoins d’accessibilité");
    remember("welcome-speaking-next-ready");
  }

  async function activate(event){
    if(stage==="next"||!isWelcome())return;

    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
    if(stage==="loading")return;

    setLoading();
    try{
      const render=window.LibcomlairRenderVoice;
      if(!render?.unlockAudio)throw new Error("render-unavailable");
      const unlocked=await render.unlockAudio();
      if(!unlocked)throw new Error("audio-still-locked");

      const presenter=window.LibcomlairGuidedPresenter;
      if(!presenter?.restartCurrent)throw new Error("presenter-unavailable");
      const accepted=!!presenter.restartCurrent();
      if(!accepted)throw new Error("welcome-not-accepted");
      remember("welcome-accepted");
    }catch(error){
      remember(error?.message||error||"welcome-start-failed");
      setListen();
    }
  }

  function onVoiceStatus(event){
    if(stage!=="loading"||!isWelcome())return;
    const state=String(event?.detail?.state||"");
    if(state==="speaking")setNext();
    else if(state==="error")setListen();
  }

  function bind(){
    const b=button();
    if(!b||b===boundButton)return;
    if(boundButton)try{boundButton.removeEventListener("click",activate,true)}catch(_){}
    boundButton=b;
    b.addEventListener("click",activate,true);
    setListen();
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});
  else bind();
  window.addEventListener("pageshow",bind);
  window.addEventListener("libcomlair-voice-status",onVoiceStatus);

  window.LibcomlairWelcomeListenFirst=Object.freeze({
    version:"v224-16",
    bind,
    stage:()=>stage,
    status:()=>({...last}),
    reset:setListen
  });
})();