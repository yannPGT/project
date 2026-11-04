# Configuration du journal Historique — Annuaire BPAC

## Objectif
Conserver le journal existant, tout en enregistrant automatiquement l'identité du compte GRIST authentifié à chaque création d'une ligne d'historique.

**Important :** la migration du schéma ne doit pas être effectuée lors d'une sauvegarde de contact. Le widget doit continuer à enregistrer les modifications si ces colonnes complémentaires sont absentes.

## Schéma d'origine (conservé)
`UID`, `Date`, `AuteurDeclare`, `TableCible`, `Ligne`, `Action`, `Changements`.

## Colonnes complémentaires (à créer dans GRIST par un administrateur)
1. `AuteurAutomatique` : colonne Booléen (case à cocher). Le widget la positionne à `true` sur les nouvelles lignes si elle existe.
2. `AuteurCompte` : colonne Texte, avec **formule de déclenchement** : `user.Name if $AuteurAutomatique else ""`
3. `AuteurCourriel` : colonne Texte, avec **formule de déclenchement** : `user.Email if $AuteurAutomatique else ""`
4. `AuteurID` : colonne Entier, avec **formule de déclenchement** : `user.UserID if $AuteurAutomatique else 0`

Pour les trois formules : choisir **Définir une formule de déclenchement**, et cocher **Appliquer aux nouveaux enregistrements**. Ne pas créer de colonnes « Formule » classiques. Les champs doivent être des champs de données remplis à la création puis conservés.

**Ordre de mise en service :** ajouter et configurer les quatre colonnes avant de réaliser le test. Ne pas tenter d'initialiser ces valeurs à partir du navigateur ou d'un nom saisi. Ne pas utiliser une clé API de compte de service pour écrire les journaux si l'identité attendue est celle du contributeur individuel.

## Vérifications
- Avant configuration : modifier un contact de test ; confirmer l'absence d'erreur SQL et la création de la ligne Historique à sept champs.
- Après configuration : créer/modifier un contact de test depuis deux comptes GRIST habilités distincts ; vérifier que `AuteurCompte`, `AuteurCourriel` et `AuteurID` correspondent au compte réellement connecté.
- Vérifier qu'un utilisateur non habilité ne peut modifier ni un autre territoire ni la table Historique pour falsifier un événement.
- Vérifier les règles d'accès, y compris les créations/écritures dans Historique. Le widget n'est pas un mécanisme de contrôle d'accès.
- Les lignes antérieures à l'activation restent inchangées ; ne pas réattribuer rétroactivement les auteurs.
- En cas de colonnes mal configurées, arrêter les tests et corriger les formules avant déploiement.

## Références
- https://support.getgrist.com/fr/authorship/
- https://support.getgrist.com/formulas/
- https://support.getgrist.com/access-rules/

Cette procédure n'effectue aucune modification directement dans le document GRIST. Elle doit être appliquée par un administrateur autorisé.
