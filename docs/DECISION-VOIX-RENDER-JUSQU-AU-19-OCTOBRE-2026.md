# Décision Libcomlair — voix avec Render jusqu’au 19 octobre 2026

## Décision

Jusqu’au **19 octobre 2026**, Render redevient le **fournisseur vocal principal actif** de Libcomlair pour la voix naturelle dynamique.

Cette décision ne change pas l’objectif d’indépendance de Libcomlair : Render reste un fournisseur interchangeable. La logique métier, les textes, les règles d’accessibilité, le déclenchement vocal, le diagnostic, la bibliothèque locale et l’historique des pannes appartiennent à Libcomlair.

## Objectif prioritaire immédiat

1. Faire fonctionner la voix naturelle automatiquement sur la page **Bienvenue / accueil**.
2. Vérifier ensuite le parcours vocal déjà validé page par page.
3. Corriger les pannes rencontrées sans créer de système vocal parallèle.
4. Répertorier chaque panne dans **Diagnostic et pannes** avec sa cause, son symptôme, sa détection et sa réparation.

Aucun nouvel objectif vocal ne doit passer devant ces quatre points tant qu’ils ne sont pas validés.

## Pourquoi utiliser Render jusqu’à cette date

Render a déjà permis à Libcomlair de produire une voix naturelle. Les pannes rencontrées constituent une base de diagnostic utile pour n’importe quel futur fournisseur :

- démarrage à froid ;
- délai réseau ;
- timeout ;
- indisponibilité du fournisseur ;
- erreur HTTP ;
- audio vide ou invalide ;
- décodage audio ;
- AudioContext verrouillé ou suspendu ;
- interruption de lecture ;
- concurrence entre deux lectures ;
- changement de page pendant une lecture ;
- cache local ;
- microphone actif pendant une réponse ;
- annulation d’une ancienne requête.

Ces catégories doivent être diagnostiquées de façon générique afin d’être réutilisables avec un autre fournisseur après Render.

## Architecture imposée

### Libcomlair possède

- les textes à prononcer ;
- la langue demandée ;
- le contexte de page ;
- le moment où une annonce doit être lancée ;
- la priorité entre microphone et lecture ;
- la bibliothèque audio locale ;
- le cache ;
- les règles de reprise ;
- le diagnostic ;
- l’historique des pannes ;
- le choix du fournisseur actif.

### Render fournit uniquement

- la génération de l’audio naturel demandé par Libcomlair.

Render ne doit pas décider de la navigation, des textes, des profils ou du comportement de l’application.

## Règle de migration après Render

Le prochain fournisseur devra être branché derrière la même logique Libcomlair. Un changement de fournisseur ne devra pas nécessiter de modifier les règles d’accessibilité, la navigation, les catégories, les profils, les commandes vocales ou le diagnostic.

## Internationalisation

La préparation de l’international doit conserver la même séparation :

**Libcomlair demande : texte + langue + contexte → fournisseur vocal produit l’audio.**

Le futur fournisseur pourra être différent selon la langue, mais les commandes, les diagnostics et les règles restent dans Libcomlair.

Les erreurs devront être enregistrées avec des catégories communes, indépendantes du fournisseur, afin qu’une panne déjà comprise avec Render puisse aider à diagnostiquer la même panne avec un fournisseur anglais, espagnol, allemand ou autre.

## Critères de validation avant le 19 octobre

- accueil : voix naturelle automatique validée ;
- changement de page : annonce correcte ;
- microphone : pas de conflit avec la lecture ;
- nouvelle lecture : ancienne requête correctement annulée ;
- démarrage à froid : comportement connu et diagnostiqué ;
- timeout fournisseur : erreur identifiable ;
- fournisseur indisponible : Libcomlair reste utilisable ;
- cache local : lecture d’un audio déjà généré lorsque disponible ;
- diagnostic : état du moteur, du fournisseur et de l’audio visibles ;
- aucune voix robotique comme solution de secours.

## Règle de travail

Jusqu’à la validation de cette phase :

**pas de nouveau moteur vocal parallèle, pas de prototype vocal séparé, pas de déplacement d’une fonction essentielle hors de Libcomlair.**

Le travail doit suivre :

**panne → diagnostic → cause → correction ciblée → test → non-régression → inscription dans Diagnostic et pannes.**
