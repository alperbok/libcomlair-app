# Libcomlair — checklist obligatoire avant une nouvelle fonction

Date : 2026-10-01

Cette checklist doit être remplie avant de considérer l’architecture d’une nouvelle fonction comme prête.

## 1. Propriétaire

- [ ] Un module responsable unique est identifié.
- [ ] Ses dépendances sont listées.
- [ ] Son mode de secours est défini si nécessaire.

## 2. Accessibilité

- [ ] Utilisable visuellement.
- [ ] Utilisable par le profil Vision.
- [ ] Texte important lisible vocalement.
- [ ] Choix importants accessibles au micro lorsque pertinent.
- [ ] Compatible avec Découverte / Assisté / Rapide.
- [ ] Ne dépend pas obligatoirement d’une photo.

## 3. International

- [ ] Les identifiants métier ne dépendent pas du français.
- [ ] La langue est indépendante du pays.
- [ ] La fonction supporte les formats locaux via une couche de présentation.
- [ ] Les noms propres peuvent garder leur forme officielle.
- [ ] Prononciation native et aide selon la langue utilisateur sont séparées si nécessaire.
- [ ] Une écriture non latine ou RTL ne casserait pas le modèle.

## 4. Données

- [ ] Schéma versionné.
- [ ] Identifiants internes stables.
- [ ] Valeurs absentes conservées comme inconnues.
- [ ] Source et date conservées.
- [ ] Niveau de confiance ou statut de vérification prévu si pertinent.
- [ ] États temporaires ont une date/expiration.
- [ ] Les conflits entre sources ne sont pas écrasés silencieusement.

## 5. Fournisseurs externes

- [ ] Fournisseur isolé derrière un adaptateur.
- [ ] Contrat des champs documenté.
- [ ] Pagination et limites documentées.
- [ ] Licence/provenance vérifiées.
- [ ] Comportement en panne défini.
- [ ] Aucun secret durable n’est stocké dans un fichier public.

## 6. Hors ligne et synchronisation

- [ ] Comportement hors ligne défini.
- [ ] File locale prévue si une action peut attendre le réseau.
- [ ] Redémarrage pendant une file d’attente testé ou prévu.
- [ ] Un compte n’est pas obligatoire sauf nécessité démontrée.
- [ ] Aucun écrasement silencieux entre versions locale et distante.

## 7. Confidentialité

- [ ] Données personnelles minimisées.
- [ ] Aucune donnée médicale non nécessaire demandée.
- [ ] Photos/médias nettoyés des métadonnées inutiles avant publication.
- [ ] Export/suppression prévus si stockage distant futur.
- [ ] Télémétrie éventuelle facultative et désactivable.

## 8. Migration

- [ ] Le changement affecte-t-il des données existantes ?
- [ ] Si oui, migration écrite avant activation.
- [ ] Ancien format encore lisible pendant validation.
- [ ] Sauvegarde prévue avant migration destructive.
- [ ] Retour arrière défini.

## 9. Diagnostic et réparation

- [ ] `status()` ou équivalent prévu.
- [ ] Version du module exposable.
- [ ] Dernière erreur exposable.
- [ ] Diagnostic ciblé défini.
- [ ] Réparation ciblée définie.
- [ ] Entrée correspondante prévue dans le registre de réparation lorsqu’un incident réel apparaît.

## 10. Tests

- [ ] Test unitaire ou de contrat lorsque pertinent.
- [ ] Cas de référence/golden case ajouté si le comportement est critique.
- [ ] Parcours de référence identifié.
- [ ] Test avec fournisseur externe indisponible lorsque pertinent.
- [ ] Test hors ligne lorsque pertinent.
- [ ] Validation sur smartphone Android réel prévue lorsqu’il y a UI, voix, micro, photo, GPS, permissions ou stockage utilisateur.
- [ ] Avant diffusion stable large, compatibilité vérifiée sur un autre appareil Android d’un constructeur différent lorsque la fonction dépend du matériel, du navigateur, du WebView ou des permissions.

## 11. Promotion

- [ ] Fonction derrière un feature flag si elle peut casser un parcours stable.
- [ ] Source vérifiée.
- [ ] Tests ciblés réussis.
- [ ] Parcours de référence réussis.
- [ ] Données utilisateur préservées.
- [ ] Version stable précédente toujours récupérable.

Une case non applicable doit être marquée explicitement `N/A` avec une raison, pas simplement ignorée.
