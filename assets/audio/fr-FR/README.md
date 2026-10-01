# Libcomlair — audio empaqueté fr-FR

Ce dossier est le chemin canonique des audios fixes français empaquetés.

## État actuel

Aucun fichier WAV n'est encore approuvé comme voix officielle.

Le générateur de référence est :

`scripts/generate-fixed-voice-pack-pocket-tts.py`

La provenance moteur / modèle / voix est enregistrée dans :

`data/voice/libcomlair-fixed-voice-source-v1.json`

Le manifeste runtime reste :

`data/voice/libcomlair-fixed-audio.json`

## Noms de fichiers réservés

- `welcome-main.wav`
- `nav-next.wav`
- `nav-back.wav`
- `presentation-main.wav`
- `diagnostic-open.wav`
- `repair-start.wav`
- `micro-confirmation.wav`

## Promotion

Un fichier ne peut être relié au manifeste avec `status: ready` qu'après :

1. génération avec la version épinglée du moteur ;
2. contrôle WAV et empreinte SHA-256 ;
3. écoute humaine ;
4. validation sur smartphone Android réel ;
5. validation de la voix comme suffisamment naturelle et compréhensible ;
6. confirmation que la provenance et les droits sont toujours valides.

Le générateur n'édite jamais automatiquement le manifeste runtime.
