# Libcomlair — revue de cohérence générale

Date : 2026-10-01

## But

Ce document sert de point de contrôle avant tout nouveau chantier. Il résume les fondations déjà présentes, leur état réel et les règles à ne pas reconstruire une seconde fois.

Il ne remplace pas les fichiers propriétaires de chaque module ; il permet de savoir immédiatement où regarder avant une modification.

## Règles stables déjà décidées

1. Plateforme mobile cible actuelle : **Android**. Samsung est seulement l’appareil de référence disponible actuellement.
2. Langue, pays de recherche, GPS, juridiction juridique et profil d’accessibilité sont indépendants.
3. Un compte ne doit pas être obligatoire pour le passeport fonctionnel local.
4. Une information d’accessibilité absente reste inconnue ; elle n’est jamais déduite.
5. Un lieu peut avoir plusieurs entrées avec des niveaux d’accessibilité différents.
6. Un trajet accessible dépend de ses segments et pas seulement de la destination.
7. Les photos sont facultatives et doivent respecter droits, confidentialité, EXIF et descriptions alternatives.
8. Les noms propres conservent leur forme officielle ; prononciation native et aide selon la langue de l’utilisateur sont séparées.
9. Toute fonction importante doit avoir un module propriétaire, un diagnostic, une procédure de réparation et un secours lorsque possible.
10. Les fournisseurs externes passent par des adaptateurs et ne définissent jamais le modèle interne.
11. Les données persistantes sont versionnées et migrées avant rupture de compatibilité.
12. Une version stable est une version réellement validée, pas simplement la plus récente.
13. Le GPS mondial utilise des coordonnées WGS84 et ne choisit jamais automatiquement langue, pays de recherche, profil ou juridiction.
14. La localisation en arrière-plan reste désactivée par défaut ; aucun historique GPS permanent n’est créé implicitement.
15. Un nouveau territoire ne devient pas officiellement disponible sans revue juridique propre à ce territoire.
16. Un droit de licence inconnu n’est jamais interprété comme une autorisation de cache, stockage hors ligne ou redistribution.

## Fondations présentes dans le dépôt

### Internationalisation
- `config/libcomlair-locales-v1.json`
- `docs/ARCHITECTURE-INTERNATIONALE.md`
- `data/i18n/fr-FR.json`
- état : structure préparée ; runtime multilingue non activé.

### Dictionnaires / prononciation
- `config/libcomlair-dictionaries-v1.json`
- `data/voice/dictionaries/dictionary-entry-schema-v1.json`
- `data/voice/libcomlair-pronunciation-overrides.json`
- `docs/ARCHITECTURE-DICTIONNAIRES-INTERNATIONAUX.md`
- état : schémas et packs préparés ; moteur international complet non activé.

### Voix locale
- bibliothèque audio locale et couverture locale déjà présentes ;
- pack fixe manifesté ;
- Render reste une dépendance transitoire pour une partie des usages ;
- TTS local dynamique et reconnaissance locale ne sont pas encore validés comme remplacements finaux.

### Profil / passeport
- `data/profile/accessibility-passport-schema-v1.json`
- migration prévue depuis `libcomlair-access-profile-v1` sans suppression immédiate de l’ancien format ;
- état : préparé, pas encore runtime universel.

### Lieux / accessibilité
- `data/accessibility-model.json`
- `data/places/place-record-schema-v1.json`
- plusieurs entrées, preuves, dates, conflits et états temporaires prévus ;
- état : modèle préparé, migration progressive nécessaire.

### Itinéraires accessibles
- `data/routes/accessibility-route-schema-v1.json`
- segmentation trottoir/traversée/rampe/ascenseur/gare/quai/véhicule/entrée ;
- état : préparé, moteur d’itinéraire accessible non activé.

### GPS mondial
- `docs/ARCHITECTURE-GPS-MONDIAL.md`
- `data/geography/location-fix-schema-v1.json`
- propriétaire architectural : `global-geolocation` ;
- état : structure préparée ; GPS runtime mondial, géocodage et arrière-plan désactivés.

### Photos
- `docs/ARCHITECTURE-PHOTOS.md`
- `data/media/photo-record-schema-v1.json`
- état : architecture préparée ; capture/publication runtime non activées.

### Synchronisation future
- `data/sync/sync-envelope-schema-v1.json`
- aucun écrasement silencieux local/distant ;
- compte facultatif ;
- état : préparé, synchronisation distante non activée.

### Fournisseurs et contrats
- `data/architecture/provider-contract-schema-v1.json`
- champs, pagination, unités, panne, géographie et droits d’utilisation maintenant séparés ;
- état : schéma préparé, contrats concrets à remplir fournisseur par fournisseur.

### Droits / licences
- `data/licenses/resource-rights-schema-v1.json`
- `config/libcomlair-rights-registry-v1.json`
- distingue accès, cache, hors ligne, transformation, redistribution et attribution ;
- état : registre seed ; les ressources externes restent à auditer individuellement.

### Conformité juridique territoriale
- `data/legal/jurisdiction-compliance-schema-v1.json`
- `config/libcomlair-legal-registry-v1.json`
- règles régionales et nationales cumulables ;
- GPS ne choisit pas seul la juridiction ;
- état : architecture seed, pas une déclaration de conformité juridique.

### Migrations
- `data/architecture/data-migrations-registry-v1.json`
- inclut désormais profil, lieux, photos, dictionnaires, GPS, registre juridique et droits/licences ;
- état : contrat de migration préparé.

### Tests de référence
- `tests/reference-journeys.json`
- `tests/golden-cases-v1.json`
- inclut désormais indépendance GPS/pays/langue, refus GPS, position périmée, gate juridique et gate droits hors ligne ;
- état : cas préparés ; fixtures physiques à compléter avant automatisation définitive.

### Android
- `docs/VALIDATION-ANDROID.md`
- test réel Android obligatoire pour les fonctions matérielles ;
- multi-constructeurs prévu avant diffusion large ;
- iOS hors périmètre actuel.

## Feature flags — principe

`config/libcomlair-feature-flags.json` reste une configuration de référence non branchée au runtime.

Les nouvelles fonctions sensibles sont séparées : GPS runtime, géocodage, arrière-plan, photos, compte, itinéraires, juridique et droits hors ligne. Une fondation présente dans le dépôt ne signifie donc pas qu’elle est active dans l’application.

## Ce qui ne doit pas être affirmé comme terminé

- GPS mondial réellement actif ;
- navigation internationale accessible active ;
- mode Voyage hors ligne complet ;
- conformité juridique d’un pays ;
- droit de redistribution d’une source externe non auditée ;
- traduction complète hors français ;
- voix dynamique locale finale ;
- reconnaissance micro locale finale ;
- publication photo ;
- synchronisation de compte ;
- mode hors ligne complet.

## Ordre recommandé pour la suite

1. terminer l’indépendance vocale locale ;
2. créer le runtime de préférences langue/pays sans changer l’interface stable ;
3. créer le module GPS Android test derrière flag, avec mode manuel ;
4. transformer progressivement les fournisseurs existants en contrats/adaptateurs audités ;
5. compléter le registre droits/licences des sources réellement utilisées ;
6. auditer juridiquement le territoire avant toute ouverture officielle hors périmètre déjà exploité ;
7. ensuite seulement activer Voyage/hors ligne, itinéraires accessibles et contributions avancées.

## Procédure anti-boucle

Avant toute correction ou nouvelle fonction :
1. lire ce document ;
2. identifier le module propriétaire dans `data/architecture/libcomlair-module-dependencies-v1.json` ;
3. consulter `docs/REGISTRE-DIAGNOSTIC-REPARATION.md` ;
4. consulter `docs/CHECKLIST-NOUVELLE-FONCTION.md` ;
5. vérifier les feature flags ;
6. rechercher les conflits historiques/load order avant d’ajouter un correctif ;
7. modifier la cause racine ;
8. rejouer les golden cases concernés ;
9. valider sur Android réel lorsque nécessaire ;
10. seulement ensuite promouvoir la version.

## Règle finale

**Ne pas recréer un système qui possède déjà un propriétaire. Étendre le schéma/module existant avec migration et tests lorsque le besoin nouveau appartient à la même responsabilité.**
