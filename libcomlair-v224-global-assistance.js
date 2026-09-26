(()=>{
"use strict";
const INTRO_KEY="libcomlair-global-settings-intro-v1";
const technical=document.getElementById("technicalMenu");
const existingPanel=technical?.querySelector(".technical-menu-panel")||null;

const style=document.createElement("style");
style.id="libcomlairGlobalAssistanceStyle";
style.textContent=`
#libcomlairGlobalMenuButton{position:fixed;left:12px;top:12px;width:52px;height:52px;min-width:52px;min-height:52px;padding:0;margin:0;border:3px solid #fff;border-radius:14px;background:#0f7784;color:#fff;font-size:1.8rem;font-weight:900;line-height:1;box-shadow:0 4px 14px rgba(0,0,0,.24);z-index:1200;display:none;align-items:center;justify-content:center}
#libcomlairGlobalMenuButton[data-visible="true"]{display:flex}
#libcomlairGlobalMenuBackdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:1250;display:flex;align-items:stretch;justify-content:flex-start}
#libcomlairGlobalMenuBackdrop[hidden]{display:none!important}
#libcomlairGlobalMenuPanel{position:relative;width:min(92vw,430px);height:100%;overflow:auto;box-sizing:border-box;background:#fff;border-right:3px solid #0f7784;padding:18px 16px 24px;box-shadow:8px 0 24px rgba(0,0,0,.22)}
#libcomlairGlobalMenuPanel h2{margin:0 52px 8px 0;font-size:1.4rem;color:#17252a}
#libcomlairGlobalMenuPanel .libcomlair-settings-intro{margin:0 0 12px;padding:10px 12px;border:2px solid #d7e5e8;border-radius:14px;background:#f7fafb;line-height:1.35}
#libcomlairGlobalMenuPanel .libcomlair-settings-actions{display:grid;grid-template-columns:1fr;gap:8px;margin:10px 0 14px}
#libcomlairGlobalMenuPanel .libcomlair-settings-actions button,#libcomlairGlobalMenuPanel .technical-menu-panel button{width:100%;min-height:48px}
#libcomlairGlobalMenuClose{position:absolute;right:12px;top:10px;width:44px;height:44px;min-width:44px;min-height:44px;padding:0;border:2px solid #65767b;border-radius:50%;background:#fff;font-size:1.35rem;font-weight:900}
#technicalMenu[data-globalized="true"]{display:none!important}
`;
document.head.appendChild(style);

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
intro.textContent="Ce menu reste disponible sur toutes les pages. Il permet d’obtenir de l’aide, d’écouter les choix de la page, de changer le niveau d’assistance, de tester la voix, de lancer le diagnostic et la réparation automatique. Avec le micro, dites simplement : Réglages.";

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
document.body.append(button,backdrop);

function shouldShow(){const b=document.body;return b.classList.contains("v224-page3-step")||b.classList.contains("v224-page4-step")||b.classList.contains("v224-page5-step")||b.classList.contains("v224-result-tool-page")||b.classList.contains("v224-utility-step")||b.classList.contains("v224-utility-detail")}
function refresh(){button.dataset.visible=shouldShow()?"true":"false"}
function isVisionDiscovery(){try{const p=JSON.parse(localStorage.getItem("libcomlair-access-profile-v1")||"null");return !!(p&&Array.isArray(p.needs)&&p.needs.includes("vision")&&window.LibcomlairVoiceContext?.getMode?.()==="discovery")}catch(_){return false}}
function open(fromVoice=false){backdrop.hidden=false;button.setAttribute("aria-expanded","true");requestAnimationFrame(()=>closeButton.focus());if(fromVoice)window.LibcomlairVoice?.speak?.("Assistance et réglages ouvert. Vous pouvez demander une explication de la page, lire les choix, changer le mode vocal, tester l’assistance, lancer le diagnostic ou la réparation automatique.",{rate:.9})}
function close(fromVoice=false){backdrop.hidden=true;button.setAttribute("aria-expanded","false");try{localStorage.setItem(INTRO_KEY,"1")}catch(_){}if(button.dataset.visible==="true")button.focus();if(fromVoice)window.LibcomlairVoice?.speak?.("Réglages fermés.",{rate:.9})}
button.addEventListener("click",()=>open(false));
closeButton.addEventListener("click",()=>close(false));
backdrop.addEventListener("click",e=>{if(e.target===backdrop)close(false)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!backdrop.hidden)close(false)});

let presented=false;
function maybePresent(){refresh();if(presented||!document.body.classList.contains("v224-page3-step"))return;let done=false;try{done=localStorage.getItem(INTRO_KEY)==="1"}catch(_){}if(done)return;presented=true;setTimeout(()=>{open(false);if(isVisionDiscovery())window.LibcomlairVoice?.speak?.("Voici Assistance et réglages. Ce menu est disponible à tout moment avec les trois tirets en haut à gauche. Vous pouvez aussi dire simplement Réglages. Il donne accès à l’aide, au diagnostic et à la réparation automatique. Je ne vous le rappellerai pas systématiquement ensuite.",{rate:.9})},300)}
try{new MutationObserver(maybePresent).observe(document.body,{attributes:true,attributeFilter:["class"]})}catch(_){}
window.addEventListener("pageshow",maybePresent);
maybePresent();

window.LibcomlairGlobalAssistance=Object.freeze({version:"v224-1",open,close,isOpen:()=>!backdrop.hidden});
})();