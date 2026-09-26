# Libcomlair — incidents outils et environnement de développement

Ce journal complète `LIBCOMLAIR-CORRECTION-LOG.md` et `LIBCOMLAIR-KNOWN-ISSUES.md`.

Il sert à distinguer les pannes de **Libcomlair** des pannes de **l’environnement de développement** : connecteurs, GitHub, navigateur, cache, publication, permissions et outils ChatGPT.

## Règle

Avant de modifier l’application pour corriger un symptôme, vérifier d’abord si le problème vient réellement du code de Libcomlair ou de l’environnement utilisé pour le modifier/tester.

Pour chaque incident, conserver : symptôme, cause confirmée, vérifications, réparation, effet sur les données, et statut.

États : `suspectée`, `confirmée`, `partiellement-réparée`, `réparée-et-validée`.

---

## 2026-09-27 — action GitHub `update_file` temporairement absente

**ID :** `dev-github-write-tool-temporarily-unavailable`

**Symptôme :** pendant une session de modification, les outils GitHub visibles ne proposaient plus l’action d’écriture `update_file`, alors que la connexion GitHub fonctionnait encore en lecture.

**Risque :** conclure à tort que le dépôt, les permissions ou les fichiers Libcomlair sont en panne, puis faire refaire inutilement des réglages déjà validés.

**Vérifications effectuées :**
- la connexion GitHub était toujours active ;
- les permissions du plugin indiquaient `Allow all actions` ;
- les fichiers du dépôt restaient accessibles en lecture ;
- après redécouverte des capacités GitHub, `update_file` est réapparue.

**Cause observée :** disparition temporaire de l’action d’écriture dans les outils exposés à la conversation, sans perte de permission ni modification du dépôt.

**Procédure de réparation :**
1. ne pas modifier les réglages GitHub immédiatement ;
2. vérifier les permissions du plugin ;
3. vérifier qu’un fichier du dépôt est toujours lisible ;
4. redécouvrir/recharger les capacités GitHub ;
5. confirmer que `update_file` réapparaît avant de reprendre les écritures ;
6. ne jamais annoncer une modification comme enregistrée tant que l’écriture n’a pas réellement réussi.

**Données :** aucune donnée Libcomlair perdue ou modifiée par cet incident.

**Validation :** `update_file` est réapparue et les écritures suivantes ont réussi.

**État :** `réparée-et-validée`.
