(()=>{
  "use strict";

  const RULES=Object.freeze([
    Object.freeze({
      id:"P0-known-issues-first",
      priority:"P0",
      domain:"diagnostic",
      title:"Consulter les pannes connues avant toute nouvelle correction",
      rule:"Lorsqu'un problème est signalé, vérifier d'abord Diagnostic et pannes, l'historique des réparations et les correctifs déjà validés avant de modifier le code.",
      triggers:["panne","bug","silence","régression","ne fonctionne plus","404","page blanche","micro","voix"],
      links:["P0-protect-data","P0-no-regression","P1-diagnose-before-fix","P1-record-new-issue"]
    }),
    Object.freeze({
      id:"P0-protect-data",
      priority:"P0",
      domain:"securite",
      title:"Ne perdre aucune donnée",
      rule:"Aucune correction, migration ou réparation ne doit supprimer ou rendre irrécupérables les données utilisateur, les données métier ou l'historique du projet.",
      triggers:["réparation","migration","base de données","sauvegarde","cache","stockage","compte"],
      links:["P0-provider-independence","P1-backup-before-risk","P0-secrets-outside-code"]
    }),
    Object.freeze({
      id:"P0-no-regression",
      priority:"P0",
      domain:"qualite",
      title:"Préserver les fonctions déjà validées",
      rule:"Une correction ciblée ne doit pas casser une fonction déjà validée. Toute modification structurelle doit vérifier les comportements précédemment approuvés.",
      triggers:["modification","refonte","correctif","nouvelle version","déploiement"],
      links:["P1-diagnose-before-fix","P1-validate-after-fix","P1-backup-before-risk"]
    }),
    Object.freeze({
      id:"P0-accessibility-continuity",
      priority:"P0",
      domain:"accessibilite",
      title:"L'accessibilité reste prioritaire sur chaque page",
      rule:"Tout élément visible, sélectionnable ou explicatif important doit rester utilisable ou lisible par l'assistance adaptée, notamment pour le profil Vision.",
      triggers:["page","case","bouton","explication","navigation","vision","accessibilité"],
      links:["P0-natural-voice-only","P1-voice-context-every-page","P0-no-regression"]
    }),
    Object.freeze({
      id:"P0-natural-voice-only",
      priority:"P0",
      domain:"voix",
      title:"Voix naturelle uniquement",
      rule:"Ne jamais utiliser une voix robotique comme solution de secours. En cas de panne, réparer ou basculer vers une autre solution de voix naturelle validée.",
      triggers:["voix","tts","render","audio","android","synthèse vocale","silence"],
      links:["P0-provider-independence","P1-android-audio-unlock","P1-voice-context-every-page"]
    }),
    Object.freeze({
      id:"P0-provider-independence",
      priority:"P0",
      domain:"independance",
      title:"Aucun fournisseur unique ne doit être indispensable",
      rule:"Libcomlair ne doit dépendre d'aucun hébergeur, fournisseur de données, moteur vocal ou service unique pour continuer à fonctionner et être restauré.",
      triggers:["render","github","google","api","hébergeur","fournisseur","migration"],
      links:["P0-protect-data","P1-backup-before-risk","P0-secrets-outside-code"]
    }),
    Object.freeze({
      id:"P0-secrets-outside-code",
      priority:"P0",
      domain:"securite",
      title:"Secrets et identifiants hors du code public",
      rule:"Les mots de passe, clés privées, URL privées de base de données et autres secrets ne doivent jamais être stockés en clair dans le code public ni demandés dans les échanges de dépannage.",
      triggers:["clé","token","mot de passe","secret","database url","api key","oauth"],
      links:["P0-protect-data","P0-provider-independence"]
    }),
    Object.freeze({
      id:"P1-diagnose-before-fix",
      priority:"P1",
      domain:"diagnostic",
      title:"Diagnostiquer avant de modifier",
      rule:"Reproduire le symptôme, identifier le contexte, consulter les règles et pannes liées, puis appliquer la correction la plus ciblée avant toute refonte.",
      triggers:["panne","bug","diagnostic","réparation"],
      links:["P0-known-issues-first","P0-no-regression","P1-validate-after-fix"]
    }),
    Object.freeze({
      id:"P1-validate-after-fix",
      priority:"P1",
      domain:"qualite",
      title:"Valider après correction",
      rule:"Une panne n'est considérée comme réparée et validée qu'après un test ciblé concluant, puis un contrôle des fonctions voisines susceptibles d'avoir été affectées.",
      triggers:["correctif","réparé","test","validation"],
      links:["P0-no-regression","P1-record-new-issue"]
    }),
    Object.freeze({
      id:"P1-record-new-issue",
      priority:"P1",
      domain:"diagnostic",
      title:"Documenter toute nouvelle panne résolue",
      rule:"Si une panne n'existe pas encore dans Diagnostic et pannes, l'ajouter après résolution avec symptôme, cause, détection, réparation, fichiers, commits et état de validation.",
      triggers:["nouvelle panne","cause nouvelle","correctif inédit"],
      links:["P0-known-issues-first","P1-validate-after-fix"]
    }),
    Object.freeze({
      id:"P1-backup-before-risk",
      priority:"P1",
      domain:"sauvegarde",
      title:"Sauvegarder avant une modification risquée",
      rule:"Avant une migration, une modification structurelle ou une opération sur des données persistantes, vérifier qu'une sauvegarde récente et récupérable existe.",
      triggers:["migration","refonte","base de données","suppression","remplacement","déploiement majeur"],
      links:["P0-protect-data","P0-provider-independence"]
    }),
    Object.freeze({
      id:"P1-voice-context-every-page",
      priority:"P1",
      domain:"voix",
      title:"Le micro et l'assistance vocale doivent suivre le contexte de chaque page",
      rule:"Chaque page doit annoncer ses éléments utiles et proposer uniquement les commandes correspondant au contexte visible, avec synchronisation entre voix et interface.",
      triggers:["voix","micro","page","navigation","commande"],
      links:["P0-accessibility-continuity","P0-natural-voice-only","P1-validate-after-fix"]
    }),
    Object.freeze({
      id:"P1-android-audio-unlock",
      priority:"P1",
      domain:"voix",
      title:"Vérifier le verrouillage audio Android avant de changer de moteur vocal",
      rule:"Si la première lecture naturelle est silencieuse sur Android, vérifier d'abord l'état Web Audio et le déverrouillage par geste utilisateur avant de conclure à une panne du fournisseur vocal.",
      triggers:["android","première page","silence","audio-locked","suspended"],
      links:["P0-natural-voice-only","P0-known-issues-first"]
    }),
    Object.freeze({
      id:"P1-external-data-isolated",
      priority:"P1",
      domain:"donnees",
      title:"Les données importées ne pilotent pas la logique de l'application",
      rule:"Les sources externes sont importées, normalisées et isolées. Une source défaillante ne doit pas casser la navigation ni les règles fonctionnelles de Libcomlair.",
      triggers:["acceslibre","idfm","sncf","vitalis","geoapify","ban","osm","import"],
      links:["P0-provider-independence","P0-no-regression"]
    }),
    Object.freeze({
      id:"P2-improvement-after-stability",
      priority:"P2",
      domain:"amelioration",
      title:"Améliorer après stabilisation",
      rule:"Les améliorations d'ergonomie, de présentation, de renommage ou de nouvelles fonctions passent après la stabilité, l'accessibilité, la sécurité et la correction des pannes prioritaires.",
      triggers:["amélioration","design","renommer","nouvelle fonction","présentation"],
      links:["P0-no-regression","P0-accessibility-continuity"]
    })
  ]);

  const ORDER=Object.freeze({P0:0,P1:1,P2:2});

  function all(){return RULES.map(r=>({...r,triggers:[...r.triggers],links:[...r.links]}));}
  function byId(id){const r=RULES.find(x=>x.id===id);return r?{...r,triggers:[...r.triggers],links:[...r.links]}:null;}
  function byPriority(priority){return all().filter(r=>r.priority===priority);}
  function linked(id){const root=byId(id);return root?root.links.map(byId).filter(Boolean):[];}
  function forText(text){
    const q=String(text||"").toLowerCase();
    return all().filter(r=>r.triggers.some(t=>q.includes(String(t).toLowerCase())))
      .sort((a,b)=>(ORDER[a.priority]??9)-(ORDER[b.priority]??9));
  }
  function resolve(ids){
    const queue=[...(Array.isArray(ids)?ids:[ids]).filter(Boolean)],seen=new Set(),out=[];
    while(queue.length){
      const id=queue.shift();
      if(seen.has(id))continue;
      seen.add(id);
      const r=byId(id);
      if(!r)continue;
      out.push(r);
      r.links.forEach(x=>{if(!seen.has(x))queue.push(x)});
    }
    return out.sort((a,b)=>(ORDER[a.priority]??9)-(ORDER[b.priority]??9));
  }
  function preflight(problem){
    const direct=forText(problem);
    const resolved=resolve(direct.map(r=>r.id));
    return {
      problem:String(problem||""),
      direct:direct.map(r=>r.id),
      rules:resolved,
      priorities:{P0:resolved.filter(r=>r.priority==="P0").map(r=>r.id),P1:resolved.filter(r=>r.priority==="P1").map(r=>r.id),P2:resolved.filter(r=>r.priority==="P2").map(r=>r.id)}
    };
  }

  window.LibcomlairRuleRegistry=Object.freeze({version:"v224-1",all,byId,byPriority,linked,forText,resolve,preflight});
})();