# Libcomlair — registre des pannes connues

Ce document complète le diagnostic intégré. Chaque nouvelle panne confirmée doit être ajoutée ici avec sa cause réelle et sa réparation avant de poursuivre les développements.

| ID | Symptôme observé | Cause confirmée | Diagnostic | Réparation |
|---|---|---|---|---|
| stale-browser-cache | Une modification publiée ne change rien à l'écran | Ancienne ressource CSS/JS conservée par le navigateur, le cache applicatif ou un service worker | Vérifier versions chargées et cache | Vider caches techniques, actualiser service workers, recharger avec une URL versionnée |
| inline-display-overrides-css | Un nouveau CSS ne produit aucun changement visible | JavaScript pose `display:block!important` ou `display:none!important` directement sur l'élément et écrase le CSS | Inspecter `element.style.display` sur l'écran actif | Supprimer/normaliser le style inline puis laisser le CSS courant contrôler la mise en page |
| empty-screen-hidden-sections | Le cadre s'affiche mais son contenu est vide | Attribut `hidden`, ancien `display:none` ou état précédent conservé | Vérifier les sections attendues selon la classe de page | Réafficher explicitement les blocs attendus et retirer les états hérités |
| page-state-visual-state-desync | La navigation a changé mais l'ancien écran reste visible | Classe de page et visibilité DOM désynchronisées | Comparer classe `body` et sections visibles | Normaliser écran actif + sections autorisées |
| return-categories-intermediate-screen | Retour aux catégories laisse le titre/tutoriel de la catégorie et un écran intermédiaire vide | Le retour ferme la catégorie sans restaurer complètement l’écran 4 | Vérifier classe de page, en-tête écran 5 et visibilité des 7 catégories | Réinitialiser l’écran 5, réafficher les 7 catégories et défiler directement au titre Catégories |\n| voice-return-command-too-generic | « Retour aux transports » et « Retour aux catégories » produisent le même écran ou un écran de catégorie vide | Une règle vocale générale interceptait toute phrase contenant « retour » | Vérifier la destination demandée dans la transcription vocale | Distinguer chaque destination et appeler explicitement la navigation écran 5 ou écran 4 |\n| voice-category-opens-inline | Une commande vocale ouvre les sous-catégories sous la page Catégories et le logo/micro dédié disparaît | Le moteur vocal ouvre directement le `<details>` et contourne la navigation écran 5 | Surveiller l’ouverture directe des grands `<details>` sur l’écran 4 | Intercepter `toggle` et convertir toute ouverture en véritable écran 5 |\n| legacy-details-open | Une catégorie se déplie dans la page au lieu d'ouvrir l'écran suivant | Ancien comportement `<details>` ou ancien écouteur exécuté avant la nouvelle navigation | Vérifier les `details[open]` sur l'écran catégories | Intercepter le clic en priorité, fermer les anciens accordéons, ouvrir l'écran dédié |
| samsung-browser-scope | La nouvelle navigation de catégorie ne s'exécute pas sur Samsung Browser | Utilisation de `:scope` dans un sélecteur JavaScript incompatible avec cette version | Erreur ou arrêt silencieux du script de navigation | Remplacer `:scope` par une recherche directe dans `children` |
| duplicate-brand | Deux logos Libcomlair apparaissent sur la même page | Ancien en-tête encore visible avec le nouvel en-tête | Compter les logos réellement visibles | Conserver uniquement l'en-tête de l'écran actif |
| mobile-layout-overflow | Le contenu dépasse le cadre mobile | Répartition interne trop haute ou règles de padding/hauteur héritées | Comparer cadre validé et hauteur du contenu | Ne pas modifier le cadre ; restructurer uniquement le contenu intérieur |
| leaflet-gray-map | La carte affiche seulement une bande de tuiles et une grande zone grise | Leaflet calcule sa taille alors que son conteneur est masqué ou pas encore dimensionné | Vérifier taille du conteneur au moment de l'affichage | Appeler `invalidateSize()` après affichage réel et conserver une taille explicite |
| voice-state-stuck | Lecture/commande vocale ne correspond plus à l'écran | État vocal ancien conservé après navigation ou erreur | Vérifier état moteur vocal et écran courant | Annuler l'état vocal en cours puis réinitialiser la navigation |
| page4-grid-blocked | Les catégories restent sur une colonne malgré le CSS grille | Le script imposait `display:block!important` sur `#v224Page4Categories` | Vérifier le style inline du conteneur | Utiliser `display:grid` ou retirer la surcharge inline |

## Règles de travail obligatoires

1. Avant toute nouvelle correction, vérifier si le symptôme existe déjà dans ce registre.
2. Si oui, appliquer d'abord la cause et la réparation connues.
3. Ne pas empiler des corrections CSS si un style inline JavaScript est prioritaire.
4. Ne jamais changer les dimensions du cadre validé pour résoudre un problème de contenu.
5. Une panne confirmée doit être ajoutée au registre et, si possible, au diagnostic automatique.
6. Une réparation sûre doit être ajoutée au moteur de réparation automatique.
7. Si la réparation exige un changement structurel du code, la réparation automatique doit au minimum nettoyer les états/cache puis recharger la version corrigée.
8. Toujours conserver les données utilisateur protégées pendant une réparation.

## État actuel du moteur automatique

Le registre JavaScript `libcomlair-known-issues-v224.js` est chargé avant :
- `libcomlair-repair-engine-v175.js`
- `libcomlair-selftest-v189.js`

Le diagnostic peut détecter les états d'interface connus. La réparation peut normaliser les états sûrs, nettoyer les caches techniques et recharger l'application tout en conservant le profil d'accessibilité, les favoris, avis, signalements et propositions.
