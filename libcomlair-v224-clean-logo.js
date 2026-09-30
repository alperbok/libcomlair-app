(()=>{
  "use strict";

  const TARGETS=".v222-profile-brand > .v222-brand-logo, .v222-app-brand > .v222-brand-logo, #v224Page4Brand > .v222-brand-logo, #v224Page5Brand > .v222-brand-logo";
  const SOURCE="assets/libcomlair-logo-v222.jpg?v=224-clean-source-4";

  function buildCleanLogo(){
    return new Promise((resolve,reject)=>{
      const source=new Image();
      source.onload=()=>{
        try{
          const canvas=document.createElement("canvas");
          canvas.width=source.naturalWidth;
          canvas.height=source.naturalHeight;
          const ctx=canvas.getContext("2d");
          if(!ctx)throw new Error("Canvas indisponible");

          // Conserver le logo complet à sa taille d'origine.
          ctx.fillStyle="#fff";
          ctx.fillRect(0,0,canvas.width,canvas.height);
          ctx.drawImage(source,0,0,source.naturalWidth,source.naturalHeight);

          // Masquer uniquement la petite tache bleue située dans la marge gauche,
          // sans rogner ni déplacer le contour du logo.
          const maskWidth=Math.round(source.naturalWidth*0.06);
          ctx.fillStyle="#fff";
          ctx.fillRect(0,0,maskWidth,source.naturalHeight);

          resolve(canvas.toDataURL("image/jpeg",0.96));
        }catch(err){reject(err)}
      };
      source.onerror=()=>reject(new Error("Logo source introuvable"));
      source.src=SOURCE;
    });
  }

  function apply(dataUrl){
    document.querySelectorAll(TARGETS).forEach(img=>{
      img.src=dataUrl;
      img.dataset.cleanLogo="true";
      img.style.setProperty("clip-path","none","important");
      img.style.setProperty("transform","none","important");
      img.style.setProperty("visibility","visible","important");
      img.style.setProperty("opacity","1","important");
      img.style.setProperty("background","#fff","important");
    });
  }

  buildCleanLogo().then(dataUrl=>{
    apply(dataUrl);
    const observer=new MutationObserver(()=>apply(dataUrl));
    observer.observe(document.body,{childList:true,subtree:true});
    window.LibcomlairCleanLogo=Object.freeze({version:"v224-4",refresh:()=>apply(dataUrl)});
  }).catch(()=>{});
})();
