# Libcomlair — journal des décisions techniques

Date de création : 2026-10-01

## Objectif

Conserver la raison des choix importants afin de ne pas recommencer plus tard une solution déjà testée, abandonnée ou remplacée.

Ce document complète Git : Git montre ce qui a changé ; ce journal explique pourquoi.

## Format d’une décision

Chaque décision importante doit contenir :

- identifiant ;
- date ;
- sujet ;
- problème ;
- options étudiées ;
- décision retenue ;
- raisons ;
- conséquences ;
- fichiers/modules concernés ;
- condition éventuelle de réexamen.

## Décisions initiales

### ADR-001 — indépendance des fournisseurs

- Date : 2026-10-01
- Sujet : dépendances externes.
- Décision : aucune fonction essentielle ne doit dépendre durablement d’un fournisseur unique.
- Raison : une panne, une limite ou la disparition d’un service ne doit pas rendre Libcomlair inutilisable.
- Conséquence : fonctionnement local prioritaire, services externes utilisés pour enrichissement/transition.

### ADR-002 — architecture modulaire de dépannage

- Date : 2026-10-01
- Sujet : diagnostic et réparation.
- Décision : `1 fonction = 1 module responsable = 1 diagnostic = 1 réparation = 1 secours lorsque possible`.
- Raison : réduire les recherches circulaires et les correctifs empilés.
- Conséquence : tout nouveau module doit documenter propriétaire, dépendances, status(), réparation et validation.

### ADR-003 — ne pas déplacer les contrôles globaux gérés par un autre moteur

- Date : 2026-10-01
- Sujet : DOM / cadre maître.
- Décision : utiliser un proxy lorsque le contrôle réel est réattaché ou géré périodiquement par un autre moteur.
- Raison : éviter les conflits DOM et boucles de MutationObserver déjà rencontrés.
- Conséquence : le cadre maître ne prend pas possession arbitrairement d’un élément global géré ailleurs.

### ADR-004 — ne pas empiler les correctifs CSS

- Date : 2026-10-01
- Sujet : régressions visuelles.
- Décision : si une première correction a peu ou pas d’effet, rechercher la règle historique, le `!important`, le style inline ou l’ordre de chargement responsable avant de modifier davantage les valeurs.
- Raison : les anciens conflits CSS ont déjà produit des recherches circulaires.

### ADR-005 — voix locale avant suppression de Render

- Date : 2026-10-01
- Sujet : indépendance vocale.
- Décision : conserver Render pendant la transition ; ne le supprimer qu’après validation du TTS local et du protocole d’autonomie totale.
- Raison : ne jamais rendre l’application muette pendant la migration.

### ADR-006 — licences vérifiées par composant

- Date : 2026-10-01
- Sujet : conformité.
- Décision : moteur, modèle vocal, dictionnaire, données phonétiques et enregistrements humains sont audités séparément.
- Raison : la licence du moteur ne couvre pas automatiquement les modèles ou données qu’il utilise.

### ADR-007 — nouveautés derrière un drapeau

- Date : 2026-10-01
- Sujet : régressions.
- Décision : les fonctions à risque ou expérimentales doivent être activables séparément avant promotion comme référence.
- Raison : pouvoir désactiver une nouveauté sans casser le reste de l’application.

### ADR-008 — photos facultatives et respectueuses de la vie privée

- Date : 2026-10-01
- Sujet : contributions photo.
- Décision : une photo ne sera jamais obligatoire pour utiliser Libcomlair ou contribuer ; elle possède des métadonnées de droits, une description alternative et un traitement de confidentialité avant synchronisation.
- Raison : préserver l’accessibilité, éviter d’exclure les personnes malvoyantes et prévenir la diffusion inutile de données personnelles ou de géolocalisation EXIF.
- Conséquence : stockage local et file hors ligne séparés, suppression EXIF avant envoi, descriptions vocales et textuelles, validation sur smartphone Android réel avant activation.

### ADR-009 — dictionnaires vocaux par langue, territoire et type de nom

- Date : 2026-10-01
- Sujet : TTS, microphone, recherche et internationalisation.
- Décision : séparer noms communs, vocabulaire d’accessibilité et familles de noms propres ; conserver la forme officielle affichée et gérer la prononciation séparément selon la langue de l’utilisateur.
- Raison : un même nom propre peut être écrit de la même manière mais nécessiter une prononciation différente selon la langue d’écoute ; les ressources de plusieurs pays auront aussi des licences différentes.
- Conséquence : packs versionnés par locale/pays, provenance et licence par ressource, corrections Libcomlair prioritaires et téléchargement hors ligne possible.

### ADR-010 — passeport fonctionnel local et compte facultatif

- Date : 2026-10-01
- Sujet : profil utilisateur.
- Décision : le futur profil universel stocke des besoins fonctionnels et préférences, sans exiger de diagnostic médical ni de compte.
- Raison : préserver la confidentialité et permettre l’utilisation hors ligne.
- Conséquence : l’ancien profil `libcomlair-access-profile-v1` reste lisible jusqu’à validation de la migration ; toute synchronisation distante sera facultative.

### ADR-011 — accessibilité par preuve, entrée et état temporaire

- Date : 2026-10-01
- Sujet : modèle des lieux.
- Décision : l’accessibilité d’un lieu ne sera jamais réduite à un booléen unique ; les entrées, critères, preuves, dates, conflits et états temporaires sont séparés.
- Raison : une entrée principale peut être inaccessible alors qu’une autre entrée est adaptée ; les conditions peuvent aussi changer temporairement.
- Conséquence : identifiant stable Libcomlair, plusieurs entrées, provenance explicite et expiration des observations temporaires.

### ADR-012 — migrations avant modification incompatible

- Date : 2026-10-01
- Sujet : données persistantes.
- Décision : toute modification incompatible d’un schéma persistant exige une migration documentée avant activation.
- Raison : empêcher la perte de profils, favoris, photos, dictionnaires ou contributions après une mise à jour.
- Conséquence : ancien format lisible jusqu’à validation, sauvegarde avant migration destructive et test de retour arrière.

### ADR-013 — contrats fournisseurs et cas de référence

- Date : 2026-10-01
- Sujet : qualité des API et données.
- Décision : chaque fournisseur externe possède un contrat d’adaptation et les comportements critiques sont protégés par des cas de référence stables.
- Raison : détecter une modification d’API ou une régression avant qu’elle fasse disparaître adresses, directions ou critères dans l’interface.
- Conséquence : tests de champs, unités, pagination, licences, panne fournisseur et fixtures indépendantes des API en direct.

### ADR-014 — synchronisation sans écrasement silencieux

- Date : 2026-10-01
- Sujet : futur compte et multi-appareils.
- Décision : une version distante ne peut jamais écraser silencieusement une version locale, et inversement.
- Raison : le fonctionnement local doit rester souverain et les conflits doivent être compréhensibles.
- Conséquence : révisions, statut de conflit, file hors ligne persistante et choix explicite avant synchronisation de préférences sensibles.

### ADR-015 — accessibilité d’un trajet calculée par segments

- Date : 2026-10-01
- Sujet : itinéraires.
- Décision : un lieu accessible ne suffit pas à déclarer un trajet accessible ; le futur moteur examine les segments entre l’utilisateur et l’entrée choisie.
- Raison : trottoir, pente, traversée, travaux, ascenseur, quai ou correspondance peuvent rendre le parcours impraticable.
- Conséquence : modèle segmenté, inconnues conservées et prise en compte des conditions temporaires sans modifier le passeport utilisateur.

### ADR-016 — Android comme plateforme mobile cible, Samsung comme appareil de référence

- Date : 2026-10-01
- Sujet : compatibilité appareils.
- Décision : Libcomlair cible les smartphones Android ; Samsung est seulement l’appareil réel actuellement disponible pour le développement et les validations courantes.
- Raison : les utilisateurs Android emploient de nombreux constructeurs et une particularité Samsung ne doit jamais devenir une hypothèse générale de l’application.
- Conséquence : validation physique Android, vérification multi-constructeurs avant diffusion large lorsque pertinent, correctifs constructeur isolés et documentation dans `docs/VALIDATION-ANDROID.md`. iOS et les autres plateformes restent hors périmètre actuel.

### ADR-017 — GPS mondial indépendant du pays, de la langue et des fournisseurs

- Date : 2026-10-01
- Sujet : géolocalisation.
- Décision : le GPS produit une position WGS84 avec précision et fraîcheur ; il ne change jamais automatiquement la langue, le pays de recherche, le profil ou la juridiction. Carte, géocodage, itinéraire et transports restent des couches séparées.
- Raison : permettre l’utilisation dans n’importe quel pays et le remplacement d’un fournisseur sans reconstruire la géolocalisation.
- Conséquence : propriétaire `global-geolocation`, mode manuel obligatoire si permission refusée, position approximative supportée, arrière-plan désactivé par défaut, aucun historique permanent implicite.

### ADR-018 — conformité juridique versionnée par juridiction

- Date : 2026-10-01
- Sujet : ouverture internationale.
- Décision : chaque territoire possède un registre de conformité séparant règles régionales, nationales et éventuellement locales/sectorielles ; aucun pays ne devient officiellement disponible sans revue de ses obligations pertinentes.
- Raison : les règles de protection des données, accessibilité numérique, contributions, photos, open data et services peuvent varier selon la juridiction et dans le temps.
- Conséquence : sources officielles datées, statut de revue, révalidation et blocage de promotion lorsqu’une incertitude importante subsiste. Le registre seed ne constitue jamais une déclaration de conformité.

### ADR-019 — droits d’utilisation séparés de la simple licence

- Date : 2026-10-01
- Sujet : données, cartes, transports, voix et mode hors ligne.
- Décision : pour chaque ressource, Libcomlair suit séparément accès, cache, stockage hors ligne, transformation, redistribution et attribution.
- Raison : une API publique ou une licence identifiée ne signifie pas automatiquement que tous les usages techniques sont autorisés.
- Conséquence : un droit inconnu bloque l’usage concerné ; un pack hors ligne exige un droit hors ligne vérifié ; les conditions doivent être réévaluées lorsqu’elles changent.

## Règle

Une décision peut être remplacée, mais elle ne doit pas être supprimée. Ajouter une nouvelle décision indiquant explicitement celle qu’elle remplace et pourquoi.
