# Libcomlair — règles prioritaires et règles liées

## Pourquoi ce registre existe
Libcomlair possède de nombreuses règles déjà décidées au fil des tests. Elles ne doivent plus dépendre uniquement de la mémoire d'une conversation.

Le registre classe les règles par priorité et relie chaque règle aux autres règles qu'elle doit faire consulter.

## Ordre de priorité

### P0 — règles absolues
Ces règles passent avant toute autre modification.

1. **Consulter les pannes connues avant toute nouvelle correction.**
   - Vérifier Diagnostic et pannes, l'historique des réparations et les correctifs déjà validés.
   - Renvoie vers : protection des données, absence de régression, diagnostic avant correction, documentation des nouvelles pannes.

2. **Ne perdre aucune donnée.**
   - Aucune réparation, migration ou modification ne doit supprimer des données utilisateur, métier ou l'historique du projet.
   - Renvoie vers : sauvegardes, indépendance des fournisseurs, protection des secrets.

3. **Préserver les fonctions déjà validées.**
   - Une correction ciblée ne doit pas casser ce qui fonctionne déjà.
   - Renvoie vers : diagnostic avant correction, validation après correction, sauvegarde avant modification risquée.

4. **L'accessibilité reste prioritaire sur chaque page.**
   - Les éléments visibles, sélectionnables ou explicatifs importants doivent rester utilisables ou lisibles par l'assistance adaptée.
   - Renvoie vers : voix naturelle, contexte vocal de chaque page, absence de régression.

5. **Voix naturelle uniquement.**
   - Ne jamais utiliser une voix robotique comme solution de secours.
   - En cas de panne, réparer ou utiliser une autre solution de voix naturelle validée.
   - Renvoie vers : indépendance des fournisseurs, déverrouillage audio Android, contexte vocal.

6. **Aucun fournisseur unique ne doit être indispensable.**
   - Libcomlair doit rester restaurable et migrable sans dépendre d'un seul hébergeur, fournisseur de données ou moteur vocal.

7. **Secrets et identifiants hors du code public.**
   - Ne jamais stocker en clair mots de passe, clés privées ou URL privées de base de données.

## P1 — règles de méthode
Ces règles indiquent comment travailler sans casser les règles P0.

1. **Diagnostiquer avant de modifier.**
2. **Valider après correction.**
3. **Documenter toute nouvelle panne résolue.**
4. **Sauvegarder avant une modification risquée.**
5. **Le micro et l'assistance vocale doivent suivre le contexte de chaque page.**
6. **Sur Android, vérifier le verrouillage audio avant de changer de moteur vocal.**
7. **Les données importées ne doivent jamais piloter la logique de l'application.**

## P2 — règles d'amélioration
Les améliorations d'ergonomie, de présentation, de renommage ou les nouvelles fonctions viennent après la stabilité, l'accessibilité, la sécurité et les pannes prioritaires.

## Règles liées
Chaque règle possède une liste de règles associées. Lorsqu'une règle est déclenchée, les règles liées doivent aussi être examinées.

Exemple :

**Problème : première page silencieuse sur Android**

1. P0 — consulter les pannes connues ;
2. P0 — voix naturelle uniquement ;
3. P1 — vérifier le verrouillage audio Android ;
4. P0 — préserver les fonctions déjà validées ;
5. P1 — valider après correction ;
6. si la panne est nouvelle : P1 — l'ajouter à Diagnostic et pannes.

## Registre exploitable par l'application
Le fichier `libcomlair-rule-registry-v224.js` expose `window.LibcomlairRuleRegistry` avec :
- `all()` : toutes les règles ;
- `byId(id)` : une règle précise ;
- `byPriority(priority)` : règles P0, P1 ou P2 ;
- `linked(id)` : règles directement liées ;
- `forText(text)` : règles déclenchées par un problème décrit en texte ;
- `resolve(ids)` : règle(s) et toutes leurs dépendances ;
- `preflight(problem)` : pré-contrôle complet avant intervention.

## Principe général
Avant toute correction importante :

**Problème → règles P0 → pannes connues → règles liées → diagnostic → correction ciblée → validation → documentation si nouvelle panne.**
