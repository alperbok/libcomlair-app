(()=>{
  "use strict";
  const brand=document.querySelector("#accessWelcome .v222-profile-brand");
  if(!brand||document.getElementById("libcomlairProfileMenuProxy"))return;

  const button=document.createElement("button");
  button.id="libcomlairProfileMenuProxy";
  button.type="button";
  button.textContent="☰";
  button.setAttribute("aria-label","Assistance et réglages");
  button.setAttribute("aria-haspopup","dialog");
  button.setAttribute("aria-expanded","false");

  button.addEventListener("click",()=>{
    const backdrop=document.getElementById("libcomlairGlobalMenuBackdrop");
    const close=document.getElementById("libcomlairGlobalMenuClose");
    const source=document.getElementById("libcomlairGlobalMenuButton");
    if(!backdrop)return;
    backdrop.hidden=false;
    button.setAttribute("aria-expanded","true");
    source?.setAttribute("aria-expanded","true");
    requestAnimationFrame(()=>close?.focus?.());
  });

  document.getElementById("libcomlairGlobalMenuClose")?.addEventListener("click",()=>button.setAttribute("aria-expanded","false"));
  brand.prepend(button);
})();