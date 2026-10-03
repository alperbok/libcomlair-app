(()=>{
  "use strict";
  const base=window.LibcomlairRepairCatalog;if(!base)return;

  const EXTRAS=Object.freeze([
    Object.freeze({
      id:"navigation-voice-content-collapse-restoration",
      area:"navigation-vocale-layout",
      status:"repaired-and-validated",
      symptom:"Sur Samsung Browser, la page Navigation vocale pouvait n'afficher que le titre et la légende, ou masquer les textes du bas après compactage du cadre.",
      cause:"Des règles flex trop compressibles et overflow:hidden réduisaient les cartes et les textes à une hauteur nulle ou masquaient leur contenu. La tentative v3.10 a confirmé cette cause et doit rester classée comme échec à ne pas réutiliser.",
      detection:"Ouvrir Navigation vocale et vérifier Découverte guidée, Simplifié, leurs descriptions, la note de changement de niveau, le statut du mode actif et la consigne Valider/Retour.",
      repair:"Utiliser des hauteurs naturelles non compressibles pour les cartes et le fieldset ; gagner de la place uniquement par marges/paddings/typographie ; conserver overflow:visible sur le contenu ; afficher la consigne guidee sous le fieldset.",
      files:["libcomlair-restoration-frame-reference-v5-validated.css","libcomlair-restoration-v3-12-voice-hint.js","libcomlair-v224-voice-screen-fresh.js"],
      commits:["bafb512aa4104e821c9a2f95239b9edc915d6623","19f8d21292a3e89e6cdc7a29fc07cb354c24ff49","91e3d1c962fd58681b20802d344f24294ff19220"],
      validation:"Validé physiquement sur Samsung Browser le 03/10/2026 avec la restauration v3.12 : contenu complet visible, cadre intérieur contenu, consigne basse visible, Retour/Valider corrects.",
      safeAutoRepair:false
    }),
    Object.freeze({
      id:"categories-transport-footer-overflow-restoration",
      area:"recherche-categories-layout",
      status:"repaired-and-validated",
      symptom:"La case Transports et/ou le footer Retour/Suivant pouvaient dépasser en bas du cadre central après agrandissement de l'en-tête.",
      cause:"L'addition des espacements verticaux entre les quatre rangées consommait trop de hauteur disponible.",
      detection:"Ouvrir Recherche/Catégories et vérifier que les sept catégories, y compris Transports, ainsi que Retour/Suivant restent entièrement visibles dans le cadre.",
      repair:"Conserver la taille des cartes et réduire l'espacement vertical canonique entre les rangées à 8px, avec marge de titre Catégories réduite.",
      files:["libcomlair-restoration-frame-reference-v5-validated.css"],
      commits:["703431f7d7e75bc33c87603590271259abc4a62e","91e3d1c962fd58681b20802d344f24294ff19220"],
      validation:"Validé physiquement sur Samsung Browser le 03/10/2026 : l'utilisateur a confirmé la page Recherche/Catégories parfaite.",
      safeAutoRepair:false
    }),
    Object.freeze({
      id:"canonical-frame-v5-consolidation",
      area:"master-frame-css-owner",
      status:"repaired-awaiting-validation",
      symptom:"Les correctifs de restauration étaient répartis entre plusieurs feuilles temporaires v3.9 à v3.12, ce qui augmentait le risque de régression et de cache ancien.",
      cause:"Accumulation de patches de validation autour d'un cadre canonique v4 pendant la phase de restauration.",
      detection:"Vérifier dans le chemin v3.13 que libcomlair-restoration-frame-reference-v5-validated.css est le seul CSS propriétaire du cadre et qu'aucun patch v3.9/v3.10/v3.11/v3.12 n'est injecté par la page externe.",
      repair:"Fusionner les valeurs validées dans le cadre canonique v5 et charger directement la consigne vocale depuis le chemin interne validé. Conserver les anciens fichiers uniquement pour historique et rollback.",
      files:["libcomlair-restoration-frame-reference-v5-validated.css","libcomlair-restoration-inner-v4-validated.html","libcomlair-restoration-test-v3-13.html"],
      commits:["91e3d1c962fd58681b20802d344f24294ff19220","0990b15739a1fcba4240a48afd75deab20265ac0","8461f153bcbc1d49175fa979edc59d387f4c36f6"],
      validation:"Comportements sources validés sur Samsung en v3.12. Le chemin consolidé v3.13 doit encore recevoir un contrôle de non-régression avant passage en repaired-and-validated.",
      safeAutoRepair:false
    })
  ]);

  function clone(x){return {...x,files:[...(x.files||[])],commits:[...(x.commits||[])]}}
  function all(){const map=new Map(base.all().map(x=>[x.id,clone(x)]));EXTRAS.forEach(x=>map.set(x.id,clone(x)));return [...map.values()]}
  function byId(id){return all().find(x=>x.id===id)||null}
  function byStatus(status){return all().filter(x=>x.status===status)}
  function validated(){return byStatus("repaired-and-validated")}
  function autoRepairable(){return all().filter(x=>x.safeAutoRepair)}
  function pendingValidation(){return all().filter(x=>!["repaired-and-validated","investigated-not-root-cause","observed-performance"].includes(x.status))}
  function historical(){return base.historical?.()||[]}
  function combined(){const map=new Map();historical().forEach(x=>map.set(x.id,x));all().forEach(x=>map.set(x.id,{...x,source:"repair-catalog"}));return [...map.values()]}
  function summary(){const recent=all(),items=combined();return {totalKnown:items.length,recent:recent.length,validated:validated().length,pendingValidation:pendingValidation().length,safeAutoRepair:autoRepairable().length,investigatedNotRootCause:recent.filter(x=>x.status==="investigated-not-root-cause").length}}
  window.LibcomlairRepairCatalog=Object.freeze({version:"v224-43.0",all,byId,byStatus,validated,autoRepairable,pendingValidation,historical,combined,summary});
})();