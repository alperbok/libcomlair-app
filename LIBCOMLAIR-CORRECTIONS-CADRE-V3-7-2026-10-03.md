# Libcomlair — Corrections cadre v3.7

Date : 2026-10-03
Statut global : À REVALIDER SUR TÉLÉPHONE

Ce document complète l’audit Diagnostic/Réparation du 03/10/2026. Il ne transforme aucun correctif en « réparation validée » avant contrôle Samsung Browser.

## 1. Logo d’en-tête décentré

Statut : correctif candidat v3.7 — à revalider.

Symptôme : sur toutes les pages utilisant le cadre de référence, le logo Libcomlair apparaît décalé vers la droite alors que Menu et Micro sont correctement positionnés.

Cause trouvée : `libcomlair-v224-clean-logo.js` applique `transform:none!important` directement sur les logos. Le cadre de référence v2 utilisait `translateX(-50%)` pour centrer le logo ; cette translation était donc neutralisée.

Correctif candidat : ne plus dépendre d’un transform. Centrer le logo par la géométrie du header : padding gauche/droite symétrique, conteneur flex centré, logo en position relative avec marges automatiques.

Fichier test : `libcomlair-restoration-frame-reference-v3-fixes.css`.

Test attendu : logo centré de façon identique sur Profil, Navigation vocale, Présentation, Mes besoins, Accueil/Recherche, Carte/GPS, Catégories, Sous-catégories et pages profondes.

## 2. Navigation vocale — contenu central disparu

Statut : correctif candidat v3.7 — à revalider.

Symptôme : titre « Navigation vocale » et légende visibles, mais les cartes « Découverte guidée » et « Simplifié » disparaissent.

Cause probable confirmée par l’historique : combinaison `flex:1 1 0`, hauteur minimale nulle et overflow masqué qui permet aux cartes de s’effondrer. Le même défaut avait déjà été réparé dans la restauration v3.2.

Correctif candidat : restaurer des cartes non compressibles avec hauteur minimale, contenu/help explicitement visibles et fieldset en colonne.

Fichier test : `libcomlair-restoration-frame-reference-v3-fixes.css`.

Test attendu : les deux cartes, leurs explications, la note et le statut sont visibles sans scroll fantôme.

## 3. Recherche / Catégories — Transports sort en bas du cadre

Statut : correctif candidat v3.7 — à revalider.

Symptôme : la case Transports descend sous la limite basse du cadre central.

Cause : l’addition des espacements verticaux dans la grille consomme quelques pixels de trop après l’agrandissement de l’en-tête de référence.

Correctif candidat : réduire légèrement `row-gap` et supprimer le padding bas résiduel, sans modifier la taille ou le style des cases.

Fichier test : `libcomlair-restoration-frame-reference-v3-fixes.css`.

Test attendu : les sept catégories, y compris Transports, restent entièrement dans le cadre central.

## 4. Retour depuis une sous-catégorie

Statut : correctif candidat v3.7 — à revalider.

Symptôme : après ouverture d’une grande catégorie puis affichage de ses sous-catégories, Retour ramène vers un écran « Catégories » partiel, sans le haut complet de la page Recherche.

Cause trouvée : `handlePage5Back()` appelle historiquement `showPage4("categories")`, ce qui force le retour directement sur la zone Catégories.

Correctif candidat de validation : intercepter uniquement le bouton Retour du cadre maître sur une page Sous-catégories simple et appeler `LibcomlairPageFlow.showSearch()`. Les retours depuis Résultats, Carte, Favoris, Filtres, Contribuer ou Fiche détaillée restent inchangés.

Fichier test : `libcomlair-restoration-return-fix-v1.js`.

Test attendu : Retour depuis une sous-catégorie restaure la page Recherche/Catégories complète, avec recherche, compteur et sept catégories.

## 5. Règle Diagnostic / Réparation à conserver

Une panne passe dans le catalogue de Réparation uniquement après :
1. symptôme reproduit ;
2. cause identifiée ;
3. correctif appliqué ;
4. test Samsung Browser réussi ;
5. absence de régression sur les pages voisines.

Après validation v3.7 :
- fusionner les règles CSS validées dans le cadre de référence canonique ;
- intégrer les quatre entrées dans Diagnostic/Réparation ;
- mettre à jour le registre des corrections ;
- créer un point de sauvegarde intermédiaire avant les améliorations de la page Carte / Favoris / Filtres et tri / Contribuer / Résultats.
