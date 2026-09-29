(()=>{
  "use strict";

  const TITLE_ID="v224PresentationTitleV2";
  const ITEM_HEIGHT="38px";

  function important(el,name,value){
    if(el)el.style.setProperty(name,value,"important");
  }

  function buildTitle(){
    const hero=document.querySelector("section.hero.v219-main-zone");
    if(!hero)return null;
    let title=document.getElementById(TITLE_ID);
    if(!title){
      title=document.createElement("div");
      title.id=TITLE_ID;
      title.textContent="Présentation Libcomlair";
      title.setAttribute("role","heading");
      title.setAttribute("aria-level","2");
      hero.insertBefore(title,hero.firstChild);
    }
    return title;
  }

  function compactItems(){
    const text=document.getElementById("libcomlairTutorialText");
    if(!text)return;
    important(text,"gap","2px");
    important(text,"padding","5px 8px");
    important(text,"box-sizing","border-box");

    text.querySelectorAll("details.v224-presentation-item").forEach(details=>{
      important(details,"margin","0");
      important(details,"padding","0");
      const summary=details.querySelector("summary.v224-presentation-summary");
      if(details.open){
        important(details,"height","auto");
        important(details,"min-height",ITEM_HEIGHT);
        important(details,"max-height","none");
        important(summary,"height","auto");
        important(summary,"min-height",ITEM_HEIGHT);
        important(summary,"max-height","none");
      }else{
        important(details,"height",ITEM_HEIGHT);
        important(details,"min-height",ITEM_HEIGHT);
        important(details,"max-height",ITEM_HEIGHT);
        important(summary,"height",ITEM_HEIGHT);
        important(summary,"min-height",ITEM_HEIGHT);
        important(summary,"max-height",ITEM_HEIGHT);
      }
      important(summary,"padding","3px 8px");
      important(summary,"margin","0");
      const strong=summary?.querySelector("strong");
      if(strong){
        important(strong,"font-size",".96rem");
        important(strong,"line-height","1.08");
      }
      const badge=summary?.querySelector(".v224-presentation-status");
      if(badge){
        important(badge,"padding","1px 6px");
        important(badge,"font-size",".76rem");
      }
      if(!details.dataset.v224CompactV2){
        details.dataset.v224CompactV2="1";
        details.addEventListener("toggle",()=>requestAnimationFrame(compactItems));
      }
    });

    const actions=document.getElementById("v224TutorialActions");
    if(actions){
      important(actions,"margin-top","3px");
      actions.querySelectorAll(".details-btn").forEach(btn=>{
        important(btn,"height","46px");
        important(btn,"min-height","46px");
        important(btn,"padding","6px 9px");
      });
    }
  }

  function render(){
    const active=!!document.body?.classList.contains("v224-onboarding-tutorial");
    const title=buildTitle();
    if(title){
      title.hidden=!active;
      important(title,"display",active?"block":"none");
    }
    const old=document.getElementById("v224TutorialScreenTitle");
    if(old)important(old,"display","none");
    if(!active)return;

    const hero=document.querySelector("section.hero.v219-main-zone");
    if(hero){
      important(hero,"position","relative");
      important(hero,"gap","2px");
      important(hero,"padding-top","0");
    }
    compactItems();
  }

  const observer=new MutationObserver(()=>requestAnimationFrame(render));
  if(document.body)observer.observe(document.body,{attributes:true,attributeFilter:["class"],subtree:false});
  window.addEventListener("libcomlair-onboarding-step",()=>{render();setTimeout(render,80)});
  window.addEventListener("pageshow",()=>{render();setTimeout(render,100)});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();

  window.LibcomlairPresentationScreenV2=Object.freeze({version:"v224-2",render,compactItems});
})();