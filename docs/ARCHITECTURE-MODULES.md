# Libcomlair — carte d’architecture des modules

Date de création : 2026-10-01

## Principe fondamental

Libcomlair suit désormais cette règle :

**1 fonction = 1 module responsable = 1 diagnostic = 1 procédure de réparation = 1 solution de secours lorsque cela est possible.**

Le but est de localiser une panne rapidement et d’éviter les correctifs empilés ou les recherches circulaires.

## Règle de dépannage

Avant toute modification :

1. identifier le symptôme exact ;
2. identifier le module propriétaire ;
3. consulter son diagnostic et son historique de réparation ;
4. vérifier les dépendances et l’ordre de chargement ;
5. rechercher une ancienne règle, un ancien script ou un observateur qui entre en conflit ;
6. corriger la cause racine ;
7. tester uniquement le module concerné puis ses interfaces avec les modules voisins ;
8. valider sur téléphone réel avant de déclarer la panne résolue.

Si une première modification visuelle ou fonctionnelle n’a presque aucun effet, ne pas continuer à changer des valeurs au hasard : rechercher un conflit ou une règle héritée.

## Vue d’ensemble

### 1. Interface et cadre maître

Responsabilité :
- cadre visuel stable ;
- en-tête ;
- pied de page ;
- zones de contenu ;
- navigation Retour / Suivant / Valider ;
- affichage cohérent sur téléphone.

Dépendances :
- CSS du cadre maître ;
- intégration des pages ;
- scripts de navigation ;
- modules de page.

Diagnostic type :
- dimensions du cadre ;
- débordement ;
- boutons visibles ;
- conflits CSS ;
- ordre des feuilles de style ;
- éléments déplacés par script.

Secours : dernière version stable du cadre / restauration de version.

### 2. Profils et besoins d’accessibilité

Responsabilité :
- choix du profil ;
- besoins enregistrés ;
- critères ;
- mode Vision, Audition et autres profils ;
- futur profil utilisateur persistant.

Diagnostic type :
- profil actif ;
- critères chargés ;
- cohérence entre stockage et affichage ;
- état des accordéons ;
- synchronisation avec la voix.

Secours : valeurs locales précédemment enregistrées et configuration par défaut.

### 3. Moteur vocal central

Responsabilité :
- recevoir tout texte à lire ;
- choisir la meilleure source audio ;
- gérer démarrage, arrêt, priorité et erreurs ;
- exposer un état unique au Diagnostic.

Chaîne cible :
1. audio Libcomlair fixe ;
2. bibliothèque audio locale ;
3. dictionnaire / règles de prononciation ;
4. TTS local hors ligne ;
5. Render uniquement comme secours transitoire tant qu’il existe.

Diagnostic type :
- texte reçu ;
- source choisie ;
- dictionnaire disponible ;
- audio local trouvé ou non ;
- TTS local prêt ou non ;
- sortie audio disponible ;
- dernier message d’erreur.

Secours : changement automatique vers le niveau suivant de la chaîne.

### 4. Dictionnaire vocal et prononciation

Responsabilité :
- noms communs ;
- noms propres ;
- villes ;
- rues ;
- transports ;
- acronymes ;
- corrections de prononciation ;
- provenance et licence.

Données locales : `data/voice/`.

Diagnostic type :
- terme trouvé ou inconnu ;
- source de la prononciation ;
- correction locale éventuelle ;
- version du dictionnaire ;
- licence/provenance disponible.

Secours : TTS local capable de prononcer un terme absent puis ajout éventuel à la liste de vérification.

### 5. Bibliothèque audio locale

Responsabilité :
- conserver les audios déjà générés ;
- réutiliser les phrases connues sans service distant ;
- stocker les futurs enregistrements fixes autorisés.

Diagnostic type :
- stockage disponible ;
- nombre d’entrées ;
- taille ;
- lecture d’un échantillon ;
- intégrité des données.

Secours : TTS local hors ligne.

### 6. Microphone et reconnaissance vocale

Responsabilité :
- autorisation micro ;
- capture ;
- transcription ;
- interprétation de commande ;
- adaptation aux éléments de la page active.

Chaîne de diagnostic :
1. autorisation ;
2. microphone disponible ;
3. signal reçu ;
4. reconnaissance ;
5. commande comprise ;
6. action exécutée ;
7. confirmation vocale.

Secours cible : reconnaissance locale hors ligne ; tout service externe devient secondaire.

### 7. Dictaphone / contribution vocale

Responsabilité :
- enregistrer une contribution ;
- écouter ;
- recommencer ;
- supprimer ;
- conserver localement avant envoi ;
- fournir éventuellement une référence de prononciation.

Diagnostic type : autorisation, enregistrement, lecture locale, stockage, envoi différé.

Secours : conservation locale jusqu’au retour du réseau.

### 8. Données universelles Libcomlair

Responsabilité :
- convertir toutes les sources vers un schéma commun ;
- fournir les données à Recherche, Autour de moi, cartes, fiches et voix.

Sources possibles : Acceslibre, IDFM, Geoapify, SNCF, BAN, fichiers locaux, contributions, futures sources autorisées.

Diagnostic type :
- source ;
- date ;
- version ;
- conversion ;
- doublons ;
- nombre d’éléments ;
- informations manquantes ;
- licence et provenance.

Secours : dernière copie locale exploitable lorsque la licence le permet.

### 9. Recherche

Responsabilité : catalogue global Libcomlair, filtres, catégories, critères et résultats.

Diagnostic type : taille du catalogue, index chargé, filtres actifs, nombre avant/après filtre, cohérence des fiches.

Secours : catalogue local disponible.

### 10. Autour de moi / GPS / carte

Responsabilité : position, proximité, données locales/réseau, tri géographique et carte.

Diagnostic type : autorisation GPS, coordonnées, source de lieux, distance, cache, carte.

Secours : dernière position/données uniquement lorsqu’il est pertinent et clairement indiqué à l’utilisateur ; ne jamais présenter une ancienne position comme actuelle.

### 11. Transport

Responsabilité : arrêts, gares, lignes, directions, identifiants, accessibilité et données temps réel lorsqu’elles existent.

Diagnostic type : jeu de données chargé, identifiants uniques, directions, doublons, date de mise à jour, source.

Secours : dernière base locale compatible avec sa licence, avec date de mise à jour annoncée.

### 12. Diagnostic central

Responsabilité : agréger l’état de chaque module sans remplacer leurs diagnostics détaillés.

Chaque module doit exposer à terme :
- `moduleId` ;
- version ;
- état `ok / dégradé / erreur / non-testé` ;
- dernier test ;
- dernière erreur ;
- dépendances ;
- mode de secours actif ;
- action de réparation autorisée.

Le Diagnostic ne doit pas réparer un autre module au hasard : il appelle la procédure déclarée par le module concerné.

### 13. Réparation

Responsabilité : appliquer des réparations ciblées et traçables.

Règles :
- ne pas effacer les données utilisateur pour réparer un problème d’interface ;
- ne pas réinitialiser tout le système pour une panne d’un seul module ;
- conserver un historique de la réparation ;
- confirmer le résultat par un test après réparation ;
- permettre un retour à la version stable lorsque la réparation échoue.

### 14. Stockage local et synchronisation

Responsabilité : profils, favoris, dictionnaires, audios, données téléchargées, contributions et réglages.

Diagnostic type : espace disponible, version du schéma, migration, corruption, capacité de lecture/écriture.

Secours : export/import et sauvegarde indépendante.

### 15. Mise à jour / version / retour arrière

Responsabilité : installer une évolution sans détruire une version fonctionnelle.

Diagnostic type : version active, version précédente, migrations exécutées, intégrité des fichiers.

Secours : restauration de la dernière version validée.

### 16. Licences et conformité

Responsabilité : aucune dépendance tierce sans source, version, licence, droit de redistribution et obligations documentées.

Diagnostic type : composant non répertorié, licence manquante, modèle dont la licence diffère du moteur, attribution absente.

Secours : composant non intégré tant que sa conformité n’est pas établie.

## Interfaces entre modules

Les modules doivent communiquer par des interfaces stables plutôt que manipuler directement le DOM ou le stockage d’un autre module quand cela peut être évité.

Exemples :
- une page demande `Voice.speak(text)` au lieu d’appeler Render directement ;
- Recherche demande ses données au modèle universel au lieu de lire plusieurs sources brutes ;
- Diagnostic demande `status()` au module au lieu de deviner son état ;
- Réparation appelle `repair()` ou une procédure documentée du module ;
- la navigation change de page via le contrôleur de navigation, pas via plusieurs scripts concurrents.

## Règle anti-régression

Lorsqu’une panne a été comprise et corrigée :

1. documenter la cause racine ;
2. documenter le fichier responsable ;
3. documenter le correctif ;
4. documenter le test de validation ;
5. ajouter si possible un test automatique ou un contrôle Diagnostic empêchant son retour.

## Critère d’une architecture saine

Quand un utilisateur signale un problème, nous devons pouvoir répondre rapidement à trois questions :

1. **Quel module en est responsable ?**
2. **Quel diagnostic permet de confirmer la panne ?**
3. **Quelle réparation ciblée ou quel secours doit être utilisé ?**

Si nous ne pouvons pas répondre à ces trois questions, l’architecture de cette fonction doit être améliorée avant d’empiler de nouveaux correctifs.
