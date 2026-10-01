# Libcomlair

Application d’accessibilité conçue pour aider les personnes en situation de handicap à trouver, comprendre et utiliser des lieux, services et transports accessibles.

## Principes du projet

- accessibilité visuelle, vocale et micro ;
- fonctionnement aussi autonome que possible ;
- aucune dépendance critique à un fournisseur unique ;
- conservation locale des fonctions essentielles ;
- diagnostic et réparation intégrés ;
- données et licences traçables ;
- validation finale sur téléphone réel ;
- principe d’architecture : **1 fonction = 1 module responsable = 1 diagnostic = 1 réparation = 1 secours lorsque possible** ;
- une nouveauté à risque est d’abord isolée et testée avant de remplacer une fonction stable ;
- **la navigation essentielle ne doit jamais attendre une voix, un réseau ou un fournisseur externe**.

## Documents de référence

- [`LIBCOMLAIR-SECURITE-INDEPENDANCE.md`](LIBCOMLAIR-SECURITE-INDEPENDANCE.md) — sécurité, sauvegardes, restauration et principe général d’indépendance.
- [`docs/ROADMAP-INDEPENDANCE-COMPLETE.md`](docs/ROADMAP-INDEPENDANCE-COMPLETE.md) — feuille de route générale vers l’indépendance complète.
- [`docs/ARCHITECTURE-MODULES.md`](docs/ARCHITECTURE-MODULES.md) — carte des responsabilités : quel module possède quelle fonction et quelles dépendances.
- [`docs/REGISTRE-DIAGNOSTIC-REPARATION.md`](docs/REGISTRE-DIAGNOSTIC-REPARATION.md) — point d’entrée en cas de panne : Module → Diagnostic → Réparation → Secours.
- [`docs/MODE-SUR-ET-FEATURE-FLAGS.md`](docs/MODE-SUR-ET-FEATURE-FLAGS.md) — mode sûr et activation séparée des nouveautés.
- [`docs/MAINTENANCE-AVANCEE.md`](docs/MAINTENANCE-AVANCEE.md) — séparation du menu utilisateur et de la maintenance réservée au développement.
- [`docs/DEPENDANCES-EXTERNES-RESTANTES.md`](docs/DEPENDANCES-EXTERNES-RESTANTES.md) — suivi des fonctions qui dépendent encore d’un fournisseur ou du réseau.
- [`config/libcomlair-feature-flags.json`](config/libcomlair-feature-flags.json) — configuration machine de référence des drapeaux, actuellement non branchée au runtime.
- [`tests/reference-journeys.json`](tests/reference-journeys.json) — parcours fonctionnels à rejouer après les modifications importantes.
- [`docs/RAPPORT-DIAGNOSTIC-EXPORT.md`](docs/RAPPORT-DIAGNOSTIC-EXPORT.md) — contenu et règles de confidentialité du futur rapport de diagnostic exportable.
- [`diagnostics/diagnostic-report-schema-v1.json`](diagnostics/diagnostic-report-schema-v1.json) — schéma machine du rapport, actuellement non activé.
- [`docs/DECISIONS-TECHNIQUES.md`](docs/DECISIONS-TECHNIQUES.md) — journal expliquant pourquoi les choix structurants ont été faits.
- [`docs/VALIDATION-VERSION-STABLE.md`](docs/VALIDATION-VERSION-STABLE.md) — barrière obligatoire avant de considérer une version comme stable.
- [`docs/voice-independence-legal-plan.md`](docs/voice-independence-legal-plan.md) — règles juridiques et licences pour la partie vocale.
- [`docs/REGISTRE-COMPOSANTS-VOCAUX.md`](docs/REGISTRE-COMPOSANTS-VOCAUX.md) — moteurs, modèles, dictionnaires et statut d’audit.
- [`docs/TEST-AUTONOMIE-TOTALE.md`](docs/TEST-AUTONOMIE-TOTALE.md) — protocole final en mode avion / services externes coupés.
- [`data/voice/README.md`](data/voice/README.md) — organisation des données vocales locales.
- [`data/voice/libcomlair-fixed-audio.json`](data/voice/libcomlair-fixed-audio.json) — manifeste versionné du futur pack vocal fixe local.
- [`data/voice/libcomlair-pronunciation-overrides.json`](data/voice/libcomlair-pronunciation-overrides.json) — dictionnaire de prononciation propre à Libcomlair.

## Règle de dépannage

Lorsqu’un problème apparaît, commencer par `docs/REGISTRE-DIAGNOSTIC-REPARATION.md`, identifier le module propriétaire, vérifier sa chaîne de diagnostic, rechercher les conflits historiques éventuels, puis corriger la cause racine. Ne pas empiler des correctifs si une ancienne règle ou un ancien script entre en conflit.

Si une nouveauté est suspectée, consulter ensuite `docs/MODE-SUR-ET-FEATURE-FLAGS.md` afin de l’isoler ou de revenir au secours prévu sans toucher aux autres modules.

## Règle avant version stable

Une version stable est la dernière version **réellement validée**, pas simplement la plus récente. Le protocole `docs/VALIDATION-VERSION-STABLE.md` impose : source vérifiée → diagnostic → tests ciblés → parcours de référence → validation téléphone lorsque nécessaire → conformité → promotion.

## Objectif d’indépendance

Le téléphone doit posséder tout ce qui est indispensable au fonctionnement essentiel de Libcomlair. Internet doit principalement servir à enrichir et actualiser les données.

L’indépendance complète ne sera considérée comme atteinte que lorsque, téléphone en mode avion et Render indisponible, un utilisateur du profil Vision pourra encore ouvrir Libcomlair, entendre l’interface, naviguer au micro, entendre des informations dynamiques, consulter les données locales, utiliser le Diagnostic et enregistrer une contribution locale.
