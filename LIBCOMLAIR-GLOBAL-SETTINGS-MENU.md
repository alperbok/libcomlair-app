# Libcomlair — Menu global Assistance et réglages

## Objectif

Le menu **☰ Assistance et réglages** doit être accessible à tout moment sans quitter la page courante.

Il ne doit plus être limité à une seule page de l'application.

## Présentation initiale

Après le choix du profil d'accessibilité, Libcomlair présente le rôle du menu Assistance et réglages.

Pour le profil Vision en **mode Découverte guidée**, l'assistance vocale doit expliquer :
- que le menu reste disponible sur toutes les pages ;
- qu'il contient les outils d'aide, de test, de diagnostic et de réparation ;
- qu'il peut être ouvert visuellement avec le bouton **☰** placé en haut à gauche ;
- qu'il peut être ouvert vocalement en disant simplement **« réglage »** ou **« réglages »**.

Cette explication détaillée ne doit pas être répétée à chaque page en mode Simplifié.

## Emplacement visuel

À partir de la première page après le profil d'accessibilité :
- bouton **☰** permanent en haut à gauche ;
- bouton Micro permanent en haut à droite lorsqu'il est prévu sur l'écran ;
- les deux commandes ne doivent pas se chevaucher ;
- le bouton ☰ doit rester au même emplacement sur toutes les pages.

Les pages Bienvenue et Profil d'accessibilité peuvent rester sans menu global, puisque le menu est présenté immédiatement après le choix du profil.

## Ouverture

Le menu doit s'ouvrir **au-dessus de la page courante**, sans changer de page et sans perdre l'état de la recherche.

Lorsqu'il est fermé :
- l'utilisateur retrouve exactement la page et la position où il se trouvait ;
- aucun filtre, choix, formulaire ou résultat ne doit être perdu.

## Contenu cible

Le menu doit regrouper au minimum :

1. **Expliquer cette page**
   - fait lire le rôle de la page courante ;
   - propose les boutons, cases, listes et tutoriels disponibles.

2. **Quels sont mes choix ?**
   - lit uniquement les actions vocales utilisables dans le contexte courant.

3. **Niveau d'assistance vocale**
   - Découverte guidée ;
   - Simplifié.

4. **Tester l'assistance vocale**

5. **Diagnostic de fonctionnement**

6. **Réparation automatique**

7. **Fermer le menu**

Des fonctions supplémentaires pourront être ajoutées par la suite si elles sont utiles.

## Commandes vocales universelles

Sur toutes les pages à partir de l'accueil principal :
- « réglage » ;
- « réglages » ;
- « ouvrir les réglages » ;
- « assistance et réglages ».

Ces commandes ouvrent le menu sans modifier la page courante.

Quand le menu est ouvert, le micro doit reconnaître les choix visibles dans le menu exactement comme sur les autres pages.

Commandes de fermeture prévues :
- « fermer les réglages » ;
- « fermer le menu » ;
- « retour » lorsque le menu est au premier plan.

## Règle de symétrie vocale

Tout élément du menu annoncé par l'assistance vocale doit pouvoir être demandé au micro avec le même libellé et plusieurs formulations naturelles.

Exemple :
- assistance : « Diagnostic de fonctionnement » ;
- micro : « diagnostic », « lancer le diagnostic », « diagnostic de fonctionnement ».

## Diagnostic et réparation

Le diagnostic devra vérifier :
- présence du bouton ☰ lorsque son affichage est attendu ;
- présence du panneau de réglages ;
- capacité à l'ouvrir et le fermer ;
- conservation de la page active ;
- présence du routeur vocal ;
- capacité du micro à reconnaître « réglages ».

La réparation automatique ne devra jamais supprimer les favoris, contributions, avis, signalements, profil d'accessibilité ou autres données utilisateur pour réparer ce menu.

## Ordre de réalisation

1. Stabiliser d'abord la reconnaissance vocale contextuelle sur toutes les pages.
2. Valider le profil d'accessibilité puis chaque écran successif.
3. Installer ensuite le bouton ☰ global et son panneau.
4. Ajouter la commande universelle « réglages ».
5. Faire expliquer le menu en mode Découverte.
6. Ajouter le menu au Diagnostic et à la Réparation automatique.

Cette séquence évite de mélanger une panne de reconnaissance vocale avec une panne de mise en page ou de navigation.