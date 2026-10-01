# Libcomlair — architecture internationale

Date : 2026-10-01

## Objectif

Préparer Libcomlair à fonctionner dans plusieurs langues et plusieurs pays sans reconstruire l’application.

La France reste le premier territoire opérationnel. L’internationalisation est préparée maintenant pour éviter que les libellés français, les fournisseurs français et les formats français deviennent des dépendances structurelles.

## Principe central : langue ≠ pays

La langue de l’utilisateur et le pays des données sont deux choix différents.

Exemples :
- un utilisateur francophone peut chercher un lieu en Espagne ;
- un utilisateur anglophone peut utiliser Libcomlair en France ;
- la Belgique ou la Suisse peuvent utiliser plusieurs langues avec les mêmes données locales.

Libcomlair doit donc gérer séparément :
1. `locale` — langue et conventions d’interface ;
2. `country` — territoire de recherche et règles de données ;
3. `voicePack` — audios fixes et voix locale ;
4. `dataAdapter` — fournisseur ou source de données du pays.

## Identifiants internes stables

Les fonctions, catégories et critères doivent avoir un identifiant interne stable et une traduction séparée.

Exemple cible :
- identifiant interne : `category.restaurant`
- français : `Restaurant`
- anglais : `Restaurant`
- espagnol : `Restaurante`

Même principe pour les critères d’accessibilité : l’identifiant reste identique alors que le libellé, la description vocale et les synonymes micro changent selon la langue.

Le modèle actuel `data/accessibility-model.json` reste utilisable pendant la transition. Une migration vers des identifiants totalement neutres ne devra être faite qu’avec schéma versionné et tests de compatibilité afin de ne pas casser les données existantes.

## Voix multilingue

Organisation cible :

`assets/audio/fr-FR/`
`assets/audio/en-GB/`
`assets/audio/es-ES/`
`assets/audio/de-DE/`
`assets/audio/it-IT/`
`assets/audio/pt-PT/`

Chaque message fixe conserve le même identifiant, par exemple `welcome.main`, mais possède un audio par locale.

Pour les textes dynamiques, le routeur vocal choisit un moteur TTS local compatible avec la locale active. Si une langue n’est pas disponible localement, Libcomlair doit signaler clairement le niveau de couverture au lieu de dépendre silencieusement d’un service externe.

## Reconnaissance vocale multilingue

Les commandes micro doivent être séparées en trois couches :
- intention universelle : `nav.back`, `category.open`, `criteria.remove` ;
- expressions reconnues par langue ;
- synonymes et prononciations locales.

Une commande française ne doit donc jamais être codée comme logique métier. Elle doit seulement mapper vers une intention interne.

## Données par pays

Chaque source nationale ou régionale devient un adaptateur vers le modèle universel Libcomlair.

Exemple France : IDFM, SNCF, Geoapify, catalogue local.

Dans un autre pays, de nouveaux adaptateurs pourront être ajoutés sans modifier la recherche, les profils handicap, les critères, les fiches ou la voix.

Règle : une source externe ne définit jamais directement l’interface Libcomlair ; elle est normalisée vers le modèle interne.

## Formats locaux

La couche locale devra aussi gérer :
- formats de date et heure ;
- numéros de téléphone ;
- unités ;
- adresses ;
- nombres ;
- noms de pays/régions ;
- conventions de transport.

## Déploiement progressif

Phase 1 : français + France, architecture internationale inactive.

Phase 2 : packs vocaux et traductions séparés du code.

Phase 3 : sélecteur de langue en test, sans changer le pays de recherche.

Phase 4 : premier second pays pilote.

Phase 5 : adaptateurs de données par pays, cache hors ligne et tests de parcours par locale.

## Validation obligatoire pour une nouvelle langue

Avant promotion :
- interface essentielle traduite ;
- 7 messages vocaux critiques disponibles ;
- commandes micro essentielles disponibles ;
- diagnostic local dans la langue ;
- aucun identifiant métier dépendant du texte traduit ;
- parcours de référence rejoués sur téléphone réel.

## Validation obligatoire pour un nouveau pays

Avant promotion :
- provenance et licence des données documentées ;
- adaptateur vers le modèle universel ;
- catégories et accessibilité normalisées ;
- recherche et Autour de moi testés ;
- transports locaux testés lorsqu’ils sont intégrés ;
- comportement hors ligne documenté.

## Règle de sécurité

L’internationalisation ne doit pas être activée en production par simple ajout de fichiers. Elle reste derrière des drapeaux tant que la traduction, la voix, le micro, les données et les parcours téléphone ne sont pas validés.
