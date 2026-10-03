# Libcomlair — Comparatif de restauration du cadre maître

Date : 2026-10-03

## Objectif

Comparer le point d’entrée actuel avec les dernières intégrations complètes connues afin de restaurer les capacités historiques sans modifier l’accueil visuel et vocal actuellement validé.

**Règle absolue : conserver l’accueil actuel `Ouvrir → voix → Suivant` et sa géométrie validée.**

---

# 1. Trois niveaux retrouvés

## A. Point d’entrée actuel

Fichier : `libcomlair-clean-entry-v1.html`

Comportement :
- affiche l’accueil propre validé ;
- charge seulement dans la page parente :
  - `libcomlair-render-voice-v196-historical.js`
  - `libcomlair-voice-engine-v191-historical.js`
  - `libcomlair-v224-welcome-open-historical.js` ;
- charge ensuite directement l’application dans une iframe :
  - `test-v224-profile-compact.html?clean-entry-v1=1`.

Conséquence : le wrapper d’intégration historique n’est pas traversé. Les modules qu’il injectait ne sont donc pas automatiquement présents dans la fenêtre de l’application.

Point important : les scripts chargés dans la page parente et ceux exécutés dans l’iframe ont des contextes `window` distincts. Le moteur vocal historique du parent ne remplace donc pas, à lui seul, les anciens scripts vocaux chargés par `test-v224-profile-compact.html`.

## B. Pont propre historique

Fichier : `libcomlair-clean-v1.html`

Ce fichier avait déjà été préparé pour combiner :
- moteur vocal historique ;
- voix router / actions du profil ;
- registre et moteur de réparation ;
- catalogues de réparation jusqu’à `extra21` ;
- assistance globale ;
- Micro visuel ;
- onboarding ;
- protections d’état et de régression ;
- synchronisation profil/besoins ;
- présentation vocale ;
- Carte/GPS ;
- Autour de moi ;
- cadre maître.

Il respecte aussi un principe important : **ne pas charger les anciens contrôleurs d’accueil concurrents** et conserver un seul propriétaire pour l’accueil.

Cependant ce pont est plus ancien que la dernière intégration complète : il ne contient pas les ajouts `extra22` à `extra28` ni plusieurs modules de maintenance/autonomie ajoutés ensuite.

## C. Dernière intégration complète retrouvée

Fichier : `test-v224-master-frame-integration-v3.html`

Titre interne : `Libcomlair — cadre maître v6.8.37`.

Ce wrapper part de `test-v224-master-frame-integration-v1.html`, lui-même construit au-dessus de `test-v224-profile-compact.html`.

Il représente la pile la plus complète retrouvée dans le dépôt.

---

# 2. Ce que le wrapper complet ajoutait par rapport au profil compact direct

## 2.1 Socle interface / cadre

À restaurer ou revalider :
- `libcomlair-v224-master-frame-integration-v1.css`
- `libcomlair-v224-master-frame-integration-v1.js`
- `libcomlair-v224-master-frame-onboarding-v2.css`
- `libcomlair-v224-frame-fixes-v6.css`
- `libcomlair-v224-frame-fixes-v6.js`
- `libcomlair-v224-clean-logo.js`
- `libcomlair-v224-page-coherence.js`
- `libcomlair-v224-page-state-guard.js`
- `libcomlair-v224-regression-guard.js`
- `libcomlair-v224-onboarding-visibility-guard.js`
- `libcomlair-v224-page3-header-guard.js`.

Ces fichiers protégeaient notamment :
- Menu / logo / Micro ;
- défilement du cadre maître ;
- Retour / Suivant ;
- pages courtes et longues ;
- états de page ;
- corrections de chevauchement et anciennes règles CSS concurrentes.

## 2.2 Assistance usager et Micro

À restaurer ou revalider :
- `libcomlair-v224-global-assistance.css`
- `libcomlair-v224-global-assistance.js`
- `libcomlair-v224-mic-visual-state.css`
- `libcomlair-v224-mic-visual-state.js`
- `libcomlair-v224-menu-compact.css`
- `libcomlair-v224-menu-groups.js`
- `libcomlair-v224-voice-completeness.js`
- `libcomlair-v224-voice-router.js`
- `libcomlair-v224-profile-simple-actions.js`.

Objectif : retrouver le menu Assistance et réglages, le Micro réellement contextuel et la symétrie voix/Micro page par page.

## 2.3 Profil, besoins et onboarding

À restaurer ou revalider :
- `libcomlair-v224-onboarding-screens.css/js`
- `libcomlair-v224-needs-step.css`
- `libcomlair-v224-needs-scroll.css`
- `libcomlair-v224-needs-profile-sync.js`
- `libcomlair-v224-needs-voice-groups.js`
- `libcomlair-v224-deep-context-v11.js`
- `libcomlair-v224-identity-registry.js`.

Objectif : conserver plusieurs handicaps/besoins ouverts, profil synchronisé, lecture des choix et retour sans perte d’état.

## 2.4 Présentation et cycle vocal

À restaurer ou revalider :
- `libcomlair-v224-voice-screen-fresh.css/js`
- `libcomlair-v224-presentation-screen-v2.css/js`
- `libcomlair-v224-presentation-voice-card.css`
- `libcomlair-v224-presentation-voice-card-v5.js`
- `libcomlair-v224-presentation-detail-v32.css/js`
- `libcomlair-v224-presentation-reading-fix-v10.css`
- `libcomlair-v224-guided-presenter-v10.js`
- `libcomlair-v224-voice-page-lifecycle.js`
- `libcomlair-v224-voice-path-diagnostic.js`.

Objectif : arrêter la voix de l’ancienne page sans désactiver la suivante, restaurer Présentation Libcomlair et les explications contextuelles.

## 2.5 Carte / GPS / Autour de moi

À restaurer ou revalider :
- `libcomlair-v224-gps-explanations-v32.js`
- `libcomlair-v224-map-gps-hub-v31.css/js`
- `libcomlair-v224-map-gps-page-v33.css/js`
- `libcomlair-v224-map-gps-polish-v34.css/js`
- `libcomlair-v224-map-gps-polish-v35.css/js`
- `libcomlair-v224-nearby-count-sync-v37.js`.

Objectif : retrouver la page GPS dédiée, le compteur Autour de moi, la liste/carte et les corrections Samsung sans changer la hauteur de carte validée.

## 2.6 Diagnostic, réparation et catalogues de pannes

Le profil compact direct contient encore un ancien moteur de réparation. Le wrapper complet le remplaçait par :
- `libcomlair-rule-registry-v224.js`
- `libcomlair-repair-catalog-v224.js`
- catalogues `extra` à `extra28`
- `libcomlair-repair-engine-v175.js`
- version local-first de `libcomlair-selftest-v189.js`.

Les catalogues `extra22` à `extra28` sont particulièrement importants car ils documentent des pannes du cadre maître, du défilement, du menu développeur et des injections de modules.

`extra28` indique explicitement qu’une ancienne version du wrapper pouvait échouer silencieusement lors de l’injection de modules ; la correction était installée mais attendait encore une validation Samsung.

## 2.7 Autonomie et maintenance avancée

Ajouts de la dernière intégration complète :
- `libcomlair-v224-data-count-diagnostic.js`
- `libcomlair-v224-voice-independence-v1.js`
- `libcomlair-local-audio-library-v1.js`
- `libcomlair-v224-welcome-local-recorder-v1.js`
- `libcomlair-v224-voice-local-coverage-v1.js`
- `libcomlair-v224-autonomy-dashboard-v1.js`
- `libcomlair-v224-maintenance-inspector-v1.js`
- `libcomlair-v224-technical-menu-access-v1.css/js`
- `libcomlair-v224-welcome-audio-maintenance-ui-v1.js`
- `libcomlair-v224-external-services-test-v1.js`
- `libcomlair-v224-welcome-autoplay-diagnostic-v1.js`.

Ces fonctions doivent rester séparées du menu usager normal et n’être réactivées qu’après validation.

---

# 3. Écarts principaux

| Fonction | Entrée actuelle | `libcomlair-clean-v1.html` | Cadre complet v6.8.37 |
|---|---|---|---|
| Accueil propre Ouvrir → voix → Suivant | OUI, validé | OUI, ancienne méthode | Ancien contrôleur de wrapper |
| Profil compact | OUI direct | OUI via transformation | OUI via wrappers |
| Cadre maître complet | NON raccordé | Partiel / ancienne version | OUI |
| Assistance globale | NON raccordée par l’entrée | OUI | OUI |
| Micro visuel/contextuel renforcé | NON raccordé | OUI | OUI |
| Protections anti-régression | NON raccordées | OUI, version antérieure | OUI |
| Catalogues réparation `extra22`–`extra28` | NON | NON | OUI |
| Frame fixes v6 | NON | NON | OUI |
| Diagnostic données / autonomie | NON | NON | OUI |
| Maintenance avancée | NON | NON | OUI |
| Bibliothèque audio locale / couverture locale | NON | NON | OUI |
| Carte/GPS renforcée | NON via wrapper | OUI ancienne version | OUI version plus récente |
| Compteur Autour de moi renforcé | NON via wrapper | OUI ancienne version | OUI version plus récente |

---

# 4. Conclusion technique

Le problème principal n’est pas que les fonctions ont disparu du dépôt. **Elles existent encore mais le point d’entrée actuel les contourne.**

Il ne faut donc pas refaire Libcomlair depuis zéro.

La bonne stratégie est de créer un **pont de restauration propre** qui :
1. conserve intégralement `libcomlair-clean-entry-v1.html` et son accueil validé ;
2. remplace seulement la source interne de l’iframe par une version restaurée de l’application ;
3. réutilise les modules du cadre maître complet ;
4. exclut tous les anciens contrôleurs d’accueil susceptibles de concurrencer `libcomlair-v224-welcome-open-historical.js` ;
5. réactive les familles de modules par étapes ;
6. rejoue les parcours de référence après chaque étape ;
7. ne publie pas comme version principale avant validation sur Samsung.

---

# 5. Ordre de restauration recommandé

## Étape 1 — cadre visuel seulement
- cadre maître CSS/JS ;
- frame fixes ;
- logo ;
- page coherence ;
- Retour/Suivant ;
- aucune modification de l’accueil.

## Étape 2 — profil / besoins / navigation
- onboarding ;
- profile simple actions ;
- needs profile sync ;
- state guard ;
- regression guard.

## Étape 3 — assistance vocale / Micro
- voice router ;
- global assistance ;
- mic visual state ;
- voice completeness ;
- page lifecycle ;
- guided presenter.

## Étape 4 — GPS / Autour de moi
- map/gps hub ;
- page GPS ;
- polishes ;
- nearby count sync.

## Étape 5 — Diagnostic / Réparation
- rule registry ;
- catalogues jusqu’à `extra28` ;
- selftest local-first ;
- repair engine.

## Étape 6 — maintenance/autonomie
- uniquement après validation des étapes précédentes ;
- menu avancé caché en usage normal.

---

# 6. Tests obligatoires avant de considérer la restauration terminée

- accueil Ouvrir → voix → Suivant inchangé ;
- entrée Vision ;
- plusieurs besoins/accordéons ouverts ;
- Restaurant → critère → résultats → fiche → retours ;
- ajout/retrait d’un critère au Micro avec confirmation vocale ;
- Menu / logo / Micro ;
- Présentation Libcomlair ;
- Transport avec identifiant, adresse, lignes et directions ;
- Autour de moi avec position, compteur, liste et carte ;
- Diagnostic/Réparation ;
- listes longues et cadre maître ;
- smartphone Samsung réel.

---

# 7. Ne pas faire

- ne pas modifier l’image d’accueil validée ;
- ne pas modifier la hauteur validée du bouton Ouvrir ;
- ne pas reconnecter les anciens contrôleurs d’accueil concurrents ;
- ne pas basculer directement le point d’entrée public vers `test-v224-master-frame-integration-v3.html` ;
- ne pas restaurer tous les modules en une seule modification ;
- ne pas utiliser les prototypes APK/Android natifs comme source de restauration ;
- ne jamais effacer profil, favoris, avis, signalements, préférences ou données persistantes pour corriger un problème technique.
