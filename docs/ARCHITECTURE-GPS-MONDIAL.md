# Libcomlair — architecture GPS mondial

Date : 2026-10-01

## Objectif

Préparer une géolocalisation utilisable dans n’importe quel pays sans lier Libcomlair à un fournisseur de carte, un pays, une langue ou un constructeur Android.

Cette architecture est préparatoire : elle ne doit pas activer un nouveau suivi GPS tant que le module Android réel, les permissions, le diagnostic et les tests physiques ne sont pas validés.

## Séparations obligatoires

Libcomlair traite séparément :
- la langue de l’utilisateur ;
- le pays de recherche choisi ;
- la position GPS courante ;
- le pays éventuellement déduit de cette position ;
- la juridiction juridique applicable ;
- le profil d’accessibilité.

Une position GPS dans un pays ne doit jamais modifier automatiquement la langue, le profil ou le pays de recherche. Elle peut seulement proposer une action à l’utilisateur.

## Coordonnées internes

Le format interne de référence est latitude/longitude WGS84.

Chaque position doit conserver au minimum :
- latitude ;
- longitude ;
- précision estimée en mètres ;
- date/heure de mesure ;
- source ;
- niveau de précision demandé/accordé ;
- état courant ou périmé.

Le schéma machine est `data/geography/location-fix-schema-v1.json`.

## Permissions Android

Règles de conception :
- demander la localisation au moment où une fonction en a besoin ;
- accepter une position approximative lorsqu’elle suffit ;
- ne demander une position précise que lorsqu’elle apporte une valeur réelle, par exemple identifier une entrée accessible ;
- localisation au premier plan par défaut ;
- localisation en arrière-plan désactivée par défaut et non demandée sans fonction démontrant sa nécessité ;
- refus de permission = mode manuel disponible, jamais blocage de l’application.

Références Android à revérifier au moment de l’intégration native :
- https://developer.android.com/develop/sensors-and-location/location/permissions
- https://developer.android.com/develop/sensors-and-location/location/permissions/runtime
- https://developer.android.com/develop/sensors-and-location/location/permissions/background

## Pas d’historique implicite

La position courante n’est pas un journal de déplacements.

Par défaut :
- pas d’historique permanent des positions ;
- pas de synchronisation distante de la position courante ;
- pas de télémétrie GPS obligatoire ;
- pas de déduction de handicap depuis les déplacements ;
- une position ancienne doit être marquée périmée et ne pas être présentée comme actuelle.

Si une future fonction nécessite un historique, elle devra avoir son propre module, son propre consentement/choix utilisateur, sa durée de conservation et sa revue juridique.

## Architecture fournisseur

Le GPS du téléphone ne doit pas dépendre du fournisseur de carte.

Séparer :
1. **position appareil** — coordonnées et précision ;
2. **géocodage inverse** — coordonnées vers adresse/pays ;
3. **carte** — affichage ;
4. **recherche de lieux** — POI ;
5. **calcul d’itinéraire** — route ;
6. **transport** — opérateurs/données locales ;
7. **données d’accessibilité** — modèle Libcomlair.

Chaque fournisseur externe reste derrière un adaptateur et peut être remplacé sans changer la position interne.

## Passage de frontière

Un parcours peut traverser plusieurs pays. Le moteur devra pouvoir :
- conserver la même position WGS84 ;
- changer d’adaptateur de données lorsque nécessaire ;
- conserver la langue et le passeport utilisateur ;
- appliquer les formats locaux à l’affichage seulement ;
- charger plusieurs packs pays pendant un même trajet ;
- ne jamais interrompre le parcours uniquement parce qu’une frontière est franchie.

## Mode hors ligne et Voyage

Le futur mode Voyage pourra télécharger une zone contenant, selon les droits disponibles :
- données cartographiques ;
- lieux/accessibilité ;
- transports ;
- dictionnaires/noms propres ;
- informations nécessaires à un itinéraire dégradé.

Le droit de mise en cache ou de redistribution doit être vérifié ressource par ressource avant inclusion hors ligne.

## Qualité et sécurité de la position

Une position doit exposer sa qualité. Si la précision est insuffisante, Libcomlair doit dire « position approximative » plutôt que présenter une entrée ou un quai comme certain.

Un résultat calculé depuis une position périmée doit être signalé ou recalculé.

## Diagnostic futur

Le module GPS devra exposer au minimum :
- disponible/non disponible ;
- permission refusée/approximative/précise ;
- premier plan/arrière-plan ;
- précision en mètres ;
- âge de la dernière mesure ;
- source de la position ;
- géocodage disponible ou non ;
- fournisseur carte/itinéraire séparé ;
- mode hors ligne disponible ou non ;
- dernière erreur.

## Tests obligatoires avant activation

- autorisation refusée + saisie manuelle ;
- position approximative ;
- position précise ;
- perte du réseau ;
- position périmée ;
- changement de pays ;
- frontière pendant un trajet ;
- fournisseur de carte indisponible sans perte de la position ;
- fournisseur de géocodage indisponible ;
- application Android réelle sur plusieurs appareils lorsque possible ;
- aucune conservation GPS non prévue après fermeture/redémarrage.

## Principe final

**Le GPS donne une position. Il ne choisit ni la langue, ni le pays de recherche, ni le profil d’accessibilité, ni la juridiction juridique de Libcomlair.**
