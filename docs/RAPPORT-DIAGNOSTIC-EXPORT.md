# Libcomlair — rapport de diagnostic exportable

Date de création : 2026-10-01

## Objectif

Permettre de comprendre une panne rapidement sans demander une longue série de captures d’écran ni exposer inutilement des données personnelles.

Le rapport doit être lisible par une personne et exploitable par les outils de diagnostic.

## Contenu prévu

### Informations générales

- version de Libcomlair ;
- date/heure du rapport ;
- version du schéma de diagnostic ;
- mode normal ou mode sûr ;
- page/contexte actif ;
- état réseau : connecté / hors connexion ;
- espace de stockage disponible lorsque l’API le permet.

### État des modules

Pour chaque module :

- `moduleId` ;
- version ;
- état `ok / degrade / erreur / non-teste` ;
- dernier test réussi ;
- dernière erreur technique ;
- dépendances ;
- mode de secours actif ;
- feature flag associé lorsque pertinent.

### Informations ciblées utiles

- moteur vocal sélectionné ;
- disponibilité de la bibliothèque audio locale ;
- disponibilité du dictionnaire ;
- état du microphone et de la reconnaissance ;
- état GPS ;
- versions des bases locales ;
- compteurs de données sans exporter le contenu des données ;
- dernière réparation appliquée ;
- dernier parcours de référence exécuté et résultat.

## Données à ne pas exporter par défaut

- nom ou identité d’un utilisateur ;
- adresse personnelle ;
- position GPS précise ;
- contenu d’une dictée ou d’un enregistrement ;
- commentaires/contributions utilisateur ;
- jetons, clés API, cookies ou secrets ;
- contenu intégral de localStorage/IndexedDB ;
- URL contenant un jeton ou identifiant sensible.

Une information sensible nécessaire à un diagnostic doit être remplacée par un état, un compteur, un type ou une valeur masquée.

## Format

Format cible : JSON UTF-8, avec éventuellement une vue texte simplifiée pour l’utilisateur.

Le schéma initial de référence est :

`diagnostics/diagnostic-report-schema-v1.json`

## Fonctionnement futur

Dans le menu Diagnostic :

1. bouton « Créer le rapport de diagnostic » ;
2. aperçu des catégories incluses ;
3. contrôle automatique de confidentialité ;
4. génération locale ;
5. possibilité de partager volontairement le fichier pour assistance.

Aucun envoi automatique du rapport n’est prévu.

## Règle de dépannage

Le rapport ne remplace pas la validation réelle sur téléphone. Il sert à identifier plus vite le module propriétaire et la chaîne qui échoue.

## Statut

Structure définie. Export runtime non activé tant que le collecteur central de `status()` des modules n’est pas suffisamment en place.