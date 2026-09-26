# Libcomlair — Protocole anti-régression vocal

## Objectif
Éviter que les mêmes pannes de micro, de contexte vocal, de cache ou de menu Assistance et réglages réapparaissent après une mise à jour.

## Architecture à protéger

### 1. Contexte vocal
`libcomlair-v224-voice-context.js`
- identifie l’écran réellement actif ;
- fournit le contexte au guide et au routeur ;
- ne déclenche pas directement d’action utilisateur.

### 2. Guide vocal
`libcomlair-v224-voice-guide.js`
- décrit la page active ;
- distingue Découverte guidée et Simplifié ;
- annonce boutons, cases, listes et explications visibles.

### 3. Routeur micro contextuel
`libcomlair-v224-voice-router.js`
- écoute les boutons Micro ;
- utilise les choix réellement visibles de la page ;
- accepte plusieurs alternatives de reconnaissance ;
- comprend les intentions cocher, décocher, ouvrir, fermer, lire et choisir ;
- refuse une action lorsqu’il hésite entre deux choix proches ;
- expose `window.LibcomlairVoiceRouter`.

### 4. Assistance et réglages globale
`libcomlair-v224-global-assistance.js`
- présente le menu après le profil lors de la découverte initiale ;
- affiche ensuite un bouton ☰ en haut à gauche des pages ;
- ouvre le menu par-dessus la page courante ;
- permet la commande vocale « Réglages » ;
- ne doit pas être rappelé systématiquement par l’assistance après sa présentation initiale ;
- expose `window.LibcomlairGlobalAssistance`.

### 5. Garde anti-régression
`libcomlair-v224-regression-guard.js`
- vérifie la présence du routeur, du contexte, du guide et du menu global ;
- vérifie la disponibilité de la reconnaissance vocale du navigateur ;
- ajoute son résultat au Diagnostic ;
- expose `window.LibcomlairRegressionGuard`.

## Règle de symétrie obligatoire
**Tout choix annoncé par l’assistance vocale doit pouvoir être demandé au micro sur le même écran.**

Cela comprend :
- boutons ;
- cases à cocher ;
- options de liste ;
- catégories et sous-catégories ;
- retours ;
- tutoriels ;
- explications ;
- menu Assistance et réglages ;
- commandes universelles pertinentes.

## Présentation du menu Réglages
Lors de la première utilisation après le profil :
1. présenter Assistance et réglages ;
2. expliquer le bouton ☰ en haut à gauche ;
3. expliquer que la commande « Réglages » l’ouvre à tout moment ;
4. expliquer son contenu ;
5. préciser qu’il ne sera pas rappelé systématiquement ensuite.

Après cette présentation :
- ne plus annoncer le menu sur chaque page ;
- le conserver accessible visuellement et vocalement ;
- le rappeler uniquement sur demande ou lorsque le diagnostic est pertinent.

## Validation page par page
Une page n’est validée que si :
1. l’assistance annonce les choix réellement visibles ;
2. le micro reconnaît chaque choix annoncé ;
3. l’action vocale produit la même action que le contrôle visuel ;
4. une confirmation vocale est émise ;
5. les tutoriels/explications peuvent être lus sur demande ;
6. une phrase incomprise ne déclenche pas une action au hasard ;
7. « Réglages » ouvre le menu global ;
8. le Diagnostic ne signale aucune brique vocale manquante.

Ordre de validation :
1. Profil d’accessibilité
2. Accueil / démarrage
3. Recherche
4. Grandes catégories
5. Sous-catégories
6. Menu de sous-catégorie
7. Carte
8. Favoris
9. Filtres et tri
10. Contribuer
11. Résultats
12. Fiche détaillée

## Contrôle du cache
Après toute modification d’un fichier vocal :
- changer sa version `?v=` dans la page qui le charge ;
- vérifier la version exposée par le composant ;
- ne pas considérer une absence de changement comme une panne logique avant d’avoir vérifié la ressource réellement chargée.

## États de panne
Ne jamais marquer une correction comme validée avant test réel sur l’application :
- suspectée ;
- confirmée ;
- partiellement réparée ;
- réparée et validée.

## Données à protéger
Aucun diagnostic ou correctif vocal ne doit effacer :
- profil d’accessibilité ;
- favoris ;
- propositions ;
- avis ;
- signalements ;
- autres données utilisateur persistantes.
