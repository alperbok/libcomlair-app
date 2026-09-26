# Libcomlair — Cartographie technique de l’installation

> Référence technique vivante pour le développement, le diagnostic et la réparation.
> Toute modification importante de Libcomlair doit être comparée à cette cartographie avant d’être considérée comme terminée.

## 1. Point d’entrée principal

### `test-v224-profile-compact.html`
Rôle :
- assemble l’interface actuelle ;
- charge les feuilles CSS ;
- charge les moteurs JavaScript ;
- contient les principaux écrans, boutons, formulaires et zones d’information.

Éléments critiques :
- ordre des feuilles CSS ;
- ordre des scripts ;
- identifiants DOM utilisés par plusieurs moteurs ;
- versions de cache `?v=`.

Risque principal :
une modification visuelle ou fonctionnelle peut sembler correcte dans un fichier mais être écrasée par un fichier chargé plus tard.

Contrôles obligatoires après modification :
- vérifier la version CSS/JS chargée ;
- vérifier qu’aucun identifiant utilisé par JavaScript n’a disparu ;
- vérifier les écrans déjà validés.

---

## 2. Navigation et état des pages

### `libcomlair-v224-page-flow.js`
Rôle :
- pilote les écrans 3, 4 et 5 ;
- ouvre les catégories et sous-catégories ;
- ouvre les pages dédiées Carte, Favoris, Filtres, Contribuer et Résultats ;
- synchronise l’affichage manuel avec certaines actions vocales ;
- expose `window.LibcomlairPageFlow`.

API publique actuelle :
- `showCategories()`
- `showSearch()`
- `showCategory()`
- `showResults()`
- `showUtility()`
- `openResultAccordion()`
- `showResultToolPage()`
- `showResultsAgain()`
- `currentCategory()`

Risque principal :
désynchronisation entre :
- classes du `body`,
- attributs `hidden`,
- propriété `open` des `details`,
- styles inline `display`,
- état vocal.

Diagnostic associé :
- vérifier l’écran attendu ;
- vérifier les classes `body` ;
- vérifier les sections réellement visibles ;
- vérifier les styles inline.

---

## 3. Interface principale, résultats et logique métier actuelle

### `libcomlair-v221-secure.js`
Rôle :
- logique centrale historique encore très importante ;
- filtres et tri ;
- favoris ;
- affichage des résultats ;
- fiches ;
- recherche ;
- critères ;
- propositions ;
- géolocalisation ;
- grande partie des commandes vocales ;
- dictée actuelle ;
- intégrations de données.

Ce fichier reste un composant critique : toute refonte doit éviter de casser les identifiants DOM ou les événements qu’il utilise.

Données locales importantes :
- `libcomlair-proposals-v13`
- `libcomlair-access-profile-v1`
- `libcomlair-reports-v16`
- `libcomlair-reviews-v18`
- `libcomlair-favorites-v16`
- caches Geoapify / IDFM / adresses

Règle :
une réparation automatique ne doit jamais supprimer ces données utilisateur sans action explicite.

---

## 4. Assistance vocale

### `libcomlair-render-voice-v195.js`
Rôle :
- génération et lecture de la voix naturelle via le backend Render ;
- gestion du contexte audio Android ;
- préchargement ;
- cache audio ;
- émission des états de la voix.

Dépendance :
- backend `https://libcomlair-backend.onrender.com`

Risques :
- Render indisponible ou en réveil ;
- audio Android verrouillé ;
- délai réseau ;
- lecture interrompue.

### `libcomlair-v224-voice-context.js`
Rôle :
- détecte l’écran réellement actif ;
- distingue accueil, recherche, catégorie, sous-catégorie, Carte, Favoris, Filtres, Contribuer, Résultats et fiche détaillée ;
- expose `window.LibcomlairVoiceContext` ;
- fournit les commandes autorisées pour le contexte courant ;
- émet `libcomlair-voice-context-change` lorsque l’écran vocal change.

Principe de sécurité :
ce composant ne déclenche aucune commande utilisateur. Il décrit uniquement le contexte. Le moteur de reconnaissance sera raccordé à cette source après validation.

Diagnostic :
`libcomlair-selftest-v189.js` vérifie maintenant que ce moteur est chargé et sait identifier un contexte.

### `libcomlair-voice-engine-v189.js`
Rôle :
- couche intermédiaire commune ;
- expose `window.LibcomlairVoice` ;
- gère lecture, annulation, état de reconnaissance, file d’attente et diagnostic vocal.

### Niveaux d’assistance pour le profil Vision

Le système vocal cible deux modes :
- **Découverte guidée** : explique complètement chaque page, toutes les cases cochables, leur état, les boutons, les choix et les commandes disponibles.
- **Assistance simplifiée** : fonctionnement quotidien plus court, avec aide détaillée disponible à la demande.

Cette préférence doit rester locale à l’appareil et être réversible à tout moment.

Principe d’accessibilité :
tout contrôle visuel interactif doit posséder un équivalent vocal utilisable.

Préférence locale : `libcomlair-voice-assistance-mode-v1`.
- sans préférence explicite + profil Vision : `discovery` ;
- choix explicite possible : `discovery` ou `simplified` ;
- le réglage n’altère aucune donnée utilisateur métier.

### Lecture des zones explicatives

L’accessibilité vocale ne concerne pas seulement les contrôles interactifs.

Les encadrés d’aide, notices, descriptions, tutoriels et autres textes explicatifs visibles doivent :
- être détectables par l’assistance vocale ;
- être proposés à la lecture ;
- pouvoir être lus sur commande ;
- être distingués des choix interactifs.

En mode découverte, les explications nécessaires à la compréhension d’une page peuvent être lues automatiquement. En mode simplifié, elles restent disponibles à la demande.

### Reconnaissance vocale actuelle
Principalement dans `libcomlair-v221-secure.js`.

État actuel :
- trop couplée à une variable `step` historique ;
- nouveaux écrans pas encore tous représentés ;
- commandes et écran réel peuvent se désynchroniser.

Évolution prévue :
voir `LIBCOMLAIR-VOICE-CONTEXT-MATRIX.md`.

Principe futur :
le contexte vocal doit être dérivé de l’écran réel affiché.

---

## 5. Dictée vocale

État actuel :
la dictée existe pour certains champs ayant la classe `.voice-dictate`.

Champs actuellement couverts :
- commentaire de contribution ;
- avis ;
- signalement d’erreur.

Champs de Contribuer encore à rendre accessibles vocalement :
- nom ;
- ville ;
- adresse ;
- téléphone ;
- site internet ;
- catégorie ;
- emplacement ;
- critères d’accessibilité ;
- validation finale.

Évolution cible :
dictée guidée avec :
1. question vocale ;
2. réponse utilisateur ;
3. transcription ;
4. relecture ;
5. « Valider / Modifier / Recommencer / Passer ».

---

## 6. Données et sources externes

### `libcomlair-data-engine-v173.js`
Rôle :
- état d’actualisation automatique ;
- fraîcheur des sources ;
- fonctions de données communes.

### `libcomlair-transport-engine-v173.js`
Rôle :
- normalisation des données de transport ;
- traitements liés aux arrêts et réseaux.

Sources utilisées :
- Geoapify ;
- Île-de-France Mobilités ;
- backend Libcomlair sur Render.

Risques :
- quota ;
- données manquantes ;
- doublons ;
- délais réseau ;
- changement d’API ;
- réponses partielles.

Règle :
une panne de source externe ne doit pas supprimer les données déjà disponibles localement.

---

## 7. Cartographie

La carte utilise Leaflet.

Panne connue :
calcul de taille pendant que le conteneur est masqué, pouvant produire une carte partiellement grise.

Écran Carte actuellement validé visuellement :
ne pas modifier ses dimensions sans demande explicite.

Contrôle :
- conteneur visible ;
- hauteur réelle > 0 ;
- redimensionnement / `invalidateSize` après affichage ;
- géolocalisation indépendante du rendu de la carte.

---

## 8. CSS et présentation

Feuilles particulièrement importantes :
- `libcomlair-v224-page3.css`
- `libcomlair-v224-page4.css`
- `libcomlair-v224-page5.css`
- `libcomlair-v224-final-pages.css`

Risque historique majeur :
accumulation de corrections successives visant les mêmes sélecteurs.

Pannes récurrentes :
- ancienne règle avec plus forte spécificité ;
- `!important` ancien ;
- style inline JavaScript ;
- hauteur fixe obsolète ;
- `overflow:hidden` ;
- état `details/open` ;
- cache navigateur.

Règle de maintenance :
- ne pas empiler un correctif sur un autre si la première modification ne change presque rien ;
- rechercher la règle réellement prioritaire ;
- supprimer les règles obsolètes une fois leur remplacement validé ;
- conserver l’historique dans Git, pas dans le CSS actif.

---

## 9. Diagnostic et réparation

### `libcomlair-known-issues-v224.js`
Rôle :
registre machine des pannes connues.

États à distinguer :
- suspectée ;
- confirmée ;
- partiellement réparée ;
- réparée et validée.

Une panne ne doit être utilisée comme référence fiable pour la réparation automatique que si sa réparation a été réellement testée.

### `LIBCOMLAIR-KNOWN-ISSUES.md`
Rôle :
documentation humaine détaillée des symptômes, causes, détection et réparations.

### `libcomlair-selftest-v189.js`
Rôle :
- diagnostic automatique ;
- vérification des moteurs attendus ;
- collecte des erreurs d’exécution ;
- exposition de `window.LibcomlairDiagnostics`.

### `libcomlair-repair-engine-v175.js`
Rôle :
- réparations techniques sûres ;
- conservation des données utilisateur ;
- coopération avec Known Issues et Diagnostics.

Règle fondamentale :
la réparation automatique doit réparer l’environnement ou l’état technique sans effacer :
- favoris ;
- propositions ;
- avis ;
- signalements ;
- profil d’accessibilité ;
- données utilisateur.

---

## 10. Flux fonctionnel actuel

1. Bienvenue
2. Profil d’accessibilité
3. Accueil / aide / présentation
4. Recherche + critères + catégories
5. Catégorie + sous-catégories
6. Menu de sous-catégorie
7. Pages dédiées :
   - Carte
   - Favoris
   - Filtres et tri
   - Contribuer
   - Résultats
8. Fiche détaillée

Toute navigation vocale doit reproduire exactement ce flux.

---

## 11. Écrans actuellement considérés stables

### Bienvenue
Présentation validée.

### Profil d’accessibilité
Présentation validée.

### Page 3
Présentation globalement validée.

### Page 4
Présentation validée pour la poursuite du travail.

### Page 5
Présentation validée pour la poursuite du travail.

### Carte
Présentation validée et à figer.

### Favoris
Organisation dynamique par catégorie validée.

### Filtres et tri
État : **partiellement réparé**.
- contenu visible ;
- contrôles disponibles ;
- remplissage vertical complet encore non résolu.

### Résultats
Présentation à conserver.

### Contribuer
À réorganiser.

### Micro / assistance vocale
À refondre vers un fonctionnement contextuel page par page.

---

## 12. Protocole avant toute évolution importante

Avant modification :

1. identifier le composant propriétaire du comportement ;
2. consulter les pannes connues ;
3. vérifier les dépendances dans cette cartographie ;
4. rechercher les styles inline ;
5. rechercher les sélecteurs CSS concurrents ;
6. vérifier les classes et états de page ;
7. relever les données utilisateur susceptibles d’être touchées ;
8. définir les écrans déjà validés à protéger.

Après modification :

1. tester la fonction modifiée ;
2. tester le retour arrière ;
3. tester au moins un écran voisin ;
4. vérifier la Carte si une règle commune de layout a changé ;
5. vérifier la voix si la navigation ou les identifiants DOM ont changé ;
6. vérifier que les données utilisateur sont intactes ;
7. mettre à jour Known Issues seulement après diagnostic réel ;
8. classer la panne selon son état réel ;
9. mettre à jour cette cartographie si l’architecture a changé.

---

## 13. Principe pour les futures réparations

Le diagnostic doit répondre dans cet ordre :

1. **Quel écran est actif ?**
2. **Quel composant devrait piloter ce comportement ?**
3. **Quelle règle ou quel script agit réellement ?**
4. **Existe-t-il déjà une panne identique réparée et validée ?**
5. **Peut-on réparer sans toucher aux données utilisateur ?**
6. **Comment vérifier automatiquement que la réparation a réussi ?**

Une réparation n’est terminée que lorsque le test de validation correspondant réussit.

---

## 14. Documents de référence associés

- `LIBCOMLAIR-KNOWN-ISSUES.md` — registre détaillé des pannes
- `libcomlair-known-issues-v224.js` — registre exploitable par le diagnostic
- `LIBCOMLAIR-VOICE-CONTEXT-MATRIX.md` — comportement vocal attendu par écran
- ce document — architecture et dépendances de l’installation

Ces documents doivent évoluer avec l’application.
