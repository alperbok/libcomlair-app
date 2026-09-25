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
