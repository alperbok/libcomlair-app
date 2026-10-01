# Libcomlair — sécurité, sauvegardes et indépendance

## Règle fondamentale
Libcomlair ne doit dépendre d'aucun hébergeur, fournisseur de données ou service unique pour continuer à fonctionner.

Le plan opérationnel détaillé est suivi dans `docs/ROADMAP-INDEPENDANCE-COMPLETE.md`.

## 1. Source de vérité
- Le dépôt GitHub `alperbok/libcomlair-app`, branche `main`, reste la source de travail principale.
- Toute modification fonctionnelle doit être versionnée.
- Les données générées importantes doivent être reproductibles à partir de leur source officielle ou sauvegardées.
- Les décisions d’architecture critiques doivent être consignées dans le dépôt et ne pas dépendre uniquement de l’historique des conversations.

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

## 4. Render et services distants
Render est considéré comme un fournisseur d'exécution, jamais comme une sauvegarde ni comme une dépendance acceptable à long terme pour une fonction essentielle.

- aucune donnée irremplaçable ne doit être stockée uniquement sur le disque local Render ;
- aucune base Render ne doit être l'unique copie d'une donnée utilisateur ou métier ;
- toute fonction Render doit disposer d'un plan de remplacement avant suppression ;
- une fonction essentielle doit pouvoir migrer vers une solution locale ou un autre fournisseur sans changer ses règles fonctionnelles.

### Dépendance vocale actuelle
La version v224 contient encore une dépendance active à `libcomlair-backend.onrender.com` pour la génération de voix naturelle.

La transition est organisée ainsi :

1. collecte des phrases et audios pendant que Render fonctionne ;
2. bibliothèque audio locale ;
3. dictionnaire vocal Libcomlair ;
4. moteur TTS local hors ligne ;
5. reconnaissance vocale locale ;
6. test d’autonomie totale ;
7. Render devient un secours transitoire puis cesse d’être une dépendance critique.

Documents associés :

- `docs/voice-independence-legal-plan.md` ;
- `docs/REGISTRE-COMPOSANTS-VOCAUX.md` ;
- `docs/TEST-AUTONOMIE-TOTALE.md` ;
- `data/voice/README.md`.

## 5. Données externes
Pour chaque source (Acceslibre, IDFM, Vitalis, SNCF, Geoapify, BAN, etc.) :
- conserver la source et la date de mise à jour ;
- surveiller les échecs et retards ;
- conserver une dernière copie exploitable lorsque la licence le permet ;
- prévoir une source de secours lorsqu'elle existe ;
- convertir progressivement les données utiles vers un modèle interne commun afin que les fonctions Libcomlair ne dépendent pas du format d’une API particulière.

## 6. Fonctionnement hors connexion
À terme, les fonctions essentielles doivent rester disponibles sans réseau :

- cadre de l’application ;
- profils et préférences ;
- critères d’accessibilité ;
- favoris ;
- tutoriels et aides ;
- diagnostic ;
- données locales disponibles ;
- voix fixe ;
- synthèse dynamique locale ;
- commandes vocales locales ;
- contributions enregistrées en attente de synchronisation.

Internet doit principalement servir à l’actualisation et à l’enrichissement.

## 7. Comptes utilisateurs et futures données personnelles
Lorsque les comptes Libcomlair seront créés :
- la base principale devra avoir des sauvegardes automatiques ;
- une copie chiffrée indépendante du fournisseur principal devra exister ;
- les restaurations devront être testées ;
- les secrets/API ne devront jamais être stockés en clair dans le code public ;
- les profils et préférences devront être exportables ou récupérables ;
- les enregistrements du dictaphone devront avoir une finalité, une durée de conservation et une suppression clairement prévues.

## 8. Licences et traçabilité
Aucun moteur, modèle, dictionnaire, fichier audio ou jeu de données tiers ne doit devenir une dépendance de production avant vérification de :

- la licence du code ;
- la licence du modèle ou des données ;
- le droit de redistribution ;
- l’attribution requise ;
- les obligations de partage ;
- les dépendances transitives ;
- la compatibilité avec les autres composants.

Le registre vocal est conservé dans `docs/REGISTRE-COMPOSANTS-VOCAUX.md`.

## 9. Diagnostic et réparation
Le Diagnostic doit progressivement contrôler les composants essentiels plutôt que des symptômes isolés :

- affichage ;
- navigation ;
- moteur vocal ;
- dictionnaire ;
- bibliothèque audio ;
- microphone ;
- GPS ;
- données ;
- stockage ;
- intégrité des fichiers ;
- fonctionnement hors ligne.

Une réparation doit être ciblée et ne pas effacer inutilement les profils, favoris ou données utilisateur.

## 10. Retour arrière après mise à jour
Une future mise à jour ne doit pas pouvoir rendre l’application durablement inutilisable. Une version fonctionnelle précédente doit pouvoir être conservée ou restaurée lorsque l’architecture le permettra.

## 11. Restauration
Une sauvegarde n'est considérée comme fiable que si elle peut être restaurée.
Le contrôle devra vérifier périodiquement :
1. le bundle Git ;
2. l'archive courante ;
3. les sommes SHA-256 ;
4. la possibilité de reconstruire une copie exploitable du site ;
5. la présence des données vocales et autres ressources essentielles dont Libcomlair est autorisé à conserver une copie.

## 12. Principe de migration
L'application doit pouvoir changer d'hébergeur, de fournisseur vocal ou de source de données sans modifier ses règles fonctionnelles : profils, accessibilité, catégories, navigation vocale, diagnostic et données locales doivent rester identiques.

## 13. Critère d’indépendance complète
L’indépendance complète est validée uniquement lorsque le protocole `docs/TEST-AUTONOMIE-TOTALE.md` réussit sur téléphone réel avec :

- mode avion ;
- Render indisponible ;
- aucun téléchargement obligatoire ;
- voix essentielle locale ;
- lecture dynamique locale ;
- commandes vocales locales ;
- données locales disponibles ;
- diagnostic fonctionnel ;
- redémarrage réussi.

## Objectif final
Une panne de Render, GitHub Pages, d'une API ou d'un autre service peut empêcher temporairement une mise à jour ou l’accès à des données fraîches, mais ne doit jamais provoquer la perte du projet, de données irremplaçables, ni rendre muettes ou inutilisables les fonctions essentielles de Libcomlair.
