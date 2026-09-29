(()=>{
  "use strict";

  const TITLE_ID="v224PresentationFreshTitle";

  function build(){
    const brand=document.querySelector("body.v224-onboarding-tutorial .v222-app-brand") || document.querySelector("#accessNeedsSection .v222-app-brand");
    if(!brand)return null;

    let title=document.getElementById(TITLE_ID);
    if(!title){
      title=document.createElement("div");
      title.id=TITLE_ID;
      title.className="v224-presentation-fresh-title";
      title.textContent="Présentation Libcomlair";
      title.setAttribute("role","heading");
      title.setAttribute("aria-level","2");
      brand.appendChild(title);
    }
    return title;
  }

  function render(){
    const title=build();
    if(!title)return;
    const active=document.body?.classList.contains("v224-onboarding-tutorial");
    title.hidden=!active;
    title.style.setProperty("display",active?"block":"none","important");
    const old=document.getElementById("v224TutorialScreenTitle");
    if(old)old.style.setProperty("display","none","important");
  }

  const observer=new MutationObserver(render);
  if(document.body)observer.observe(document.body,{attributes:true,attributeFilter:["class"]});
  window.addEventListener("libcomlair-onboarding-step",render);
  window.addEventListener("pageshow",render);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();

  window.LibcomlairPresentationShellFresh=Object.freeze({version:"v224-1",build,render});
})();