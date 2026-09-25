# Libcomlair — registre des pannes connues

Ce document complète le diagnostic intégré. Chaque nouvelle panne confirmée doit être ajoutée ici avec sa cause réelle et sa réparation avant de poursuivre les développements.

| ID | Symptôme observé | Cause confirmée | Diagnostic | Réparation |
|---|---|---|---|---|
| stale-browser-cache | Une modification publiée ne change rien à l'écran | Ancienne ressource CSS/JS conservée par le navigateur, le cache applicatif ou un service worker | Vérifier versions chargées et cache | Vider caches techniques, actualiser service workers, recharger avec une URL versionnée |
| inline-display-overrides-css | Un nouveau CSS ne produit aucun changement visible | JavaScript pose `display:block!important` ou `display:none!important` directement sur l'élément et écrase le CSS | Inspecter `element.style.display` sur l'écran actif | Supprimer/normaliser le style inline puis laisser le CSS courant contrôler la mise en page |
| css-specificity-collision | Une correction CSS est publiée mais la hauteur, les marges ou la disposition ne changent presque pas | Une ancienne règle CSS plus spécifique reste prioritaire | Comparer les sélecteurs et repérer les anciennes règles avec `!important` | Supprimer la règle conflictuelle puis garder une seule règle finale spécifique à l’écran |
| empty-screen-hidden-sections | Le cadre s'affiche mais son contenu est vide | Attribut `hidden`, ancien `display:none` ou état précédent conservé | Vérifier les sections attendues selon la classe de page | Réafficher explicitement les blocs attendus et retirer les états hérités |
| page-state-visual-state-desync | La navigation a changé mais l'ancien écran reste visible | Classe de page et visibilité DOM désynchronisées | Comparer classe `body` et sections visibles | Normaliser écran actif + sections autorisées |
| return-categories-intermediate-screen | Retour aux catégories laisse le titre/tutoriel de la catégorie et un écran intermédiaire vide | Le retour ferme la catégorie sans restaurer complètement l’écran 4 | Vérifier classe de page, en-tête écran 5 et visibilité des 7 catégories | Réinitialiser l’écran 5, réafficher les 7 catégories et défiler directement au titre Catégories |
| voice-return-command-too-generic | « Retour aux transports » et « Retour aux catégories » produisent le même écran ou un écran de catégorie vide | Une règle vocale générale interceptait toute phrase contenant « retour » | Vérifier la destination demandée dans la transcription vocale | Distinguer chaque destination et appeler explicitement la navigation écran 5 ou écran 4 |
| voice-category-opens-inline | Une commande vocale ouvre les sous-catégories sous la page Catégories et le logo/micro dédié disparaît | Le moteur vocal ouvre directement le `<details>` et contourne la navigation écran 5 | Surveiller l’ouverture directe des grands `<details>` sur l’écran 4 | Intercepter `toggle` et convertir toute ouverture en véritable écran 5 |
| legacy-details-open | Une catégorie se déplie dans la page au lieu d'ouvrir l'écran suivant | Ancien comportement `<details>` ou ancien écouteur exécuté avant la nouvelle navigation | Vérifier les `details[open]` sur l'écran catégories | Intercepter le clic en priorité, fermer les anciens accordéons, ouvrir l'écran dédié |
| samsung-browser-scope | La nouvelle navigation de catégorie ne s'exécute pas sur Samsung Browser | Utilisation de `:scope` dans un sélecteur JavaScript incompatible avec cette version | Erreur ou arrêt silencieux du script de navigation | Remplacer `:scope` par une recherche directe dans `children` |
| duplicate-brand | Deux logos Libcomlair apparaissent sur la même page | Ancien en-tête encore visible avec le nouvel en-tête | Compter les logos réellement visibles | Conserver uniquement l'en-tête de l'écran actif |
| mobile-layout-overflow | Le contenu dépasse le cadre mobile | Répartition interne trop haute ou règles de padding/hauteur héritées | Comparer cadre validé et hauteur du contenu | Ne pas modifier le cadre ; restructurer uniquement le contenu intérieur |
| filter-frame-forced-minheight-clips-sort | Une grande zone vide apparaît et « Trier par » disparaît | Une ancienne hauteur minimale du cadre combinée à `min-height:100%` et `overflow:hidden` pousse le tri hors écran | Vérifier les hauteurs forcées du cadre et des enfants flex | Supprimer les hauteurs minimales obsolètes et laisser le conteneur flex utiliser uniquement l’espace réellement disponible |
| filters-empty-after-layout-refactor | La page Filtres et tri affiche le cadre mais plus les contrôles | Refonte ayant déplacé les contrôles hors de `#placesFilters` et modifié le flux d’ouverture | Comparer avec la dernière version où les filtres étaient visibles | Restaurer `#placesFilters` dans `#v224FiltersContent` et le flux `showResultToolPage` connu fonctionnel ; **partiellement réparé le 26/09/2026** : contenu revenu, mais remplissage vertical complet de l’écran encore à résoudre |
| leaflet-gray-map | La carte affiche seulement une bande de tuiles et une grande zone grise | Leaflet calcule sa taille alors que son conteneur est masqué ou pas encore dimensionné | Vérifier taille du conteneur au moment de l'affichage | Appeler `invalidateSize()` après affichage réel et conserver une taille explicite |
| voice-state-stuck | Lecture/commande vocale ne correspond plus à l'écran | État vocal ancien conservé après navigation ou erreur | Vérifier état moteur vocal et écran courant | Annuler l'état vocal en cours puis réinitialiser la navigation |
| page4-grid-blocked | Les catégories restent sur une colonne malgré le CSS grille | Le script imposait `display:block!important` sur `#v224Page4Categories` | Vérifier le style inline du conteneur | Utiliser `display:grid` ou retirer la surcharge inline |

### États de validation des pannes

- **Suspectée** : symptôme observé, cause non démontrée.
- **Confirmée** : cause démontrée, réparation pas encore validée.
- **Partiellement réparée** : une partie du symptôme est corrigée, mais l’objectif complet n’est pas encore atteint.
- **Réparée et validée** : réparation appliquée puis vérifiée réellement dans l’application.

Seules les pannes **réparées et validées** peuvent servir de référence fiable au moteur de diagnostic/réparation automatique.
## Protocole obligatoire avant toute correction

Ce protocole doit être exécuté **avant de modifier le code**, même si la correction paraît simple. Le but est d'éviter les essais successifs sur une panne déjà connue.

1. **Consulter le registre des pannes connues** et rechercher le symptôme exact ou un symptôme proche.
2. **Exécuter le diagnostic des pannes connues** sur l'écran concerné quand il est disponible.
3. **Vérifier les styles inline JavaScript** susceptibles d'écraser le CSS (display, height, visibility, opacity, etc.).
4. **Rechercher les anciennes règles CSS avec !important** qui ciblent le même élément.
5. **Comparer la spécificité des sélecteurs** avant d'ajouter une nouvelle règle CSS.
6. **Vérifier l'état de navigation** : classes du body, attributs hidden, accordéons open, section réellement visible.
7. **Vérifier le cache/version des ressources** si une modification publiée ne change rien.
8. **Appliquer d'abord la réparation déjà connue** quand la panne est répertoriée.
9. **Supprimer la cause conflictuelle à la source** avant d'ajouter un nouveau correctif. Ne pas empiler des surcharges CSS.
10. **Conserver les cadres et dimensions déjà validés** ; corriger en priorité l'organisation intérieure.
11. **Tester un seul changement structurel à la fois** et comparer avec la capture précédente.
12. **Enregistrer toute nouvelle panne confirmée** dans ce registre avant de poursuivre les développements.
13. Si la réparation est sûre, **l'ajouter au diagnostic/réparation automatique**.
14. Toujours conserver les données utilisateur protégées pendant une réparation.

### Règle anti-boucle

Si une première correction ne produit **presque aucun changement visuel**, ne pas modifier une deuxième fois les mêmes valeurs. Revenir immédiatement aux étapes 1 à 7 pour rechercher une panne connue, une surcharge inline, un conflit de spécificité ou un cache ancien.

## Cycle de vie obligatoire d’une panne

Toute panne confirmée doit devenir une connaissance exploitable par l’application, et pas seulement une note de développement.

Pour chaque panne, enregistrer systématiquement :
1. **Symptôme utilisateur** : ce que l’utilisateur voit ou entend.
2. **Cause réelle confirmée** : la source technique du problème.
3. **Méthode de détection** : test DOM, état de page, cache, style inline, erreur vocale, taille Leaflet, etc.
4. **Niveau de réparation** : automatique sûre, semi-automatique, ou intervention de code requise.
5. **Réparation connue** : action exacte à appliquer.
6. **Données à protéger** : profil, favoris, avis, signalements, propositions et autres données utilisateur.
7. **Test de validation** : condition permettant de confirmer que la panne est réellement résolue.

### Utilisation par les outils intégrés

- **Diagnostic de fonctionnement** : doit rechercher les pannes connues qu’il sait détecter et afficher leur identifiant/cause.
- **Réparation automatique** : doit appliquer uniquement les réparations sûres et connues, puis relancer le diagnostic.
- **Panne structurelle non réparable automatiquement** : le diagnostic doit au minimum l’identifier clairement, nettoyer les états transitoires sûrs et charger la version corrigée sans toucher aux données utilisateur.
- **Nouvelle panne** : elle doit être ajoutée au registre avant d’être considérée comme définitivement traitée.

Ainsi, plus le projet avance, plus les outils Diagnostic et Réparation deviennent efficaces grâce aux problèmes déjà rencontrés.
### Cas concret : pages dédiées Carte / Filtres

Le gestionnaire `showResultToolPage()` ne doit jamais imposer `display:block!important` à l’outil actif. Cette surcharge inline empêche les règles finales `display:flex` ou `display:grid` de s’appliquer.

Règle : pour l’outil actif, supprimer la propriété inline `display` ; pour les outils inactifs seulement, utiliser `display:none!important`.
## Politique de suppression des règles obsolètes

Les correctifs temporaires ne doivent pas rester indéfiniment dans les feuilles actives.

Lorsqu’une nouvelle structure remplace une ancienne :
1. rechercher les sélecteurs dupliqués qui ciblent le même écran ;
2. identifier la règle finale réellement utilisée ;
3. supprimer les variantes anciennes devenues sans utilité ;
4. conserver une seule règle canonique par comportement ;
5. incrémenter la version de ressource pour éviter le cache ;
6. vérifier les écrans déjà validés après le nettoyage.

L’historique Git conserve les anciennes versions : elles n’ont donc pas besoin de rester actives dans le CSS de production.
## État actuel du moteur automatique

Le registre JavaScript `libcomlair-known-issues-v224.js` est chargé avant :
- `libcomlair-repair-engine-v175.js`
- `libcomlair-selftest-v189.js`

Le diagnostic peut détecter les états d'interface connus. La réparation peut normaliser les états sûrs, nettoyer les caches techniques et recharger l'application tout en conservant le profil d'accessibilité, les favoris, avis, signalements et propositions.
