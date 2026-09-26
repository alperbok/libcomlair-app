# Libcomlair — Règles de diagnostic et réparation du micro

## Objectif

Éviter les régressions où l'utilisateur doit répéter plusieurs fois une commande longue alors qu'une commande courte et contextuelle pourrait déclencher la même action.

## Principe d'accessibilité

Pour chaque action importante visible sur la page :

1. préférer un libellé court à l'écran lorsque cela reste compréhensible ;
2. reconnaître en priorité le même mot court au micro ;
3. conserver les anciennes formulations longues comme synonymes de secours ;
4. n'utiliser une commande très courte que si elle ne peut désigner qu'une seule action visible dans le contexte courant ;
5. confirmer vocalement l'action réellement exécutée.

Exemples validés comme direction :

- `Valider` pour confirmer les choix du profil ;
- `Sans adaptation` pour continuer sans profil particulier ;
- `Retour au profil` à l'écran, avec `Retour` ou `Retour profil` au micro ;
- `Suivant`, `Précédent`, `Retour`, `Ouvrir`, `Fermer`, `Lire`, `Valider`, `Réglages` lorsque le contexte rend le mot non ambigu.

## Symptôme à reconnaître

La panne peut se manifester ainsi :

- il faut répéter plusieurs fois une phrase ;
- le bouton fonctionne au toucher mais la formulation vocale est difficile à reconnaître ;
- le micro comprend une partie de la phrase mais ne déclenche pas l'action ;
- une commande courte déclenche parfois la mauvaise action ;
- après une mise à jour, une ancienne formulation fonctionne mais la nouvelle commande courte ne fonctionne plus.

## Diagnostic à effectuer

Avant toute modification :

1. identifier l'écran réellement actif ;
2. recenser les boutons, cases, radios, listes et tutoriels réellement visibles ;
3. vérifier que chaque action importante possède au moins une formulation vocale simple ;
4. vérifier que la formulation courte n'est pas partagée par deux actions visibles ;
5. vérifier que le routeur micro contextuel chargé est la bonne version ;
6. vérifier le cache navigateur et la version `?v=` du script ;
7. vérifier que le texte affiché et la commande vocale principale restent cohérents ;
8. vérifier que les anciennes formulations sont toujours disponibles comme alias de secours.

## Réparation sûre

Une réparation du micro fondée sur cette règle peut :

- restaurer les alias vocaux courts attendus ;
- rétablir la version correcte du routeur après un problème de cache ;
- réappliquer les métadonnées vocales d'un contrôle ;
- retirer un alias court devenu ambigu sur la page active ;
- conserver les anciennes formulations longues comme synonymes ;
- relancer le diagnostic vocal après réparation.

Elle ne doit jamais :

- effacer le profil d'accessibilité ;
- supprimer favoris, avis, propositions ou signalements ;
- modifier les données de lieux ;
- déclencher automatiquement une action utilisateur ;
- attribuer un mot court à plusieurs actions concurrentes ;
- supprimer une ancienne commande qui fonctionnait sans validation utilisateur.

## Validation après réparation

Une réparation n'est considérée comme validée que lorsque :

1. le mot court visible à l'écran déclenche la bonne action au micro ;
2. l'ancienne formulation reste reconnue ;
3. aucune autre action de la page ne se déclenche avec le même mot court ;
4. la confirmation vocale correspond à l'action exécutée ;
5. un écran voisin est également testé pour vérifier qu'aucune commande n'a été détournée.

## Règle anti-régression

Le micro doit rester contextuel : **un mot court n'est universel que lorsque son sens est sûr dans le contexte courant**.

Exemple : `Retour` peut être universel comme intention, mais sa destination dépend toujours de la page active. `Valider` ne doit être utilisé seul que s'il existe une seule validation principale visible.

Cette règle doit être utilisée par le Diagnostic et la Réparation automatique comme référence lors des futures pannes de reconnaissance vocale.
