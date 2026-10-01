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
- principe d’architecture : **1 fonction = 1 module responsable = 1 diagnostic = 1 réparation = 1 secours lorsque possible**.

## Documents de référence

- [`LIBCOMLAIR-SECURITE-INDEPENDANCE.md`](LIBCOMLAIR-SECURITE-INDEPENDANCE.md) — sécurité, sauvegardes, restauration et principe général d’indépendance.
- [`docs/ROADMAP-INDEPENDANCE-COMPLETE.md`](docs/ROADMAP-INDEPENDANCE-COMPLETE.md) — feuille de route générale vers l’indépendance complète.
- [`docs/ARCHITECTURE-MODULES.md`](docs/ARCHITECTURE-MODULES.md) — carte des responsabilités : quel module possède quelle fonction et quelles dépendances.
- [`docs/REGISTRE-DIAGNOSTIC-REPARATION.md`](docs/REGISTRE-DIAGNOSTIC-REPARATION.md) — point d’entrée en cas de panne : Module → Diagnostic → Réparation → Secours.
- [`docs/voice-independence-legal-plan.md`](docs/voice-independence-legal-plan.md) — règles juridiques et licences pour la partie vocale.
- [`docs/REGISTRE-COMPOSANTS-VOCAUX.md`](docs/REGISTRE-COMPOSANTS-VOCAUX.md) — moteurs, modèles, dictionnaires et statut d’audit.
- [`docs/TEST-AUTONOMIE-TOTALE.md`](docs/TEST-AUTONOMIE-TOTALE.md) — protocole final en mode avion / services externes coupés.
- [`data/voice/README.md`](data/voice/README.md) — organisation des données vocales locales.
- [`data/voice/libcomlair-pronunciation-overrides.json`](data/voice/libcomlair-pronunciation-overrides.json) — dictionnaire de prononciation propre à Libcomlair.

## Règle de dépannage

Lorsqu’un problème apparaît, commencer par `docs/REGISTRE-DIAGNOSTIC-REPARATION.md`, identifier le module propriétaire, vérifier sa chaîne de diagnostic, rechercher les conflits historiques éventuels, puis corriger la cause racine. Ne pas empiler des correctifs si une ancienne règle ou un ancien script entre en conflit.

## Objectif d’indépendance

Le téléphone doit posséder tout ce qui est indispensable au fonctionnement essentiel de Libcomlair. Internet doit principalement servir à enrichir et actualiser les données.

L’indépendance complète ne sera considérée comme atteinte que lorsque, téléphone en mode avion et Render indisponible, un utilisateur du profil Vision pourra encore ouvrir Libcomlair, entendre l’interface, naviguer au micro, entendre des informations dynamiques, consulter les données locales, utiliser le Diagnostic et enregistrer une contribution locale.
