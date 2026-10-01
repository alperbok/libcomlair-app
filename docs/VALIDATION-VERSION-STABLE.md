# Libcomlair — validation avant version stable

Date de création : 2026-10-01

## Objectif

Empêcher qu’une expérimentation ou une correction partielle devienne la nouvelle référence avant validation complète.

## Chaîne obligatoire

1. **Source vérifiée**
   - fichier propriétaire identifié ;
   - dépendances et ordre de chargement vérifiés ;
   - pannes connues consultées ;
   - aucune donnée utilisateur inutilement touchée.

2. **Diagnostic du module**
   - état cohérent ;
   - aucune nouvelle erreur non expliquée ;
   - secours connu lorsque nécessaire.

3. **Tests ciblés**
   - fonction modifiée ;
   - retour arrière ;
   - module voisin ;
   - données utilisateur préservées.

4. **Parcours de référence**
   - exécuter les parcours concernés dans `tests/reference-journeys.json` ;
   - noter les échecs avant toute promotion.

5. **Validation téléphone réel**
   Obligatoire lorsque sont concernés :
   - rendu visuel ;
   - tactile ;
   - audio ;
   - microphone ;
   - GPS ;
   - performance ou stockage local.

6. **Conformité**
   - licence/source/version documentées pour tout nouveau composant tiers ;
   - aucune clé, jeton ou secret dans le code public ;
   - aucune collecte personnelle ajoutée sans règle claire.

7. **Promotion**
   - le feature flag peut passer de `test` à `on` ;
   - la version peut être déclarée stable ;
   - les documents d’architecture sont mis à jour si nécessaire.

## Causes de blocage

Une version ne doit pas être promue si :

- la validation téléphone nécessaire manque ;
- un parcours essentiel échoue ;
- une panne connue est contournée sans cause racine comprise ;
- une nouvelle dépendance externe devient indispensable sans secours ;
- une licence est incertaine ;
- des données utilisateur risquent d’être perdues ;
- le Diagnostic ne peut pas distinguer l’état du module modifié.

## Règle spéciale pour une correction urgente

Une correction urgente peut être diffusée avec périmètre réduit seulement si :

- elle répare une panne clairement identifiée ;
- elle ne modifie pas des modules non concernés ;
- les données utilisateur sont protégées ;
- le correctif et sa validation sont documentés ;
- un retour arrière existe ou la version stable précédente reste disponible.

## Principe final

**Une version stable n’est pas la dernière version créée : c’est la dernière version réellement validée.**
