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
- Conséquence : stockage local et file hors ligne séparés, suppression EXIF avant envoi, descriptions vocales et textuelles, validation Samsung avant activation.

### ADR-009 — dictionnaires vocaux par langue, territoire et type de nom

- Date : 2026-10-01
- Sujet : TTS, microphone, recherche et internationalisation.
- Décision : séparer noms communs, vocabulaire d’accessibilité et familles de noms propres ; conserver la forme officielle affichée et gérer la prononciation séparément selon la langue de l’utilisateur.
- Raison : un même nom propre peut être écrit de la même manière mais nécessiter une prononciation différente selon la langue d’écoute ; les ressources de plusieurs pays auront aussi des licences différentes.
- Conséquence : packs versionnés par locale/pays, provenance et licence par ressource, corrections Libcomlair prioritaires et téléchargement hors ligne possible.

## Règle

Une décision peut être remplacée, mais elle ne doit pas être supprimée. Ajouter une nouvelle décision indiquant explicitement celle qu’elle remplace et pourquoi.