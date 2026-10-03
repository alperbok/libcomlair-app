# Libcomlair — Addendum audit Diagnostic / Réparation

Date : 2026-10-03

## Objet

Anomalies trouvées pendant la relecture complète du Diagnostic et de la Réparation. Ces anomalies peuvent faire croire à une panne alors que le composant est présent et fonctionnel.

## 1. Garde anti-régression — routeur vocal

Fichier : `libcomlair-v224-regression-guard.js`.

La garde exige exactement :
- `LibcomlairVoiceRouter.version === "v224-6"`.

Or le routeur actuel `libcomlair-v224-voice-router.js` expose :
- `version: "v224-8"`.

Conséquence : faux échec possible du contrôle « Routeur micro contextuel ».

Réparation à appliquer lors de la restauration : ne plus valider une capacité saine par égalité stricte sur un ancien numéro de version. Vérifier présence + méthodes nécessaires (`start`, `candidates`, diagnostic des commandes simples), conformément au Diagnostic local-first.

## 2. Garde anti-régression — menu Assistance et réglages

Fichier : `libcomlair-v224-regression-guard.js`.

La garde exige exactement :
- `LibcomlairGlobalAssistance.version === "v224-3"`.

Or `libcomlair-v224-global-assistance.js` expose actuellement :
- `version: "v224-4"`.

Conséquence : faux échec possible du contrôle « Menu Assistance et réglages ».

Réparation à appliquer lors de la restauration : contrôle par capacité (`open`, `close`, rattachement correct à l’en-tête) plutôt que numéro exact.

## 3. Rapport de Maintenance avancée — moteur de réparation

Fichier : `libcomlair-v224-technical-menu-access-v1.js`.

Dans `moduleSnapshot()`, le module `repair` cherche le global :
- `LibcomlairRepairEngine`.

Le moteur actuel `libcomlair-repair-engine-v175.js` expose principalement :
- `window.LibcomlairRepair`.

Le self-test `libcomlair-selftest-v189.js` gère correctement les deux formes :
- `window.LibcomlairRepair || window.LibcomlairRepairEngine`.

Conséquence : le rapport technique de Maintenance avancée peut déclarer le module Réparation absent alors que la réparation automatique fonctionne.

Réparation à appliquer lors de la restauration : utiliser la même résolution que le self-test, avec priorité à `LibcomlairRepair` et compatibilité historique avec `LibcomlairRepairEngine`.

## 4. Règle générale confirmée

Ces trois anomalies confirment la décision déjà enregistrée dans `libcomlair-repair-catalog-extra27-v224.js` :

**Le Diagnostic doit être local-first et capability-based. Une nouvelle version valide ne doit jamais être considérée en panne uniquement parce que son numéro a changé.**

Ne pas corriger ces faux négatifs en redescendant les composants vers une ancienne version. Corriger la garde/le rapport, pas les modules fonctionnels.
