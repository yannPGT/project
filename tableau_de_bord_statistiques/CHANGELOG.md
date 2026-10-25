# Historique des versions du tableau de bord statistiques

## Règle de versionnage

- La version de référence est **V2.0**, établie le 19 octobre 2026.
- Chaque modification est tracée dans les commits GitHub.
- Le numéro affiché ne change qu’après validation explicite de Yannick. Une modification du code n’entraîne donc pas automatiquement une nouvelle version.
- Après chaque modification, proposer si nécessaire le maintien du numéro ou son évolution ; consigner ici toute évolution validée avec sa date et les changements associés.
- Convention proposée, à valider lors d’une évolution : V2.1 pour une évolution fonctionnelle compatible ; V3.0 pour une refonte majeure. Les corrections peuvent rester dans la version courante selon validation.
- Le paramètre URL `?v=...` est un repère de cache indépendant du numéro de version fonctionnelle.

## V2.0 — 19 octobre 2026

- Établissement de la version actuellement présente dans le dépôt comme référence V2.0.
- Ajout de « V2.0 » après la mention institutionnelle en pied de page.
- Conservation de la signature SPM Développement.

## Corrections du 22 octobre 2026 — version affichée V2.0 conservée

- Calcul financier commun à partir des fiches SYNAPSE pour les vues générale, départementale et zonale, la comparaison et les exports annuels : les exercices annulés sont exclus.
- Ajout du restant à engager et de ses deux composantes : montants demandés des exercices programmés ; montants demandés des exercices réalisés sans montant reçu renseigné.
- Un reçu égal à zéro est considéré comme renseigné ; une valeur absente ou blanche ne l’est pas. Le retard financier correspond à une mise à jour attendue après réalisation, sans délai calendaire supplémentaire.
- Ventilation zonale entre départements et activité propre EMIZ ; détail des composantes dans le tableau général.
- Tests synthétiques des annulations, montants français, valeurs vides et nulles, zéro explicite, périmètres annuels et territoriaux, et indépendance vis-à-vis des anciens agrégats Grist. Pas de modification des formules ou données du classeur Grist.


## 23 octobre 2026 — Vue départementale (V2.0 conservée)

- Même rendu statistique que la synthèse départementale : types, risques, DO joué et personne, alerte, participation, scolaires, CIP, canaux et plans.
- Comparaison pluriannuelle limitée au département sélectionné : activité, objectifs, DO, risques, types, population, plans et financements. Années issues des données, avec les années de référence de la comparaison générale.
- Alertes de commandement séparées ; PCS/PICS réalisés incluant les joueurs ; absence de données signalée par un tiret et année en cours provisoire.
- Vérification : audit statistique automatisé, isolation entre deux départements et concordance des rendus avec la synthèse.

## 23 octobre 2026 — Initialisation de la connexion Grist (V2.0 conservée)

- Attendre l’événement `onOptions` confirmant l’accès complet avant de demander la liste des tables. `ready()` annonce la disponibilité du widget sans confirmer l’autorisation.
- Distinguer l’ouverture du widget seul, l’API absente, une absence de réponse et un accès insuffisant. Reprendre automatiquement le chargement après autorisation reçue.
- Tests : `node tableau_de_bord_statistiques/tests/connection-startup.cjs` et audit statistique existant. Le message de délai dépassé observé ne permet pas de conclure à une corruption de la base ni de prouver la cause de la rupture de liaison.

## 23 octobre 2026 — Compatibilité du niveau d’accès Grist (V2.0 conservée)

- Corriger le champ de confirmation d’accès : l’API actuelle définit `InteractionOptions.accessLevel`. Le démarrage accepte également `access_level` pour compatibilité.
- Les tests de connexion utilisent désormais le nom du champ défini dans l’interface officielle Grist ; un cas distinct vérifie l’ancien format.
- Validation : tests de connexion et audit statistique réussis.

## 23 octobre 2026 — Lecture indépendante des notifications de configuration (V2.0 conservée)

- Ne plus attendre indéfiniment `onOptions` pour démarrer : lancer une lecture directe après `ready()`. Les refus explicites restent pris en compte et les contrôles de chaque requête restent assurés par Grist.
- Supprimer la découverte préalable via `listTables()` : lecture des 12 identifiants connus, en commençant par `BDD_SYNAPSE_2026`. Une erreur de lecture identifie ainsi la table concernée.
- Vérification supplémentaire avec le script officiel `https://docs.getgrist.com/grist-plugin-api.js`, téléchargé le 23 octobre 2026 : échanges RPC et chargement simulé des 12 tables avec et sans notification d’options. Test reproductible par `GRIST_PLUGIN_API_SOURCE=... node tests/connection-rpc.cjs`.
- Audit statistique et tests de démarrage réussis. La validation dans le document utilisateur reste nécessaire : son contexte de navigateur n’est pas accessible à distance.

## 23 octobre 2026 — Infobulles des statistiques départementales (V2.0 conservée)

- Survol des types, risques, DO joué et fonctions, plans dominants, alerte et participation : noms et dates des exercices composant chaque indicateur, triés par date.
- Financement départemental : noms, dates et montants des demandes et des reçus renseignés ; les reçus de 0 € sont conservés et les valeurs absentes exclues de cette liste.
- Infobulles natives sur les lignes, barres et cartes ; noms échappés, dates absentes signalées, filtres territoriaux et annuels conservés. Comparaison dépliable inchangée.
- Validation : audit statistique, tests des infobulles, tests de démarrage et échanges RPC avec le script API officiel réussis. Contrôle dans le document utilisateur à confirmer après rechargement.

## 25 octobre 2026 — Dashboard de comparaison départementale (V2.0 conservée)

- Modification limitée à la comparaison pluriannuelle de la vue départementale : cartes de repères, graphiques annuels d’activité et de financement, comparaisons de deux années dans des volets thématiques.
- Période par défaut limitée aux cinq dernières années disponibles jusqu’à l’année sélectionnée ; historique complet et inclusion des années futures sur demande. Absence de données distinguée d’un zéro ; repères d’objectif propres à chaque année ; années incomplètes signalées.
- Tableaux existants conservés dans « Voir la comparaison chiffrée », replié par défaut. Infobulles avec exercices et dates ; détails financiers avec montants ; PCS/PICS conservant leur périmètre organisateur ou joueur.
- Styles réservés à ce composant. Aucun changement des autres parties du widget, des formules de calcul ni du démarrage Grist.
- Vérification : audit statistique, infobulles et connexion ; tests du dashboard, contrôle automatique de l’absence de changement extérieur ; essais Chromium des sélecteurs et volets, filtrage département/année et rendu bureau/mobile réussis sur données synthétiques.
