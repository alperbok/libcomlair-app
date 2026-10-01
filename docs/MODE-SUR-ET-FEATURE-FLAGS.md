# Libcomlair — mode sûr et drapeaux de fonctions

Date de création : 2026-10-01

## Objectif

Éviter qu’une nouvelle fonction ou une mise à jour défectueuse rende toute l’application inutilisable.

Principe : une nouveauté ne remplace pas immédiatement ce qui fonctionne. Elle est ajoutée à côté, activable séparément, testée, puis promue comme référence après validation.

## 1. Mode sûr Libcomlair

Le mode sûr doit permettre de démarrer avec uniquement les fonctions essentielles lorsque l’application normale rencontre une panne importante.

### Fonctions à conserver en mode sûr

- cadre maître minimal ;
- navigation Retour / Accueil ;
- sélection ou lecture du profil actif ;
- Diagnostic ;
- accès au registre des pannes connues ;
- lecture vocale locale essentielle lorsqu’elle est disponible ;
- accès aux données locales déjà stockées ;
- export du rapport de diagnostic ;
- retour à la dernière version stable lorsque cette fonction existera.

### Fonctions pouvant être désactivées temporairement

- nouvelles fonctions expérimentales ;
- appels API non indispensables ;
- services externes ;
- synchronisations en arrière-plan ;
- modules récemment modifiés non nécessaires au diagnostic ;
- animations ou enrichissements visuels non essentiels.

### Règles

- le mode sûr ne doit jamais effacer les données utilisateur ;
- il doit être identifiable clairement ;
- il doit indiquer pourquoi il a été activé ;
- il doit permettre de quitter le mode sûr après réparation ;
- son activation automatique future doit être limitée à des erreurs critiques confirmées, pour éviter les boucles de démarrage.

## 2. Drapeaux de fonctions (feature flags)

Les fonctions nouvelles ou à risque doivent pouvoir être activées séparément.

Exemples :

- `voice.localTts` ;
- `voice.localRecognition` ;
- `voice.dictionaryV1` ;
- `diagnostic.exportReport` ;
- `data.universalModel` ;
- `offline.fullMode` ;
- `updates.rollback` ;
- `contributions.offlineQueue`.

## 3. États autorisés

Chaque drapeau possède l’un des états suivants :

- `off` : non utilisé ;
- `test` : disponible uniquement pour validation ;
- `on` : activé dans la version courante ;
- `fallback` : utilisé uniquement si la fonction principale échoue.

## 4. Règles de promotion

Une fonction passe de `test` à `on` seulement si :

1. le code source a été vérifié ;
2. son module propriétaire est identifié ;
3. son diagnostic existe ;
4. sa procédure de secours existe lorsque nécessaire ;
5. les parcours de référence concernés réussissent ;
6. la validation téléphone réelle est faite lorsque l’affichage, la voix, le micro, le GPS ou le tactile sont concernés ;
7. aucune donnée utilisateur n’est perdue ;
8. les licences sont vérifiées si un composant tiers est ajouté.

## 5. Retour arrière

Si une fonction `on` provoque une régression :

1. la repasser en `off` ou utiliser son `fallback` ;
2. conserver les données utilisateur ;
3. enregistrer le symptôme et la cause dans les pannes connues ;
4. réparer le module propriétaire ;
5. rejouer les parcours de référence avant réactivation.

## 6. Source de configuration

Le fichier machine de référence est :

`config/libcomlair-feature-flags.json`

Ce fichier est créé comme structure de référence. Il n’est pas encore branché au runtime de production tant que son intégration n’a pas été testée.

## Critère de réussite

Une panne d’une fonction expérimentale ne doit plus obliger à modifier plusieurs modules ni empêcher l’accès au Diagnostic et aux fonctions essentielles.