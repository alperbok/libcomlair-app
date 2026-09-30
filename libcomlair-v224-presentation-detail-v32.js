(()=>{
  "use strict";
  const by=id=>document.getElementById(id);
  function mode(){try{return window.LibcomlairVoiceContext?.getMode?.()||"simplified"}catch(_){return "simplified"}}
  function gpsItem(){return [...document.querySelectorAll("#libcomlairTutorialText details.v224-presentation-item")].find(d=>/Carte\s*\/\s*GPS accessible/i.test(d.querySelector("summary strong")?.textContent||""))||null}
  function bodyText(){const item=gpsItem();return (item?.querySelector(".v224-presentation-body")?.textContent||window.LibcomlairGpsExplanations?.gpsDetail||"").trim()}
  function ensure(){
    let host=by("v224PresentationDetailOverlay");if(host)return host;
    host=document.createElement("div");host.id="v224PresentationDetailOverlay";host.hidden=true;host.setAttribute("aria-hidden","true");
    host.innerHTML='<section id="v224PresentationDetailCard" role="dialog" aria-modal="true" aria-labelledby="v224PresentationDetailTitle"><span id="v224PresentationDetailStatus">Projet</span><h2 id="v224PresentationDetailTitle">Carte / GPS accessible</h2><p id="v224PresentationDetailBody"></p><button id="v224PresentationDetailClose" class="details-btn" type="button">Fermer</button></section>';
    document.body.appendChild(host);
    by("v224PresentationDetailClose")?.addEventListener("click",close);
    host.addEventListener("click",e=>{if(e.target===host)close()});
    return host;
  }
  function open(){
    if(document.body?.classList.contains("v224-presentation-reading"))return false;
    const host=ensure(),text=bodyText();
    const p=by("v224PresentationDetailBody");if(p)p.textContent=text;
    host.hidden=false;host.setAttribute("aria-hidden","false");
    setTimeout(()=>by("v224PresentationDetailClose")?.focus?.(),20);
    if(mode()==="discovery"&&text){try{window.LibcomlairVoice?.speak?.("Carte et GPS accessible. "+text,{rate:.9})}catch(_){}}
    return true;
  }
  function close(){
    const host=by("v224PresentationDetailOverlay");if(host){host.hidden=true;host.setAttribute("aria-hidden","true")}
    try{window.LibcomlairVoice?.cancel?.()}catch(_){}
    gpsItem()?.querySelector("summary")?.focus?.();
  }
  function bind(){
    const item=gpsItem();if(!item||item.dataset.v224DetailBound==="1")return;
    item.dataset.v224DetailBound="1";
    const summary=item.querySelector("summary");
    summary?.addEventListener("click",e=>{
      if(document.body?.classList.contains("v224-presentation-reading"))return;
      e.preventDefault();e.stopPropagation();item.open=false;open();
    });
  }
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!by("v224PresentationDetailOverlay")?.hidden)close()});
  function sync(){bind()}
  window.addEventListener("libcomlair-onboarding-step",()=>{sync();setTimeout(sync,100)});
  window.addEventListener("pageshow",()=>{sync();setTimeout(sync,120)});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(sync,0),{once:true});else setTimeout(sync,0);
  window.LibcomlairPresentationDetail=Object.freeze({version:"v224-32",open,close});
})();