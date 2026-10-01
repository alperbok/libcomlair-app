# Libcomlair — architecture photos

Date : 2026-10-01

## Objectif

Préparer une gestion des photos compatible avec les fiches de lieux, les contributions, l’accessibilité, le mode hors ligne et l’internationalisation, sans rendre la photo obligatoire.

## Principe d’accessibilité

Une photo n’est jamais obligatoire pour utiliser Libcomlair ni pour contribuer. Un utilisateur malvoyant doit pouvoir décrire vocalement une situation sans prendre de photo.

Chaque photo utile doit pouvoir recevoir une description textuelle et vocale. La photo complète une information d’accessibilité mais ne doit pas être l’unique preuve lorsqu’une donnée structurée peut être saisie.

## Usages prévus

- photo générale d’un lieu ;
- entrée et seuil ;
- rampe, ascenseur ou escalier ;
- toilettes adaptées ;
- stationnement PMR ;
- signalétique, braille, boucle magnétique ou autre équipement ;
- arrêt, quai, véhicule ou accès transport ;
- signalement temporaire : travaux, ascenseur indisponible, accès obstrué ;
- contribution utilisateur destinée à confirmer ou corriger une fiche.

## Modèle de données

Chaque photo doit être reliée par identifiant à un lieu ou une contribution, jamais uniquement par son nom affiché.

Métadonnées minimales :
- identifiant photo ;
- identifiant du lieu ou de la contribution ;
- type d’usage ;
- date de création ;
- source ;
- statut des droits ;
- statut de modération ;
- descriptions alternatives par langue ;
- critères d’accessibilité documentés ;
- état temporaire ou permanent ;
- informations de synchronisation hors ligne.

Le schéma machine de référence est `data/media/photo-record-schema-v1.json`.

## Confidentialité par défaut

Avant synchronisation ou publication :
- supprimer les métadonnées EXIF non nécessaires, notamment la position GPS précise ;
- ne jamais publier automatiquement une position différente de celle du lieu auquel la photo est reliée ;
- prévoir un contrôle ou floutage des visages et plaques lorsqu’ils ne sont pas nécessaires ;
- ne pas déduire le handicap, l’identité ou une information personnelle d’une personne visible ;
- permettre la suppression d’une photo par son auteur lorsque les règles de conservation le permettent.

## Droits et provenance

Une photo doit avoir une provenance explicite : `user`, `venue`, `official-source`, `open-data` ou autre source auditée.

Aucune image provenant du Web ne doit être intégrée au catalogue sans droit de réutilisation documenté. Pour les contributions utilisateurs, l’application devra présenter les conditions de publication avant l’envoi.

## Fonctionnement hors ligne

Une contribution photo peut être mise en file locale avec :
- fichier local ;
- miniature locale ;
- métadonnées ;
- description dictée ou saisie ;
- statut `pending-sync`.

La synchronisation ne doit jamais bloquer la navigation. Une contribution non synchronisée doit rester visible comme telle pour son auteur.

## Internationalisation

Les descriptions alternatives sont séparées par locale. La photo elle-même reste la même.

Exemple : une photo d’entrée en Espagne peut être décrite en français pour un utilisateur francophone et en espagnol pour un autre utilisateur.

## Signalements temporaires

Une photo documentant une situation temporaire peut recevoir `expiresAt`. Après cette date, elle n’est pas supprimée automatiquement mais cesse d’être utilisée comme preuve actuelle tant qu’elle n’est pas reconfirmée.

## Diagnostic

Le futur module photo devra exposer au minimum :
- capacité appareil photo disponible ;
- accès fichier disponible ;
- stockage local disponible ;
- nombre d’éléments en attente de synchronisation ;
- erreurs de compression ou stockage ;
- contrôle EXIF exécuté ou non.

## Validation avant activation

- prise de photo sur smartphone Android réel ;
- import depuis galerie ;
- contribution sans photo ;
- description vocale ;
- stockage hors ligne ;
- suppression EXIF ;
- reprise après fermeture de l’application ;
- synchronisation ultérieure ;
- affichage de la description alternative dans le profil Vision ;
- avant diffusion stable large, contrôle sur au moins un second appareil Android d’un constructeur différent lorsque possible.

Le Samsung utilisé aujourd’hui reste l’appareil de référence de développement, mais il ne définit pas à lui seul la compatibilité Android.
