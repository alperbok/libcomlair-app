(()=>{
 const body=document.body;
 const splash=document.getElementById("libcomlairSplash");
 const next=document.getElementById("libcomlairSplashNext");
 const welcome=document.getElementById("accessWelcome");
 const title=document.getElementById("accessWelcomeTitle");
 function showProfile(){
   if(splash)splash.hidden=true;
   body.classList.remove("v221-onboarding");
   body.classList.add("v221-profile-step");
   if(welcome){welcome.hidden=false;welcome.removeAttribute("aria-hidden");}
   requestAnimationFrame(()=>{(title||welcome)?.scrollIntoView({block:"start"});(title||welcome)?.focus?.()});
 }
 next?.addEventListener("click",showProfile);
 ["applyAccessProfile","skipAccessProfile"].forEach(id=>{
   document.getElementById(id)?.addEventListener("click",()=>{
     setTimeout(()=>{
       body.classList.remove("v221-profile-step");
       document.querySelector("header")?.scrollIntoView({block:"start"});
     },0);
   });
 });
})();