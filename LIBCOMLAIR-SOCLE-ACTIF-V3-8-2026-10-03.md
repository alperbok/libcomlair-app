# Libcomlair — socle actif v3.8 clean

Date : 2026-10-03
Statut : à revalider sur Samsung avant promotion comme sauvegarde de référence.

## Principe

Les anciens fichiers restent dans GitHub pour l'historique, Diagnostic et Réparation, mais les anciens CSS de cadre ne doivent plus être exécutés dans le socle actif.

## Cadre actif unique

CSS canonique :
- `libcomlair-restoration-frame-reference-v4-clean.css`

Ce fichier devient l'unique propriétaire de :
- cadre extérieur des pages internes ;
- Menu ;
- position et zone du logo ;
- Micro 100 px validé ;
- cadre central ;
- footer Retour / Suivant / Valider ;
- comportement de Mes besoins ;
- Navigation vocale ;
- Recherche/Catégories ;
- Sous-catégories ;
- intégration Carte/GPS dans le cadre.

## Anciens CSS de cadre retirés du socle v3.8

Ils restent conservés dans GitHub mais ne sont plus chargés par `libcomlair-restoration-inner-v3-clean.html` :
- `libcomlair-v224-master-frame-integration-v1.css` ;
- `libcomlair-v224-frame-fixes-v6.css` ;
- `libcomlair-restoration-frame-reference-v2.css` ;
- `libcomlair-restoration-frame-reference-v3-fixes.css` ;
- `libcomlair-restoration-profile-menu-proxy-v1.css` (règles fusionnées dans v4 clean).

## Ancien JavaScript retiré

- `libcomlair-v224-frame-fixes-v6.js` : retiré du socle clean car il répétait le masquage des anciennes navigations et ajoutait un `MutationObserver` redondant. Le contrôleur `libcomlair-v224-master-frame-integration-v1.js` assure déjà la construction et la synchronisation du cadre.

## Modules anciens encore conservés parce qu'ils ont une fonction utile

- `libcomlair-v224-master-frame-integration-v1.js` : construit réellement le shell Menu/Logo/Micro/Main/Footer et route les boutons du cadre.
- `libcomlair-v224-clean-logo.js` : masque encore la petite anomalie graphique de l'image source du logo. Son contrôle de position n'est plus utilisé par le cadre v4 ; le centrage se fait sans `transform`.
- modules historiques de voix / données / présentation : conservés tant que leur remplacement fonctionnel n'est pas validé.

## Corrections v3.8 à revalider téléphone

1. Logo centré dans l'espace libre entre Menu et Micro, pas au centre géométrique de la page.
2. Micro 100 px inchangé.
3. Navigation vocale : le cadre `Niveau d'assistance vocale` s'arrête après son contenu et ne descend plus inutilement jusqu'au footer.
4. Recherche/Catégories : espacement vertical réduit de 22 px à 17 px pour garder Transports entièrement dans le cadre.
5. Retour sous-catégorie : conservation du correctif vers la page Recherche/Catégories complète.

## Règle Diagnostic/Réparation

Après validation Samsung :
- passer les corrections ci-dessus en `VALIDÉ TÉLÉPHONE` ;
- ajouter les symptômes/causes/réparations au registre Diagnostic/Réparation ;
- enregistrer la liste des modules actifs autorisés ;
- détecter comme anomalie tout ancien CSS de cadre chargé en parallèle du CSS canonique.
