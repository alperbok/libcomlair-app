# Libcomlair V224 — gabarit mobile validé

Cette référence correspond à la mise en page validée visuellement le 25 septembre 2026 sur Samsung Browser.
Pour les prochaines pages mobiles, conserver ces dimensions et positions avant d'ajouter le contenu spécifique.

## Cadre principal — référence validée

- `#mainContent`
  - largeur : `100%`
  - marge : `0`
  - padding extérieur : `1px`
  - `box-sizing: border-box`

- `#accessWelcome`
  - largeur : `100%`
  - marge : `0`
  - padding intérieur : `10px 12px 11px`
  - rayon du cadre : `24px`
  - hauteur minimale : `calc(100dvh - 2px)`
  - `box-sizing: border-box`

## Logo — dimensions validées

- conteneur `.v222-profile-brand`
  - hauteur minimale : `66px`
  - marge : `-2px 0 0`
  - réserve à droite : `62px`

- logo `.v222-brand-logo`
  - largeur : `min(69vw, 305px)`
  - largeur maximale : `305px`
  - hauteur : automatique
  - centré horizontalement

## Micro — dimensions et position validées

Le fichier chargé en dernier `libcomlair-v224-micro-final.css` fait foi.

- taille : `100px × 100px`
- position horizontale : `right: -8px`
- position verticale : `top: 0`
- bordure : `4px`
- taille de l'icône : `2.25rem`
- texte « Micro » : `1rem`, gras
- ombre : `0 5px 16px rgba(0,0,0,.22)`

## Répartition intérieure validée

- les 5 choix utilisent une grille dédiée `.v224-needs-grid`
- grille : `repeat(5, minmax(52px, 1fr))`
- espacement entre choix : `8px`
- chaque choix garde une hauteur minimale de `52px`
- les deux boutons du bas gardent une hauteur minimale de `50px`

## Règle pour les prochaines pages

1. Reprendre d'abord le cadre, le logo et le micro avec les valeurs ci-dessus.
2. Ne pas modifier leurs dimensions pour faire rentrer le contenu.
3. Adapter uniquement la structure et la répartition intérieure.
4. Toujours vérifier qu'aucun élément ne dépasse le cadre sur mobile.
5. Conserver une zone tactile généreuse pour les éléments d'accessibilité.

Version visuelle de référence : V224 / réglage 18.


## Problèmes déjà rencontrés — à ne pas reproduire

### 1. Marges blanches / mauvais cadrage
- Ne jamais corriger un problème de cadrage en réduisant toute la page au hasard.
- Corriger d'abord les marges, paddings, largeur/hauteur du conteneur et le `box-sizing`.
- Vérifier sur Samsung Browser avant de toucher aux tailles de texte ou de boutons.

### 2. Cadre qui change de taille quand on remplit l'intérieur
- Le cadre validé doit rester indépendant du contenu.
- Ne pas augmenter la hauteur du cadre pour combler un espace vide.
- Répartir l'espace à l'intérieur avec une grille ou une structure dédiée.
- Si un contenu dépasse, corriger la structure interne, pas le cadre.

### 3. Cache navigateur
- Quand une modification CSS/JS ne semble pas apparaître, utiliser un nouveau numéro de version dans l'URL du fichier chargé.
- Si nécessaire, créer un fichier CSS dédié chargé en dernier plutôt que d'empiler des règles dans un fichier déjà mis en cache.

### 4. Styles masqués par d'anciennes règles
- Avant d'ajouter une nouvelle règle CSS, vérifier les sélecteurs existants avec `display:none!important`, `hidden`, ou les styles inline.
- Éviter d'empiler plusieurs couches de `!important` sans identifier la règle responsable.
- Pour chaque nouvel écran, utiliser une classe d'état unique sur `body` et des sélecteurs explicites.

### 5. Écrans qui restent vides
- Ne pas se contenter de changer la classe d'état.
- À l'ouverture d'un écran, vérifier explicitement :
  - que ses blocs existent dans le DOM ;
  - qu'ils ne portent pas l'attribut `hidden` ;
  - qu'aucun style inline `display:none` ne reste actif ;
  - qu'une ancienne règle liée à l'écran précédent ne les masque pas.
- Préférer une vraie logique d'écran : page précédente masquée, page courante affichée, autres sections masquées.

### 6. Navigation / état visuel désynchronisés
- Un changement d'état logique ne suffit pas : l'interface visible doit suivre exactement.
- Après chaque navigation, vérifier :
  - la classe `body` ;
  - la section réellement visible ;
  - la position de défilement ;
  - les contrôles vocaux associés.
- Éviter de réutiliser un ancien écran comme simple conteneur si cela crée des conflits de visibilité.

### 7. Logo en double
- Chaque écran ne doit avoir qu'un seul en-tête de marque visible.
- Si le gabarit contient déjà le logo principal, ne pas ajouter un second logo dans un bloc de contenu.

### 8. Micro d'accessibilité
- Conserver la taille et la position validées du micro sur les prochaines pages.
- Ne pas le réduire pour faire rentrer le contenu.
- Garder une zone tactile généreuse et vérifier qu'il ne chevauche ni le logo ni le cadre.

### 9. Carte Leaflet partiellement grise
- Si la carte est affichée après une navigation ou dans une section auparavant masquée, appeler `map.invalidateSize()` après l'affichage.
- Donner une largeur et une hauteur explicites au conteneur de carte.
- Initialiser ou recalculer la carte seulement une fois son conteneur réellement visible.

### 10. Méthode de travail à suivre
1. Partir du dernier écran validé.
2. Modifier une seule famille de choses à la fois.
3. Ne pas toucher aux éléments déjà validés sans raison.
4. Tester sur le téléphone après chaque changement structurel important.
5. En cas de régression, revenir au dernier état validé au lieu d'empiler de nouvelles corrections.

