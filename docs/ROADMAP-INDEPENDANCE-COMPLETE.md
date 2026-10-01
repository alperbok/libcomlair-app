# Libcomlair — feuille de route vers l’indépendance complète

Date de création : 2026-10-01

## Objectif général

Libcomlair doit continuer à assurer ses fonctions essentielles même si Render, une API, un hébergeur ou un service vocal externe devient indisponible.

Principe directeur : **le téléphone doit posséder tout ce qui est indispensable ; Internet sert surtout à enrichir et actualiser les données.**

Principe d’architecture : **1 fonction = 1 module responsable = 1 diagnostic = 1 réparation = 1 secours lorsque possible.**

## Documents de référence

- `LIBCOMLAIR-SECURITE-INDEPENDANCE.md` : règle générale d’indépendance, sauvegardes et restauration.
- `docs/ARCHITECTURE-MODULES.md` : carte des modules, responsabilités, dépendances et interfaces.
- `docs/REGISTRE-DIAGNOSTIC-REPARATION.md` : point d’entrée en cas de panne et chaîne Module → Diagnostic → Réparation → Secours.
- `docs/voice-independence-legal-plan.md` : règles de licence et de conformité pour la voix.
- `docs/REGISTRE-COMPOSANTS-VOCAUX.md` : statut des moteurs, modèles, dictionnaires et voix étudiés.
- `docs/TEST-AUTONOMIE-TOTALE.md` : protocole qui décidera si l’indépendance est réellement atteinte.

## État actuel

### Déjà en place

- dépôt GitHub comme source de vérité ;
- sauvegarde et manifeste de restauration existants ;
- diagnostic et réparation déjà présents dans l’application ;
- moteur vocal central `LibcomlairVoice` ;
- Render encore utilisé pour la voix naturelle ;
- bibliothèque audio locale IndexedDB ajoutée au moteur Render : les audios déjà générés peuvent être réutilisés localement ;
- inventaire vocal `LibcomlairVoiceIndependence` : recense phrases fixes, textes visibles et structures dynamiques rencontrées ;
- rubrique Diagnostic « Autonomie vocale » ;
- plan légal pour l’indépendance vocale ;
- carte d’architecture des modules ;
- registre Diagnostic / Réparation / Secours ;
- emplacement versionné du dictionnaire vocal Libcomlair.

### Encore dépendant de services externes

- génération vocale d’un texte totalement nouveau ;
- reconnaissance vocale/micro selon la technologie actuellement utilisée ;
- récupération de données récentes via les API ;
- hébergement de certaines fonctions serveur.

## Chantier A — autonomie vocale

### A1. Inventaire et collecte — EN COURS

Objectif : connaître tout ce que Libcomlair doit savoir lire.

- recenser chaque phrase fixe prononcée ;
- recenser chaque bouton, titre, case et aide visible ;
- distinguer texte fixe et contenu dynamique ;
- conserver localement les audios déjà générés ;
- signaler les textes visibles non couverts par le système vocal.

Critère de passage : aucun écran essentiel ne contient d’information importante inconnue du moteur vocal.

### A2. Dictionnaire vocal Libcomlair — PROCHAINE ÉTAPE

Créer une base propre à Libcomlair pour :

- noms communs utiles à l’application ;
- noms propres ;
- villes, rues et lieux ;
- stations, arrêts, lignes et directions ;
- acronymes ;
- nombres, unités et expressions récurrentes ;
- corrections de prononciation ;
- provenance et licence de chaque ressource tierce.

Le dictionnaire Libcomlair doit rester séparé des lexiques tiers afin de préserver la traçabilité juridique.

### A3. Bibliothèque d’audios fixes — À CONSTRUIRE

Enregistrer localement les éléments stables :

- bienvenue ;
- Retour / Suivant / Valider ;
- catégories et sous-catégories ;
- critères d’accessibilité ;
- tutoriels ;
- messages du diagnostic ;
- aides de navigation.

Les fichiers doivent avoir une origine et des droits documentés.

### A4. TTS local hors ligne — À ÉTUDIER ET TESTER

But : prononcer un texte entièrement nouveau sans Render ni Internet.

Exigences :

- fonctionnement Android hors ligne ;
- qualité française acceptable ;
- licence du moteur compatible ;
- licence du modèle vocal compatible ;
- droit de redistribution vérifié ;
- performances suffisantes sur téléphone ;
- aucune dépendance serveur obligatoire.

### A5. Reconnaissance vocale locale — À ÉTUDIER

Le microphone doit aussi devenir indépendant.

Exigences :

- commandes essentielles reconnues hors ligne ;
- français ;
- Android ;
- licence compatible ;
- modèle redistribuable ;
- commandes synchronisées avec chaque page et chaque élément sélectionnable.

### A6. Dictaphone — À INTÉGRER AU MOTEUR CENTRAL

Usages :

- contribution en mode Vision ;
- enregistrement de phrases fixes ;
- référence de bonne prononciation ;
- possibilité d’écouter, recommencer ou supprimer avant envoi ;
- consentement explicite et règles de conservation.

## Chantier B — données et fonctionnement hors ligne

### B1. Modèle de données universel

Toutes les sources doivent être converties vers un même schéma interne :

- identité du lieu ;
- catégorie et sous-catégorie ;
- adresse ;
- coordonnées ;
- critères d’accessibilité ;
- provenance ;
- date de mise à jour ;
- niveau de fiabilité ;
- informations vocalisables.

Objectif : que Recherche, Autour de moi, fiche détaillée, voix et Diagnostic utilisent la même structure.

### B2. Base locale versionnée

Prévoir des versions distinctes pour :

- lieux ;
- transports ;
- accessibilité ;
- dictionnaire vocal ;
- audio fixe ;
- profils et préférences ;
- contributions en attente.

### B3. Mode hors connexion

Doivent fonctionner sans réseau :

- cadre de l’application ;
- profils ;
- critères ;
- favoris ;
- tutoriels ;
- diagnostic ;
- données récemment téléchargées ;
- dictionnaire vocal ;
- voix locale essentielle ;
- contributions enregistrées localement en attente d’envoi.

## Chantier C — diagnostic et réparation

### C1. Diagnostic central

Contrôler au minimum :

- affichage ;
- navigation ;
- couverture vocale des éléments visibles ;
- bibliothèque audio ;
- TTS local ;
- microphone / reconnaissance locale ;
- GPS ;
- base de données ;
- stockage ;
- mode hors ligne ;
- intégrité des fichiers ;
- état des services externes sans les considérer indispensables.

Chaque module doit progressivement exposer son propre état, sa version, son dernier test, sa dernière erreur, ses dépendances et son mode de secours. Le Diagnostic central agrège ces informations au lieu de deviner l’état des autres modules.

### C2. Réparation ciblée

Chaque anomalie doit correspondre à une réparation précise, sans réinitialiser inutilement les données utilisateur.

La procédure de référence est décrite dans `docs/REGISTRE-DIAGNOSTIC-REPARATION.md`.

### C3. Retour arrière après mise à jour

Conserver une version fonctionnelle précédente afin de pouvoir restaurer rapidement si une mise à jour casse l’affichage, le micro ou la voix.

### C4. Règle anti-boucle

Avant un nouveau correctif : identifier le module propriétaire, consulter les anciennes réparations, rechercher CSS/JS historiques, `!important`, MutationObserver, événements concurrents et ordre de chargement. Si une première modification a peu ou pas d’effet, rechercher un conflit au lieu de continuer à modifier des valeurs.

## Chantier D — accessibilité et expérience utilisateur

### D1. Trois niveaux d’accompagnement

- Découverte : explication complète page par page ;
- Assisté : guidage vocal réduit mais présent ;
- Rapide : commandes essentielles seulement.

### D2. Profil utilisateur d’accessibilité

À terme :

- enregistrer les besoins ;
- appliquer automatiquement les critères ;
- éviter de refaire les mêmes choix à chaque ouverture ;
- permettre la modification du profil ;
- ne pas perdre le profil lors d’une mise à jour ou réinstallation si une sauvegarde existe.

### D3. Règle de finition

Une nouvelle fonction n’est pas considérée terminée tant qu’elle n’est pas :

1. utilisable visuellement ;
2. utilisable vocalement ;
3. navigable au micro lorsque nécessaire ;
4. testable par le Diagnostic ;
5. compatible avec les profils concernés ;
6. rattachée à un module responsable et une procédure de diagnostic.

## Chantier E — qualité et fiabilité des données

Chaque information d’accessibilité devrait pouvoir indiquer :

- source officielle ;
- déclarée par l’établissement ;
- vérifiée par Libcomlair ;
- contribution utilisateur ;
- date de dernière vérification ;
- donnée ancienne à revérifier.

Le nombre de critères vérifiés peut être affiché sans remplacer le détail des critères.

## Chantier F — licences, confidentialité et traçabilité

Aucun moteur, modèle, dictionnaire, voix ou jeu de données tiers ne doit être intégré sans :

- source officielle ;
- version exacte ;
- licence ;
- droit de redistribution ;
- attribution requise ;
- compatibilité avec les autres composants ;
- date de vérification.

Pour les enregistrements humains : consentement explicite, finalité, conservation et suppression doivent être documentés.

## Ordre de travail recommandé

### Phase 1 — maintenant

1. continuer à collecter les phrases et audios pendant que Render fonctionne ;
2. créer et alimenter le dictionnaire Libcomlair ;
3. commencer la bibliothèque d’audios fixes ;
4. tenir le registre des licences ;
5. préparer le test d’autonomie totale ;
6. rattacher progressivement chaque fonction existante à la carte des modules et au registre de diagnostic.

### Phase 2 — prototype local

1. tester un TTS français réellement hors ligne ;
2. tester une reconnaissance vocale française hors ligne ;
3. brancher les deux derrière le moteur vocal central sans supprimer Render ;
4. mesurer vitesse, qualité, taille et consommation sur téléphone.

### Phase 3 — bascule progressive

Ordre de priorité du moteur vocal :

1. audio Libcomlair fixe ;
2. bibliothèque audio locale ;
3. TTS local ;
4. Render uniquement en secours transitoire.

Pour le microphone :

1. reconnaissance locale ;
2. service externe uniquement en secours transitoire si nécessaire.

### Phase 4 — autonomie générale

- données locales versionnées ;
- fonctionnement hors connexion ;
- contributions hors ligne ;
- restauration de version ;
- diagnostic complet ;
- export/import et migrations de données.

### Phase 5 — suppression des dépendances critiques

Render et les autres services externes ne doivent plus être nécessaires aux fonctions essentielles.

## Critère final de réussite

L’indépendance complète est atteinte lorsque, téléphone en mode avion et Render inaccessible, un utilisateur du profil Vision peut encore :

- ouvrir Libcomlair ;
- entendre l’interface essentielle ;
- naviguer au micro ;
- entendre les catégories et critères ;
- consulter les données locales disponibles ;
- entendre une adresse ou un nom nouveau grâce au moteur local ;
- utiliser le diagnostic ;
- enregistrer une contribution localement ;
- redémarrer l’application sans téléchargement obligatoire.

Tant que ce test ne passe pas, l’indépendance complète n’est pas considérée comme acquise.
