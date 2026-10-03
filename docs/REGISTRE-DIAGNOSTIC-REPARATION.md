# Libcomlair — registre Modules → Diagnostic → Réparation → Secours

Date de création : 2026-10-01

Ce registre sert de point d’entrée lorsqu’un problème apparaît. Il complète la carte `docs/ARCHITECTURE-MODULES.md`.

## États utilisés

- `ok` : module validé dans son usage actuel ;
- `degrade` : fonctionne mais dépend d’un secours ou d’un service externe ;
- `erreur` : fonction essentielle défaillante ;
- `a-construire` : architecture prévue mais non encore terminée ;
- `a-auditer` : fonctionnement présent mais propriétaire/dépendances encore à clarifier.

## Registre initial

| Module | État actuel | Diagnostic prioritaire | Réparation ciblée | Secours / repli | Validation finale |
|---|---|---|---|---|---|
| Cadre maître / affichage | ok, sous surveillance | CSS chargé, dimensions, débordement, conflits, scripts qui déplacent des éléments | corriger la règle source ou le script conflictuel ; éviter l’empilement d’overrides | dernière version stable du cadre | capture téléphone réel |
| Navigation pages | a-auditer | page active, contrôleur, boutons Retour/Suivant, événements concurrents | corriger le contrôleur responsable | retour à la navigation stable précédente | parcours complet téléphone |
| Profils / besoins | ok, évolutif | profil actif, stockage, accordéons, critères appliqués | réparer synchronisation profil/DOM/stockage | valeurs locales précédentes | changement de profil + retour |
| Voix centrale | degrade | texte reçu, moteur choisi, état audio, dernière erreur | réparer uniquement l’étape défaillante | audio local → TTS local futur → Render transitoire | écoute réelle téléphone |
| Bibliothèque audio locale | en cours | IndexedDB, nombre d’audios, lecture d’échantillon | reconstruire entrée corrompue sans vider toute la bibliothèque | TTS local futur / Render transitoire | lecture hors réseau d’un audio connu |
| Dictionnaire vocal | a-construire | terme trouvé, source, correction, version, licence | ajouter/corriger entrée validée | moteur TTS local pour terme inconnu | noms propres + mots communs |
| TTS local hors ligne | a-construire | moteur, modèle, licence, chargement, latence, sortie audio | relancer moteur ou restaurer modèle validé | audio enregistré ; Render seulement pendant transition | texte nouveau en mode avion |
| Micro / reconnaissance | a-auditer | autorisation → signal → transcription → commande → action | réparer l’étape exacte | reconnaissance locale future | commandes page par page |
| Dictaphone | a-construire | autorisation, capture, fichier, lecture, stockage | recréer session d’enregistrement | conservation locale | contribution Vision hors connexion |
| Recherche | a-auditer | catalogue chargé, index, filtres, compteur | reconstruire index / filtre concerné | catalogue local | recherches représentatives |
| Autour de moi | degrade | GPS, caches Geoapify/IDFM, fraîcheur, compteur | rafraîchir uniquement la source concernée | dernière donnée locale clairement datée | test localisation réelle |
| Carte / GPS | ok, sous surveillance | permission, coordonnées, rendu carte | réparation GPS ou rendu seulement | liste locale si carte indisponible | test téléphone réel |
| Données universelles | a-construire | source, conversion, schéma, doublons, provenance | réparer convertisseur de la source | dernière copie compatible | comparaison source → fiche |
| Transport | degrade | base, identifiants, directions, doublons, date | reconstruire/importer source concernée | données locales datées | arrêts multi-lignes/directions |
| Contributions | a-construire | saisie/dictée, stockage local, statut, synchronisation | relancer envoi sans supprimer la contribution | file locale en attente | mode avion puis synchronisation |
| Diagnostic central | en cours | modules enregistrés, status(), dernier test | corriger agrégateur uniquement | diagnostics locaux par module | test de panne simulée |
| Réparation automatique | en cours | cause identifiée, procédure liée, résultat | action ciblée déclarée par module | retour arrière version | panne simulée + réparation |
| Stockage local | a-auditer | lecture/écriture, espace, version schéma | migration ou réparation ciblée | export/import | redémarrage + conservation données |
| Migrations | a-construire | version source/cible, journal de migration | reprendre migration idempotente | restauration sauvegarde | upgrade depuis ancienne version |
| Export / import utilisateur | a-construire | contenu exporté, intégrité, version | réimport / migration | copie locale utilisateur | restauration sur installation propre |
| Mise à jour / rollback | a-construire | version active, intégrité, version stable précédente | restauration version précédente | version stable embarquée/cachée | simulation mise à jour défectueuse |
| Mode hors connexion | a-construire | ressources locales, données, voix, micro, redémarrage | réparer cache/pack concerné | fonctions essentielles locales | protocole autonomie totale |
| Licences / conformité | en cours | registre, version, licence moteur/modèle/données | bloquer intégration non conforme | composant alternatif autorisé | audit documentaire |
| Sauvegarde / restauration projet | ok, à tester périodiquement | bundle, archive, SHA-256, reconstruction | restaurer depuis sauvegarde indépendante | copie externe | reconstruction complète |

## Validation restauration — 03/10/2026

### Navigation vocale — réparée et validée Samsung

- Symptôme : contenu de `Navigation vocale` partiellement ou totalement masqué après compactage ; dans la tentative v3.10, seules le titre et la légende pouvaient rester visibles.
- Cause : combinaison de `flex` compressible et `overflow:hidden` sur le contenu, puis compactage trop agressif des zones inférieures.
- Réparation validée : hauteurs naturelles non compressibles, contenu en `overflow:visible`, réduction uniquement des marges/paddings, maintien des deux cartes et des textes du bas, plus restauration de la consigne guidée `Valider / Retour` sous le fieldset.
- Validation physique : Samsung Browser, 03/10/2026, restauration v3.12.
- À ne pas réutiliser : stratégie v3.10 avec compression destructive.
- Fichiers de référence : `libcomlair-restoration-frame-reference-v5-validated.css`, `libcomlair-restoration-v3-12-voice-hint.js`.

### Recherche / Catégories — réparée et validée Samsung

- Symptôme : la case `Transports` et le footer `Retour / Suivant` dépassaient du cadre en bas.
- Cause : somme des espacements verticaux trop importante après agrandissement de l’en-tête commun.
- Réparation validée : conserver la hauteur des cartes et réduire le `row-gap` canonique à `8px`, avec marge basse du titre Catégories réduite.
- Validation physique : Samsung Browser, 03/10/2026 ; page déclarée parfaite par l’utilisateur.
- Fichier de référence : `libcomlair-restoration-frame-reference-v5-validated.css`.

### Consolidation anti-régression — cadre canonique v5

- But : ne plus charger les patches temporaires v3.9, v3.10, v3.11 et v3.12 comme couches successives.
- Nouveau propriétaire CSS du cadre : `libcomlair-restoration-frame-reference-v5-validated.css`.
- Nouveau chemin interne : `libcomlair-restoration-inner-v4-validated.html`.
- Nouveau test consolidé : `libcomlair-restoration-test-v3-13.html`.
- Sauvegarde avant consolidation : branche `backup-v3-12-samsung-valide-2026-10-03`, pointée sur le commit `4ed2978797f56acf0686c7bd9fd235fee2c9a3d5`.
- État : comportements sources validés en v3.12 ; le chemin consolidé v3.13 doit encore recevoir un contrôle rapide Samsung avant d’être déclaré définitivement validé.
- Catalogue de réparation préparé : `libcomlair-repair-catalog-extra29-v224.js`. Il reste volontairement non activé tant que le test v3.13 n’a pas confirmé l’absence de régression.

## Procédure standard lorsqu’une panne est signalée

### Étape 1 — classer le symptôme

Exemples :
- « je n’entends rien » → Voix centrale ;
- « le micro entend mais n’agit pas » → interprétation de commande/navigation, pas capture micro ;
- « le bouton est décalé » → cadre maître/CSS ;
- « il manque des directions » → Transport/données ;
- « le compteur est faux » → module qui possède ce compteur, pas le cadre visuel.

### Étape 2 — vérifier la chaîne du module

Ne jamais commencer par modifier le résultat final si une étape amont peut être la cause.

Exemple voix :
`texte → dictionnaire → audio local → TTS → sortie audio`.

Exemple micro :
`permission → capture → reconnaissance → compréhension → action → confirmation`.

Exemple données :
`source → téléchargement → conversion → stockage → filtre → affichage`.

### Étape 3 — rechercher les conflits historiques

Avant d’ajouter un nouveau correctif :
- rechercher anciennes versions du module ;
- CSS `!important` ;
- MutationObserver ;
- événements capture/bubble ;
- scripts chargés deux fois ;
- ordre des scripts et feuilles de style ;
- cache/version de ressource.

### Étape 4 — corriger la cause racine

Le correctif doit être appliqué au propriétaire réel de la fonction. Éviter les scripts « hotfix » supplémentaires lorsque la règle source peut être corrigée proprement.

### Étape 5 — valider à trois niveaux

1. source vérifiée dans le dépôt ;
2. diagnostic du module cohérent ;
3. validation physique sur le téléphone pour tout problème d’affichage, audio, micro, GPS ou interaction tactile.

## Fiche type pour un futur module

Chaque nouveau module devra documenter :

```text
Module ID :
Responsabilité :
Fichier(s) propriétaire(s) :
Dépendances :
Entrées :
Sorties :
status() :
Dernier test réussi :
Dernière erreur :
Procédure de diagnostic :
Procédure de réparation :
Mode de secours :
Données utilisateur à préserver :
Test téléphone requis : oui/non
```

## Règle d’évolution

À chaque panne réellement comprise, mettre à jour ce registre avec la cause et la procédure de réparation si elle peut se reproduire. Le but est qu’une panne déjà résolue ne demande jamais de recommencer l’enquête depuis zéro.