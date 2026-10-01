# Libcomlair — architecture anti-refonte

Date : 2026-10-01

## Objectif

Éviter que l’ajout futur de pays, langues, photos, comptes, synchronisation, données transport ou nouveaux profils oblige à reconstruire le cœur de Libcomlair.

Cette architecture est préparatoire. Elle ne doit pas activer de comportement utilisateur tant que les modules concernés ne sont pas testés et validés.

## Principes obligatoires

1. **Identifiants stables** : aucun identifiant métier ne dépend d’un texte traduit, d’un nom affiché ou d’un fournisseur externe.
2. **Langue ≠ pays ≠ position GPS** : ces trois informations sont indépendantes.
3. **Besoin fonctionnel ≠ diagnostic médical** : le profil utilisateur enregistre des besoins d’usage, pas des données médicales inutiles.
4. **Local d’abord** : profil, préférences, files de contribution, dictionnaires essentiels et secours doivent pouvoir exister localement.
5. **Schémas versionnés** : toute donnée persistante possède `schemaVersion` et une migration documentée avant changement incompatible.
6. **Source et date obligatoires** : toute information d’accessibilité importée doit pouvoir indiquer provenance, date, confiance et validité.
7. **Pas de valeur inventée** : une information absente reste inconnue.
8. **Historique plutôt qu’écrasement silencieux** : les corrections de données doivent pouvoir être retracées.
9. **Adaptateurs fournisseurs** : aucune API externe ne définit directement le modèle interne ou l’interface.
10. **Diagnostic par module** : toute fonction nouvelle doit exposer état, version, dépendances, dernière erreur et tests requis.
11. **Android, pas une marque** : Samsung est l’appareil de référence actuel, mais aucune fonction ne doit dépendre d’un constructeur Android particulier.
12. **GPS ≠ carte ≠ pays ≠ juridiction** : la position appareil reste indépendante du fournisseur de carte, du pays de recherche et de la règle juridique applicable.
13. **Juridiction versionnée** : un nouveau territoire ne devient pas officiellement disponible sans revue de ses règles propres et des éventuelles règles régionales supérieures.
14. **Droits explicites** : accès public ou API accessible ne signifie jamais automatiquement droit de cache, stockage hors ligne, transformation ou redistribution.

## Profil / passeport fonctionnel

Le futur passeport Libcomlair doit conserver séparément :
- besoins fonctionnels ;
- critères d’accessibilité préférés ;
- langue d’interface ;
- pays de recherche ;
- mode Découverte / Assisté / Rapide ;
- préférences vocales et de prononciation ;
- packs hors ligne ;
- préférences de confidentialité ;
- informations de synchronisation si un compte existe un jour.

Le compte ne doit jamais être obligatoire pour utiliser le passeport local.

## GPS mondial

Le propriétaire architectural est `global-geolocation`.

Règles :
- coordonnées internes WGS84 ;
- saisie manuelle disponible si la permission GPS est refusée ;
- position approximative acceptée lorsqu’elle suffit ;
- position précise demandée seulement si nécessaire ;
- localisation en arrière-plan désactivée par défaut ;
- aucun historique permanent de déplacements créé implicitement ;
- précision et ancienneté de la mesure conservées ;
- une position périmée n’est pas présentée comme actuelle ;
- carte, géocodage, POI, itinéraire et transport restent des services séparés ;
- franchir une frontière ne change pas automatiquement la langue ou le profil.

Référence : `docs/ARCHITECTURE-GPS-MONDIAL.md` et `data/geography/location-fix-schema-v1.json`.

## Lieux et accès multiples

Un lieu peut avoir plusieurs entrées. Chaque entrée doit pouvoir posséder :
- coordonnées ;
- adresse ou repère ;
- type d’accès ;
- marches ;
- pente ;
- largeur utile ;
- porte ;
- ascenseur ou rampe ;
- horaires spécifiques ;
- photos ;
- statut temporaire ;
- source et date de vérification.

La fiche globale d’un lieu ne doit donc jamais réduire l’accessibilité à un seul booléen.

## Accessibilité du trajet

Le modèle doit pouvoir évoluer vers des segments de trajet : trottoir, traversée, pente, travaux, quai, correspondance, ascenseur, entrée finale.

Un itinéraire accessible devra être calculé à partir des besoins du passeport, sans modifier ces besoins.

## Données temporaires

Toute information temporaire doit pouvoir utiliser :
- `validFrom` ;
- `validUntil` ;
- `observedAt` ;
- `lastConfirmedAt` ;
- `status = active|expired|unconfirmed`.

Une donnée expirée peut rester dans l’historique mais ne doit plus être présentée comme état actuel.

## Provenance et confiance

Chaque affirmation d’accessibilité doit pouvoir contenir :
- source ;
- type de source : officielle, établissement, open data, contribution utilisateur ;
- date ;
- niveau de confiance ;
- preuve éventuelle ;
- conflit éventuel avec une autre source.

Libcomlair doit montrer le conflit au lieu de choisir silencieusement une valeur lorsque deux sources fiables se contredisent.

## Dédoublonnage des lieux

Le même lieu peut venir de plusieurs sources. Le modèle doit conserver :
- un identifiant Libcomlair stable ;
- les identifiants externes de chaque fournisseur ;
- les règles de rapprochement ;
- les fusions réversibles ;
- l’historique des sources.

## Photos

La photo complète les données structurées mais ne les remplace pas. Les règles de `docs/ARCHITECTURE-PHOTOS.md` s’appliquent : droits, EXIF, descriptions alternatives, hors ligne et confidentialité.

## Dictionnaires et noms propres

Pour chaque nom :
- forme officielle ;
- variante locale reconnue si elle existe ;
- prononciation native ;
- aide de prononciation selon la langue de l’utilisateur ;
- translittération si l’écriture l’exige ;
- synonymes micro ;
- alias de recherche.

## Internationalisation avancée

Préparer sans activer nécessairement :
- écritures de droite à gauche ;
- alphabets non latins ;
- translittération ;
- pluriels et genres ;
- unités ;
- dates/heures ;
- formats d’adresse et téléphone ;
- fuseaux horaires.

Les valeurs internes doivent rester neutres ; la locale ne sert qu’à présenter ou interpréter.

## Juridiction et conformité territoriale

La juridiction applicable n’est jamais choisie uniquement à partir du GPS.

Le registre juridique doit pouvoir empiler :
- règles régionales/supranationales ;
- règles nationales ;
- règles locales ou sectorielles si nécessaire.

Chaque obligation doit conserver sa source officielle, sa date de vérification, son domaine, son état et son éventuel caractère bloquant pour une sortie officielle.

Un statut `prepared` ou `test` ne signifie pas « juridiquement conforme ».

Référence : `data/legal/jurisdiction-compliance-schema-v1.json` et `config/libcomlair-legal-registry-v1.json`.

## Droits, licences et conditions d’utilisation

Chaque ressource externe doit distinguer au minimum :
- droit d’accès ;
- droit de cache ;
- droit de stockage hors ligne ;
- droit de transformation ;
- droit de redistribution ;
- attribution ;
- éventuelles obligations de partage à l’identique ;
- date de vérification des conditions.

Un droit inconnu est traité comme non autorisé pour l’usage concerné jusqu’à vérification.

Un pack Voyage/hors ligne ne peut pas embarquer une ressource dont le droit hors ligne n’est pas vérifié.

Référence : `data/licenses/resource-rights-schema-v1.json` et `config/libcomlair-rights-registry-v1.json`.

## Synchronisation future

Si un compte est ajouté :
- fonctionnement local sans compte préservé ;
- export et suppression possibles ;
- synchronisation explicite ;
- conflits détectés ;
- aucune donnée locale écrasée silencieusement ;
- version et horodatage de chaque enregistrement ;
- reprise après coupure réseau.

## Contributions et modération

Prévoir dès le départ :
- file hors ligne ;
- provenance ;
- statut de modération ;
- droit de correction ;
- signalement ;
- expiration des observations temporaires ;
- séparation entre donnée publique et brouillon local.

## Fournisseurs externes

Chaque fournisseur doit avoir un contrat d’adaptation documentant :
- champs indispensables ;
- champs optionnels ;
- unités ;
- pagination ;
- quotas ;
- erreurs ;
- version ou date de schéma ;
- licence et conditions ;
- droits de cache/hors ligne/redistribution ;
- comportement si un champ disparaît.

Une modification de contrat fournisseur doit être détectée par test avant d’atteindre l’interface.

## Jeux de référence

Créer des cas de référence stables servant de vérité de test :
- lieux avec données complètes ;
- lieux avec données inconnues ;
- lieu avec plusieurs entrées ;
- arrêt avec plusieurs lignes/directions ;
- conflit de sources ;
- donnée temporaire expirée ;
- nom propre étranger avec prononciations native et adaptée ;
- GPS refusé avec mode manuel ;
- position GPS périmée ;
- GPS dans un pays différent sans changement automatique de langue/pays de recherche ;
- pays non audité juridiquement ;
- ressource sans droit hors ligne vérifié.

Après une modification importante, ces cas doivent être rejoués.

## Versionnement et migrations

Le code, les données, les dictionnaires, les packs vocaux, les profils, les schémas GPS, les registres juridiques et les registres de droits doivent pouvoir avoir des versions distinctes.

Avant toute évolution incompatible :
1. écrire la migration ;
2. prévoir le retour arrière ou la lecture de l’ancien format ;
3. tester sur une copie ;
4. vérifier la conservation des données utilisateur ;
5. seulement ensuite promouvoir le nouveau schéma.

## Sécurité et confidentialité

- aucune clé secrète dans un fichier public ;
- minimisation des données personnelles ;
- aucune déduction de handicap depuis une photo ou une position ;
- pas d’historique GPS permanent implicite ;
- pas de collecte analytique indispensable au fonctionnement ;
- toute future télémétrie doit être optionnelle, documentée et désactivable ;
- export/suppression des données personnelles prévus avant synchronisation distante.

## Barrière avant développement d’une nouvelle fonction

Avant de coder une fonction, vérifier obligatoirement :
- plusieurs langues ?
- plusieurs pays ?
- GPS ou mode manuel ?
- position approximative/précise ?
- hors ligne ?
- droits de cache/hors ligne/redistribution ?
- juridiction applicable ?
- profil Vision ?
- micro ?
- voix ?
- photo ?
- confidentialité ?
- source/licence ?
- diagnostic ?
- migration ?
- retour arrière ?
- test sur smartphone Android réel ?
- comportement dépendant d’un constructeur Android ? Si oui, est-il isolé et justifié ?

Si une réponse est pertinente et non traitée, l’architecture de la fonction n’est pas encore terminée.
