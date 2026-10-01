# Libcomlair

Application d’accessibilité conçue pour aider les personnes en situation de handicap à trouver, comprendre et utiliser des lieux, services et transports accessibles.

## Principes du projet

- cible mobile actuelle : **smartphones Android** ; iPhone/iOS et les autres plateformes ne font pas partie du périmètre actuel ;
- Samsung est l’appareil de référence de développement actuellement disponible, pas une exigence de compatibilité ;
- accessibilité visuelle, vocale et micro ;
- fonctionnement aussi autonome que possible ;
- aucune dépendance critique à un fournisseur unique ;
- conservation locale des fonctions essentielles ;
- diagnostic et réparation intégrés ;
- données et licences traçables ;
- validation finale sur smartphone Android réel ;
- GPS mondial indépendant de la langue, du pays de recherche, du fournisseur de carte et de la juridiction ;
- aucun nouveau territoire n’est déclaré officiellement disponible sans revue juridique propre ;
- aucun droit de cache, hors ligne, transformation ou redistribution n’est supposé lorsqu’il n’est pas vérifié ;
- principe d’architecture : **1 fonction = 1 module responsable = 1 diagnostic = 1 réparation = 1 secours lorsque possible** ;
- une nouveauté à risque est d’abord isolée et testée avant de remplacer une fonction stable ;
- **la navigation essentielle ne doit jamais attendre une voix, un réseau ou un fournisseur externe** ;
- **toute nouvelle fonction doit être pensée avant codage pour plusieurs langues, pays, GPS, hors ligne, droits/licences, juridiction, accessibilité, confidentialité, diagnostic, migration et retour arrière**.

## Documents de référence

- [`LIBCOMLAIR-SECURITE-INDEPENDANCE.md`](LIBCOMLAIR-SECURITE-INDEPENDANCE.md) — sécurité, sauvegardes, restauration et principe général d’indépendance.
- [`docs/REVUE-COHERENCE-2026-10-01.md`](docs/REVUE-COHERENCE-2026-10-01.md) — état de référence à consulter avant tout nouveau chantier pour éviter les doublons et les boucles.
- [`docs/ROADMAP-INDEPENDANCE-COMPLETE.md`](docs/ROADMAP-INDEPENDANCE-COMPLETE.md) — feuille de route générale vers l’indépendance complète.
- [`docs/ARCHITECTURE-MODULES.md`](docs/ARCHITECTURE-MODULES.md) — carte des responsabilités : quel module possède quelle fonction et quelles dépendances.
- [`docs/ARCHITECTURE-INTERNATIONALE.md`](docs/ARCHITECTURE-INTERNATIONALE.md) — séparation langue/pays, packs vocaux, pays et adaptateurs internationaux.
- [`docs/ARCHITECTURE-GPS-MONDIAL.md`](docs/ARCHITECTURE-GPS-MONDIAL.md) — GPS mondial, permissions Android, frontières, confidentialité et séparation des fournisseurs.
- [`docs/ARCHITECTURE-PHOTOS.md`](docs/ARCHITECTURE-PHOTOS.md) — photos, descriptions alternatives, droits, confidentialité et hors ligne.
- [`docs/ARCHITECTURE-ANTI-REFONTE.md`](docs/ARCHITECTURE-ANTI-REFONTE.md) — règles pour éviter les futures reconstructions du cœur de l’application.
- [`docs/CHECKLIST-NOUVELLE-FONCTION.md`](docs/CHECKLIST-NOUVELLE-FONCTION.md) — checklist obligatoire avant de commencer une nouvelle fonction.
- [`docs/VALIDATION-ANDROID.md`](docs/VALIDATION-ANDROID.md) — cible Android, appareil de référence et validation multi-constructeurs.
- [`docs/REGISTRE-DIAGNOSTIC-REPARATION.md`](docs/REGISTRE-DIAGNOSTIC-REPARATION.md) — point d’entrée en cas de panne : Module → Diagnostic → Réparation → Secours.
- [`docs/MODE-SUR-ET-FEATURE-FLAGS.md`](docs/MODE-SUR-ET-FEATURE-FLAGS.md) — mode sûr et activation séparée des nouveautés.
- [`docs/MAINTENANCE-AVANCEE.md`](docs/MAINTENANCE-AVANCEE.md) — séparation du menu utilisateur et de la maintenance réservée au développement.
- [`docs/DEPENDANCES-EXTERNES-RESTANTES.md`](docs/DEPENDANCES-EXTERNES-RESTANTES.md) — suivi des fonctions qui dépendent encore d’un fournisseur ou du réseau.
- [`config/libcomlair-feature-flags.json`](config/libcomlair-feature-flags.json) — configuration machine de référence des drapeaux, actuellement non branchée au runtime.
- [`config/libcomlair-legal-registry-v1.json`](config/libcomlair-legal-registry-v1.json) — registre seed de conformité par juridiction ; ne constitue pas une déclaration juridique de conformité.
- [`config/libcomlair-rights-registry-v1.json`](config/libcomlair-rights-registry-v1.json) — registre des droits/licences par ressource et usage.
- [`tests/reference-journeys.json`](tests/reference-journeys.json) — parcours fonctionnels à rejouer après les modifications importantes.
- [`tests/golden-cases-v1.json`](tests/golden-cases-v1.json) — cas de référence stables à valider avant automatisation.
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
- [`data/profile/accessibility-passport-schema-v1.json`](data/profile/accessibility-passport-schema-v1.json) — futur passeport fonctionnel local et versionné.
- [`data/places/place-record-schema-v1.json`](data/places/place-record-schema-v1.json) — futur modèle universel des lieux, entrées, preuves et états temporaires.
- [`data/routes/accessibility-route-schema-v1.json`](data/routes/accessibility-route-schema-v1.json) — préparation des itinéraires accessibles par segments.
- [`data/geography/location-fix-schema-v1.json`](data/geography/location-fix-schema-v1.json) — schéma mondial de position, précision et fraîcheur GPS.
- [`data/legal/jurisdiction-compliance-schema-v1.json`](data/legal/jurisdiction-compliance-schema-v1.json) — schéma de conformité par juridiction.
- [`data/licenses/resource-rights-schema-v1.json`](data/licenses/resource-rights-schema-v1.json) — schéma des droits d’accès, cache, hors ligne, transformation et redistribution.
- [`data/sync/sync-envelope-schema-v1.json`](data/sync/sync-envelope-schema-v1.json) — préparation d’une synchronisation future sans écrasement silencieux.
- [`data/architecture/provider-contract-schema-v1.json`](data/architecture/provider-contract-schema-v1.json) — contrat de référence des fournisseurs externes et de leurs droits d’utilisation.
- [`data/architecture/data-migrations-registry-v1.json`](data/architecture/data-migrations-registry-v1.json) — registre des migrations de données persistantes et de référence.

## Règle de dépannage

Lorsqu’un problème apparaît, commencer par `docs/REVUE-COHERENCE-2026-10-01.md`, puis `docs/REGISTRE-DIAGNOSTIC-REPARATION.md`, identifier le module propriétaire, vérifier sa chaîne de diagnostic, rechercher les conflits historiques éventuels, puis corriger la cause racine. Ne pas empiler des correctifs si une ancienne règle ou un ancien script entre en conflit.

Si une nouveauté est suspectée, consulter ensuite `docs/MODE-SUR-ET-FEATURE-FLAGS.md` afin de l’isoler ou de revenir au secours prévu sans toucher aux autres modules.

## Règle avant nouvelle fonction

Avant de coder, utiliser `docs/CHECKLIST-NOUVELLE-FONCTION.md`. Une case pertinente non traitée signifie que l’architecture de la fonction n’est pas encore prête.

## Règle avant version stable

Une version stable est la dernière version **réellement validée**, pas simplement la plus récente. Le protocole `docs/VALIDATION-VERSION-STABLE.md` impose : source vérifiée → diagnostic → tests ciblés → parcours de référence → validation Android réelle lorsque nécessaire → droits/licences → conformité territoriale si pertinente → promotion.

## Objectif d’indépendance

Le téléphone doit posséder tout ce qui est indispensable au fonctionnement essentiel de Libcomlair. Internet doit principalement servir à enrichir et actualiser les données.

L’indépendance complète ne sera considérée comme atteinte que lorsque, smartphone Android en mode avion et Render indisponible, un utilisateur du profil Vision pourra encore ouvrir Libcomlair, entendre l’interface, naviguer au micro, entendre des informations dynamiques, consulter les données locales autorisées au stockage hors ligne, utiliser le Diagnostic et enregistrer une contribution locale.
