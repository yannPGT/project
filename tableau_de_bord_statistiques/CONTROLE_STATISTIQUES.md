# Contrôle des statistiques et des postures — 18 octobre 2026

## Périmètre

Contrôle du code de `tableau_de_bord_statistiques/index.html` (version de départ : `528895efbc8754b0d8217fc14558e3673f6d2a56`), des données exportées fournies par le propriétaire et de la table annuelle OBJECTIFS_CIRCULAIRE. Les données réelles et les résultats chiffrés de cet export ne sont pas ajoutés au dépôt.

## Règles appliquées dans toutes les vues

- Les volumes réalisés, programmés et annulés restent présentés séparément.
- Seuls les exercices **réalisés par un organisateur**, hors alertes de la chaîne de commandement, alimentent les détails : types d'exercice, catégories et risques, plans dominants et concourants, PCS/PICS, DO, scolaires, CIP, participation et dispositifs d'alerte.
- Les alertes de la chaîne de commandement réalisées disposent d'un **compteur indépendant** ; elles ne contribuent ni au volume ordinaire, ni aux objectifs quantitatifs, ni aux autres détails. Les alertes explicites réalisées sans posture sont conservées dans ce seul compteur ; aucune posture ne leur est attribuée.
- Tous les comptes quantitatifs et les cartes sont recalculés depuis BDD_SYNAPSE_2026, quelle que soit l'année. Les anciens totaux précalculés ne remplacent plus ces comptes.
- Les objectifs quantitatifs utilisent le seuil annuel présent dans l'indicateur, avec le repli défini pour le widget (4 départemental, 2 zonal).
- Une fiche avec PCS/PICS est comptée une fois pour chaque plan concerné, au niveau départemental. Le sélecteur cartographique « Plan mis en œuvre » utilise également les seuls réalisés départementaux.
- Les types « Cadre/Cadres » et « Combiné cadre/cadres et terrain » sont regroupés. L'alerte radio reconnaît le champ « radios conventionnées ». Les plans référencés sont résolus avant comptage PCS/PICS.
- La lecture globale des objectifs qualitatifs tient compte des groupes d'alternatives (`Groupe_objectif`) : OU au sein du groupe, plusieurs groupes à couvrir. Le rapport de référence fourni confirme cette alternative pour NOVI/POP en 2025.

## Normalisation historique (2025 et avant)

| Posture initiale | Posture normalisée | Traitement |
|---|---|---|
| Direction | Organisateur | Exercice ordinaire, sauf type explicitement alerte |
| Veille / Renforcé | Organisateur | Même règle |
| Appui | Joueur | Exclu des organisateurs |
| Vigilance avec catégorie/risque d'alerte, commandement et sauvegarde ou équivalent | Organisateur | Exercice d'alerte de la chaîne de commandement |
| Autre Vigilance | Joueur | Exclu des organisateurs |
| Organisateur / Joueur | Inchangée | Respect du rôle existant |
| Vide ou inconnue | Non attribuée | Signalée, sans correction arbitraire |

Le code conserve `Posture_origine` et `Exercice_alerte_chaine_commandement` avant de remplacer les valeurs historiques. La normalisation n'altère pas les fiches de 2026 et après. Elle est idempotente.

## Application dans le classeur vivant

Le calcul du widget applique immédiatement ces règles à la lecture ; la modification physique de la BDD est distincte.

En bas du widget, ouvrir **Contrôle des données et correction des postures historiques**, puis **Vérifier les postures de la base Grist**. Cette étape ne modifie rien.

- Le widget examine les formules du classeur avant toute migration.
- Si des formules dépendent des anciennes valeurs de Posture, l'application est bloquée : elles doivent être examinées et adaptées en premier. Utiliser **Télécharger le diagnostic des formules** pour obtenir leurs définitions, sans lignes de données. Vérifier le contenu avant toute transmission.
- Si aucun obstacle n'est relevé, **Appliquer la correction dans Grist** effectue la sauvegarde de la posture d'origine et la mise à jour groupée. Les fiches sont relues avant l'action et contrôlées après. Des droits de modification des données et du schéma sont nécessaires.
- Effectuer cette opération sans modification simultanée de la table par d'autres utilisateurs. Une modification détectée entre la prévisualisation et la relecture bloque l'application.

Aucune session Grist pilotable n'étant disponible pendant ce contrôle, **la migration de la BDD en production n'a pas été exécutée par l'assistant**.

## Vérifications

`node tableau_de_bord_statistiques/tests/statistics-audit.cjs`

Les tests synthétiques vérifient les filtres de statut et de rôle, les alertes indépendantes, les comptes PCS/PICS et cartographiques, les comptes 2026 malgré un indicateur précalculé erroné, les alternatives qualitatives, la validation des dates, la lecture des montants français, la prévisualisation sans écriture, les actions Grist de migration, la sauvegarde de l'origine, l'absence de modification des années récentes, le blocage en présence de formules historiques et l'idempotence.

Le même test accepte un export local `{bdd:[...],objectives:[...]}` via la variable d'environnement `GRIST_AUDIT_DATA`. Il vérifie alors la concordance générale / détails / comparaison / synthèse annuelle sur 2024, 2025 et 2026 et l'identité des résultats avant/après normalisation. Aucun jeu de données réel n'est inclus.

## Limites restant à lever

- Les valeurs sont vérifiées sur l'export fourni, pas sur l'état courant du classeur en ligne. Les fiches sans posture reconnue restent à compléter.
- Les **couvertures qualitatives individuelles** sont encore lues dans les indicateurs Grist. Leurs formules ne sont pas certifiées par cet audit du widget ; le diagnostic des formules est nécessaire pour en vérifier le périmètre de fiches.
- Les **financements** conservent leur propre périmètre (demandes et versements, y compris avant réalisation). Les totaux fournis par les tables financières doivent être rapprochés de leurs sources pour certifier leurs montants. Ils ne sont pas transformés en diagnostic de déficit.
- L'audit complet du classeur ne peut être déclaré achevé avant la vérification des formules dépendantes et l'application contrôlée de la migration.

Référence technique des actions Grist : https://github.com/gristlabs/grist-core/blob/main/documentation/overview.md.
