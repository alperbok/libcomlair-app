# Libcomlair — Commandes vocales courtes et contextuelles

## Principe

Libcomlair privilégie des mots courts, simples et faciles à reconnaître lorsque le contexte permet de savoir sans ambiguïté quelle action est demandée.

Règle d’interface : lorsque c’est possible, le mot court utilisé par le micro doit aussi être visible sur le bouton ou la case correspondante.

Règle de compatibilité : les anciennes formulations longues restent reconnues comme synonymes de secours afin de ne pas casser les habitudes acquises.

## Vocabulaire prioritaire

- `Valider` : confirmer un choix ou une étape.
- `Suivant` : passer à l’écran suivant lorsqu’une seule action suivante existe.
- `Continuer` : poursuivre lorsqu’il n’y a qu’une seule poursuite possible.
- `Retour` : revenir à l’écran logique précédent.
- `Précédent` : synonyme possible de Retour lorsque pertinent.
- `Lire` : lancer la seule lecture proposée sur l’écran.
- `Ouvrir` : ouvrir l’unique panneau ou contenu concerné lorsque le contexte est sans ambiguïté.
- `Fermer` : fermer l’unique panneau ouvert concerné.
- `Rechercher` : lancer l’unique action principale de recherche.
- `Annuler` : annuler l’action en cours.
- `Recommencer` : recommencer l’étape active.
- `Réglages` : ouvrir le menu Assistance et réglages à tout moment où il est disponible.

## Sécurité contextuelle

Un mot court ne doit être ajouté automatiquement que s’il désigne une seule action visible dans le contexte actif.

Exemple :
- si une page ne contient qu’un seul bouton de retour, `Retour` peut le déclencher ;
- si deux retours différents sont visibles, le micro doit demander un libellé plus précis au lieu de choisir au hasard.

Le routeur micro contextuel applique cette règle avant de déclencher une action.

## Profil d’accessibilité

Libellés simplifiés retenus :
- `Valider` à la place de `Utiliser mes choix` ;
- `Sans adaptation` à la place de `Continuer sans adaptation particulière`.

Synonymes conservés :
- `Valider`, `Confirmer`, `Mes choix`, `Utiliser mes choix` ;
- `Sans adaptation`, `Aucune adaptation`, `Continuer sans adaptation`, `Continuer`.

## Écran suivant

Libellé simplifié retenu :
- `Retour au profil` à la place de `Modifier mon profil d’accessibilité`.

Commandes reconnues :
- `Retour` ;
- `Retour profil` ;
- `Profil` ;
- ancienne formulation `Modifier mon profil d’accessibilité` en secours.

## Règle pour toutes les pages futures

Lors de la création ou de la modification d’un écran :
1. recenser les actions réellement visibles ;
2. chercher un mot court naturel pour chaque action importante ;
3. n’utiliser un mot générique que s’il est non ambigu sur cet écran ;
4. afficher autant que possible ce même mot à l’écran ;
5. conserver les anciennes formulations comme synonymes ;
6. faire confirmer vocalement l’action exécutée ;
7. vérifier avec le Diagnostic que le routeur contextuel chargé est la bonne version.

Cette règle s’applique aux boutons, cases, menus, tutoriels, formulaires, pages de résultats et fiches détaillées.