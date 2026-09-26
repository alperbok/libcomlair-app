(()=>{
"use strict";
const INTRO_KEY="libcomlair-global-settings-intro-v1";
const technical=document.getElementById("technicalMenu");
const existingPanel=technical?.querySelector(".technical-menu-panel")||null;

const button=document.createElement("button");
button.id="libcomlairGlobalMenuButton";
button.type="button";
button.setAttribute("aria-label","Assistance et réglages");
button.setAttribute("aria-haspopup","dialog");
button.setAttribute("aria-expanded","false");
button.textContent="☰";

const backdrop=document.createElement("div");
backdrop.id="libcomlairGlobalMenuBackdrop";
backdrop.hidden=true;

const panel=document.createElement("section");
panel.id="libcomlairGlobalMenuPanel";
panel.setAttribute("role","dialog");
panel.setAttribute("aria-modal","true");
panel.setAttribute("aria-labelledby","libcomlairGlobalMenuTitle");

const closeButton=document.createElement("button");
closeButton.id="libcomlairGlobalMenuClose";
closeButton.type="button";
closeButton.setAttribute("aria-label","Fermer Assistance et réglages");
closeButton.textContent="×";

const title=document.createElement("h2");
title.id="libcomlairGlobalMenuTitle";
title.textContent="Assistance et réglages";

const intro=document.createElement("p");
intro.className="libcomlair-settings-intro";
intro.textContent="Ce menu reste disponible sur toutes les pages après le choix du profil. Son bouton trois tirets se trouve dans l’en-tête, à gauche du logo, et défile avec la page. Avec le micro, dites simplement : Réglages.";

const actions=document.createElement("div");
actions.className="libcomlair-settings-actions";
function addAction(text,fn){const b=document.createElement("button");b.type="button";b.className="details-btn";b.textContent=text;b.addEventListener("click",fn);actions.appendChild(b);return b}
addAction("🔊 Expliquer cette page",()=>window.LibcomlairVoiceGuide?.readCurrent?.());
addAction("📋 Lire les choix de cette page",()=>window.LibcomlairVoiceGuide?.readCurrent?.());
addAction("🧭 Activer Découverte guidée",()=>{window.LibcomlairVoiceContext?.setMode?.("discovery");window.LibcomlairVoice?.speak?.("Mode découverte guidée activé.",{rate:.9})});
addAction("⚡ Activer le mode simplifié",()=>{window.LibcomlairVoiceContext?.setMode?.("simplified");window.LibcomlairVoice?.speak?.("Mode simplifié activé.",{rate:.9})});

panel.append(closeButton,title,intro,actions);
if(existingPanel){panel.appendChild(existingPanel);technical.dataset.globalized="true"}
backdrop.appendChild(panel);
document.body.append(backdrop);

function visible(el){
  if(!el||el.hidden||el.hasAttribute("hidden"))return false;
  try{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0}catch(_){return false}
}
function stillChoosingProfile(){return visible(document.getElementById("libcomlairSplash"))||visible(document.getElementById("accessWelcome"))}
function shouldShow(){
  if(stillChoosingProfile())return false;
  const b=document.body;
  return b.classList.contains("v224-page3-step")||b.classList.contains("v224-page4-step")||b.classList.contains("v224-page5-step")||b.classList.contains("v224-result-tool-page")||b.classList.contains("v224-utility-step")||b.classList.contains("v224-utility-detail");
}
function activeBrand(){
  const b=document.body;
  if(b.classList.contains("v224-page5-step")||b.classList.contains("v224-result-tool-page")||b.classList.contains("v224-utility-step")||b.classList.contains("v224-utility-detail")){
    const el=document.getElementById("v224Page5Brand");
    if(el)return el;
  }
  if(b.classList.contains("v224-page4-step")){
    const el=document.getElementById("v224Page4Brand");
    if(el)return el;
  }
  if(b.classList.contains("v224-page3-step")){
    const el=document.querySelector("#accessNeedsSection .v222-app-brand");
    if(el)return el;
  }
  return [
    document.querySelector("#accessNeedsSection .v222-app-brand"),
    document.getElementById("v224Page4Brand"),
    document.getElementById("v224Page5Brand")
  ].find(visible)||null;
}
function attachToHeader(){
  const host=activeBrand();
  if(!host)return false;
  if(button.parentElement!==host)host.prepend(button);
  return true;
}
function refresh(){
  const show=shouldShow();
  if(show)attachToHeader();
  button.dataset.visible=show?"true":"false";
}
function isVisionDiscovery(){try{const p=JSON.parse(localStorage.getItem("libcomlair-access-profile-v1")||"null");return !!(p&&Array.isArray(p.needs)&&p.needs.includes("vision")&&window.LibcomlairVoiceContext?.getMode?.()==="discovery")}catch(_){return false}}
function open(fromVoice=false){
  if(stillChoosingProfile())return false;
  refresh();
  backdrop.hidden=false;
  button.setAttribute("aria-expanded","true");
  requestAnimationFrame(()=>closeButton.focus());
  if(fromVoice)window.LibcomlairVoice?.speak?.("Assistance et réglages ouvert. Vous pouvez demander une explication de la page, lire les choix, changer le mode vocal, tester l’assistance, lancer le diagnostic ou la réparation automatique.",{rate:.9});
  return true;
}
function close(fromVoice=false){
  backdrop.hidden=true;
  button.setAttribute("aria-expanded","false");
  try{localStorage.setItem(INTRO_KEY,"1")}catch(_){}
  refresh();
  if(button.dataset.visible==="true")button.focus();
  if(fromVoice)window.LibcomlairVoice?.speak?.("Réglages fermés.",{rate:.9});
}
button.addEventListener("click",()=>open(false));
closeButton.addEventListener("click",()=>close(false));
backdrop.addEventListener("click",e=>{if(e.target===backdrop)close(false)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!backdrop.hidden)close(false)});

let presented=false;
function maybePresent(){
  refresh();
  if(presented||stillChoosingProfile()||!document.body.classList.contains("v224-page3-step"))return;
  let done=false;try{done=localStorage.getItem(INTRO_KEY)==="1"}catch(_){}
  if(done)return;
  presented=true;
  setTimeout(()=>{
    if(!shouldShow())return;
    open(false);
    if(isVisionDiscovery())window.LibcomlairVoice?.speak?.("Voici Assistance et réglages. Le bouton trois tirets est placé dans l’en-tête, à gauche du logo. Il défile avec la page. Vous pouvez aussi dire simplement Réglages. Je ne vous le rappellerai pas systématiquement ensuite.",{rate:.9});
  },300);
}
try{new MutationObserver(maybePresent).observe(document.body,{attributes:true,attributeFilter:["class"]})}catch(_){}
window.addEventListener("pageshow",maybePresent);
setInterval(refresh,700);
maybePresent();

window.LibcomlairGlobalAssistance=Object.freeze({version:"v224-3",open,close,isOpen:()=>!backdrop.hidden,refresh,activeBrand});
})();