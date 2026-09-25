(()=>{
 const profileMic=document.getElementById("v222ProfileMic");
 const realMic=document.getElementById("visionVoiceCommand");
 const announce=document.getElementById("visionReadPage");
 profileMic?.addEventListener("click",()=>{
   if(realMic && !realMic.hidden){
     realMic.click();
     return;
   }
   if(announce){
     announce.click();
   }
 });
})();