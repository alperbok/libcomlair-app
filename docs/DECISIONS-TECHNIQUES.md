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

## Règle

Une décision peut être remplacée, mais elle ne doit pas être supprimée. Ajouter une nouvelle décision indiquant explicitement celle qu’elle remplace et pourquoi.