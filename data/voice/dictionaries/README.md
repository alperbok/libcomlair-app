# Dictionnaires Libcomlair

Ce dossier accueillera les dictionnaires locaux utilisés par la voix, le microphone et la recherche.

## Structure

- `<locale>/common.json` : noms communs et vocabulaire courant ;
- `<locale>/accessibility.json` : vocabulaire d’accessibilité ;
- `<locale>/<country>/places.json` : villes, régions, quartiers ;
- `<locale>/<country>/streets.json` : voies et toponymes ;
- `<locale>/<country>/transport.json` : gares, stations, arrêts, lignes, destinations ;
- `<locale>/<country>/organizations.json` : établissements, opérateurs, administrations, marques ;
- `<locale>/<country>/proper-person.json` : noms de personnes seulement lorsqu’ils sont réellement nécessaires au produit.

## Format d’entrée recommandé

```json
{
  "display": "München",
  "language": "de",
  "country": "DE",
  "type": "places",
  "tts": {
    "de-DE": "München",
    "fr-FR": "Munich"
  },
  "aliases": ["Munich"],
  "microSynonyms": [],
  "source": "",
  "license": "",
  "confidence": "verified"
}
```

La forme affichée officielle et la forme prononcée sont séparées. Une aide de prononciation ne doit pas renommer la donnée à l’écran.

## Licences

Tout dictionnaire tiers doit être audité avant intégration : provenance, licence, attribution éventuelle, droit de modification et droit de redistribution hors ligne.

## Activation

La présence d’un fichier dans ce dossier ne l’active pas automatiquement. Les packs restent derrière les drapeaux expérimentaux jusqu’aux tests voix, micro, recherche et hors ligne.
