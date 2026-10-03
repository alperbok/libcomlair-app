# Libcomlair — Corrections cadre v3.7 / v3.8 clean / v3.9

Date : 2026-10-03
Statut global : À REVALIDER SUR TÉLÉPHONE

Ce document complète l’audit Diagnostic/Réparation du 03/10/2026. Il ne transforme aucun correctif en « réparation validée » avant contrôle Samsung Browser.

## 1. Logo d’en-tête décentré

Statut : v3.7 non validé ; nouvelle correction intégrée au socle clean v3.8 — à revalider.

Symptôme : sur toutes les pages utilisant le cadre de référence, le logo Libcomlair apparaît décalé vers la droite alors que Menu et Micro sont correctement positionnés.

Cause trouvée : `libcomlair-v224-clean-logo.js` applique `transform:none!important` directement aux logos. Le cadre de référence v2 utilisait `translateX(-50%)` pour centrer le logo ; cette translation était donc neutralisée.

Résultat du test v3.7 : le logo reste trop à droite.

Correctif v3.8 clean : ne plus centrer le logo sur toute la largeur de l’écran et ne plus utiliser de transform. Le logo est positionné dans l’espace réellement disponible entre le bord droit du Menu et le bord gauche du Micro. Le Micro validé reste inchangé.

Fichier canonique de test : `libcomlair-restoration-frame-reference-v4-clean.css`.

Test attendu : logo visuellement centré entre Menu et Micro de façon identique sur Profil, Navigation vocale, Présentation, Mes besoins, Accueil/Recherche, Carte/GPS, Catégories, Sous-catégories et pages profondes.

## 2. Navigation vocale — contenu central / hauteur du cadre

Statut : contenu restauré en v3.7 ; hauteur à revalider en v3.8 clean.

Symptôme initial : titre « Navigation vocale » et légende visibles, mais les cartes « Découverte guidée » et « Simplifié » disparaissaient.

Cause : combinaison de règles flex/overflow permettant aux cartes de s’effondrer.

Résultat du test v3.7 : les deux cartes sont revenues, mais le cadre « Niveau d’assistance vocale » descend trop bas sous le contenu.

Correctif v3.8 clean : fieldset en hauteur naturelle (`flex:0 0 auto`, `height:auto`) ; cartes visibles et non compressibles ; pas de grande traîne vide en bas du cadre interne.

Fichier canonique de test : `libcomlair-restoration-frame-reference-v4-clean.css`.

Test attendu : les deux cartes, leurs explications, la note et le statut sont visibles ; le cadre s’arrête après le contenu utile ; pas de scroll fantôme.

## 3. Recherche / Catégories — Transports sort en bas du cadre

Statut : v3.8 encore trop serré en bas ; ajustement v3.9 à revalider.

Symptôme : la case Transports descend sous la limite basse du cadre central, puis le footer Retour / Suivant se retrouve trop bas.

Cause : l’addition des espacements verticaux entre les quatre rangées consomme encore trop de hauteur après l’agrandissement de l’en-tête.

Résultat du test v3.8 : Transports reste encore légèrement trop bas et le footer touche le bas du cadre extérieur.

Correctif candidat v3.9 : conserver la hauteur et le style des cases, réduire encore uniquement l’espacement vertical canonique entre les rangées (`row-gap` de 12px à 8px) et réduire légèrement la marge du titre Catégories.

Fichier de validation temporaire : `libcomlair-restoration-v3-9-spacing-fix.css`.

Test attendu : les sept catégories, y compris Transports, restent entièrement dans le cadre central et Retour / Suivant restent entièrement dans le cadre extérieur.

## 4. Retour depuis une sous-catégorie

Statut : correctif candidat — encore à revalider sur le parcours complet.

Symptôme : après ouverture d’une grande catégorie puis affichage de ses sous-catégories, Retour ramenait vers un écran « Catégories » partiel, sans le haut complet de la page Recherche.

Cause trouvée : `handlePage5Back()` appelait historiquement `showPage4("categories")`, ce qui force le retour directement sur la zone Catégories.

Correctif candidat : intercepter uniquement le Retour du cadre maître sur une page Sous-catégories simple et appeler `LibcomlairPageFlow.showSearch()`. Les retours depuis Résultats, Carte, Favoris, Filtres, Contribuer ou Fiche détaillée restent inchangés.

Fichier : `libcomlair-restoration-return-fix-v1.js`.

Test attendu : Retour depuis une sous-catégorie restaure la page Recherche/Catégories complète, avec recherche, compteur et sept catégories.

## 5. Consolidation anti-régression — socle v3.8 clean

Statut : architecture de test préparée ; à valider sur Samsung avant remplacement du chemin stable.

Décision : ne plus empiler les anciens propriétaires du cadre.

Dans `libcomlair-restoration-inner-v3-clean.html` :
- `libcomlair-v224-master-frame-integration-v1.css` n’est plus chargé ;
- `libcomlair-v224-frame-fixes-v6.css` n’est plus chargé ;
- `libcomlair-v224-frame-fixes-v6.js` est volontairement retiré pour éviter un `MutationObserver` redondant ;
- `libcomlair-restoration-frame-reference-v4-clean.css` devient l’unique propriétaire CSS du cadre ;
- les modules encore utiles sont conservés uniquement pour leur fonction propre (voix, données, menu, diagnostic, nettoyage visuel, etc.).

Règle : les anciens fichiers restent dans GitHub pour historique, Diagnostic et Réparation. Ils ne sont supprimés physiquement qu’après validation du chemin clean et vérification qu’aucune fonction utile ne dépend encore d’eux.

## 6. Mes besoins — cadre intérieur trop long

Statut : ajustement v3.9 à revalider.

Symptôme : avec un dossier comme Vision ouvert, le cadre intérieur descend trop bas et donne l’impression de dépasser la hauteur utile de la page.

Cause probable : addition de la hauteur minimale du cadre central, des gaps entre dossiers et des marges internes de chaque critère.

Correctif candidat v3.9 : réduire très légèrement la hauteur minimale du cadre central, les gaps entre dossiers, les marges du titre/profil et les espacements internes des critères, sans supprimer le défilement utile quand plusieurs dossiers sont ouverts.

Fichier de validation temporaire : `libcomlair-restoration-v3-9-spacing-fix.css`.

Test attendu : avec Vision ouvert, le cadre intérieur s’arrête plus haut ; avec plusieurs dossiers ouverts, le défilement historique reste disponible.

## 7. Règle Diagnostic / Réparation à conserver

Une panne passe dans le catalogue de Réparation uniquement après :
1. symptôme reproduit ;
2. cause identifiée ;
3. correctif appliqué ;
4. test Samsung Browser réussi ;
5. absence de régression sur les pages voisines.

Après validation v3.9 :
- fusionner les deux ajustements d’espacement dans `libcomlair-restoration-frame-reference-v4-clean.css` ou sa prochaine version canonique ;
- supprimer le patch temporaire du chemin actif ;
- passer les entrées validées dans Diagnostic/Réparation ;
- mettre à jour le registre des corrections ;
- créer un point de sauvegarde intermédiaire ;
- seulement ensuite travailler les améliorations de la page Carte / Favoris / Filtres et tri / Contribuer / Résultats.
