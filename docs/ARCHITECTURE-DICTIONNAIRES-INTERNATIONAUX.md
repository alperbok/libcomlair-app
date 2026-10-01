# Libcomlair — architecture des dictionnaires internationaux

Date : 2026-10-01

## Objectif

Construire une couche lexicale commune au TTS, au microphone, aux recherches et aux traductions afin que Libcomlair puisse prononcer et reconnaître correctement les mots courants et les noms propres dans plusieurs langues et pays.

## Principe : langue ≠ pays

Un dictionnaire est sélectionné selon au moins deux dimensions :
- `locale` : langue utilisée par l’utilisateur ;
- `country` : territoire auquel un nom propre ou une donnée est rattaché.

Exemple : un utilisateur en français recherchant `München` en Allemagne doit conserver le nom officiel du lieu, mais le moteur français peut avoir besoin d’une prononciation adaptée.

## Familles de dictionnaires

Les ressources sont séparées pour éviter un fichier unique impossible à maintenir :

1. `common` — noms communs, verbes, adjectifs et vocabulaire courant ;
2. `accessibility` — fauteuil roulant, boucle magnétique, rampe, ascenseur, braille, etc. ;
3. `proper-person` — noms de personnes lorsque nécessaires ;
4. `places` — villes, régions, quartiers et pays ;
5. `streets` — voies, places, avenues et toponymes ;
6. `transport` — gares, stations, arrêts, lignes et destinations ;
7. `organizations` — établissements, opérateurs, administrations et marques ;
8. `overrides` — corrections Libcomlair prioritaires.

## Une entrée n’est pas seulement un mot

Une entrée peut contenir :
- forme écrite officielle ;
- variantes orthographiques ;
- langue d’origine ;
- territoire ;
- catégorie ;
- prononciation phonétique si disponible ;
- forme destinée au TTS si une transcription simple suffit ;
- synonymes micro ;
- aliases de recherche ;
- provenance ;
- licence ;
- niveau de confiance ;
- date de mise à jour.

## Prononciation selon la langue de l’utilisateur

Le nom écrit ne doit pas être modifié pour faciliter la voix.

Exemple conceptuel :
- `display`: `München`
- `originLocale`: `de-DE`
- prononciation possible pour `de-DE`
- prononciation possible pour `fr-FR`

Ainsi la fiche conserve le vrai nom tandis que chaque moteur vocal reçoit une forme adaptée.

## Reconnaissance micro

Les dictionnaires servent également à la reconnaissance des variantes prononcées. Un nom propre peut donc avoir plusieurs synonymes ou formes approximatives sans modifier son identifiant interne.

Les commandes métier restent des intentions universelles : le dictionnaire aide à reconnaître les paramètres de la commande, pas à coder la logique métier en français.

## Sources et licences

Chaque ressource tierce doit déclarer sa provenance et sa licence. Les dictionnaires libres de noms communs, bases géographiques, données de transport et listes de noms propres sont audités séparément.

Aucune ressource ne doit être copiée dans un pack Libcomlair tant que son droit de redistribution n’est pas vérifié.

## Packs et téléchargement

Organisation cible :

`data/voice/dictionaries/<locale>/common.json`
`data/voice/dictionaries/<locale>/accessibility.json`
`data/voice/dictionaries/<locale>/<country>/places.json`
`data/voice/dictionaries/<locale>/<country>/streets.json`
`data/voice/dictionaries/<locale>/<country>/transport.json`
`data/voice/dictionaries/<locale>/<country>/organizations.json`

Les gros dictionnaires pourront être téléchargés par pack afin de ne pas alourdir l’application de base.

## Priorité de résolution

1. correction locale Libcomlair (`overrides`) ;
2. dictionnaire spécialisé du pays ;
3. dictionnaire commun de la langue ;
4. prononciation native du moteur TTS ;
5. signalement dans le diagnostic si le résultat reste inconnu.

## Couverture mesurable

Le diagnostic doit pouvoir afficher, par locale et pays :
- dictionnaire commun disponible ;
- vocabulaire accessibilité disponible ;
- noms de lieux disponibles ;
- transports disponibles ;
- nombre de corrections locales ;
- licence vérifiée ou non ;
- pack hors ligne présent ou absent.

## Déploiement

Phase 1 : français/France et registre des packs.

Phase 2 : intégrer une ressource de noms communs légalement vérifiée et le vocabulaire accessibilité.

Phase 3 : noms propres français : communes, rues et transports utiles aux données déjà intégrées.

Phase 4 : créer les mêmes catégories pour anglais, espagnol, allemand, italien et portugais.

Phase 5 : ajouter des pays/continents au fur et à mesure de leurs adaptateurs de données.

## Règle de sécurité

Un pack de dictionnaire peut être ajouté sans activer automatiquement son utilisation. L’activation runtime reste derrière un drapeau et nécessite des tests TTS, micro et recherche.
