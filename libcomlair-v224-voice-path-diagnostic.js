(()=>{
  "use strict";

  function norm(v){return String(v??"").replace(/\s+/g," ").trim()}
  function lifecycle(){try{return window.LibcomlairVoicePageLifecycle?.status?.()||null}catch(_){return null}}
  function context(){try{return window.LibcomlairVoiceContext?.current?.()||null}catch(_){return null}}
  function voice(){try{return window.LibcomlairVoice?.status?.()||null}catch(_){return null}}
  function render(){try{return window.LibcomlairRenderVoice?.status?.()||null}catch(_){return null}}

  function snapshot(){
    const lc=lifecycle(),ctx=context(),v=voice(),r=render();
    const history=(lc?.history||[]).slice(-10);
    return {
      pageId:document.body?.dataset?.libcomlairPageId||"non défini",
      contextId:ctx?.id||"non défini",
      contextTitle:ctx?.title||"",
      mode:(()=>{try{return window.LibcomlairVoiceContext?.getMode?.()||""}catch(_){return ""}})(),
      presenter:window.LibcomlairGuidedPresenter?.version||"absent",
      presenterActive:!!window.LibcomlairGuidedPresenter?.isPresenting?.(),
      lifecycle:window.LibcomlairVoicePageLifecycle?.version||"absent",
      voiceEngine:window.LibcomlairVoice?.version||"absent",
      voiceState:v?.last?.state||"inconnu",
      voiceError:v?.last?.error||v?.lastOutcome?.reason||"",
      recognitionActive:!!v?.recognitionActive,
      renderEngine:window.LibcomlairRenderVoice?.version||"absent",
      renderState:r?.last?.state||"inconnu",
      renderError:r?.last?.error||"",
      audioState:r?.audioState||"inconnu",
      stopCount:lc?.stopCount??0,
      history
    };
  }

  function format(s){
    const lines=[
      "Page : "+s.pageId,
      "Contexte : "+s.contextId+(s.contextTitle?" — "+s.contextTitle:""),
      "Mode : "+s.mode,
      "Présentateur : "+s.presenter+" — "+(s.presenterActive?"actif":"inactif"),
      "Cycle : "+s.lifecycle+" — arrêts : "+s.stopCount,
      "Moteur vocal : "+s.voiceEngine+" — état : "+s.voiceState,
      "Render : "+s.renderEngine+" — état : "+s.renderState+" — audio : "+s.audioState
    ];
    if(s.voiceError)lines.push("Erreur voix : "+s.voiceError);
    if(s.renderError)lines.push("Erreur Render : "+s.renderError);
    if(s.recognitionActive)lines.push("Micro : écoute active");
    if(s.history.length){
      lines.push("Derniers événements :");
      s.history.forEach(item=>{
        const d=new Date(item.time||Date.now());
        const extra=Object.entries(item).filter(([k])=>k!=="time"&&k!=="type").map(([k,v])=>k+"="+norm(v)).join(" ; ");
        lines.push(d.toLocaleTimeString("fr-FR")+" — "+norm(item.type)+(extra?" — "+extra:""));
      });
    }
    return lines.join("\n");
  }

  function ensurePanel(){
    const host=document.querySelector("#systemDiagnosticPanel")||document.querySelector(".technical-menu-panel");
    if(!host||document.getElementById("v224VoicePathDiagnostic"))return;
    const wrap=document.createElement("section");
    wrap.id="v224VoicePathDiagnostic";
    wrap.style.marginTop="12px";
    const h=document.createElement("h3");h.textContent="Diagnostic vocal du parcours";
    const p=document.createElement("p");p.className="data-note";p.textContent="À utiliser si la voix ne redémarre pas après un changement de page.";
    const button=document.createElement("button");button.type="button";button.className="details-btn";button.textContent="Afficher l’état vocal";
    const out=document.createElement("pre");out.id="v224VoicePathDiagnosticResult";out.setAttribute("aria-live","polite");out.style.whiteSpace="pre-wrap";out.style.fontSize="0.9rem";out.style.padding="8px";out.style.border="1px solid #ccd";out.style.borderRadius="8px";out.style.background="#fff";out.hidden=true;
    button.addEventListener("click",()=>{out.textContent=format(snapshot());out.hidden=false;try{out.scrollIntoView({block:"nearest"})}catch(_){}});
    wrap.append(h,p,button,out);host.appendChild(wrap);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ensurePanel,{once:true});else ensurePanel();
  window.addEventListener("pageshow",ensurePanel);
  window.LibcomlairVoicePathDiagnostic=Object.freeze({version:"v224-1",snapshot,format,ensurePanel});
})();