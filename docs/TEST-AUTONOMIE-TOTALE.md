# Libcomlair — protocole de test d’autonomie totale

Date de création : 2026-10-01

## But

Vérifier objectivement que les fonctions essentielles de Libcomlair restent utilisables sans Render ni autre service distant obligatoire.

## Préparation

Le test final doit être réalisé sur un smartphone Android réel. Le Samsung actuellement utilisé reste l’appareil de référence de développement, mais l’autonomie Libcomlair ne doit pas dépendre d’une marque particulière.

Conditions :

1. fermer puis relancer Libcomlair ;
2. activer le mode avion ;
3. confirmer qu’aucune connexion réseau n’est disponible ;
4. considérer Render et les API externes comme indisponibles ;
5. ne pas installer ni télécharger de composant pendant le test.

## Test 1 — démarrage

Réussite si :

- Libcomlair s’ouvre ;
- le cadre principal s’affiche ;
- le profil utilisé est récupérable localement ;
- aucune page essentielle ne reste bloquée sur un chargement réseau.

## Test 2 — voix fixe

Tester :

- bienvenue ;
- Retour ;
- Suivant ;
- catégories ;
- critères ;
- tutoriel / présentation ;
- messages du Diagnostic.

Réussite si tous les contenus essentiels sont lisibles sans serveur vocal.

## Test 3 — voix dynamique

Faire lire un contenu qui n’a pas besoin d’être un enregistrement complet prédéfini :

- nombre de résultats ;
- adresse ;
- nom de lieu ;
- nom propre ;
- direction de transport ;
- message construit dynamiquement.

Réussite si le moteur local produit une lecture compréhensible sans Render.

## Test 4 — mot ou nom nouveau

Présenter un nom non présent dans les audios fixes.

Réussite si :

- le dictionnaire fournit la prononciation, ou
- le moteur TTS local peut la produire ;
- une correction de prononciation peut être enregistrée si nécessaire.

## Test 5 — microphone

Tester les commandes essentielles :

- ouvrir une catégorie ;
- ouvrir une sous-catégorie ;
- sélectionner / enlever un critère ;
- lire une fiche ;
- Retour ;
- nouvelle recherche.

Réussite si la reconnaissance locale fonctionne sans service distant.

## Test 6 — synchronisation voix / écran

Réussite si chaque commande vocale change l’écran correspondant et si chaque choix visible important peut être annoncé ou sélectionné vocalement.

## Test 7 — données locales

Réussite si l’utilisateur peut consulter :

- les données déjà téléchargées ;
- les favoris ;
- les critères ;
- les informations locales enregistrées ;
- les dernières données exploitables dont la licence autorise la conservation.

L’absence de réseau peut empêcher l’actualisation ; elle ne doit pas empêcher la consultation des données locales disponibles.

## Test 8 — contribution hors ligne

Réussite si l’utilisateur peut :

- commencer une contribution ;
- utiliser le dictaphone ou la saisie prévue ;
- écouter / corriger / supprimer ;
- enregistrer la contribution localement ;
- la conserver en attente de synchronisation.

## Test 9 — Diagnostic

Le Diagnostic doit reconnaître clairement :

- réseau indisponible ;
- Render indisponible ;
- voix locale fonctionnelle ;
- bibliothèque audio locale fonctionnelle ;
- dictionnaire accessible ;
- microphone local fonctionnel ;
- stockage accessible ;
- données locales disponibles.

Il ne doit pas déclarer l’application en panne uniquement parce qu’un service externe est absent si son remplacement local fonctionne.

## Test 10 — redémarrage

Fermer complètement l’application puis la rouvrir en restant hors connexion.

Réussite si :

- la voix essentielle fonctionne encore ;
- le profil et les préférences sont conservés ;
- les données locales sont conservées ;
- les contributions en attente ne sont pas perdues ;
- aucun téléchargement obligatoire n’est demandé.

## Test 11 — retour réseau

Réactiver la connexion.

Réussite si :

- la synchronisation reprend sans supprimer les données locales ;
- les contributions en attente peuvent être envoyées ;
- les données peuvent être actualisées ;
- la disponibilité de Render ne change pas le fonctionnement essentiel déjà assuré localement.

## Résultat final

L’indépendance complète est validée uniquement si les tests essentiels ci-dessus réussissent sur smartphone Android réel.

Un test réussi dans le code, sur ordinateur ou dans un émulateur ne remplace pas la validation physique sur Android. Avant diffusion large, l’autonomie doit aussi être vérifiée sur un appareil Android d’un autre constructeur lorsque possible.
