# Libcomlair — point de reprise du 27 septembre 2026

Ce fichier sert de point de reprise avant redémarrage du téléphone. Il complète les journaux de corrections et doit éviter de recommencer des étapes déjà comprises ou corrigées.

## Méthode de travail retenue

- Les acquis servent à ne pas recommencer les mêmes erreurs.
- Avant toute correction : vérifier les problèmes déjà rencontrés, leur cause, la réparation validée et les fichiers concernés.
- Ne jamais considérer une correction comme validée avant test réel sur téléphone.
- Distinguer : suspectée / confirmée / partiellement réparée / réparée et validée.
- Ne pas empiler des correctifs CSS si la cause structurelle n'est pas identifiée.
- Adapter le contenu au cadre de l'écran, jamais le cadre au contenu.
- Préserver les écrans et dimensions déjà approuvés sauf régression démontrée.
- Séparer les pannes de l'application des incidents d'environnement (GitHub, cache, navigateur, connecteur).

## Parcours logique retenu

1. Choix du profil / handicap
2. Mes besoins d'accessibilité
3. Navigation vocale
4. Comment fonctionne Libcomlair ?
5. Accueil / Recherche
6. Recherche / Catégories
7. Sous-catégories
8. Résultats et outils
9. Fiche détaillée
10. Contribution / avis / réglages selon le besoin

Le bouton Retour doit suivre ce même parcours à l'envers et ne doit pas faire réapparaître une étape qui a été sautée à l'aller.

## Règle centrale du mode Découverte guidée

### Profil Vision

Le mode Découverte guidée est un véritable tutoriel vocal. Il doit remplacer ce que l'utilisateur malvoyant ne peut pas voir et lui apprendre à utiliser Libcomlair.

Sur chaque page, l'assistance doit suivre cet ordre :

1. Dire où l'utilisateur se trouve.
2. Expliquer à quoi sert la page.
3. Décrire les informations visibles utiles.
4. Lire tous les choix, cases, boutons, champs et rubriques disponibles.
5. Dire ce qui est déjà sélectionné, coché ou ouvert.
6. Expliquer les commandes vocales possibles.
7. Proposer clairement la prochaine action : Valider, Suivant, Rechercher, Retour, etc.
8. Attendre la fin de la présentation avant de demander l'action suivante.

La visite guidée Vision doit être complète et pédagogique, pas seulement lire du texte.

### Autres profils

Mobilité, Audition, Compréhension/cognition et Assistance/accompagnement peuvent utiliser une version plus courte de Découverte guidée :

- nom et rôle de la page ;
- choix principaux ;
- commande ou action suivante ;
- détails supplémentaires uniquement sur demande.

### Mode Simplifié

Le mode Simplifié annonce seulement l'essentiel nécessaire pour utiliser la page.

## Page Mes besoins d'accessibilité

Cette étape doit être une vraie page et ne plus être sautée.

Organisation retenue : sous-dossiers par handicap :

- Mobilité
- Vision
- Audition
- Compréhension / cognition
- Assistance / accompagnement

Les dossiers correspondant aux handicaps choisis au départ doivent s'ouvrir automatiquement. Les autres restent disponibles sur demande. Chaque critère doit être utilisable au toucher et à la voix. La page se termine par Valider ou Retour.

## Navigation vocale

La voix doit expliquer qu'il existe deux choix :

- Découverte guidée : explique les pages, les choix, le fonctionnement et apprend à utiliser Libcomlair.
- Simplifié : annonce l'essentiel.

Elle doit annoncer le choix actuel, demander lequel choisir, puis proposer Valider ou Retour.

## Comment fonctionne Libcomlair ?

En mode Vision + Découverte, la lecture doit démarrer automatiquement à la première visite. Le bouton Lire n'est pas nécessaire comme action principale pendant cette première lecture. À la fin, la voix doit proposer clairement : Suivant ou Retour.

## Accueil / Recherche

La page doit être présentée complètement. La voix doit expliquer le rôle de Présentation Libcomlair, annoncer Rechercher et proposer Rechercher ou Retour.

## Recherche / Catégories

Le champ Rechercher un lieu ou une ville est actuellement facultatif tant que les résultats ne sont pas assez complets. En mode Vision, l'assistance doit malgré tout expliquer son rôle.

Elle doit lire toutes les catégories visibles. Lorsqu'une catégorie est dite au micro, elle doit être sélectionnée puis la voix doit proposer Valider pour l'ouvrir ou Retour.

## Micro et assistance vocale

Objectif retenu : tout élément visible et utilisable doit être connu du micro ; tout texte explicatif visible doit pouvoir être lu en Découverte guidée.

Le routeur doit couvrir notamment :

- boutons ;
- cases à cocher ;
- boutons radio ;
- listes ;
- liens ;
- accordéons / rubriques ;
- champs texte, recherche et zones de saisie ;
- contrôles accessibles par rôle ARIA ;
- dictée des champs après sélection vocale.

## En-tête commun

À partir de l'onboarding et sur les pages suivantes, le gabarit ☰ | logo | micro doit rester cohérent sur toutes les pages. Ne pas corriger cet en-tête page par page si une règle commune peut couvrir tous les écrans.

Le menu ☰ reste attaché à l'en-tête et défile avec le logo ; il ne doit pas être fixé au viewport.

## État actuel avant redémarrage

- La v7 est la page de test active : `test-v224-voice-contextual-v7.html`.
- Le parcours a été réordonné pour inclure Mes besoins d'accessibilité avant Navigation vocale.
- Une feuille dédiée aux sous-dossiers de besoins a été créée : `libcomlair-v224-needs-step.css`.
- La présentation automatique des premières visites en mode Vision a été ajoutée dans `libcomlair-v224-guided-presenter.js`.
- La couverture vocale complète est portée par `libcomlair-v224-voice-completeness.js` et le routeur `libcomlair-v224-voice-router.js`.
- La sélection vocale d'une catégorie doit demander ensuite Valider ou Retour.
- Les améliorations récentes sont installées mais doivent encore être testées page par page avant d'être classées réparées et validées.

## Prochaine reprise

Reprendre les tests dans cet ordre, sans sauter d'étape :

1. Choix du handicap Vision
2. Mes besoins d'accessibilité
3. Navigation vocale
4. Comment fonctionne Libcomlair ?
5. Accueil / Recherche
6. Recherche / Catégories
7. Sous-catégorie
8. Résultats
9. Fiche détaillée

À chaque page vérifier :

- présentation automatique correcte ;
- contenu complet annoncé ;
- tous les choix connus du micro ;
- commande choisie confirmée vocalement ;
- Retour / Suivant / Valider cohérents ;
- aucune régression d'un écran déjà validé.

Ne passer une page en « réparée et validée » qu'après confirmation sur le téléphone.