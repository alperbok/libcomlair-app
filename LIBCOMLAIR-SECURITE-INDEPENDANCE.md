# Libcomlair — sécurité, sauvegardes et indépendance

## Règle fondamentale
Libcomlair ne doit dépendre d'aucun hébergeur, fournisseur de données ou service unique pour continuer à fonctionner.

## 1. Source de vérité
- Le dépôt GitHub `alperbok/libcomlair-app`, branche `main`, reste la source de travail principale.
- Toute modification fonctionnelle doit être versionnée.
- Les données générées importantes doivent être reproductibles à partir de leur source officielle ou sauvegardées.

## 2. Sauvegarde automatique du dépôt
Le workflow `.github/workflows/backup-repository.yml` crée chaque jour une sauvegarde complète contenant :
- un `git bundle` avec l'historique Git complet ;
- une archive de l'état courant ;
- le SHA du commit sauvegardé ;
- les sommes SHA-256 des fichiers et des archives ;
- la date UTC de création.

L'intégrité du dépôt est contrôlée avec `git fsck --full` avant création de la sauvegarde.

## 3. Copie hors GitHub
Une copie externe périodique doit être conservée sur un fournisseur distinct (par exemple Google Drive ou autre stockage choisi ultérieurement). Cette copie doit contenir au minimum le bundle Git complet et l'archive courante.

Objectif : pouvoir restaurer Libcomlair même en cas de perte d'accès à GitHub.

## 4. Render
Render est considéré comme un fournisseur d'exécution, jamais comme une sauvegarde.
- aucune donnée irremplaçable ne doit être stockée uniquement sur le disque local Render ;
- aucune base Render ne doit être l'unique copie d'une donnée utilisateur ou métier ;
- toute fonction Render doit disposer d'un plan de remplacement avant suppression.

### Dépendance actuelle à auditer
La version v224 contient encore une dépendance historique/active à `libcomlair-backend.onrender.com` pour la voix naturelle. Cette dépendance ne doit pas être supprimée tant qu'un moteur de secours indépendant n'a pas été testé et validé.

## 5. Données externes
Pour chaque source (Acceslibre, IDFM, Vitalis, SNCF, Geoapify, BAN, etc.) :
- conserver la source et la date de mise à jour ;
- surveiller les échecs et retards ;
- conserver une dernière copie exploitable lorsque la licence le permet ;
- prévoir une source de secours lorsqu'elle existe.

## 6. Comptes utilisateurs et futures données personnelles
Lorsque les comptes Libcomlair seront créés :
- la base principale devra avoir des sauvegardes automatiques ;
- une copie chiffrée indépendante du fournisseur principal devra exister ;
- les restaurations devront être testées ;
- les secrets/API ne devront jamais être stockés en clair dans le code public.

## 7. Restauration
Une sauvegarde n'est considérée comme fiable que si elle peut être restaurée.
Le contrôle devra vérifier périodiquement :
1. le bundle Git ;
2. l'archive courante ;
3. les sommes SHA-256 ;
4. la possibilité de reconstruire une copie exploitable du site.

## 8. Principe de migration
L'application doit pouvoir changer d'hébergeur sans modifier ses règles fonctionnelles : profils, accessibilité, catégories, navigation vocale, diagnostic et données locales doivent rester identiques.

## Objectif final
Une panne de Render, GitHub Pages, d'une API ou d'un autre service peut réduire temporairement une fonction, mais ne doit jamais provoquer la perte du projet ni de données irremplaçables.
