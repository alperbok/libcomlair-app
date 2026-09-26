(()=>{
  "use strict";
  // Couche de compatibilité V224.
  // La reconnaissance vocale contextuelle est désormais portée par
  // libcomlair-v224-voice-router.js afin d’éviter les doubles moteurs
  // et les interceptions concurrentes du bouton Micro.
  window.LibcomlairAccessibleHome=Object.freeze({version:"v224-compat-1"});
})();
