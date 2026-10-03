# Libcomlair — Audit historique de récupération — 22 au 30 septembre 2026

Date de consolidation : 2026-10-03

## Objet

Ce document reconstitue le travail réalisé du 22 au 30 septembre 2026 afin d’éviter de reconstruire des fonctions déjà développées, corrigées ou validées.

Il croise quatre sources :

1. les échanges et validations sur téléphone Samsung ;
2. l’historique GitHub et les chaînes de commits ;
3. les registres Diagnostic / Réparation / Known Issues ;
4. les incidents Render et autres incidents d’environnement documentés.

Il ne remplace pas le registre maître du patrimoine. Il sert de chronologie de récupération et de filtre anti-régression.

## États utilisés

- **VALIDÉ TÉLÉPHONE** : comportement réellement confirmé dans l’application sur téléphone.
- **RÉPARÉ / À REVALIDER** : cause comprise et correctif installé, mais validation complète à refaire.
- **PARTIEL** : une partie fonctionne, mais un défaut est encore documenté.
- **REMPLACÉ** : étape historique abandonnée au profit d’une architecture plus récente.
- **ÉCHEC / NE PAS RESTAURER** : essai ayant créé ou conservé une panne.
- **PROJET / PRÉPARÉ** : prévu pour plus tard, non actif comme fonction finale.

---

# 1. Règles de récupération

## 1.1 Dernière validation réelle avant numéro de version

Un fichier portant un numéro plus élevé n’est pas automatiquement la bonne référence.

Pour chaque fonction, retenir :

`besoin utilisateur → panne observée → cause démontrée → correctif → amélioration → dernière validation réelle`.

## 1.2 Ne pas restaurer une étape intermédiaire

Exemples :

- les accordéons de catégories V160 ont été utiles le 23 septembre mais ont ensuite été remplacés par de véritables écrans Catégories / Sous-catégories ;
- plusieurs versions de Carte/GPS ont été abandonnées après des boucles Samsung ;
- plusieurs versions d’accueil vocal ont échoué avant la solution validée ;
- plusieurs versions Filtres ont rendu le contenu visible sans atteindre le rendu final attendu.

## 1.3 Le cadre ne doit pas être adapté au contenu

Règle déjà validée le 25 septembre : le cadre, le logo et les zones fixes restent stables ; on adapte la répartition intérieure et le défilement.

Sous le cadre maître, cette règle devient :

- haut : Menu — logo — Micro ;
- centre : contenu adaptatif ;
- bas : Retour / Suivant ou action contextuelle ;
- page courte : utiliser l’espace disponible sans scroll inutile ;
- page longue : scroll géré par le cadre maître ;
- aucune navigation native ou ancien en-tête ne doit se superposer.

## 1.4 Séparer panne application et panne infrastructure

Une panne Render, un cache Samsung, une ressource CSS ancienne ou un problème du présentateur vocal ne sont pas la même panne.

Ne jamais modifier un composant fonctionnel tant que la chaîne réelle n’est pas identifiée.

---

# 2. Chronologie

## 22 septembre — Transport / IDFM

Travail principal : fiabilisation des transports et des arrêts voyageurs.

Acquis importants :

- listes IDFM réelles ;
- distinction des arrêts homonymes par identifiant ;
- regroupements plus lisibles pour les gares routières ;
- adresses ;
- lignes et directions dans la fiche ;
- conservation des arrêts physiquement distincts ;
- préparation des audits de couverture IDFM V132 à V135 ;
- Autour de moi → Transports → Bus / Arrêt déjà utilisé dans les tests.

Règle à conserver : les directions et identifiants appartiennent aux données transport, pas au simple libellé visuel.

État : **base fonctionnelle**, améliorée les jours suivants.

## 23 septembre — directions IDFM, catégories, Présentation, voix et diagnostic

### Directions IDFM

Chaîne utile :

- V152 : affichage des directions ;
- V153 : chargement plus résilient ;
- génération / index de fragments statiques ;
- fallback backend ;
- mises à jour automatiques ;
- V157 : tests réels de plusieurs arrêts au hasard confirmés par l’utilisateur.

État : **VALIDÉ TÉLÉPHONE** sur le comportement V157, puis enrichi ensuite.

Ne pas restaurer V152 ou V153 seules.

### Catégories

Étapes historiques :

- V158 : tentative de supprimer les doublons — insuffisante ;
- V159 : masquage plus agressif — boutons du haut perturbés ;
- V160 : navigation uniquement par accordéons, commandes vocales conservées.

État : **REMPLACÉ**. Ces accordéons ne sont pas l’architecture finale de navigation.

### Présentation Libcomlair / Vision

- renommage de l’ancienne introduction en **Présentation Libcomlair** ;
- V162/V163 : déclenchement automatique pour Vision ;
- lecture rejouée lors d’une nouvelle entrée dans Vision ;
- bouton manuel conservé ;
- validation utilisateur : « Très bien. Ça fonctionne ».

État : **VALIDÉ TÉLÉPHONE**, puis profondément amélioré le 28–30.

### Tutoriels par catégorie

- tutoriels pour chaque catégorie V167 ;
- version vocale ;
- correction mobile V168.

État : composant historique à conserver dans l’intention, puis intégrer au guide contextuel plus récent.

### Diagnostic / Réparation

- réparation automatique installée dans la famille V175 ;
- principe validé : toute panne doit garder symptôme, cause, détection, réparation, données protégées et test ;
- une réparation n’est fiable qu’après test réel.

Important : à cette date, la voix de l’application n’était pas encore stable de bout en bout. Ne pas interpréter l’existence de V175 comme validation complète du moteur vocal.

## 24 septembre — voix naturelle, Render, catégories renommées et refonte visuelle

### Voix / Render

- V185 : superviseur vocal, diagnostic de fin de lecture et mécanismes de secours ;
- V188 : Render devient fournisseur vocal principal ;
- V189 : essai Render-only sans fallback robotique ;
- gestion des réveils / cold starts Render ensuite ajoutée ;
- test de synthèse Google sur téléphone utilisé pour isoler les problèmes du navigateur et de l’application.

Règle durable : garder diagnostic + secours + séparation moteur/application. Le fournisseur vocal historique n’est pas une règle fonctionnelle.

### Présentation Vision automatique

Plusieurs tentatives ont précédé un chemin utilisant le comportement manuel déjà fiable.

La famille V201 a servi à remettre à plat le démarrage du profil et la présentation naturelle.

État historique : amélioré ensuite ; ne pas restaurer le chemin V201 au détriment de l’accueil actuel validé.

### Noms de catégories

Décisions qui subsistent :

- Hôtel principal → **Hébergements** pour éviter la confusion vocale avec une sous-catégorie Hôtel ;
- Bars/Cafés → **Débits de boissons** avec alias vocaux ;
- Loisirs → **Activités et sorties**.

État : **À CONSERVER**.

### Refonte d’interface

- V219 : hiérarchie visuelle et menu technique ;
- styles déplacés vers CSS externe pour compatibilité CSP ;
- V220 : test d’interface externe.

Cette phase est une fondation du cadre maître ultérieur.

## 25 septembre — V224, géométrie mobile, vrais écrans et pages outils

### Gabarit V224

Le document `LIBCOMLAIR-V224-REFERENCE.md` enregistre une géométrie Samsung validée.

Principes toujours valables :

- ne pas toucher au cadre pour faire rentrer le contenu ;
- corriger l’organisation intérieure ;
- vérifier les styles inline et `!important` ;
- versionner les CSS/JS contre le cache ;
- ne pas empiler des correctifs si le premier ne change presque rien.

Le Micro 100 × 100 px est une **référence historique du 25**, mais sa taille/position a été remplacée plus tard sous le cadre maître. Ne pas le restaurer comme valeur finale.

### Recherche / Catégories / Sous-catégories

Construction de :

- écran 4 Recherche / Catégories ;
- écran 5 Sous-catégories ;
- ouverture d’une catégorie dans un véritable écran suivant ;
- compatibilité Samsung sans `:scope` ;
- interception des anciens `<details>` ;
- catégories en grille ;
- tutoriel court adapté par catégorie ;
- retour direct aux catégories ;
- ouverture vocale convertie elle aussi vers l’écran 5 ;
- retours vocaux différenciés Transports / Catégories ;
- commande Bus et sous-catégories Transport fiabilisées.

État : architecture dédiée **À CONSERVER**. Les accordéons inline plus anciens sont remplacés.

### Résultats

- ouverture des résultats après sous-catégorie ;
- écran Résultats explicitement identifié ;
- ciblage compatible Samsung sans `:has` ;
- présentation de résultats à préserver ;
- une fiche ouverte depuis Résultats doit pouvoir revenir à la liste correspondante.

État : **base à conserver**, voix validée jusqu’à la fiche le 29.

### Carte / Favoris / Filtres / Contribuer / Résultats

Une phase intermédiaire a utilisé des accordéons, puis l’architecture a évolué vers de **vraies pages dédiées**.

Ne pas restaurer les accordéons intermédiaires comme destination finale.

### Favoris

- persistance locale déjà existante ;
- dossiers dynamiques par catégorie ;
- dossier créé lorsque nécessaire ;
- navigation et états visuels nettoyés.

État : organisation par catégorie **VALIDÉE** dans le parcours de travail.

### Filtres et tri

Très longue série d’ajustements :

- compactage ;
- tentatives plein cadre ;
- correction Samsung en sortant le contenu d’un `<details>` problématique ;
- suppression d’une hauteur qui masquait « Trier par » ;
- suppression d’anciennes surcharges ;
- restauration du conteneur fonctionnel ;
- restauration du flux visible.

La panne « page Filtres vide » a été réparée, mais le 26 la fonction a été **reclassée PARTIELLE** car le remplissage vertical complet n’était pas encore parfaitement résolu.

Ne pas considérer les commits portant « final » comme preuve de validation finale.

### Contribuer

La page dédiée existe dans l’architecture, mais la cartographie technique la classait encore **à réorganiser**.

État : **PARTIEL / À AUDITER**, ne pas inventer une finalisation inexistante.

## 26 septembre — guide vocal, Micro contextuel, menu global et anti-régression

### Découverte guidée / Simplifié

Architecture retenue :

- **Découverte guidée** : présentation complète et pédagogique ;
- **Simplifié** : annonce seulement l’essentiel ;
- préférence locale réversible ;
- Vision utilise Découverte par défaut en l’absence de choix explicite.

### Symétrie voix / Micro

Règle obligatoire :

> Tout choix annoncé par l’assistance vocale doit pouvoir être demandé au Micro sur le même écran.

Cela couvre boutons, cases, listes, catégories, sous-catégories, tutoriels, explications, Retour/Suivant/Valider et menu Réglages.

### Commandes courtes

Profil :

- `Valider` ;
- `Sans adaptation` ;
- synonymes courts prioritaires ;
- anciens libellés longs conservés en secours.

Validation utilisateur sur Samsung : **fonctionne**.

Le raccourci Retour au profil était installé mais encore à revalider spécifiquement dans le journal de correction.

### Micro visuel

- cercle assombri pendant l’écoute réelle ;
- retour normal à la fin / erreur / annulation ;
- état détectable par Diagnostic ;
- resynchronisation possible par Réparation.

État : **VALIDÉ TÉLÉPHONE** le 26 septembre.

### Menu Assistance et réglages

Règle cible :

- ☰ en haut à gauche après le profil ;
- Micro à droite ;
- menu par-dessus la page courante ;
- état de la page conservé ;
- commande vocale `Réglages` ;
- Explication de la page ;
- Quels sont mes choix ? ;
- niveau d’assistance ;
- test vocal ;
- Diagnostic ;
- Réparation automatique.

Le défaut du bouton ☰ inséré en bas du flux a été attribué à des styles dynamiques peu fiables sous CSP, puis réparé via CSS externe.

Le défaut `position: fixed` pendant le scroll a ensuite été corrigé en rattachant le bouton à l’en-tête actif, mais le journal de cette date demandait encore une validation spécifique après défilement.

### Diagnostic / Réparation

Les données protégées comprennent notamment :

- `libcomlair-access-profile-v1` ;
- favoris ;
- avis ;
- signalements ;
- propositions ;
- préférence Découverte/Simplifié.

Règle : une réparation technique ne doit jamais effacer ces données.

## 27 septembre — parcours Vision complet, Mes besoins et contexte vocal

### Mes besoins

Retour d’une vraie étape dédiée :

- groupes Mobilité, Vision, Audition, Compréhension/cognition, Assistance/accompagnement ;
- groupes choisis au profil ouverts automatiquement ;
- autres groupes disponibles ;
- critères utilisables au toucher et à la voix ;
- état restauré quand on revient sur la page.

Le profil local `libcomlair-access-profile-v1` est réellement consommé par le moteur d’accessibilité, la synchronisation de Mes besoins, le contexte vocal et le présentateur guidé. Il ne s’agit pas seulement d’une idée de conversation.

### Profil enregistré

Décision utilisateur :

- profil modifiable ;
- critères mémorisés localement ;
- pas de compte obligatoire ;
- possibilité de simplifier les visites suivantes et d’éviter de refaire inutilement les critères ;
- synchronisation de compte éventuelle plus tard.

État : principe **À CONSERVER**. Le futur passeport universel préparé ensuite ne doit pas supprimer l’ancien profil tant que sa migration n’est pas validée.

### Guide Vision

Séquence pédagogique :

1. dire où se trouve l’utilisateur ;
2. expliquer le rôle de la page ;
3. décrire les informations utiles ;
4. lire les contrôles visibles ;
5. annoncer les états cochés / ouverts ;
6. expliquer les commandes Micro ;
7. proposer l’action suivante ;
8. attendre la fin avant de demander une action.

Le présentateur Vision complet et les présentations de première visite sont installés dans cette phase.

### Catégories par voix

Une catégorie prononcée doit être sélectionnée puis demander une confirmation / `Valider`, au lieu d’ouvrir une action ambiguë immédiatement.

## 28 septembre — ordre du parcours et modes vocaux

Après vérification visuelle, ordre de référence :

1. Profil ;
2. Navigation vocale ;
3. Présentation / Comment fonctionne Libcomlair ;
4. Mes besoins d’accessibilité ;
5. Accueil / Recherche ;
6. Recherche / Catégories ;
7. Sous-catégories ;
8. Résultats / outils ;
9. Fiche détaillée.

Le Retour doit suivre le même parcours à l’envers.

Commit de réorganisation important : `87557629d35ecdacc40a0d63c700bb0ea27b8c77` — voice et tutoriel avant Mes besoins.

### Navigation vocale

- présentation des deux modes ;
- finalisation de l’écran des choix vocaux ;
- Découverte = première utilisation / apprentissage ;
- Simplifié = utilisation quotidienne plus courte.

État : fondation finale de l’écran, encore affinée le 29 et intégrée au cadre le 30.

## 29 septembre — reconstruction propre de Navigation, Présentation et continuité vocale

### Navigation vocale

Les anciennes couches successives ne doivent plus être empilées.

Une architecture d’écran « fresh » / autonome a été créée pour éviter les anciens conflits de rendu.

Règle de restauration : ne pas réactiver les anciens layouts `voice-mode-*` s’ils doublonnent le nouvel écran.

### Présentation Libcomlair

Longue chaîne de finalisation :

- accordéons guidés ;
- suppression du rendu vocal historique concurrent ;
- page compacte ;
- reconstruction indépendante après échec d’une première version ;
- titre aligné avec les autres pages ;
- hauteur équilibrée au viewport ;
- carte de lecture vocale centrée ;
- navigation maintenue visible pendant la lecture ;
- contrôle par un seul présentateur ;
- une seule exécution, pas de replay après 10/10 ;
- proposition Suivant / Retour à la fin.

Les accordéons restent utiles pour consultation manuelle ; la lecture automatique ne doit pas les ouvrir les uns après les autres si la carte centrée est utilisée.

État : plusieurs éléments **VALIDÉS TÉLÉPHONE**.

### Continuité vocale

Panne comprise : arrêter une ancienne voix pouvait soit laisser l’ancienne page parler, soit couper la page suivante.

Solution : un seul propriétaire du cycle de vie vocal ; annuler la requête précédente et laisser le nouveau contexte parler.

Render v196 pouvait produire du son alors qu’une page restait muette : preuve que la panne du présentateur n’était pas une panne serveur.

### Parcours vocal profond

Validation obtenue jusqu’à :

`Recherche/Catégories → catégorie → sous-catégorie → résultats → fiche détaillée`.

Cette couverture doit être considérée comme un acquis à restaurer.

### Accueil / Recherche

Ajout de la notice **Comment utiliser cette page ?** (`08fd5aa...`) et style associé (`921e65d...`).

Une grande zone vide sur cette page a ensuite été enregistrée comme panne ; le contenu explicatif devait occuper harmonieusement le centre sans repousser la navigation basse.

## 30 septembre — Carte/GPS, Autour de moi, Samsung et cadre maître

### Autour de moi

Décision fonctionnelle :

- si l’utilisateur arrive depuis une catégorie, `Autour de moi` conserve cette catégorie ;
- l’entrée Carte/GPS générale peut travailler toutes catégories ;
- une fiche / un résultat doit pouvoir préparer plus tard `Y aller avec le GPS` ;
- le compteur doit correspondre aux résultats réellement autour de l’utilisateur et pas à une autre population de résultats.

La cause d’un écart observé a été identifiée : la liste globale pouvait inclure davantage de sources (notamment IDFM) que les seuls POI Geoapify affichés sur une carte.

Les séparations finales des compteurs Recherche / Autour de moi ont été consolidées juste après minuit le 1er octobre ; elles sont la continuité directe du travail du 30.

### Carte/GPS — chaîne à conserver

- v31 : hub Carte/GPS + Autour de moi contextuel ;
- v31.1 : suppression d’une boucle `MutationObserver` Samsung ;
- v32 : explications, séparation de Recherche, étape dédiée Retour/Suivant, voix contextuelle ;
- v33 : véritable page autonome Carte/GPS + présentateur v10 ;
- v34 : mise en page mobile, en-tête, panneaux, Retour ;
- v35 : tutoriels, Retour unique, viewport ;
- v35 a réintroduit une boucle Samsung ;
- v35.1 : suppression de la boucle et version Samsung-safe ;
- v35.3 : entrée de test cache-safe ;
- textes tutoriels ensuite raccourcis au rôle essentiel pour tenir sur téléphone.

Ne pas restaurer v35 avant la correction v35.1.

### Retour Carte/GPS

Hiérarchie travaillée :

- Recherche/Catégories → Retour = Carte/GPS ;
- Carte/GPS → Retour = Accueil/Recherche ;
- panneaux internes → Retour = Carte/GPS ;
- un seul Retour principal, pas deux contrôles concurrents.

### Cadre maître v36

Chaîne de création :

- cadre autonome ;
- alignement sur la géométrie Libcomlair validée ;
- suppression de l’artefact bleu du logo ;
- navigation basse harmonisée ;
- CSS et runtime d’intégration ;
- correctif de gel Samsung ;
- contrôle Menu indépendant ;
- application du cadre à Navigation vocale / Présentation / Accueil Recherche ;
- masquage de la navigation native ;
- réglage vertical ;
- pages courtes fixes ;
- remplissage des catégories ;
- harmonisation du Micro de Mes besoins ;
- suppression des anciens en-têtes et Micro concurrents.

Les consolidations juste après minuit le 1er octobre sont à considérer comme prolongement de cette phase :

- catégories et sous-catégories étirées dans le centre ;
- scroll maître stabilisé ;
- besoins multi-accordéons ;
- suppression des anciennes règles de taille Catégories ;
- cadre maître = source unique de dimensionnement des catégories ;
- réglage de hauteur de carte ;
- cohérence compteurs.

---

# 3. Chaînes fonctionnelles de référence pour la restauration

## 3.1 Accueil visuel et voix

Historique 22–30 utile pour comprendre le déverrouillage audio et les pannes Samsung.

**Mais l’accueil actuellement validé Ouvrir → voix → Suivant et la voix Vera approuvée sont plus récents et priment.**

Ne pas restaurer un ancien accueil Azure/Render à la place de l’accueil actuel.

## 3.2 Profil / Mes besoins

À conserver :

- profil multi-handicap ;
- stockage local ;
- Vision détectable ;
- groupes de Mes besoins liés au profil ;
- état conservé au retour ;
- modification possible ;
- aucun effacement par Diagnostic/Réparation ;
- futur profil universel = migration préparée, pas remplacement forcé.

## 3.3 Navigation vocale / Présentation

À conserver :

- écran Navigation vocale autonome ;
- Découverte / Simplifié ;
- Présentation autonome ;
- carte centrée pendant lecture automatique ;
- pas d’ouverture automatique des accordéons ;
- pas de replay 10/10 ;
- Suivant / Retour annoncés à la fin ;
- arrêt propre de la voix en quittant la page ;
- voix suivante non désactivée.

## 3.4 Micro

Chaîne correcte :

1. géométrie historique V224 ;
2. Micro contextuel ;
3. commandes courtes non ambiguës ;
4. état visuel écoute validé ;
5. extension à tous les contrôles visibles et champs ;
6. harmonisation cadre maître ;
7. suppression des anciens forçages et doublons.

Ne pas restaurer la taille 100 px du 25 comme valeur finale universelle.

## 3.5 Recherche / Catégories / Sous-catégories

À conserver :

- écran Recherche/Catégories dédié ;
- écran Sous-catégories dédié ;
- 7 catégories finales : Magasins, Débits de boissons, Hébergements, Restaurants, Activités et sorties, Services, Transports ;
- catégorie vocale = même écran que le toucher ;
- confirmation vocale quand nécessaire ;
- Retour hiérarchique précis ;
- tailles et remplissage central contrôlés par le cadre maître ;
- aucun ancien accordéon inline qui contourne l’écran suivant.

## 3.6 Résultats / Fiche

À conserver :

- liste longue défilable ;
- compteur lié aux données affichées ;
- ouverture fiche ;
- Retour vers la même liste sans perdre l’état ;
- lecture vocale et commandes contextuelles ;
- couverture vocale validée jusqu’à la fiche.

## 3.7 Favoris

À conserver :

- stockage local ;
- validation des données ;
- dossiers dynamiques par catégorie ;
- page dédiée ;
- données protégées pendant réparation.

## 3.8 Filtres

À restaurer avec prudence :

- contenu visible et fonctionnel ;
- tri visible ;
- pas de hauteur forcée qui clippe ;
- pas de `<details>` Samsung problématique ;
- ne pas prétendre que le remplissage vertical était définitivement validé le 26.

## 3.9 Contribuer

À conserver comme page dédiée, mais statut historique : **à réorganiser / à auditer**.

## 3.10 Carte / GPS / Autour de moi

À conserver :

- page Carte/GPS autonome ;
- modes distincts ;
- voix contextuelle ;
- Retour unique ;
- Samsung-safe sans observer infini ;
- catégorie conservée dans Autour de moi ;
- carte et géolocalisation séparées ;
- compteur proximité dédié ;
- futur Y aller avec le GPS préparé.

## 3.11 Transport / IDFM

À conserver :

- arrêts voyageurs ;
- IDs ;
- adresses ;
- lignes ;
- directions ;
- plusieurs directions si nécessaire ;
- vrais doublons physiques ;
- tri ;
- données locales / index fragmenté / fallback ;
- mise à jour automatique ;
- fiche détaillée ;
- voix.

## 3.12 Menu Assistance / Réglages

À conserver :

- ☰ attaché à l’en-tête ;
- ouverture en surimpression ;
- conservation de la page et de son état ;
- Réglages au Micro ;
- Expliquer cette page ;
- Quels sont mes choix ? ;
- niveau d’assistance ;
- test vocal ;
- Diagnostic ;
- Réparation automatique.

Le menu usager doit rester séparé des fonctions de maintenance avancée.

## 3.13 Diagnostic / Réparation

À conserver :

- cycle de vie panne ;
- distinction confirmé / partiel / validé ;
- réparation uniquement ciblée ;
- protection des données ;
- détection cache / inline / CSS / hidden / état page / observers ;
- retest téléphone obligatoire pour audio, Micro, GPS, tactile et mise en page.

---

# 4. Liste « ne pas restaurer comme état final »

- V158/V159 catégories avec doublons ou boutons du haut cassés ;
- V160 accordéons comme architecture finale de catégories ;
- anciens `<details>` qui ouvrent les sous-catégories inline ;
- anciens headers, logos ou Micro doublés ;
- Micro historique 100 px appliqué partout sous le cadre maître ;
- anciens Retour/Valider internes quand le cadre maître possède déjà le pied de page ;
- Filtres plein cadre issus d’une étape qui masquait « Trier par » ;
- Carte/GPS v35 avant correction Samsung v35.1 ;
- MutationObserver qui réécrit ce qu’il observe ;
- anciennes couches superposées de Navigation vocale ;
- Présentation v1 ayant dû être reconstruite ;
- mécanisme de voix qui coupe globalement la page suivante ;
- accueil vocal historique Azure/Render en remplacement de l’accueil actuel validé ;
- fournisseur Render comme source de vérité ou sauvegarde.

---

# 5. Comparaison avec la restauration actuelle

La restauration actuelle montre encore plusieurs régressions déjà connues historiquement :

- Micro qui chevauche le cadre ;
- anciennes proportions de certaines pages ;
- pages courtes sous-remplies ;
- Recherche/Catégories ne remplissant plus le centre ;
- certaines anciennes couches visibles ;
- continuité vocale incomplète après l’accueil.

Ces symptômes correspondent à des familles de pannes déjà traitées :

- ancien CSS / mauvaise priorité ;
- anciens forçages Micro ;
- propriétaire de scroll incorrect ;
- dimensionnement Catégories dupliqué ;
- wrapper qui ne charge pas toutes les couches finales ;
- anciennes navigations internes non masquées.

Conclusion : **ne pas reconstruire ces écrans depuis zéro**. Reconnecter les propriétaires finaux et supprimer les couches historiques concurrentes.

---

# 6. Ordre de restauration recommandé après l’audit

1. conserver l’accueil actuel validé intact ;
2. restaurer le cadre maître final sans anciens headers/navigation ;
3. restaurer Profile / Navigation vocale / Présentation / Mes besoins dans l’ordre validé ;
4. restaurer le Micro contextuel et son état visuel ;
5. restaurer Accueil/Recherche et sa notice plein centre ;
6. restaurer Carte/GPS Samsung-safe ;
7. restaurer Recherche/Catégories et Sous-catégories avec dimensionnement maître ;
8. restaurer Résultats → Fiche → Retour ;
9. restaurer Transport/IDFM ;
10. restaurer Favoris et Filtres en respectant leur état de validation ;
11. réauditer Contribuer avant de le déclarer final ;
12. restaurer Menu Assistance, Diagnostic et Réparation ;
13. tester le parcours complet Vision sur téléphone ;
14. seulement après validation, promouvoir le wrapper de restauration.

---

# 7. Test de non-régression avant promotion

Pour chaque écran :

- Menu–Logo–Micro propres ;
- aucun chevauchement ;
- centre rempli intelligemment ;
- scroll uniquement si nécessaire ;
- Retour/Suivant uniques ;
- voix de la page précédente arrêtée ;
- nouvelle page correctement annoncée ;
- tous les choix annoncés disponibles au Micro ;
- explications lisibles vocalement ;
- page tactile = page vocale ;
- aucune donnée utilisateur perdue ;
- aucun gel Samsung ;
- cache/version contrôlé.

Parcours Vision minimum :

`Accueil validé → Profil → Navigation vocale → Présentation → Mes besoins → Accueil/Recherche → Carte/GPS → Recherche/Catégories → Sous-catégorie → Résultats → Fiche → Retour`.

---

# 8. Conclusion

La période du 22 au 30 septembre contient plusieurs centaines de changements, dont **598 commits entre la sauvegarde du 25 septembre et la fin du 30 septembre** à elle seule.

La récupération doit donc s’appuyer sur les chaînes fonctionnelles et les validations réelles, pas sur une copie brute d’un ancien fichier global.

Le travail déjà effectué est largement récupérable dans l’historique, les registres et les échanges. La priorité est désormais de **réassembler l’état final validé sans réactiver les couches intermédiaires**.
