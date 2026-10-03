# Libcomlair — Registre maître du patrimoine

Date de création : 2026-10-03

## Rôle

Ce document est la checklist principale de conservation de Libcomlair. Avant toute refonte, restauration, migration ou gros correctif, vérifier ce registre puis les documents techniques référencés.

Objectif : ne plus perdre une correction validée, une règle d’accessibilité, une décision de navigation, un module de diagnostic, ni un projet préparé pour la France ou l’international.

## États utilisés

- **VALIDÉ** : testé réellement sur l’application et confirmé.
- **ACTIF** : présent dans l’architecture actuelle mais pas forcément validé de bout en bout.
- **À RESTAURER** : existe encore dans le dépôt/historique mais le point d’entrée actuel ne le charge plus correctement.
- **PRÉPARÉ POUR PLUS TARD** : architecture/documentation prête, activation différée.
- **EXPÉRIMENTAL** : ne doit pas être activé en production sans validation.

---

# 1. Cadre maître — règle non négociable

## 1.1 Identité visuelle commune

Toutes les pages concernées doivent conserver la même identité de cadre :

- zone haute : **Menu à gauche — logo Libcomlair centré — Micro à droite** ;
- zone centrale : contenu de la page ;
- zone basse : **Retour — Suivant** ou l’action équivalente contextuelle (ex. Valider, Rechercher) ;
- aucune ancienne navigation native ne doit chevaucher la navigation du cadre maître ;
- aucun ancien en-tête ne doit créer un double logo ou un second micro ;
- le logo propre doit rester centré et sans l’artefact bleu précédemment supprimé.

Références :
- `test-v224-master-frame-v36-final.html`
- `libcomlair-v224-master-frame-integration-v1.css`
- `libcomlair-v224-master-frame-integration-v1.js`
- `libcomlair-v224-frame-fixes-v6.css`
- `libcomlair-v224-frame-fixes-v6.js`

## 1.2 Même cadre ne signifie pas contenu figé

Le cadre doit rester cohérent, mais la zone centrale s’adapte au volume réel de chaque page.

### Page courte

- pas de défilement inutile ;
- le contenu utilise l’espace central disponible ;
- haut et bas restent propres et non chevauchés.

### Page longue / beaucoup de contenu

- le défilement est piloté par le **cadre maître**, pas par une ancienne règle locale concurrente ;
- le contenu peut devenir défilant quand sa hauteur dépasse l’espace disponible ;
- les pages Résultats et pages utilitaires peuvent forcer le mode de défilement ;
- le contenu ne doit jamais passer sous le Micro, le Menu ou les boutons bas.

Référence runtime : `syncScrollMode()` dans `libcomlair-v224-master-frame-integration-v1.js`.

### Mes besoins d’accessibilité / plusieurs handicaps

Cas important déjà travaillé : plusieurs groupes/accordéons peuvent être ouverts simultanément.

Règle :
- la liste complète doit rester consultable ;
- **Retour / Valider ne doivent jamais flotter par-dessus les accordéons** ;
- une ancienne règle locale `height:100%` + `overflow-y:auto` ne doit pas bloquer la hauteur cumulée du contenu ;
- sous le cadre maître, supprimer les anciens scrolls locaux concurrents et laisser le cadre maître gérer hauteur et défilement ;
- le pied de page doit apparaître au bon endroit après la fin logique du contenu lorsque ce comportement est requis.

Références :
- `libcomlair-repair-catalog-extra23-v224.js`
- commits `a6815a0d87da29e1e2dab5926469836b3aaef2a0` et `d391d15f24f3a9a3076d7bf36686fbc325d16b40`.

### Résultats

- les listes longues doivent rester parcourables sans modifier la géométrie générale du cadre ;
- la page Résultats fait partie des écrans où le mode de défilement maître peut être forcé ;
- les résultats visuels, le compteur vocal et les données affichées doivent rester synchronisés ;
- une fiche détaillée doit pouvoir s’ouvrir puis revenir à la même liste de résultats sans perdre l’état.

### Carte / GPS

- la hauteur de carte validée ne doit pas être modifiée pour résoudre un problème général de cadre ;
- Leaflet doit recevoir `invalidateSize()` après affichage réel si nécessaire ;
- la géolocalisation reste indépendante du rendu de la carte.

---

# 2. Parcours utilisateur à restaurer et protéger

Ordre fonctionnel de référence :

1. Bienvenue / accueil visuel.
2. Profil d’accessibilité.
3. Mes besoins d’accessibilité.
4. Niveau d’assistance vocale.
5. Présentation / explication de la page.
6. Recherche.
7. Grandes catégories.
8. Sous-catégories.
9. Carte / GPS / Autour de moi.
10. Favoris.
11. Filtres et tri.
12. Contribuer.
13. Résultats.
14. Fiche détaillée.

Le point d’entrée propre actuel `libcomlair-clean-entry-v1.html` doit conserver l’accueil validé **Ouvrir → voix → Suivant**, puis être raccordé au parcours maître complet au lieu de court-circuiter les modules historiques.

---

# 3. Assistance vocale et Micro

## 3.1 Règle de symétrie

**Tout choix annoncé par l’assistance vocale doit pouvoir être demandé au Micro sur le même écran.**

Cela comprend :
- boutons ;
- cases ;
- listes ;
- catégories et sous-catégories ;
- explications ;
- tutoriels ;
- Retour / Suivant / Valider ;
- menu Réglages ;
- commandes contextuelles utiles.

Référence : `LIBCOMLAIR-VOICE-REGRESSION-PROTOCOL.md`.

## 3.2 Continuité entre pages

- en quittant une page, sa voix doit s’arrêter immédiatement ;
- la page suivante doit ensuite récupérer son propre contexte vocal ;
- arrêter la voix précédente ne doit jamais désactiver toute l’assistance de la page suivante ;
- l’identité vocale doit être dérivée de l’écran réellement actif.

## 3.3 Micro

- le Micro doit être contextuel page par page ;
- les commandes courtes ne sont utilisées que lorsqu’elles ne sont pas ambiguës ;
- l’état visuel du cercle Micro doit correspondre réellement à l’écoute ;
- le cercle s’assombrit pendant l’écoute puis revient à l’état normal ;
- la dictée vocale doit rester disponible pour les champs prévus.

---

# 4. Menus

## 4.1 Menu usager — Assistance et réglages

À conserver :
- bouton ☰ en haut à gauche après le profil ;
- ouverture au-dessus de la page courante sans perte d’état ;
- commande vocale `Réglages` ;
- Expliquer cette page ;
- Quels sont mes choix / Lire les choix ;
- niveau d’assistance ;
- test vocal ;
- diagnostic ;
- réparation automatique ;
- fermeture du menu.

Le menu doit rester sûr, simple et destiné à l’usage quotidien.

Référence : `LIBCOMLAIR-GLOBAL-SETTINGS-MENU.md`.

## 4.2 Menu avancé — réservé au développement/maintenance

Doit rester séparé du menu usager.

Fonctions :
- maintenance avancée ;
- autonomie ;
- dépendances ;
- test sans services externes ;
- préparation hors ligne ;
- fonctions expérimentales ;
- rapport technique ;
- contrôles de non-régression.

Référence : `docs/MAINTENANCE-AVANCEE.md`.

---

# 5. Recherche, catégories, résultats et fiches

À protéger :
- recherche lieu / ville ;
- critères d’accessibilité ;
- catégories : Magasins, Débits de boissons, Hébergements, Restaurants, Activités et sorties, Services, Transports ;
- vraies pages dédiées, pas retour des anciens accordéons historiques lorsque le parcours dédié est attendu ;
- filtres et tri ;
- favoris ;
- contribution ;
- résultats ;
- fiche détaillée ;
- retour exact vers le niveau précédent ;
- conservation des choix, filtres et résultats pendant les retours.

---

# 6. Carte, GPS et Autour de moi

À conserver/restaurer :
- page Carte/GPS dédiée ;
- Retour/Suivant intégrés au cadre maître ;
- explications courtes adaptées au téléphone ;
- Autour de moi avec géolocalisation réelle ;
- compteur spécifique ;
- liste + carte ;
- distinction position appareil / carte / POI / géocodage / itinéraire / transport ;
- compatibilité Samsung ;
- comportement manuel si permission GPS refusée dans l’architecture future.

---

# 7. Transport France / IDFM

À protéger :
- arrêts voyageurs ;
- identifiants uniques ;
- adresses ;
- lignes ;
- directions ;
- plusieurs directions si nécessaires ;
- vrais doublons physiques conservés ;
- tri alphabétique ;
- persistance des listes ;
- fiche détaillée ;
- liens horaires / trafic lorsque disponibles ;
- lecture vocale ;
- sous-catégorie Bus et autres modes selon les développements ;
- données IDFM locales/versionnées et contrôles de fraîcheur.

---

# 8. Diagnostic, réparation et anti-régression

Principe : **1 fonction = 1 module responsable = 1 diagnostic = 1 réparation = 1 secours lorsque possible.**

Toujours vérifier avant un nouveau correctif :
- registre des pannes connues ;
- styles inline ;
- anciennes règles `!important` ;
- conflits CSS ;
- état DOM/classes/hidden/open ;
- cache/version `?v=` ;
- observers ou événements concurrents ;
- ordre de chargement ;
- données utilisateur à protéger.

Ne jamais résoudre une panne en supprimant :
- profil ;
- favoris ;
- avis ;
- signalements ;
- propositions ;
- préférences vocales ;
- données persistantes utiles.

Références :
- `LIBCOMLAIR-KNOWN-ISSUES.md`
- `LIBCOMLAIR-CORRECTION-LOG.md`
- `docs/REGISTRE-DIAGNOSTIC-REPARATION.md`
- `docs/ARCHITECTURE-MODULES.md`
- `docs/ARCHITECTURE-ANTI-REFONTE.md`.

---

# 9. Projets préparés pour plus tard — France et international

Ces dossiers font partie du patrimoine et ne doivent pas être supprimés pendant une restauration de l’application actuelle.

## 9.1 Internationalisation

Référence : `docs/ARCHITECTURE-INTERNATIONALE.md`.

Principes :
- langue ≠ pays ;
- `locale`, `country`, `voicePack`, `dataAdapter` séparés ;
- identifiants métier internes stables et indépendants du texte traduit ;
- France premier territoire opérationnel ;
- second pays pilote plus tard ;
- adaptateurs par pays ;
- validation téléphone réelle avant activation.

## 9.2 GPS mondial

Référence : `docs/ARCHITECTURE-GPS-MONDIAL.md`.

Principes :
- WGS84 ;
- précision/âge/source de position ;
- pas d’historique implicite ;
- passage de frontière sans rupture ;
- GPS indépendant du fournisseur de carte ;
- futur mode Voyage/hors ligne ;
- GPS ne choisit jamais automatiquement langue, pays, profil ou juridiction.

## 9.3 Dictionnaires internationaux

Référence : `docs/ARCHITECTURE-DICTIONNAIRES-INTERNATIONAUX.md`.

Préparer :
- vocabulaire courant ;
- accessibilité ;
- villes/rues/lieux ;
- transports ;
- organisations ;
- prononciations ;
- synonymes Micro ;
- licences/provenance ;
- packs France/français puis anglais, espagnol, allemand, italien, portugais et autres pays au fur et à mesure.

## 9.4 Photos

Référence : `docs/ARCHITECTURE-PHOTOS.md`.

- photo jamais obligatoire ;
- contribution possible sans photo ;
- descriptions alternatives ;
- confidentialité/EXIF ;
- droits/provenance ;
- stockage hors ligne ;
- synchronisation différée ;
- signalements temporaires.

## 9.5 Indépendance complète / hors ligne

Référence : `docs/ROADMAP-INDEPENDANCE-COMPLETE.md`.

Objectif : fonctions essentielles disponibles même sans Render, API ou Internet.

Préparer/protéger :
- bibliothèque audio locale ;
- TTS local ;
- reconnaissance vocale locale ;
- dictionnaire Libcomlair ;
- modèle universel de données ;
- base locale versionnée ;
- contributions hors ligne ;
- diagnostic central ;
- réparation ciblée ;
- restauration de version ;
- export/import et migrations ;
- test final en mode avion pour le profil Vision.

---

# 10. Registres et structures à ne jamais supprimer

## `config/`
- `libcomlair-dictionaries-v1.json`
- `libcomlair-feature-flags.json`
- `libcomlair-legal-registry-v1.json`
- `libcomlair-locales-v1.json`
- `libcomlair-offline-essential-assets-v1.json`
- `libcomlair-rights-registry-v1.json`

## `data/`
Conserver les domaines préparés :
- `architecture/`
- `geography/`
- `i18n/`
- `legal/`
- `licenses/`
- `media/`
- `places/`
- `profile/`
- `routes/`
- `sync/`
- `voice/`

---

# 11. Règle de validation avant toute grosse modification

Avant publication :

1. comparer avec ce registre ;
2. vérifier le cadre maître sur page courte ET page longue ;
3. vérifier une page avec plusieurs handicaps/accordéons ouverts ;
4. vérifier une liste de résultats longue ;
5. vérifier Menu–Logo–Micro ;
6. vérifier Retour/Suivant ;
7. vérifier continuité vocale entre deux pages ;
8. vérifier Micro contextuel ;
9. vérifier Carte/GPS/Autour de moi ;
10. vérifier un parcours catégories → résultats → fiche → retours ;
11. vérifier Transport ;
12. vérifier menu usager et menu avancé ;
13. vérifier Diagnostic/Réparation ;
14. vérifier que les projets préparés pour plus tard et leurs fichiers n’ont pas été supprimés ;
15. vérifier le cache/version des ressources ;
16. tester sur smartphone Android réel.

Une restauration ou une refonte n’est pas considérée terminée avant cette revue complète.

---

# 12. Addendum — dernière passe de contrôle de la valise

## 12.1 Sources nationales de données à conserver

La valise ne se limite pas à IDFM. Les chaînes nationales/régionales préparées ou actives à conserver comprennent :

- Île-de-France Mobilités / IDFM ;
- Acceslibre ;
- gares SNCF ;
- Vitalis / Grand Poitiers ;
- leurs workflows de mise à jour et contrôles de fraîcheur ;
- les alertes techniques de données trop anciennes doivent rester séparées des diagnostics d’interface.

Références :
- `.github/workflows/update-acceslibre.yml`
- `.github/workflows/update-arrets-vitalis.yml`
- `.github/workflows/update-gares.yml`
- `.github/workflows/watch-data-updates.yml`
- workflows IDFM présents dans le dépôt.

## 12.2 Carte officielle des dépendances entre modules

Conserver `data/architecture/libcomlair-module-dependencies-v1.json` comme référence avant modification d’un module.

Cette carte relie chaque fonction à :
- ses fichiers propriétaires ;
- ses dépendances ;
- les tests obligatoires à rejouer.

Exemples protégés : accueil, voix fixe/dynamique, dictionnaires internationaux, passeport d’accessibilité, géolocalisation, lieux universels, itinéraires accessibles, synchronisation, droits, fournisseurs de données, diagnostic, maintenance, Autour de moi et Transport.

## 12.3 Tests de référence / golden cases

Conserver et utiliser :
- `tests/golden-cases-v1.json`
- `tests/reference-journeys.json`.

Les parcours actuels à rejouer après une grosse modification comprennent au minimum :
- première entrée Vision ;
- Restaurant → critère → résultat → fiche → retours ;
- ajout/retrait d’un critère au Micro avec confirmation vocale ;
- Transport → arrêt → identifiant/adresse → lignes/directions → lecture vocale ;
- Autour de moi → position → compteur → liste → carte ;
- Diagnostic/Réparation.

Les parcours GPS mondial, passage de frontière et hors ligne restent **futurs** tant qu’ils ne sont pas activés et validés.

## 12.4 Intégrité des données et migrations

Référence : `data/architecture/data-migrations-registry-v1.json`.

Règles :
- perte de données interdite par défaut ;
- sauvegarde avant migration destructive ;
- ancien format encore lisible jusqu’à validation ;
- stratégie de retour arrière obligatoire ;
- validation sur téléphone si des données utilisateur sont affectées ;
- une position GPS éphémère ne doit jamais devenir persistante par migration ;
- historique légal et droits/licences traçables.

## 12.5 Passeport d’accessibilité futur

Référence : `data/profile/accessibility-passport-schema-v1.json`.

Règles :
- besoins fonctionnels plutôt que diagnostic médical ;
- compte facultatif ;
- fonctionnement local toujours disponible ;
- langue indépendante du pays ;
- pays de recherche indépendant du GPS ;
- aucune synchronisation distante ne doit écraser silencieusement le profil local ;
- migration depuis `libcomlair-access-profile-v1` sans supprimer l’ancien profil avant validation.

## 12.6 Modèle universel des lieux

Référence : `data/places/place-record-schema-v1.json`.

Règles :
- l’accessibilité d’un lieu n’est jamais un simple oui/non global ;
- une valeur inconnue reste inconnue ;
- plusieurs entrées d’un même lieu peuvent avoir des accessibilités différentes ;
- provenance et preuve restent attachées aux critères ;
- conflits de sources conservés et visibles ;
- conditions temporaires et dates de validité ;
- identifiants externes ne remplacent pas l’identifiant interne Libcomlair ;
- fusion de données réversible.

## 12.7 Itinéraires accessibles futurs

Référence : `data/routes/accessibility-route-schema-v1.json`.

Règles :
- accessibilité calculée segment par segment ;
- segment inconnu reste inconnu ;
- condition temporaire peut invalider un trajet ;
- calculer un trajet ne modifie jamais le profil ;
- un lieu accessible ne garantit pas un trajet accessible jusqu’à lui.

## 12.8 Synchronisation future

Référence : `data/sync/sync-envelope-schema-v1.json`.

Règles :
- usage local possible sans compte ;
- file hors ligne conservée après redémarrage ;
- aucun écrasement silencieux local ou distant ;
- conflits visibles et explicitement résolus ;
- suppression distante uniquement après action explicite de l’utilisateur ;
- préférences fonctionnelles sensibles synchronisées uniquement avec choix explicite.

## 12.9 Contrats fournisseurs de données

Référence : `data/architecture/provider-contract-schema-v1.json`.

Un fournisseur externe ne doit jamais définir directement :
- l’interface ;
- les identifiants internes Libcomlair ;
- la position de l’appareil.

Chaque adaptateur doit gérer normalisation, unités, pagination, valeurs manquantes, panne du fournisseur et métadonnées de provenance. Les droits/licences doivent être vérifiés avant intégration hors ligne ; un droit inconnu signifie **pas d’autorisation d’embarquer la ressource**.

## 12.10 Sauvegardes et surveillance

Conserver l’infrastructure de sauvegarde :
- bundle Git complet ;
- archive ;
- SHA et SHA-256 ;
- vérification `git fsck` ;
- surveillance des sauvegardes trop anciennes ou en échec.

Références :
- `BACKUP-MANIFEST-2026-09-25.md`
- `.github/workflows/backup-repository.yml`
- `.github/workflows/watch-backups.yml`.

## 12.11 Périmètre explicite de la « valise Libcomlair »

**EXCLUSION DÉCIDÉE : APK / application Android native / emballage destiné au téléchargement téléphone.**

Ces anciens prototypes peuvent rester dans le dépôt à titre historique mais :
- ne guident pas l’architecture de la valise ;
- ne doivent pas être utilisés pour restaurer l’application actuelle ;
- ne doivent pas réintroduire d’anciens moteurs vocaux ou comportements ;
- ne sont à réexaminer que si une décision future explicite les remet dans le périmètre.

La valise concerne l’application et ses capacités propres : interface, cadre, voix, Micro, profils, données, recherche, GPS/carte, transports, menus, diagnostic/réparation, sauvegardes, fonctionnement local/hors ligne et projets France/international préparés.