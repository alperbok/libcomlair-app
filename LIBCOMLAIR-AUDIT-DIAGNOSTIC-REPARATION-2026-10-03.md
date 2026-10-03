# Libcomlair — Audit Diagnostic / Réparation

Date : 2026-10-03

## But

Conserver la mémoire des correctifs retrouvés dans Diagnostic/Réparation afin de restaurer Libcomlair sans oublier les décisions déjà testées ni réactiver une ancienne solution devenue obsolète.

Cet audit complète :
- `LIBCOMLAIR-REGISTRE-MAITRE-PATRIMOINE.md` ;
- `LIBCOMLAIR-KNOWN-ISSUES.md` ;
- `LIBCOMLAIR-CORRECTION-LOG.md` ;
- `docs/REGISTRE-DIAGNOSTIC-REPARATION.md` ;
- `docs/ARCHITECTURE-MODULES.md` ;
- `docs/MAINTENANCE-AVANCEE.md`.

## Périmètre relu

- `libcomlair-repair-catalog-v224.js` ;
- toutes les extensions présentes `extra2` à `extra28` ;
- aucune `extra29` n’existe au moment de l’audit ;
- `libcomlair-known-issues-v224.js` ;
- `libcomlair-repair-engine-v175.js` ;
- `libcomlair-selftest-v189.js` ;
- `libcomlair-v224-technical-menu-access-v1.js` ;
- registres/documentation Diagnostic, Réparation et Maintenance avancée.

---

# 1. Cadre maître adaptable — correctifs à ne jamais perdre

## 1.1 Règle générale

Même identité de cadre ne veut pas dire contenu figé.

Le cadre garde :
- Menu — Logo — Micro en haut ;
- contenu au centre ;
- Retour / Suivant ou action équivalente dans la navigation prévue.

Mais le comportement du centre dépend du volume réel du contenu.

## 1.2 Plusieurs handicaps / accordéons

### Panne : `needs-accordion-reset-by-legacy-body-observer`

Symptôme : Vision reste ouvert mais Audition, Mobilité ou un troisième dossier se referment immédiatement.

Cause : un ancien `MutationObserver` sur les classes du `body` relançait `syncNeedsPage()` et réappliquait `details.open` d’après le profil enregistré.

Réparation validée :
- supprimer cet observateur de classes obsolète ;
- le profil initialise les accordéons à l’entrée de la page ;
- ensuite l’utilisateur peut ouvrir plusieurs dossiers librement.

Validation : Samsung Browser, 01/10/2026 : plusieurs dossiers restent ouverts simultanément.

Fichier de référence : `libcomlair-v224-needs-profile-sync.js`.

### Panne : `master-frame-fixed-footer-hides-accordion-tail`

Symptôme : quand plusieurs handicaps sont ouverts, Retour/Valider restent fixés en bas et masquent la fin de la liste.

Cause : grille du cadre en trois lignes fixes, adaptée aux pages courtes mais pas à un contenu extensible.

Réparation : pour `v224-onboarding-needs` uniquement :
- shell défilant ;
- lignes `82px / auto / auto` ;
- `mainContent` prend sa hauteur naturelle ;
- header conservé/sticky selon la structure validée ;
- footer placé après la liste et visible à la fin du contenu.

Références :
- `libcomlair-v224-master-frame-integration-v1.css` ;
- `libcomlair-v224-frame-fixes-v6.css`.

### Panne : `master-frame-needs-footer-held-by-legacy-center-scroll`

Symptôme : même après la correction précédente, Retour/Valider peuvent encore rester en bas de l’écran.

Cause : `libcomlair-v224-needs-step.css` imposait encore `height:100%` + `overflow-y:auto` au centre, empêchant la hauteur des accordéons de pousser le footer.

Réparation :
- supprimer le scroll local concurrent de `needs-step.css` ;
- sous le cadre maître, une seule couche pilote hauteur et défilement ;
- contenu en hauteur naturelle / `max-content` selon la règle finale ;
- footer après la liste.

Commits de référence :
- `a6815a0d87da29e1e2dab5926469836b3aaef2a0` ;
- `d391d15f24f3a9a3076d7bf36686fbc325d16b40`.

## 1.3 Résultats et pages utilitaires

Le runtime du cadre maître possède `syncScrollMode()`.

Règles :
- page courte : pas de scroll inutile ;
- débordement réel : activer le mode de défilement maître ;
- `v224-results-step` et `v224-utility-step` peuvent forcer ce mode ;
- ne jamais redimensionner arbitrairement le cadre pour faire rentrer une longue liste ;
- garder les résultats visuels, le compteur vocal et l’état de recherche synchronisés ;
- fiche détaillée → Retour doit retrouver la même liste et son état.

## 1.4 Tailles des catégories

Panne : `master-frame-category-sizing-rules-stacked`.

Cause : mêmes hauteurs définies dans plusieurs CSS concurrents.

Règle : une seule source canonique dans le cadre maître. Ne pas réintroduire les anciennes copies `page4.css` / `frame-fixes` qui reprennent la priorité.

---

# 2. Navigation et Retour

Correctifs à préserver :

- `return-categories-intermediate-screen` : Retour catégories restaure réellement les grandes catégories, sans écran intermédiaire vide ;
- `voice-return-command-too-generic` : Retour transports et Retour catégories sont des destinations différentes ;
- `voice-category-opens-inline` / `legacy-details-open` : une grande catégorie ne doit pas se déplier dans l’écran courant si le parcours validé exige une page dédiée ;
- Carte/GPS respecte l’ordre inverse exact du parcours :
  - panneau Carte/GPS → Retour = page Carte/GPS principale ;
  - Recherche/Catégories → Retour = Carte/GPS ;
  - Carte/GPS principale → Retour = Accueil/Recherche.

---

# 3. Cycle de vie vocal — règle essentielle

## 3.1 Un seul orchestrateur

Panne : `voice-continues-after-page-change`.

La solution historique n’était pas seulement `cancel()`.

Règle finale :
- un seul propriétaire du cycle vocal ;
- la navigation signale le changement ;
- l’ancienne lecture s’arrête immédiatement ;
- l’état interne du présentateur est réinitialisé ;
- le contexte de la nouvelle page est détecté ;
- une seule nouvelle annonce démarre.

Ne jamais avoir deux orchestrateurs qui s’annulent mutuellement.

## 3.2 Voix sur les pages suivantes

Pannes enregistrées :
- `voice-only-starts-on-profile-not-following-pages` ;
- `voice-silent-all-pages-after-lifecycle-race` ;
- `voice-stops-on-search-categories-and-deep-pages` ;
- `profile-voice-silent-after-v10`.

Réparation validée historiquement :
- contexte fondé sur l’écran réellement visible ;
- présentateur unique ;
- lecture directe des pages profondes : search, category, subcategory, map, favorites, filters, contribute, results, detail ;
- le mode Simplifié annonce l’essentiel au lieu de devenir silencieux.

Validation historique v11 : voix active du Profil jusqu’à la fiche détaillée.

## 3.3 Présentation Libcomlair

Correctifs validés ou de référence :
- accordéons compacts pour consultation manuelle ;
- pendant lecture automatique, une carte centrale indépendante plutôt que l’ouverture successive des accordéons ;
- pas de replay automatique après 10/10 ;
- après la dernière rubrique, proposer vocalement Suivant et Retour/Précédent ;
- titre dans le flux normal, pas en position absolue fragile ;
- prononciation vocale de `Libcomlair` = « Lib comme l’air » sans modifier l’écriture visuelle.

## 3.4 Accueil vocal — historique versus comportement actuel

Plusieurs stratégies se sont succédé. Ne jamais appliquer aveuglément une entrée historique.

Historique important :
- Android/Samsung peut laisser Web Audio `suspended` avant un geste dans la page ;
- le flux validé le 30/09 utilisait `Écouter → voix naturelle → Suivant` ;
- le 01/10 une expérimentation `welcome-local-first` avait séparé navigation et voix pour empêcher Render de bloquer l’entrée.

**Comportement actuel validé le 03/10/2026 et désormais prioritaire :**
- bouton visible `Ouvrir` ;
- appui sur Ouvrir = démarrage de la voix naturelle ;
- dès que la voix démarre, Ouvrir disparaît ;
- `Suivant →` apparaît au même emplacement ;
- jamais Ouvrir et Suivant simultanément ;
- appui sur Suivant = arrêt immédiat de la voix de bienvenue puis ouverture de la page suivante ;
- la page suivante doit ensuite reprendre sa propre assistance vocale.

Donc : conserver les diagnostics historiques sur Android/Render, mais ne pas rétablir une ancienne stratégie qui supprimerait le flux Ouvrir → voix → Suivant actuellement validé.

---

# 4. Micro et commandes vocales

À préserver :

- commandes courtes contextuelles seulement si non ambiguës ;
- `Retour`, `Suivant`, `Valider`, `Lire`, `Ouvrir`, `Fermer`, `Annuler`, `Recommencer`, `Continuer`, `Rechercher` ;
- commande longue conservée comme synonyme de secours ;
- Micro contextuel à l’écran actif ;
- couverture de tous les contrôles visibles, champs, contrôles ARIA et textes explicatifs ;
- dictée des champs lorsqu’elle est prévue ;
- état visuel du cercle Micro synchronisé avec l’écoute réelle ;
- Réparation automatique peut resynchroniser l’état du Micro et réauditer les commandes simples.

Validation historique : cercle Micro assombri pendant écoute puis normal à la fin.

---

# 5. Menu usager et Maintenance avancée

## Menu usager

Correctifs historiques :
- ne pas injecter les styles essentiels uniquement par JavaScript ;
- bouton ☰ rattaché à l’en-tête actif ;
- bouton non `fixed` pendant le scroll ;
- panneau en superposition ;
- ouverture manuelle dans le profil Vision doit pouvoir annoncer les choix visibles ;
- le menu ne doit pas perdre l’état de la page derrière lui.

## Menu avancé

Doit rester séparé et masqué en usage normal.

Outils prévus/présents :
- autonomie ;
- test sans services externes ;
- dépendances externes ;
- matrice « quoi retester après une modification » ;
- préparation hors ligne ;
- feature flags ;
- rapport technique ;
- sortie du mode avancé.

Ne pas confondre ce masquage d’interface avec une authentification forte.

---

# 6. Carte / GPS / Autour de moi

Correctifs retrouvés :

## Conserver le contexte de recherche

Panne `nearby-search-resets-category-to-all` : Autour de moi ne doit pas effacer la catégorie/sous-catégorie active.

Règle : mémoriser le contexte avant rafraîchissement et le restaurer après.

## Compteurs cohérents

Pannes :
- `nearby-counter-excludes-transport-from-status` ;
- `nearby-visible-count-differs-from-voice-count`.

Règle : le compteur réellement affiché est la source canonique pour le message visible et vocal, transports inclus lorsque l’écran les inclut.

## Carte/GPS = vraie page autonome

Panne `map-gps-hub-overlaps-search-page`.

Correction validée : Carte/GPS doit être seule dans son écran et Suivant rend la main à la recherche classique.

## Assistance vocale Carte/GPS

Panne `map-gps-page-has-no-voice-assistance`.

Correction validée : contexte `map-gps-hub` géré par le même présentateur que les autres pages.

## Samsung et mise en page

À préserver :
- Micro entièrement dans le cadre, sans chevauchement ;
- panneau ouvert défilant intérieurement quand nécessaire ;
- éviter `scrollIntoView` qui fait remonter le document et coupe le titre ;
- un seul bouton Retour visible dans les panneaux ;
- tutoriels Carte/GPS détaillés en Découverte, plus discrets/absents en Simplifié selon règle ;
- ne jamais réintroduire un `MutationObserver` permanent qui modifie le DOM qu’il observe.

---

# 7. Transport / IDFM

À préserver :
- plusieurs points portant le même nom ne sont jamais supprimés automatiquement ;
- vérifier identifiant, commune, adresse, lignes et directions avant tout regroupement ;
- regrouper éventuellement visuellement, mais conserver les identifiants/directions distincts ;
- cadence/actualisation et watchdog des données restent un sujet Diagnostic ;
- les données locales datées servent de secours en cas de service dégradé.

---

# 8. Filtres, carte et états DOM

Pannes connues à garder dans la mémoire :
- `filters-empty-after-layout-refactor` ;
- `filter-frame-forced-minheight-clips-sort` ;
- `inline-display-overrides-css` ;
- `css-specificity-collision` ;
- `empty-screen-hidden-sections` ;
- `page-state-visual-state-desync` ;
- `duplicate-brand` ;
- `leaflet-gray-map` ;
- `layout-overflow-mobile`.

Règle : si une correction CSS semble ne presque rien changer, ne pas modifier encore la même valeur ; rechercher d’abord styles inline, `!important`, spécificité, cache, classes/hidden/open et anciennes couches.

---

# 9. MutationObserver — règle Samsung

Pannes confirmées :
- `onboarding-javascript-class-observer-loop` ;
- `map-gps-v31-freezes-samsung-browser` ;
- `map-gps-v35-samsung-mutation-loop` ;
- `needs-accordion-reset-by-legacy-body-observer`.

Règle obligatoire :
- ne pas observer en permanence une propriété que la fonction de synchronisation modifie elle-même ;
- synchronisation idempotente ;
- n’écrire texte, attribut ou classe que si la valeur change ;
- préférer événements fonctionnels ciblés ;
- lorsqu’une temporisation suffit, utiliser une série bornée plutôt qu’un observateur infini.

---

# 10. Diagnostic local-first

Panne : `diagnostic-false-failure-from-provider-and-exact-version-checks`.

Règle :
- Diagnostic valide des **capacités**, pas des numéros de version exacts ;
- aucune requête réseau n’est nécessaire pour dire si les fonctions locales sont opérationnelles ;
- Render et autres services externes ont un état séparé ;
- une panne externe ne doit pas faire croire que tout Libcomlair est en panne ;
- le mode « services externes coupés » sert à tester l’autonomie.

Le self-test actuel couvre notamment :
- moteur vocal ;
- entrée application ;
- couverture vocale locale ;
- routeur Micro ;
- menu Assistance ;
- contexte/guide vocal ;
- catégories ;
- accessibilité ;
- données ;
- détails ;
- transports ;
- interface ;
- Réparation ;
- pannes connues.

---

# 11. Réparation automatique — données protégées

Le moteur actuel protège explicitement :
- `libcomlair-access-profile-v1` ;
- `libcomlair-favorites-v16` ;
- `libcomlair-reviews-v18` ;
- `libcomlair-reports-v16` ;
- `libcomlair-proposals-v13` ;
- `libcomlair-voice-assistance-mode-v1`.

Il peut :
- annuler une voix bloquée ;
- réparer certaines pannes sûres connues ;
- réauditer les commandes vocales simples ;
- resynchroniser l’indicateur Micro ;
- nettoyer les caches techniques ;
- mettre à jour les service workers ;
- effacer seulement les caches/données transitoires identifiés ;
- recharger avec un paramètre anti-cache.

Ne jamais transformer Réparation automatique en remise à zéro générale.

---

# 12. Cache et versions

Panne validée : `voice-stale-script-cache-presenter-v6`.

Règle :
- si le téléphone affiche une ancienne version malgré le commit, vérifier la version réellement chargée ;
- incrémenter les versions des ressources ;
- pour les tests importants, un nouveau nom de fichier peut être nécessaire ;
- ne pas conclure qu’un correctif a échoué si le diagnostic prouve que l’ancienne ressource est encore chargée.

---

# 13. Stratégie anti-empilement

Panne/règle : `clean-rebuild-preferred-after-layered-regressions`.

Si plusieurs couches historiques modifient le même composant et que les régressions reviennent :
- arrêter d’ajouter des hotfix ;
- identifier les propriétaires concurrents ;
- créer si nécessaire un module propre, isolé, avec son DOM/style/événements ;
- cesser de charger les anciennes couches responsables ;
- valider avant suppression définitive.

Cette règle ne justifie pas une refonte globale : elle s’applique au composant réellement conflictuel seulement.

---

# 14. Contrôle obligatoire pendant la restauration actuelle

Avant de considérer la restauration terminée :

1. Ouvrir → voix → Suivant fonctionne et les deux libellés ne coexistent jamais.
2. Suivant coupe la voix de Bienvenue.
3. La page suivante reprend sa propre assistance vocale.
4. Profil puis pages suivantes : voix continue sans silence global.
5. Plusieurs handicaps peuvent rester ouverts simultanément.
6. Retour/Valider ne recouvrent jamais la fin de Mes besoins.
7. Une liste Résultats longue défile dans le cadre sans modifier le cadre maître.
8. Retour depuis fiche retrouve la liste et son état.
9. Menu–Logo–Micro ne se chevauchent pas.
10. Menu usager et Maintenance avancée restent séparés.
11. Carte/GPS est une page autonome.
12. Autour de moi conserve catégorie/sous-catégorie et compteur voix = compteur écran.
13. Navigation Retour Carte/GPS respecte l’ordre inverse exact.
14. Aucun double Retour dans les panneaux.
15. Aucune boucle `MutationObserver` sur Samsung.
16. Diagnostic local réussit même si Render est coupé, lorsque les fonctions locales sont saines.
17. Réparation automatique conserve toutes les données protégées.
18. Catégories restent des pages dédiées selon le parcours validé.
19. Carte Leaflet se redimensionne correctement après affichage.
20. Cache/version réellement chargés sont contrôlés avant de juger une correction.

## Règle finale

**Diagnostic et Réparation sont une mémoire technique de Libcomlair. Une panne déjà comprise doit être retrouvée ici avant toute nouvelle modification.**
