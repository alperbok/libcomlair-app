# Libcomlair — Plan légal pour l'indépendance vocale

Date de création : 2026-10-01

## Objectif

Atteindre une autonomie vocale complète : la navigation vocale essentielle doit continuer à fonctionner sans Render ni autre service distant obligatoire.

## Règle de conformité

Aucune brique vocale externe ne doit être intégrée dans la version de production tant que les éléments suivants n'ont pas été vérifiés séparément :

1. licence du code du moteur ;
2. licence du modèle ou des poids de voix ;
3. licence du dictionnaire / lexique / données phonétiques ;
4. licence ou consentement lié à la voix humaine utilisée ;
5. droits de redistribution dans l'application ;
6. obligations d'attribution, de notice, de partage à l'identique ou de publication du code ;
7. restrictions d'usage éventuelles ;
8. compatibilité entre toutes les licences de la chaîne.

Aucun fichier binaire, modèle vocal ou dictionnaire tiers ne doit être ajouté au dépôt principal tant que cette vérification n'est pas terminée.

## Architecture cible

Ordre de priorité prévu :

1. audios Libcomlair enregistrés et détenus/licenciés par Libcomlair ;
2. bibliothèque audio locale générée et mise en cache ;
3. moteur TTS local embarqué et hors ligne ;
4. dictionnaire / lexique local de prononciation ;
5. Render uniquement comme solution transitoire tant que l'indépendance n'est pas complète.

## Candidats étudiés

### Sherpa-ONNX

- Fonction : moteur d'inférence local, y compris TTS.
- Licence du code : Apache-2.0.
- Android : supporté.
- Statut Libcomlair : candidat prioritaire pour étude.
- Attention : la licence du moteur ne couvre pas automatiquement les modèles chargés. Chaque modèle doit être vérifié séparément.
- Point de vigilance 2026 : l'équipe sherpa-onnx a annoncé vouloir retirer la dépendance eSpeak-NG / piper-phonemize afin d'éviter les contraintes GPL dans une chaîne visée Apache-2.0. Libcomlair ne doit donc pas figer une version contenant cette dépendance sans audit complet.

### Pocket-TTS / Kyutai

- Fonction : synthèse vocale locale légère, avec support du français dans les modèles publiés.
- Licence du code : MIT.
- Licence affichée pour les poids du modèle : CC BY 4.0.
- Statut Libcomlair : candidat à tester, pas encore approuvé pour intégration finale.
- Conditions : attribution obligatoire ; vérifier précisément les conditions de redistribution des poids et les conditions d'usage du dépôt/modèle avant intégration.
- Les modèles étant distribués avec des conditions d'accès/usage, ne pas les embarquer avant validation documentaire complète.

### Piper historique

- Fonction : TTS local.
- Licence du code historique : MIT.
- Statut Libcomlair : ne pas choisir comme base finale pour le moment.
- Raisons : dépôt historique archivé ; les chaînes Piper/eSpeak-NG peuvent introduire des contraintes GPL ; les licences des voix varient selon les modèles et doivent être contrôlées une par une.

### Lexique 4

- Fonction : lexique français / données phonologiques.
- Licence annoncée : CC BY-SA 4.0.
- Statut Libcomlair : utilisable comme source étudiée, mais à maintenir séparée des données Libcomlair.
- Conditions : attribution, indication des modifications et respect des obligations ShareAlike pour les adaptations couvertes.
- Le dictionnaire propre à Libcomlair doit rester identifiable séparément afin de faciliter la conformité et les mises à jour.

## Solution juridiquement la plus robuste à long terme

La cible la plus sûre est une chaîne dans laquelle Libcomlair contrôle le maximum d'éléments :

- phrases fixes enregistrées spécifiquement pour Libcomlair ;
- consentement écrit et licence claire pour toute voix humaine enregistrée ;
- dictionnaire Libcomlair propre pour les noms propres, transports, rues, lieux et corrections de prononciation ;
- moteur local sous licence permissive ;
- modèle vocal dont la redistribution est explicitement autorisée, ou modèle construit/entraîné pour Libcomlair avec des données dont les droits sont maîtrisés ;
- fichier THIRD-PARTY-NOTICES et copies des licences distribuées avec l'application.

## Registre obligatoire avant intégration

Pour chaque composant vocal, conserver :

- nom ;
- version exacte ;
- URL/source officielle ;
- licence du code ;
- licence des données/modèles ;
- propriétaire/auteur ;
- autorisation de redistribution ;
- attribution requise ;
- modifications effectuées ;
- fichiers Libcomlair concernés ;
- date de vérification ;
- statut : `a-etudier`, `prototype-seulement`, `approuve`, `refuse`.

## Critère d'indépendance complète

L'indépendance vocale est atteinte uniquement lorsqu'un test sans accès à Render et sans service vocal distant permet encore :

- de lire les pages et boutons essentiels ;
- de lire les catégories, critères et aides ;
- de lire les résultats dynamiques ;
- de prononcer les nouveaux noms de lieux et adresses ;
- de lire les messages d'erreur et de diagnostic ;
- de fonctionner après redémarrage de l'application sans téléchargement obligatoire.

## Principe de prudence

Ce document sert de registre technique et de conformité interne. Avant une distribution publique importante ou commerciale, les obligations particulières des licences retenues doivent être revérifiées dans leur texte officiel à la version exacte utilisée.
