# Libcomlair — Matrice vocale par écran

> Document de référence pour l’évolution du micro et de l’assistance vocale.
> Objectif : tout ce qu’un utilisateur peut voir, toucher, choisir, cocher ou saisir doit avoir un équivalent vocal accessible.

## Deux niveaux d’assistance vocale

Libcomlair doit proposer deux modes complémentaires pour le profil Vision.

### 1. Mode découverte guidée

Destiné aux premières utilisations et réactivable à tout moment.

Sur chaque écran, l’assistance doit expliquer :
- le rôle de la page ;
- ce que l’utilisateur peut y faire ;
- toutes les cases cochables visibles ;
- l’état de chaque case : cochée ou non cochée ;
- tous les boutons et choix disponibles ;
- les conséquences principales de chaque action ;
- les commandes vocales utilisables sur cet écran ;
- comment revenir en arrière ;
- comment demander de l’aide ou faire répéter.

Règle fondamentale :
**tout élément visuel interactif doit avoir un équivalent vocal explicite.**

Pour une case à cocher, l’assistance doit pouvoir :
1. annoncer son libellé ;
2. annoncer son état ;
3. proposer de la cocher ou de la décocher ;
4. confirmer le changement.

Exemple :
« Lieux avec téléphone, non coché. Vous pouvez dire : cocher lieux avec téléphone. »

Le mode découverte ne doit pas se limiter à lire l’écran : il doit **enseigner le fonctionnement de Libcomlair page par page**.

### Zones explicatives et informations non interactives

Les éléments qui ne sont pas des choix mais qui apportent une explication doivent eux aussi être accessibles vocalement.

Cela comprend notamment :
- encadrés explicatifs ;
- notices ;
- textes d’aide ;
- tutoriels ;
- descriptions de catégories ;
- explications de critères ;
- messages d’information ;
- légendes utiles ;
- avertissements non critiques ;
- textes expliquant le fonctionnement d’une page.

Règle :
**toute information visuelle utile doit pouvoir être proposée à la lecture.**

Comportement attendu :
1. en mode découverte, l’assistance annonce qu’une explication est disponible ;
2. elle peut lire automatiquement les explications essentielles à la compréhension de la page ;
3. pour les explications secondaires, elle propose par exemple : « Une explication est disponible. Dites “lire l’explication” pour l’écouter. » ;
4. en mode simplifié, elle ne lit pas systématiquement les textes longs, mais doit toujours permettre de les demander.

Commandes prévues :
- « Lire l’explication »
- « Lire les informations »
- « Lire l’aide »
- « Lire le tutoriel »
- « Explique cette page »
- « Lire tout ce qui est affiché »

Si plusieurs zones explicatives sont présentes sur la même page, l’assistance doit les nommer afin que l’utilisateur puisse choisir celle qu’il souhaite écouter.

### 2. Mode assistance simplifiée

Destiné à l’usage quotidien une fois l’application assimilée.

L’assistance annonce seulement :
- le nom de l’écran ;
- les informations nouvelles ou importantes ;
- les choix principaux disponibles ;
- la confirmation des actions ;
- les erreurs ou incompréhensions.

Les explications détaillées restent disponibles par commandes :
- « Aide »
- « Quels sont mes choix ? »
- « Explique cette page »
- « Lire toutes les options »
- « Répète »

### Passage d’un mode à l’autre

Le changement doit être possible vocalement et visuellement.

Commandes prévues :
- « Activer le mode découverte »
- « Activer le mode simplifié »
- « Explique cette page »

La préférence doit être conservée localement pour éviter de redemander à chaque ouverture.

### Critère de couverture d’un écran

Une page n’est pas considérée comme complètement accessible au profil Vision tant que :
- chaque case cochable est annoncée avec son état ;
- chaque bouton important peut être identifié et déclenché vocalement ;
- chaque choix de liste ou menu peut être lu et sélectionné vocalement ;
- chaque champ saisissable peut être rempli ou dicté vocalement lorsque cela est pertinent ;
- chaque action produit une confirmation vocale ;
- l’utilisateur peut demander une explication complète de la page.

---

## Principe général

Chaque écran doit suivre le cycle :

1. **Présenter** : annoncer le nom de l’écran et les informations importantes.
2. **Proposer** : dire uniquement les choix réellement disponibles sur cet écran.
3. **Écouter** : reconnaître plusieurs formulations naturelles pour chaque choix.
4. **Agir** : effectuer exactement la même action que l’équivalent visuel.
5. **Confirmer** : annoncer ce qui a été compris et l’action réalisée.
6. **Récupérer** : si la phrase n’est pas comprise, proposer les choix valides sans obliger l’utilisateur à deviner la commande.

Le micro doit être **contextuel** : une commande valable sur un écran ne doit pas être interprétée comme une autre action sur un autre écran.

## Commandes universelles

Ces commandes doivent être disponibles partout où elles ont un sens :

- « Aide »
- « Quels sont mes choix ? »
- « Répète » / « Répéter »
- « Retour »
- « Page précédente »
- « Arrêter la lecture »
- « Recommencer »
- « Nouvelle recherche » lorsque l’utilisateur se trouve dans le parcours de recherche

En cas d’incompréhension :

> « Je n’ai pas compris. Vous pouvez dire… »

Puis l’assistance énumère uniquement les commandes du contexte actif.

---

## Écran 1 — Bienvenue

### Lecture automatique
- Présentation courte de Libcomlair.
- Indiquer qu’il faut dire ou sélectionner « Suivant ».

### Commandes
- « Suivant »
- « Continuer »
- « Aide »
- « Répète »

### Confirmation
- « Ouverture du choix de vos besoins d’accessibilité. »

---

## Écran 2 — Profil d’accessibilité

### Lecture automatique
Lire les profils disponibles :
- Mobilité
- Vision
- Audition
- Compréhension / cognition
- Assistance / accompagnement

Puis :
- « Utiliser mes choix »
- « Continuer sans adaptation particulière »

### Commandes
- « Mobilité »
- « Vision »
- « Audition »
- « Compréhension »
- « Assistance »
- « Enlever [profil] »
- « Utiliser mes choix »
- « Continuer sans adaptation »
- « Quels sont mes choix ? »
- « Répète »

### Confirmation
Exemples :
- « Vision sélectionnée. »
- « Vision retirée. »
- « Vos choix sont enregistrés. »

---

## Écran 3 — Accueil / démarrage

### Lecture automatique pour le profil Vision
- Présentation Libcomlair.
- Profil d’accessibilité actif.
- Choix disponibles.

### Commandes
- « Modifier mon profil »
- « Commencer »
- « Présentation Libcomlair »
- « Arrêter la lecture »
- « Comment fonctionne Libcomlair ? »
- « Assistance et réglages »
- « Tester l’assistance vocale »
- « Diagnostic »
- « Réparation automatique »
- « Rechercher un lieu accessible »

### Confirmation
Annoncer systématiquement l’écran ou la fonction ouverte.

---

## Écran 4 — Recherche et grandes catégories

### Lecture automatique
- « Trouvez un lieu accessible. »
- Lire le champ de recherche.
- Présenter « Personnaliser la recherche ».
- Lire les grandes catégories :
  - Magasins
  - Débits de boissons
  - Hébergements
  - Restaurants
  - Activités et sorties
  - Services
  - Transports

### Commandes
- « Rechercher [texte] » ou mode dictée du champ de recherche
- « Ouvrir les critères »
- « Ajouter [critère] »
- « Enlever [critère] »
- nom d’une catégorie
- « Retour »

### Confirmation
Exemples :
- « Catégorie Transports ouverte. »
- « Boucle magnétique ajoutée. »
- « Boucle magnétique retirée. »

---

## Écran 5 — Catégorie et sous-catégories

Le contexte doit dépendre de la catégorie active.

### Exemple Transports
Lecture :
- nom de la catégorie ;
- explication courte ;
- sous-catégories disponibles.

Commandes :
- « Tous les transports »
- « Train » / « Gare »
- « Bus » / « Arrêt »
- « Métro »
- « Tramway »
- « Taxi » / « Transport adapté »
- « Bateau » / « Ferry »
- « Lire l’explication »
- « Retour aux catégories »
- « Quels sont mes choix ? »

### Autres catégories
Même principe : générer la liste vocale depuis les boutons réellement visibles.

### Confirmation
- « Bus / Arrêt sélectionné. »
- puis annoncer le menu de la sous-catégorie.

---

## Écran 6 — Menu de sous-catégorie / Bus - Arrêt

### Lecture automatique
« Vous êtes dans Bus / Arrêt. Vous pouvez ouvrir Carte, Favoris, Filtres et tri, Contribuer ou Résultats. »

### Commandes
- « Carte »
- « Favoris »
- « Filtres »
- « Filtres et tri »
- « Contribuer »
- « Résultats »
- « Retour aux transports »
- « Quels sont mes choix ? »

### Confirmation
Annoncer le nom de la page ouverte.

---

## Écran 7A — Carte

### Lecture automatique
- rappeler la sous-catégorie active ;
- expliquer que la carte est facultative ;
- annoncer l’action « Autour de moi » ;
- lire le statut de géolocalisation.

### Commandes
- « Autour de moi »
- « Lire le statut »
- « Résultats »
- « Retour à Bus / Arrêt »
- « Quels sont mes choix ? »

### Confirmation
- annoncer le lancement de la recherche ;
- annoncer le résultat ou l’erreur de géolocalisation.

---

## Écran 7B — Favoris

### Lecture automatique
- nombre de favoris ;
- dossiers de catégories réellement présents.

### Commandes
- « Ouvrir [nom du dossier] »
- « Fermer [nom du dossier] »
- « Lire mes favoris »
- « Ouvrir [nom du lieu] »
- « Retour à Bus / Arrêt »
- « Quels sont mes choix ? »

### Confirmation
- annoncer le dossier ouvert ;
- annoncer la fiche sélectionnée.

---

## Écran 7C — Filtres et tri

### Lecture automatique
Lire :
- filtres actifs ;
- les cinq filtres disponibles ;
- le bouton de réinitialisation ;
- les options de tri disponibles.

### Commandes
- « Favoris uniquement »
- « Mes propositions uniquement »
- « Lieux présents sur la carte »
- « Lieux avec site internet »
- « Lieux avec téléphone »
- « Enlever [filtre] »
- « Réinitialiser les filtres »
- « Trier par nom »
- « Trier par ville »
- « Trier par catégorie »
- « Trier par accessibilité »
- « Mes propositions en premier »
- « Quels sont mes filtres ? »
- « Quels sont mes choix ? »
- « Retour à Bus / Arrêt »

### Confirmation
Exemples :
- « Filtre lieux avec téléphone activé. »
- « Filtre lieux avec téléphone retiré. »
- « Tri par nom activé. »
- « Tous les filtres ont été réinitialisés. »

### État actuel
Présentation utilisable mais remplissage vertical de l’écran encore partiellement résolu. Ne pas réintroduire de refonte structurelle tant que ce problème n’est pas repris explicitement.

---

## Écran 7D — Contribuer

### Objectif
Cet écran doit devenir entièrement utilisable sans lecture visuelle du formulaire.

### Mode à créer : dictée guidée
L’assistance pose les questions une par une.

Ordre proposé :
1. « Quel est le nom du lieu ? »
2. « Dans quelle ville se trouve-t-il ? »
3. « Quelle est son adresse ? »
4. « Connaissez-vous son numéro de téléphone ? »
5. « Connaissez-vous son site internet ? »
6. « Quelle est sa catégorie ? »
7. « Que souhaitez-vous indiquer sur son accessibilité ? »
8. « Voulez-vous utiliser votre position pour placer le lieu ? »
9. critères d’accessibilité ;
10. récapitulatif avant enregistrement.

### Pour chaque réponse dictée
1. transcrire ;
2. relire ce qui a été compris ;
3. proposer :
   - « Valider »
   - « Modifier »
   - « Recommencer »
   - « Passer » si le champ est facultatif.

### Champs actuellement présents
- Nom du lieu
- Ville
- Adresse précise
- Téléphone
- Site internet
- Catégorie
- Commentaire sur l’accessibilité
- Emplacement / position
- Critères d’accessibilité
- Enregistrer

### État actuel
La dictée existe seulement pour :
- commentaire d’accessibilité ;
- avis ;
- signalement d’erreur.

Les autres champs de Contribuer ne sont pas encore pilotables vocalement.

### Commandes globales de Contribuer
- « Commencer la contribution »
- « Champ suivant »
- « Champ précédent »
- « Relire ma réponse »
- « Modifier ma réponse »
- « Recommencer »
- « Passer »
- « Utiliser ma position »
- « Lire le récapitulatif »
- « Enregistrer »
- « Annuler »
- « Retour à Bus / Arrêt »

---

## Écran 7E — Résultats

### Lecture automatique
- nombre de résultats ;
- filtres actifs ;
- annoncer comment parcourir la liste.

### Commandes
- « Lire les résultats »
- « Résultat suivant »
- « Résultat précédent »
- « Ouvrir [nom du lieu] »
- « Lire ce résultat »
- « Nouvelle recherche »
- « Retour à Bus / Arrêt »
- « Quels sont mes choix ? »

### Confirmation
- lire le nom et un résumé court du résultat ciblé ;
- confirmer l’ouverture de la fiche.

---

## Écran 8 — Fiche détaillée

### Lecture automatique
- nom du lieu ;
- informations essentielles disponibles ;
- rubriques accessibles.

### Commandes
- « Lire la fiche »
- « Lignes et directions »
- « Informations pratiques »
- « Actions possibles »
- « Signalement »
- « Avis et commentaires »
- « Accessibilité »
- « Appeler »
- « Ouvrir le site »
- « Itinéraire »
- « Voir sur la carte »
- « Partager »
- « Copier l’adresse »
- « Ajouter aux favoris »
- « Retirer des favoris »
- « Signaler une erreur »
- « Retour aux résultats »

### Confirmation
Chaque action doit être confirmée vocalement.

---

## Fiabilisation de la reconnaissance

### Problèmes observés à traiter
- besoin de répéter plusieurs fois ;
- commandes valides parfois non reconnues ;
- termes proches confondus ;
- retour vocal parfois absent après une action ;
- commandes anciennes disponibles alors que l’écran a changé.

### Règles à adopter
- dictionnaire de synonymes par contexte ;
- normalisation accents / pluriels / ponctuation ;
- correspondance exacte prioritaire avant correspondance partielle ;
- ne jamais tester une commande d’un autre écran avant les commandes du contexte actif ;
- plusieurs formulations naturelles pour chaque action ;
- confirmation vocale systématique ;
- en cas de faible confiance ou absence de correspondance : ne rien déclencher et proposer les choix valides ;
- éviter les commandes trop génériques comme « ouvrir » ou « retour » sans tenir compte de l’écran actif.

---

## Architecture cible

Le micro visuel des pages 3, 4 et 5 utilise déjà le même point d’entrée réel : `#visionVoiceCommand`.

La prochaine évolution doit ajouter un **contexte vocal central** avec, au minimum :

- `welcome`
- `profile`
- `home`
- `search`
- `category:<id>`
- `subcategory:<id>`
- `map`
- `favorites`
- `filters`
- `contribute`
- `results`
- `detail`
- `dictation:<field>`

Le contexte doit être dérivé de l’état réel de la page, pas d’une variable vocale indépendante qui peut se désynchroniser.

---

## Critère de validation

Un écran n’est considéré vocalement accessible que si un utilisateur qui ne le voit pas peut :

1. savoir où il se trouve ;
2. connaître les choix disponibles ;
3. effectuer chaque action principale par la voix ;
4. entendre la confirmation de l’action ;
5. revenir en arrière ;
6. demander de l’aide ou faire répéter ;
7. récupérer après une incompréhension sans devoir utiliser l’écran.

Chaque écran devra être testé manuellement avec ce parcours avant d’être marqué **vocalement validé**.
