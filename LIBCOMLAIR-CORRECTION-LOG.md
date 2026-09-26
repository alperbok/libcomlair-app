# Libcomlair — journal des corrections et validations

Ce fichier est la mémoire opérationnelle des corrections réellement rencontrées pendant les tests. Il complète `LIBCOMLAIR-KNOWN-ISSUES.md` et le registre machine.

## Règle de conservation

Pour chaque panne ou régression, enregistrer :
- le symptôme vu ou entendu par l’utilisateur ;
- la cause réellement démontrée ;
- le ou les fichiers responsables ;
- la réparation appliquée ;
- les commits de référence ;
- la méthode de diagnostic ;
- les données à protéger ;
- le test de validation ;
- l’état réel : `suspectée`, `confirmée`, `partiellement-réparée`, `réparée-et-validée`.

Une réparation ne devient une référence automatique que lorsqu’elle est `réparée-et-validée` par un test réel dans l’application.

---

## 2026-09-26 — commandes vocales Profil trop longues

**ID :** `voice-profile-long-primary-actions`

**Symptôme utilisateur :** il faut souvent répéter « Utiliser mes choix » ou « Continuer sans adaptation particulière » sur la page Profil d’accessibilité.

**Cause démontrée :** les actions principales utilisaient des formulations longues comme libellés et comme cibles vocales principales. Le routeur pouvait accepter plusieurs variantes, mais l’utilisateur devait souvent prononcer une phrase complète.

**Réparation :**
- afficher `Valider` pour confirmer les handicaps cochés ;
- afficher `Sans adaptation` pour continuer sans adaptation particulière ;
- reconnaître en priorité `Valider`, `Confirmer`, `Mes choix`, `Sans adaptation`, `Aucune adaptation`, `Continuer` ;
- conserver les anciens libellés longs comme synonymes de secours.

**Fichiers :**
- `libcomlair-v224-voice-router.js`
- `libcomlair-v224-profile-simple-actions.js`
- page de test `test-v224-voice-contextual-v5.html` / suivantes.

**Commits de référence :**
- `09d475946c549c4bfcba84b959c3514effc49c28` — synonymes courts initiaux ;
- `e4606b6c7c3f13f4995dece51a8efd6672ce55e8` — page de test synchronisée.

**Diagnostic :** vérifier les candidats retournés par `LibcomlairVoiceRouter.candidates()` et confirmer que les actions visibles possèdent un alias court non ambigu.

**Données à protéger :** profil d’accessibilité, favoris, avis, signalements, propositions, préférence Découverte/Simplifié.

**Validation :** utilisateur a confirmé « Ça fonctionne » après test de `Vision → Valider` et `Sans adaptation` sur Samsung Browser.

**État :** `réparée-et-validée`.

---

## 2026-09-26 — retour au profil trop long

**ID :** `voice-home-return-profile-too-long`

**Symptôme utilisateur :** sur la page suivante, il faut dire « Modifier mon profil d’accessibilité » pour revenir au profil.

**Réparation appliquée :**
- libellé cible : `Retour au profil` ;
- commandes prioritaires : `Retour`, `Retour profil`, `Profil` ;
- anciennes formulations conservées comme synonymes.

**Fichiers :**
- `libcomlair-v224-voice-router.js`
- `libcomlair-v224-profile-simple-actions.js`.

**Commits de référence :**
- `7ae9363a7d22aaecf9c66707dca54719a1acb817` — synonymes retour profil ;
- `5debc769cb9665534740b1a7c61e948eeb04072b` — libellé visible Retour au profil.

**Diagnostic :** sur la page concernée, `Retour` ne doit être ajouté comme alias court que s’il n’existe qu’une seule action de retour visible.

**Validation :** correction installée, test utilisateur spécifique encore à faire.

**État :** `confirmée`.

---

## 2026-09-26 — généralisation des commandes courtes contextuelles

**ID :** `voice-short-contextual-actions`

**Objectif :** appliquer la simplicité des commandes à toutes les pages et à toutes les actions où un mot court est suffisamment précis.

**Règle :** un mot court (`Retour`, `Suivant`, `Valider`, `Lire`, `Ouvrir`, `Fermer`, `Annuler`, `Recommencer`, `Continuer`, `Rechercher`) n’est ajouté automatiquement que s’il correspond à une seule action visible du contexte courant. Si plusieurs actions correspondent, le routeur conserve les formulations plus précises et ne déclenche rien au hasard.

**Réparation :** `libcomlair-v224-voice-router.js` calcule les candidats visibles, puis ajoute les alias courts uniquement quand le groupe correspondant contient une seule action.

**Commit de référence :** `4598e5e867061dcdf4899aa1651e2d3dd13cd7b2`.

**Diagnostic :** auditer `LibcomlairVoiceRouter.candidates()` page par page et rechercher les alias courts absents ou ambigus.

**Validation :** principe installé ; Profil partiellement validé, parcours complet pas encore validé.

**État :** `partiellement-réparée`.

---

## 2026-09-26 — menu ☰ affiché en bas de page

**ID :** `global-menu-dynamic-style-blocked`

**Symptôme utilisateur :** le bouton à trois tirets apparaît comme un bouton HTML ordinaire en bas à gauche de la page et le panneau ouvert s’insère dans le flux au lieu de se superposer.

**Cause confirmée :** les styles essentiels du menu étaient injectés dynamiquement par JavaScript ; la politique de sécurité de la page empêchait cette méthode d’être fiable.

**Réparation :** déplacer les styles essentiels vers `libcomlair-v224-global-assistance.css`, feuille CSS externe chargée explicitement avec une version de cache.

**Fichiers :**
- `libcomlair-v224-global-assistance.css`
- `libcomlair-v224-global-assistance.js`.

**Validation :** les captures suivantes montrent le bouton repositionné en haut et le panneau fonctionnel ; la panne « bouton en bas dans le flux » n’est plus présente.

**État :** `réparée-et-validée`.

---

## 2026-09-26 — bouton ☰ reste fixé pendant le défilement

**ID :** `global-menu-button-fixed-on-scroll`

**Symptôme utilisateur :** le bouton ☰ conserve la même position à l’écran pendant le défilement alors qu’il doit rester à côté du logo.

**Cause confirmée :** `libcomlair-v224-global-assistance.css` imposait `position: fixed` au bouton.

**Réparation :**
- rattacher le bouton au bloc d’en-tête actif (`.v222-app-brand`, `#v224Page4Brand`, `#v224Page5Brand`) ;
- utiliser `position:absolute` dans cet en-tête ;
- conserver uniquement le panneau ouvert en superposition fixe.

**Commits de référence :**
- `41547ec474b751300e72f39c42f2aadbcfc32a06`
- `38e22ba62e10a8c05c75c6c62798a61f698b5797`
- `049ad9b5e131598900b291678fe0d87f4c457fdf` — diagnostic adapté à la règle d’en-tête.

**Diagnostic :** le bouton doit avoir un parent correspondant à l’en-tête actif et `position:absolute`; il ne doit pas être `fixed`.

**Validation :** correction installée, validation utilisateur après défilement encore nécessaire.

**État :** `confirmée`.

---

## 2026-09-26 — réparation automatique des commandes vocales simples

**ID :** `voice-simple-command-repair`

**Objectif :** permettre à Réparation automatique de restaurer la couche de commandes courtes sans toucher aux données utilisateur.

**Réparation installée :**
- `LibcomlairVoiceRouter.repairSimpleCommands()` audite les actions visibles et leurs alias courts ;
- `libcomlair-repair-engine-v175.js` appelle cette réparation pendant la réparation automatique ;
- la préférence `libcomlair-voice-assistance-mode-v1` est ajoutée aux données protégées ;
- le résultat de l’audit vocal est enregistré avec la dernière réparation.

**Commits de référence :**
- `918de728faa41d36390981513d2c2476c67f536d`
- `2aaffd1ddfee9147ca0b6973457e37e3e3417b6c`
- `d3cfd41b03b28531addb858c29bbe186558215cc` — contrôle anti-régression synchronisé.

**Données protégées :**
- `libcomlair-access-profile-v1`
- `libcomlair-favorites-v16`
- `libcomlair-reviews-v18`
- `libcomlair-reports-v16`
- `libcomlair-proposals-v13`
- `libcomlair-voice-assistance-mode-v1`.

**Validation :** code installé mais Diagnostic/Réparation n’a pas encore été validé de bout en bout sur le téléphone.

**État :** `confirmée`.

---

## 2026-09-26 — indicateur visuel du microphone pendant l’écoute

**ID :** `voice-mic-visual-listening-state`

**Symptôme utilisateur :** lorsque le micro est activé, aucun changement du cercle Micro ne permettait de savoir si l’application écoutait réellement.

**Cause confirmée :** l’état de reconnaissance existait dans le moteur vocal mais n’était pas relié visuellement aux boutons Micro.

**Réparation :**
- assombrir le cercle Micro pendant toute la durée réelle de reconnaissance ;
- revenir automatiquement à l’apparence normale à la fin de l’écoute, après une erreur ou une annulation ;
- comparer l’état `LibcomlairVoice.isRecognitionActive()` avec l’état visuel du bouton ;
- permettre à Réparation automatique de resynchroniser un état visuel bloqué.

**Fichiers :**
- `libcomlair-v224-mic-visual-state.js`
- `libcomlair-v224-mic-visual-state.css`
- `libcomlair-v224-regression-guard.js`
- `libcomlair-repair-engine-v175.js`.

**Commits de référence :**
- `cc902c57a72f61c80acc6217886e275134e493ea`
- `65813d04f528e5a74647f5ae7613e8117440d64b`
- `a8412455425bfbf15a840409bf878d95cbbbec08`
- `9c2c52bc576f113810739669767b89c9dfbc5fd3`.

**Diagnostic :** l’état visuel doit être sombre uniquement lorsque le moteur signale que la reconnaissance est active ; tout écart est une désynchronisation détectable.

**Validation :** utilisateur a confirmé « Ça fonctionne » sur Samsung Browser le 26/09/2026 : le cercle Micro s’assombrit pendant l’écoute puis revient à son état normal.

**État :** `réparée-et-validée`.

---

## Contrôle obligatoire lors du futur test Diagnostic / Réparation

Le test devra vérifier au minimum :
1. que le diagnostic identifie les composants vocaux réellement chargés ;
2. que le routeur fournit les commandes courtes du contexte courant ;
3. qu’une commande courte ambiguë n’est pas ajoutée ;
4. que Réparation automatique relance l’audit vocal ;
5. que le mode Découverte/Simplifié est conservé ;
6. que le profil, favoris, avis, signalements et propositions restent intacts ;
7. que le menu ☰ reste rattaché à l’en-tête ;
8. que l’indicateur visuel du micro correspond réellement à l’état d’écoute ;
9. qu’un changement de version/cache recharge bien les ressources corrigées ;
10. que toute réparation seulement « confirmée » reste distinguée d’une réparation « réparée-et-validée ».
