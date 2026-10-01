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
- licence ;
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
- nom propre étranger avec prononciations native et adaptée.

Après une modification importante, ces cas doivent être rejoués.

## Versionnement et migrations

Le code, les données, les dictionnaires, les packs vocaux et les profils doivent pouvoir avoir des versions distinctes.

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
- pas de collecte analytique indispensable au fonctionnement ;
- toute future télémétrie doit être optionnelle, documentée et désactivable ;
- export/suppression des données personnelles prévus avant synchronisation distante.

## Barrière avant développement d’une nouvelle fonction

Avant de coder une fonction, vérifier obligatoirement :
- plusieurs langues ?
- plusieurs pays ?
- hors ligne ?
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
