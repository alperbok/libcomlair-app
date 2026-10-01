# Libcomlair — registre des composants vocaux

Date de création : 2026-10-01

Ce registre complète `docs/voice-independence-legal-plan.md`.

## Règle

Aucun composant n’est `approuve` tant que son code, son modèle, ses données, ses droits de redistribution et ses obligations d’attribution n’ont pas tous été vérifiés.

## Statuts

- `a-etudier` : piste identifiée, audit incomplet ;
- `prototype-seulement` : utilisable pour essai, pas pour diffusion finale ;
- `approuve` : audit terminé et intégration autorisée ;
- `refuse` : incompatible ou trop risqué pour la cible Libcomlair.

## Registre

| Composant | Fonction | Licence code | Licence modèle/données | Redistribution | Android hors ligne | Statut | Points à vérifier |
|---|---|---|---|---|---|---|---|
| Render TTS actuel | TTS distant | service externe | service externe | non pertinent pour embarquement local | non | transition | date butoir, disponibilité, remplacement |
| Bibliothèque audio Libcomlair | lecture locale d’audios déjà générés | code Libcomlair | audios à tracer selon origine | locale | oui | en cours | politique de taille, export, purge, sauvegarde |
| Audios fixes Libcomlair | messages stables | code Libcomlair | voix humaine / droits Libcomlair à documenter | à organiser | oui | a-construire | consentement, licence de voix, format, version |
| Dictionnaire Libcomlair | corrections et noms propres | code/données Libcomlair | données propres | oui si données maîtrisées | oui | a-construire | schéma, provenance, corrections |
| Lexique 4 | lexique français / phonologie | n/a | CC BY-SA 4.0 annoncée | sous conditions | oui comme données | a-etudier | attribution, séparation des adaptations, version exacte |
| Sherpa-ONNX | moteur local TTS/ASR | Apache-2.0 annoncée | dépend du modèle | à vérifier modèle par modèle | oui | a-etudier | chaîne exacte, dépendances, licence du modèle français |
| Pocket-TTS / Kyutai | TTS local | MIT annoncée | CC BY 4.0 annoncée pour poids examinés | sous conditions | à tester | a-etudier | conditions d’accès, redistribution des poids, performance Android |
| Piper historique | TTS local | MIT historique | varie selon voix | variable | oui selon version | prototype-seulement | dépôt archivé, dépendances phonémisation, licences voix |
| eSpeak-NG | phonémisation / TTS | GPL | données associées à vérifier | obligations GPL | oui | a-etudier | compatibilité avec architecture finale |
| Vosk | reconnaissance vocale | Apache-2.0 annoncée | modèles à vérifier séparément | à vérifier modèle par modèle | oui | a-etudier | licence du modèle français, taille, précision Samsung |

## Fiche obligatoire avant passage à `approuve`

Pour chaque composant :

- nom exact ;
- version / commit ;
- source officielle ;
- licence du code ;
- licence du modèle ;
- licence des données ;
- auteur / propriétaire ;
- droit de redistribution ;
- attribution requise ;
- obligations de partage du code ou des données ;
- dépendances transitives ;
- fichiers intégrés à Libcomlair ;
- taille ;
- fonctionnement Android hors ligne ;
- résultat des tests Samsung ;
- date de vérification ;
- décision et motif.

## Principe de prudence

Une licence permissive du moteur ne garantit jamais que le modèle de voix chargé possède la même licence. Le moteur, le modèle, le dictionnaire et les éventuelles données d’entraînement sont toujours audités séparément.
