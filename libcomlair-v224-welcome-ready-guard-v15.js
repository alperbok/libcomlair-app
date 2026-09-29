(()=>{
  "use strict";

  let announced=false;
  let leftWelcome=false;
  let timer=null;
  let attempts=0;
  let last={time:0,reason:"",contextId:"",result:"idle"};

  function context(){
    try{return window.LibcomlairVoiceContext?.current?.()||null}catch(_){return null}
  }
  function visible(el){
    if(!el||el.hidden||el.hasAttribute?.("hidden")||el.getAttribute?.("aria-hidden")==="true")return false;
    try{const cs=getComputedStyle(el),r=el.getBoundingClientRect();return cs.display!=="none"&&cs.visibility!=="hidden"&&r.width>0&&r.height>0}catch(_){return false}
  }
  function isWelcome(){
    const ctx=context();
    return ctx?.id==="welcome"&&visible(document.getElementById("libcomlairSplash"));
  }
  function stop(){clearTimeout(timer);timer=null}

  function mark(reason,result){
    last={time:Date.now(),reason:String(reason||""),contextId:context()?.id||"",result:String(result||"")};
  }

  function schedule(reason,delay=260){
    if(announced||leftWelcome)return;
    stop();
    timer=setTimeout(()=>attempt(reason),delay);
  }

  function attempt(reason){
    timer=null;
    if(announced||leftWelcome)return false;
    if(!isWelcome()){
      if(context()?.id&&context()?.id!=="welcome")leftWelcome=true;
      mark(reason,"not-ready");
      return false;
    }
    const presenter=window.LibcomlairGuidedPresenter;
    if(!presenter){mark(reason,"presenter-unavailable");schedule("presenter-wait",350);return false}

    const previous=presenter.lastAttempt?.()||{};
    if(previous.contextId==="welcome"&&(previous.result==="speaking"||previous.result==="ended")){
      announced=true;mark(reason,"already-started");stop();return true;
    }
    if(presenter.isPresenting?.()){
      mark(reason,"presenter-busy");schedule("busy-recheck",400);return false;
    }

    attempts+=1;
    let ok=false;
    try{ok=!!presenter.restartCurrent?.()}catch(_){ok=false}
    mark(reason,ok?"restart-accepted":"restart-refused");
    if(!ok&&attempts<8)schedule("retry-"+attempts,450);
    return ok;
  }

  window.addEventListener("libcomlair-voice-status",event=>{
    const state=event?.detail?.state||"";
    if(!isWelcome())return;
    if(state==="speaking"){
      announced=true;mark("voice-status","speaking");stop();
    }else if(state==="error"&&!announced&&attempts<8){
      schedule("voice-error-retry",650);
    }
  });

  const observer=new MutationObserver(()=>{
    if(announced||leftWelcome)return;
    if(isWelcome())schedule("welcome-dom-ready",220);
    else if(context()?.id&&context()?.id!=="welcome")leftWelcome=true;
  });
  try{observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class","hidden","aria-hidden","style"]})}catch(_){}

  [300,700,1300,2200,3400].forEach((delay,index)=>setTimeout(()=>{
    if(!announced&&!leftWelcome)attempt("historical-ready-"+(index+1));
  },delay));

  window.LibcomlairWelcomeReadyGuard=Object.freeze({
    version:"v224-15",
    attempt,
    isWelcome,
    status:()=>({...last,announced,leftWelcome,attempts})
  });
})();