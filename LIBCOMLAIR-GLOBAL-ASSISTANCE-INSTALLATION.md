# Libcomlair — Assistance et réglages globale

## Objectif

Le menu **Assistance et réglages** doit être présenté une première fois après le choix du profil d’accessibilité, puis rester disponible à tout moment par :

- le bouton `☰` fixé en haut à gauche ;
- la commande vocale **« Réglages »** ;
- la commande **« Fermer les réglages »** pour fermer le panneau.

Il ne doit pas être rappelé systématiquement par l’assistance vocale après sa présentation initiale.

## Composants propriétaires

- `libcomlair-v224-global-assistance.js` : création, ouverture, fermeture, présentation initiale et commande globale.
- `libcomlair-v224-global-assistance.css` : position fixe du bouton et panneau latéral.
- `libcomlair-v224-voice-router.js` : reconnaissance de « Réglages » et « Fermer les réglages ».
- `libcomlair-v224-regression-guard.js` : contrôle de présence et de position réelle du menu.

## Panne confirmée — bouton ☰ dans le flux de la page

### Symptôme

Le bouton `☰` apparaît en bas à gauche de la page et, lorsqu’il est ouvert, le contenu du menu s’affiche comme du contenu normal au lieu d’un panneau superposé.

### Cause confirmée

La première version appliquait le style du menu par une balise `<style>` créée dynamiquement en JavaScript. La politique CSP de la page autorise les feuilles CSS externes mais n’autorise pas ce style dynamique comme source fiable. Les éléments HTML étaient donc créés sans leur mise en page prévue.

### Réparation structurelle

Le style du menu est maintenant placé dans la feuille externe :

`libcomlair-v224-global-assistance.css`

La page de test doit la charger explicitement avec un numéro de version `?v=` neuf.

### Validation attendue

Après le choix du profil :

1. le bouton `☰` apparaît en haut à gauche ;
2. il reste fixe lorsqu’on fait défiler la page ;
3. il n’apparaît pas pendant l’écran de choix initial du profil ;
4. lorsqu’on l’ouvre, le menu se superpose à la page courante ;
5. le bouton `×` se trouve en haut du panneau ;
6. la fermeture rend exactement la page précédente ;
7. le diagnostic anti-régression confirme `Position fixe du menu réglages`.

## Règles anti-régression

- Ne pas remettre le CSS essentiel du menu dans une balise `<style>` créée par JavaScript.
- Toute nouvelle version du CSS, du routeur ou du menu doit incrémenter son paramètre `?v=` dans la page qui le charge.
- Ne pas considérer le menu validé parce que le bouton existe : vérifier `getComputedStyle(button).position === "fixed"`.
- Le bouton global doit rester absent de Bienvenue et du choix initial du profil.
- Le menu ne doit pas modifier les données utilisateur.
- La Carte et les autres écrans déjà validés ne doivent pas être redimensionnés par ce menu.

## État

Cause : **confirmée** le 26/09/2026 à partir des captures Samsung Browser.

Réparation : **installée dans la page de test v2, en attente de validation utilisateur**.
