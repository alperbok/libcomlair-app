# Dépendances externes restantes — Libcomlair

Date de référence : 2026-10-01.

## Règle

Aucune dépendance externe ne doit pouvoir empêcher l'ouverture, la navigation essentielle, le diagnostic ou l'accès aux fonctions déjà rendues locales.

Une dépendance externe peut enrichir Libcomlair, mais elle ne doit pas devenir un verrou d'entrée.

## Tableau de suivi

| Fonction | Dépendance externe actuelle | Risque | Cible | Statut |
|---|---|---|---|---|
| Entrée dans l'application | aucune autorisée | critique | navigation toujours disponible | corrigé à valider sur Samsung |
| Voix d'accueil | Render encore nécessaire si aucun audio local n'existe | élevé | fichier audio Libcomlair empaqueté | pack v1 en construction |
| Phrases fixes | Render majoritaire | élevé | pack vocal local versionné | à migrer |
| Informations dynamiques | Render | élevé | TTS local + dictionnaire | à construire |
| Micro / reconnaissance | composants navigateur / externes selon chemin | élevé | reconnaissance locale auditée | à construire |
| Recherche de lieux | sources réseau pour actualisation | moyen | base locale comme source de lecture | en transition |
| Autour de moi | Geoapify + IDFM pour actualisation | moyen | cache local + mode dégradé explicite | en transition |
| Carte | tuiles réseau | moyen | stratégie hors ligne à définir | à construire |
| Diagnostic essentiel | doit rester local | critique | fonctionnement local | en cours |

## Accueil

Depuis le module `libcomlair-v224-welcome-local-first-v17.js`, le démarrage suit cette règle :

1. la navigation vers le choix de profil reste toujours disponible ;
2. un audio fixe empaqueté est utilisé en priorité s'il existe ;
3. sinon, un audio déjà présent dans la bibliothèque locale du téléphone peut être lu ;
4. aucune requête Render n'est lancée par le module d'accueil ;
5. l'absence de voix ne bloque jamais l'accès à l'application.

## Critère de sortie de Render pour une fonction

Une fonction est considérée indépendante de Render lorsque :

- son chemin essentiel n'appelle plus Render ;
- son contenu local est versionné ;
- son diagnostic identifie clairement la source locale active ;
- son fonctionnement a été validé avec Render inaccessible ;
- la validation physique a été faite sur le Samsung lorsque l'audio, le micro ou l'affichage sont concernés.

## Ordre de migration recommandé

1. accueil ;
2. navigation essentielle ;
3. Présentation Libcomlair ;
4. critères et catégories ;
5. confirmations du micro ;
6. diagnostic et réparation ;
7. fiches dynamiques ;
8. reconnaissance vocale locale.
