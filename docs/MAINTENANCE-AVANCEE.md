# Libcomlair — Maintenance avancée réservée au développement

Date de création : 2026-10-01

## Objectif

Séparer clairement les outils destinés aux utilisateurs des outils de développement et de maintenance interne.

## Principe

Le menu utilisateur ne doit afficher que les fonctions sûres et utiles au quotidien : aide, état, tests essentiels, diagnostic et réparation autorisée.

La rubrique **Maintenance avancée** est masquée par défaut et n'est visible que lorsqu'un mode développeur est activé pour la session de l'onglet.

## Activation actuelle

Le module propriétaire est `libcomlair-v224-technical-menu-access-v1.js`.

Pour les tests, le paramètre `libcomlair-dev=1` active le mode développeur pour l'onglet courant puis est retiré de l'URL. Le bouton « Quitter la maintenance avancée » désactive immédiatement ce mode pour la session.

Cette méthode est une séparation d'interface destinée à éviter les manipulations accidentelles. **Elle n'est pas une authentification de sécurité forte.** Comme l'application actuelle est distribuée côté client, aucun secret ou pouvoir administratif dangereux ne doit dépendre de ce mécanisme.

Avant d'ajouter des actions sensibles (gestion de comptes, données personnelles, suppression distante, clés, administration serveur), une authentification et des autorisations serveur réelles seront obligatoires.

## Outils actuellement autorisés

La maintenance avancée v1 reste non destructive :

- lecture des feature flags de référence ;
- création d'un rapport technique local ;
- affichage de l'état de développement ;
- fermeture du mode développeur.

Le rapport technique n'inclut pas volontairement :

- position GPS précise ;
- dictées ou textes personnels ;
- contenu audio ;
- secrets ou clés ;
- contenu brut du stockage local.

## Outils futurs prévus

Après validation séparée :

- tableau de santé des modules ;
- matrice de dépendances ;
- tests de panne volontaire ;
- migrations de schéma ;
- contrôle du stockage ;
- licences et provenance ;
- retour arrière vers une version stable ;
- tests de restauration.

## Règle de sécurité

Une fonction avancée ne peut être ajoutée que si :

1. son module propriétaire est identifié ;
2. son effet est documenté ;
3. les données utilisateur à préserver sont connues ;
4. un diagnostic confirme son résultat ;
5. un mode de secours existe lorsque nécessaire ;
6. une action destructive demande une confirmation explicite ;
7. une action réellement privilégiée possède une authentification adaptée et ne repose pas sur un simple masquage côté client.

## Validation

Toute modification du menu technique doit vérifier :

- mode utilisateur : Maintenance avancée invisible ;
- mode développeur : Maintenance avancée visible ;
- fermeture du mode : rubrique de nouveau invisible ;
- Diagnostic et Réparation utilisateur toujours accessibles ;
- fonctionnement vocal du menu ;
- validation sur téléphone réel avant classement comme stable.
