(()=>{
  "use strict";

  /*
    v224-4
    Le présentateur guidé reste l'unique propriétaire de la lecture.
    Ce module sécurise la transition quand l'utilisateur change de page
    pendant que la voix naturelle Render parle :
    1. profiter du geste utilisateur pour maintenir Web Audio déverrouillé ;
    2. arrêter proprement l'ancienne page ;
    3. réarmer Web Audio dans le même geste ;
    4. effectuer une relance de sécurité seulement si aucun nouveau cycle
       vocal n'a démarré après la navigation.
    Aucune voix locale/robotique n'est utilisée.
  */

  const NAV_IDS=new Set([
    "libcomlairSplashNext",
    "applyAccessProfile","skipAccessProfile","changeAccessProfile",
    "v224VoiceModeBack","v224VoiceModeValidate",
    "v224TutorialBack","v224TutorialNext",
    "v224NeedsBack","v224NeedsValidate",
    "v224HomeBack","v224Page3Next","v224Page4Back"
  ]);

  const BUSY_STATES=new Set([
    "queued","preparing-render","generating-render","speaking","listening"
  ]);

  let stopCount=0;
  let navigationGeneration=0;
  let safetyTimer=null;
  const history=[];

  function remember(type,extra){
    const item={time:Date.now(),type,...(extra||{})};
    history.push(item);
    if(history.length>40)history.shift();
    return item;
  }

  function voiceStatus(){
    try{return window.LibcomlairVoice?.status?.()||null}catch(_){return null}
  }

  function naturalAudioStatus(){
    try{return window.LibcomlairRenderVoice?.status?.()||null}catch(_){return null}
  }

  function armNaturalAudio(reason){
    const render=window.LibcomlairRenderVoice;
    if(!render?.unlockAudio)return false;
    try{
      const result=render.unlockAudio();
      Promise.resolve(result).then(ok=>{
        remember("audio-unlock",{reason,ok:!!ok,audioState:naturalAudioStatus()?.audioState||""});
      }).catch(error=>{
        remember("audio-unlock-error",{reason,error:String(error?.message||error||"")});
      });
      return true;
    }catch(error){
      remember("audio-unlock-error",{reason,error:String(error?.message||error||"")});
      return false;
    }
  }

  function fallbackStop(){
    try{window.LibcomlairPresentationVoiceCard?.stop?.()}catch(_){}
    try{window.LibcomlairVoiceGuide?.stop?.()}catch(_){}
  }

  function stopCurrent(reason){
    stopCount+=1;
    remember("stop",{reason:reason||"navigation",voiceState:voiceStatus()?.last?.state||""});
    const presenter=window.LibcomlairGuidedPresenter;
    if(presenter?.cancelCurrent){
      try{presenter.cancelCurrent();return}catch(_){}
    }
    fallbackStop();
  }

  function presentCurrent(force=true){
    const presenter=window.LibcomlairGuidedPresenter;
    try{
      window.LibcomlairVoiceContext?.refresh?.("navigation-safety");
    }catch(_){}
    try{return !!presenter?.presentCurrent?.(force)}catch(_){return false}
  }

  function restartCurrent(){
    const presenter=window.LibcomlairGuidedPresenter;
    if(presenter?.restartCurrent){
      try{presenter.restartCurrent();return true}catch(_){}
    }
    return presentCurrent(true);
  }

  function scheduleSafetyRestart(targetId){
    const token=++navigationGeneration;
    clearTimeout(safetyTimer);
    safetyTimer=setTimeout(()=>{
      if(token!==navigationGeneration)return;
      const status=voiceStatus();
      const state=status?.last?.state||"";
      const busy=!!status?.recognitionActive||BUSY_STATES.has(state);
      if(busy){
        remember("safety-not-needed",{targetId,state});
        return;
      }

      /*
        Si aucun cycle vocal n'a démarré, le changement d'écran n'a pas
        atteint le présentateur. On ré-identifie la page et on la présente
        une seule fois. Le moteur reste Render uniquement.
      */
      armNaturalAudio("safety-restart");
      const ok=presentCurrent(true);
      remember("safety-restart",{
        targetId,
        ok,
        pageId:document.body?.dataset?.libcomlairPageId||"",
        contextId:(()=>{try{return window.LibcomlairVoiceContext?.current?.()?.id||""}catch(_){return ""}})()
      });
    },850);
  }

  document.addEventListener("click",event=>{
    const target=event.target?.closest?.("button,a");
    if(!target||!NAV_IDS.has(target.id))return;

    /* Le clic est un geste utilisateur autorisé par Android/Chrome. */
    armNaturalAudio("before-stop:"+target.id);
    stopCurrent("navigation:"+target.id);
    armNaturalAudio("after-stop:"+target.id);
    scheduleSafetyRestart(target.id);
  },true);

  window.addEventListener("libcomlair-voice-status",event=>{
    const state=event?.detail?.state||"";
    if(BUSY_STATES.has(state))remember("voice-cycle",{state});
  });

  window.LibcomlairVoicePageLifecycle=Object.freeze({
    version:"v224-4",
    cancel:stopCurrent,
    restart:restartCurrent,
    stopCount:()=>stopCount,
    history:()=>history.map(x=>({...x})),
    status:()=>({
      version:"v224-4",
      pageId:document.body?.dataset?.libcomlairPageId||"",
      voice:voiceStatus(),
      render:naturalAudioStatus(),
      stopCount,
      history:history.map(x=>({...x}))
    }),
    isReading:()=>!!(
      window.LibcomlairGuidedPresenter?.isPresenting?.()||
      window.LibcomlairPresentationVoiceCard?.isRunning?.()
    )
  });
})();