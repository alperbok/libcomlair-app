(()=>{
  "use strict";

  const REPAIRS=Object.freeze([
    Object.freeze({
      id:"voice-profile-long-primary-actions",
      area:"voice",
      status:"repaired-and-validated",
      symptom:"Les commandes Utiliser mes choix et Continuer sans adaptation particulière demandent souvent d'être répétées.",
      cause:"Les actions principales utilisent des formulations vocales trop longues comme cibles prioritaires.",
      detection:"Sur le profil, vérifier les candidats du routeur et la présence d'alias courts pour applyAccessProfile et skipAccessProfile.",
      repair:"Afficher Valider et Sans adaptation, utiliser les mots courts comme commandes prioritaires et conserver les formulations longues comme synonymes.",
      files:["libcomlair-v224-voice-router.js","libcomlair-v224-profile-simple-actions.js"],
      commits:["09d475946c549c4bfcba84b959c3514effc49c28","e4606b6c7c3f13f4995dece51a8efd6672ce55e8"],
      validation:"Validé par l'utilisateur sur Samsung Browser le 26/09/2026.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-home-return-profile-too-long",
      area:"voice",
      status:"confirmed",
      symptom:"La commande Modifier mon profil d'accessibilité est trop longue pour revenir au profil.",
      cause:"Le libellé visible et la cible vocale sont trop longs pour une action de retour fréquente.",
      detection:"Vérifier qu'une seule action de retour vers le profil est visible et que Retour est un alias non ambigu.",
      repair:"Afficher Retour au profil et reconnaître Retour, Retour profil, Profil, tout en gardant les anciennes formulations.",
      files:["libcomlair-v224-voice-router.js","libcomlair-v224-profile-simple-actions.js"],
      commits:["7ae9363a7d22aaecf9c66707dca54719a1acb817","5debc769cb9665534740b1a7c61e948eeb04072b"],
      validation:"Correction installée ; validation utilisateur spécifique encore nécessaire.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"voice-short-contextual-actions",
      area:"voice",
      status:"partially-repaired",
      symptom:"Les actions fréquentes utilisent des phrases longues et variables selon les pages.",
      cause:"Absence historique d'un vocabulaire court, contextuel et non ambigu commun à l'application.",
      detection:"Auditer LibcomlairVoiceRouter.candidates() sur l'écran actif et vérifier les alias courts uniques.",
      repair:"Ajouter automatiquement Retour, Suivant, Valider, Lire, Ouvrir, Fermer, Annuler, Recommencer, Continuer ou Rechercher uniquement si une seule action visible correspond.",
      files:["libcomlair-v224-voice-router.js"],
      commits:["4598e5e867061dcdf4899aa1651e2d3dd13cd7b2"],
      validation:"Profil partiellement validé ; parcours complet encore à tester.",
      safeAutoRepair:true
    }),
    Object.freeze({
      id:"global-menu-dynamic-style-blocked",
      area:"layout",
      status:"repaired-and-validated",
      symptom:"Le bouton trois tirets apparaît en bas de page et le panneau est inséré dans le flux.",
      cause:"Les styles essentiels du menu étaient injectés dynamiquement et n'étaient pas appliqués de manière fiable sous la politique de sécurité de la page.",
      detection:"Bouton présent mais sans positionnement attendu ; panneau non superposé.",
      repair:"Déplacer les styles essentiels vers libcomlair-v224-global-assistance.css et charger cette feuille explicitement avec version de cache.",
      files:["libcomlair-v224-global-assistance.css","libcomlair-v224-global-assistance.js"],
      commits:[],
      validation:"Validé par captures suivantes : le bouton n'est plus dans le flux en bas de page.",
      safeAutoRepair:false
    }),
    Object.freeze({
      id:"global-menu-button-fixed-on-scroll",
      area:"layout",
      status:"confirmed",
      symptom:"Le bouton trois tirets reste au même endroit pendant le défilement au lieu de rester à côté du logo.",
      cause:"Le CSS imposait position:fixed au bouton.",
      detection:"Le bouton est fixed ou son parent n'est pas l'en-tête actif.",
      repair:"Rattacher le bouton à l'en-tête actif et utiliser position:absolute ; conserver uniquement le panneau en superposition fixe.",
      files:["libcomlair-v224-global-assistance.js","libcomlair-v224-global-assistance.css","libcomlair-v224-regression-guard.js"],
      commits:["41547ec474b751300e72f39c42f2aadbcfc32a06","38e22ba62e10a8c05c75c6c62798a61f698b5797","049ad9b5e131598900b291678fe0d87f4c457fdf"],
      validation:"Correction installée ; test de défilement utilisateur encore à faire.",
      safeAutoRepair:false
    }),
    Object.freeze({
      id:"voice-simple-command-repair",
      area:"repair",
      status:"confirmed",
      symptom:"Après une mise à jour, les commandes courtes peuvent disparaître ou ne plus correspondre aux éléments visibles.",
      cause:"Le routeur vocal et ses alias contextuels n'étaient pas contrôlés par Réparation automatique.",
      detection:"Vérifier la présence de LibcomlairVoiceRouter.repairSimpleCommands() et auditer les candidats visibles.",
      repair:"Relancer l'audit des commandes simples depuis Réparation automatique et conserver les données utilisateur ainsi que le mode vocal.",
      files:["libcomlair-v224-voice-router.js","libcomlair-repair-engine-v175.js","libcomlair-v224-regression-guard.js"],
      commits:["918de728faa41d36390981513d2c2476c67f536d","2aaffd1ddfee9147ca0b6973457e37e3e3417b6c","d3cfd41b03b28531addb858c29bbe186558215cc"],
      validation:"Installé ; test Diagnostic/Réparation de bout en bout encore nécessaire.",
      safeAutoRepair:true
    })
  ]);

  function all(){return REPAIRS.map(x=>({...x,files:[...x.files],commits:[...x.commits]}));}
  function byId(id){const item=REPAIRS.find(x=>x.id===id);return item?{...item,files:[...item.files],commits:[...item.commits]}:null;}
  function byStatus(status){return all().filter(x=>x.status===status);}
  function validated(){return byStatus("repaired-and-validated");}
  function autoRepairable(){return all().filter(x=>x.safeAutoRepair);}
  function pendingValidation(){return all().filter(x=>x.status!=="repaired-and-validated");}

  function historical(){
    try{
      const defs=window.LibcomlairKnownIssues?.definitions?.();
      return Array.isArray(defs)?defs.map(x=>({...x,source:"known-issues"})):[];
    }catch(_){return []}
  }

  function combined(){
    const map=new Map();
    historical().forEach(item=>map.set(item.id,item));
    all().forEach(item=>map.set(item.id,{...item,source:"repair-catalog"}));
    return [...map.values()];
  }

  function summary(){
    const recent=all();
    const combinedItems=combined();
    return {
      totalKnown:combinedItems.length,
      recent:recent.length,
      validated:recent.filter(x=>x.status==="repaired-and-validated").length,
      pendingValidation:recent.filter(x=>x.status!=="repaired-and-validated").length,
      safeAutoRepair:recent.filter(x=>x.safeAutoRepair).length
    };
  }

  window.LibcomlairRepairCatalog=Object.freeze({
    version:"v224-2",
    all,
    byId,
    byStatus,
    validated,
    autoRepairable,
    pendingValidation,
    historical,
    combined,
    summary
  });
})();