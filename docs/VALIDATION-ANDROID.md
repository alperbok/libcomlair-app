# Libcomlair — cible Android et validation multi-appareils

Date de création : 2026-10-01

## Cible officielle actuelle

Libcomlair cible les **smartphones Android**. iPhone/iOS et les autres plateformes ne font pas partie du périmètre actuel.

Samsung n’est pas une exigence de l’application. Le téléphone Samsung actuellement utilisé sert d’**appareil de référence de développement et de validation courante** parce qu’il est disponible pour les tests physiques.

Une fonction ne doit jamais être conçue comme « compatible Samsung » seulement. Elle doit être conçue pour Android et les particularités d’un constructeur doivent rester isolées.

## Surfaces de test

Pendant le développement, Libcomlair peut être testé via :

- la page GitHub dans un navigateur Android ;
- le navigateur utilisé sur l’appareil de référence ;
- Chrome Android lorsque pertinent ;
- plus tard, l’application Android installée et son WebView ou sa couche native.

Le comportement d’un navigateur ne doit pas être considéré comme une garantie du comportement de l’application Android installée, notamment pour l’audio automatique, le microphone, les permissions, le stockage, la caméra et le fonctionnement hors ligne.

## Niveaux de validation

### Niveau 1 — développement courant

- appareil Android réel de référence ;
- aujourd’hui : le Samsung disponible pour les tests ;
- validation des régressions visuelles, tactiles, vocales, micro, GPS, photo et stockage.

### Niveau 2 — avant promotion stable d’une fonction sensible

Lorsque possible, vérifier au moins un **second appareil Android d’un constructeur différent** pour les fonctions dépendantes du matériel, du navigateur, du WebView ou des permissions.

Les différences constatées doivent être enregistrées comme différences Android/constructeur et non comme comportement général de Libcomlair.

### Niveau 3 — avant diffusion Android large

Définir une matrice représentative couvrant :

- plusieurs constructeurs Android ;
- plusieurs versions Android dans la plage officiellement supportée ;
- différentes tailles d’écran ;
- appareil aux performances modestes et appareil plus récent ;
- TTS et reconnaissance vocale disponibles sur l’appareil ;
- appareil photo, GPS, stockage, permissions et mode hors ligne ;
- application installée, pas uniquement navigateur Web.

La version Android minimale supportée sera décidée lors de la création de la coque Android réelle en fonction des bibliothèques retenues et des tests. Elle ne doit pas être inventée avant cette étape.

## Règle constructeur

Si une anomalie ne se produit que chez un constructeur :

1. conserver le comportement Android standard comme référence ;
2. documenter l’anomalie précise ;
3. isoler le correctif si un traitement spécifique est réellement nécessaire ;
4. ne jamais modifier le comportement de tous les appareils pour contourner un problème propre à une marque ;
5. prévoir un diagnostic permettant d’identifier la capacité concernée plutôt que de se fier uniquement au nom du constructeur.

## Validation physique

Un test dans le code, sur ordinateur ou dans un émulateur ne remplace pas un test sur smartphone Android réel pour les fonctions qui dépendent de :

- affichage et tactile ;
- voix et lecture audio ;
- microphone ;
- caméra et galerie ;
- GPS ;
- permissions Android ;
- stockage local ;
- performances ;
- fonctionnement hors ligne ;
- reprise après fermeture ou redémarrage.

## Historique Samsung

Les anciennes mentions « Samsung Browser » ou « validé sur Samsung » dans les journaux de bugs restent correctes : elles indiquent **où un problème historique a été observé ou validé**. Elles ne définissent pas la plateforme cible de Libcomlair.
