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

## 4. GPS / géographie

- [ ] La fonction peut fonctionner sans GPS lorsqu’un mode manuel est possible.
- [ ] Position GPS, pays de recherche et langue restent indépendants.
- [ ] Position approximative acceptée lorsqu’elle suffit.
- [ ] Position précise demandée seulement si nécessaire.
- [ ] Localisation en arrière-plan non demandée par défaut.
- [ ] Précision et ancienneté de la position sont prises en compte.
- [ ] Une position périmée n’est pas présentée comme actuelle.
- [ ] Le fournisseur de carte/géocodage/itinéraire est séparé du GPS de l’appareil.
- [ ] Le passage de frontière ne casse pas le modèle.
- [ ] Aucun historique de déplacements n’est créé implicitement.

## 5. Données

- [ ] Schéma versionné.
- [ ] Identifiants internes stables.
- [ ] Valeurs absentes conservées comme inconnues.
- [ ] Source et date conservées.
- [ ] Niveau de confiance ou statut de vérification prévu si pertinent.
- [ ] États temporaires ont une date/expiration.
- [ ] Les conflits entre sources ne sont pas écrasés silencieusement.

## 6. Fournisseurs externes et droits

- [ ] Fournisseur isolé derrière un adaptateur.
- [ ] Contrat des champs documenté.
- [ ] Pagination et limites documentées.
- [ ] Licence et conditions d’utilisation vérifiées.
- [ ] Droit de cache vérifié si cache utilisé.
- [ ] Droit de stockage hors ligne vérifié avant tout pack Voyage/hors ligne.
- [ ] Droit de transformation vérifié si les données sont modifiées.
- [ ] Droit de redistribution vérifié avant inclusion dans l’application.
- [ ] Attribution conservée lorsqu’elle est obligatoire.
- [ ] Comportement en panne défini.
- [ ] Aucun secret durable n’est stocké dans un fichier public.
- [ ] Un droit inconnu n’est jamais interprété comme une autorisation.

## 7. Hors ligne et synchronisation

- [ ] Comportement hors ligne défini.
- [ ] File locale prévue si une action peut attendre le réseau.
- [ ] Redémarrage pendant une file d’attente testé ou prévu.
- [ ] Un compte n’est pas obligatoire sauf nécessité démontrée.
- [ ] Aucun écrasement silencieux entre versions locale et distante.

## 8. Confidentialité

- [ ] Données personnelles minimisées.
- [ ] Aucune donnée médicale non nécessaire demandée.
- [ ] Photos/médias nettoyés des métadonnées inutiles avant publication.
- [ ] Localisation non conservée au-delà de ce qui est nécessaire.
- [ ] Export/suppression prévus si stockage distant futur.
- [ ] Télémétrie éventuelle facultative et désactivable.

## 9. Juridiction / conformité

- [ ] Le ou les territoires concernés sont identifiés sans les déduire uniquement du GPS.
- [ ] Les règles régionales et nationales applicables peuvent se cumuler.
- [ ] Les sources officielles sont enregistrées avec date de vérification.
- [ ] Les obligations accessibilité, données personnelles, photos, contributions et open data sont examinées lorsqu’elles sont pertinentes.
- [ ] Un nouveau pays ne passe pas en disponibilité officielle sans revue juridique du territoire.
- [ ] Une incertitude juridique importante bloque la promotion ou déclenche une revue qualifiée.
- [ ] Une règle d’un pays n’est pas copiée automatiquement vers un autre.

## 10. Migration

- [ ] Le changement affecte-t-il des données existantes ?
- [ ] Si oui, migration écrite avant activation.
- [ ] Ancien format encore lisible pendant validation.
- [ ] Sauvegarde prévue avant migration destructive.
- [ ] Retour arrière défini.

## 11. Diagnostic et réparation

- [ ] `status()` ou équivalent prévu.
- [ ] Version du module exposable.
- [ ] Dernière erreur exposable.
- [ ] Diagnostic ciblé défini.
- [ ] Réparation ciblée définie.
- [ ] Entrée correspondante prévue dans le registre de réparation lorsqu’un incident réel apparaît.

## 12. Tests

- [ ] Test unitaire ou de contrat lorsque pertinent.
- [ ] Cas de référence/golden case ajouté si le comportement est critique.
- [ ] Parcours de référence identifié.
- [ ] Test avec fournisseur externe indisponible lorsque pertinent.
- [ ] Test hors ligne lorsque pertinent.
- [ ] Validation sur smartphone Android réel prévue lorsqu’il y a UI, voix, micro, photo, GPS, permissions ou stockage utilisateur.
- [ ] Avant diffusion stable large, compatibilité vérifiée sur un autre appareil Android d’un constructeur différent lorsque la fonction dépend du matériel, du navigateur, du WebView ou des permissions.

## 13. Promotion

- [ ] Fonction derrière un feature flag si elle peut casser un parcours stable.
- [ ] Source vérifiée.
- [ ] Tests ciblés réussis.
- [ ] Parcours de référence réussis.
- [ ] Données utilisateur préservées.
- [ ] Droits/licences vérifiés pour le mode d’utilisation réel.
- [ ] Revue juridique territoriale faite si un nouveau pays devient officiellement disponible.
- [ ] Version stable précédente toujours récupérable.

Une case non applicable doit être marquée explicitement `N/A` avec une raison, pas simplement ignorée.
