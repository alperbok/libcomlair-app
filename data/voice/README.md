# Libcomlair — données vocales locales

Ce dossier est réservé aux données vocales propres à Libcomlair et aux références de prononciation dont la licence permet l’intégration.

## Objectifs

- conserver les corrections de prononciation Libcomlair ;
- recenser les noms propres rencontrés ;
- recenser les noms de rues, villes, gares, arrêts et lieux ;
- conserver la provenance et la licence des ressources tierces ;
- préparer la lecture hors ligne ;
- ne pas mélanger les données propres à Libcomlair avec les lexiques tiers soumis à des licences spécifiques.

## Fichiers prévus

- `libcomlair-pronunciation-overrides.json` : dictionnaire propre à Libcomlair ;
- futurs manifests de packs vocaux ;
- futurs index des audios fixes ;
- références vers les licences correspondantes.

## Règle juridique

Aucun dictionnaire tiers complet, modèle vocal ou fichier audio externe ne doit être copié ici avant validation de sa licence et de son droit de redistribution selon `docs/voice-independence-legal-plan.md` et `docs/REGISTRE-COMPOSANTS-VOCAUX.md`.

## Séparation des données

Les entrées propres à Libcomlair doivent rester identifiables séparément des ressources telles que Lexique 4 ou d’autres dictionnaires. Une importation tierce doit conserver sa source, sa version, sa licence et ses conditions.

## Format des corrections

Chaque entrée peut contenir :

- `text` : forme affichée ;
- `type` : nom commun, ville, rue, transport, commerce, acronyme, autre ;
- `language` : langue principale ;
- `pronunciation` : représentation de prononciation validée ;
- `pronunciationScheme` : système utilisé, par exemple IPA ou règle interne ;
- `audioId` : identifiant d’un audio local si disponible ;
- `source` : origine de l’information ;
- `license` : licence si l’entrée provient d’une source tierce ;
- `verified` : validation humaine ;
- `notes` : remarque utile ;
- `updatedAt` : date de dernière modification.

Le dictionnaire doit être versionné afin que le Diagnostic et les mises à jour sachent exactement quelle base est installée.
