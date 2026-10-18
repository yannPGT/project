# Raccordement Albert API — synthèse annuelle

État au 17 octobre 2026 : le widget prépare un document texte (consigne + JSON agrégé). Aucun appel à Albert n'est activé. Aucune clé et aucune donnée d'exercice individuelle ne figurent dans ce fichier.

## Périmètre des statistiques après le contrôle du 18 octobre 2026

Le document préparé utilise les fiches d'organisateurs selon les règles historiques validées. Les détails (types, risques, plans, dispositifs, PCS/PICS) portent uniquement sur les exercices réalisés, hors exercices d'alerte de la chaîne de commandement. Ces alertes sont indiquées dans `commandChainAlerts` et ne doivent jamais être ajoutées aux totaux ordinaires. Les alertes explicites réalisées dont la posture est vide sont conservées dans ce compteur séparé, sans affectation de rôle. Les postures inconnues sont signalées dans `unresolvedPostures`.

Les objectifs d'un même `alternativeGroup` sont des alternatives. Les couvertures qualitatives restent issues des indicateurs Grist et leurs formules nécessitent un contrôle séparé. Les montants financiers restent ceux de la table financière et ne sont pas limités aux seuls exercices réalisés.

## Circuit conseillé avec L’Assistant de la DINUM

1. Ouvrir « Comparaison des années » → « Synthèse annuelle », choisir l'année, cliquer « Préparer le document pour L’Assistant ». Vérifier la consigne et les agrégats sous « Voir le document ».
2. Cliquer « Copier consigne + données », puis « Ouvrir L’Assistant ». Coller le contenu dans une nouvelle conversation et envoyer. La copie dans le champ de conversation suffit ; le téléchargement n'est pas obligatoire.
3. Si la copie est bloquée par le navigateur ou le cadre Grist, utiliser « Télécharger le document .txt », puis le joindre dans la conversation avec une demande explicite de rédaction.
4. Relire le texte obtenu, corriger les constats discutables et l'intégrer manuellement dans la synthèse imprimable du widget.

Un lien vers L’Assistant ne peut pas déposer et soumettre silencieusement les données dans la conversation : une action explicite dans cette application reste nécessaire. Le document est créé localement dans le navigateur jusqu'à la copie, au téléchargement ou à l'envoi manuel. L'usage de cet assistant et le contenu envoyé doivent respecter le périmètre de données autorisé par le service.

## Essai immédiat avec une clé temporaire

La documentation Albert indique que les clés sont créées depuis le Playground, affichées une seule fois, et expirent au plus tard un an après création. Pour l'essai, créer une clé dédiée, courte durée, puis la révoquer une fois l'essai terminé. Ne jamais copier cette clé dans Grist, dans le widget, dans GitHub, dans un fichier JSON ou dans une conversation.

1. Dans le widget, ouvrir « Comparaison des années » → « Synthèse annuelle » ; choisir l'année ; cliquer « Préparer les données à transmettre » puis « Copier le résumé JSON ». Relire ce résumé (intitulés d'objectifs compris) et enregistrer localement sous `resume.json`.
2. Télécharger `albert_essai_local.mjs` depuis ce même dossier ; disposer de Node.js 18 ou plus. Dans PowerShell, saisir la clé sans l'inscrire dans l'historique de commandes :
   ```powershell
   $secretAlbert = Read-Host 'Clé temporaire Albert' -AsSecureString
   $env:ALBERT_API_KEY = [System.Net.NetworkCredential]::new('', $secretAlbert).Password
   node .\albert_essai_local.mjs .\resume.json
   Remove-Item Env:ALBERT_API_KEY
   ```
3. Le script exige désormais un JSON de version 2 (recréer le résumé depuis le widget) et appelle Albert depuis votre poste. Il affiche seulement un **brouillon** dans le terminal. Si besoin, définir `ALBERT_MODEL` dans l'environnement ; par défaut `openweight-small` selon le guide. Comparer chaque nombre et chaque affirmation à la synthèse Grist. Ne pas publier le texte automatiquement.

L'usage d'une clé temporaire rend cet essai réversible ; **il ne rend pas acceptable l'insertion de la clé dans le JavaScript du widget**. Pour une utilisation collective, passer par le service authentifié ci-dessous.

## Retour sur le premier essai de rédaction (2025)

Le texte testé sur le Playground a correctement repris plusieurs totaux, mais il confondait 75/104 territoires atteignant le seuil quantitatif avec un taux de réalisation des objectifs qualitatifs. Il interprétait aussi 1 500 € enregistrés comme reçus face à 134 288 € demandés comme un déficit prouvé, alors que la table financière ne permet pas d'établir cette conclusion. La mention « FR (France) » correspond à un dispositif FR-Alert mal identifié. Une date renseignée sur les exercices comptés ne garantit pas que l'ensemble du fichier soit complet.

Le JSON de version 2 précise ces dénominateurs et limites. Le script d'essai interdit les qualificatifs « sous-dotation », « signal d'alarme » et les causes ou recommandations sans source. La vérification humaine reste nécessaire même après ces consignes.

## Consigne pour un nouvel essai dans le Playground

Créer d'abord un nouveau JSON de version 2 dans le widget. Dans le Playground, fournir cette instruction séparément du JSON :

> Rédige une proposition de synthèse annuelle en français, limitée aux chiffres et aux libellés du JSON. Distingue les territoires atteignant le seuil quantitatif des objectifs qualitatifs de la circulaire : les premiers ne mesurent pas la réalisation des seconds. FR-Alert désigne un dispositif d'alerte à la population. Les montants demandés et reçus sont seulement des sommes renseignées dans une table : ne déduis ni déficit, ni taux de financement, ni effet sur les exercices futurs. Ne déduis aucune cause des pics mensuels ni aucune appréciation sur la capacité opérationnelle. Une année échue et l'absence de dates manquantes ne prouvent pas l'exhaustivité des données. Qualifie chaque pourcentage avec son dénominateur, n'invente aucun fait et conclue par les limites de source. Rends un brouillon structuré à valider par un agent.

Le texte généré doit être vérifié ligne à ligne avant intégration.

## Architecture

Navigateur Grist → widget hébergé sur GitHub Pages → service institutionnel authentifié → Albert API (`POST https://albert.api.etalab.gouv.fr/v1/chat/completions`). Le retour est un brouillon modifiable et relu avant d'être inséré dans le rapport imprimable. Le widget demeure responsable des calculs ; Albert ne recalcule aucun indicateur.

## Contrat du service

- Route envisagée : `POST /api/syntheses-annuelles/rediger` sur un domaine institutionnel HTTPS.
- Entrée : JSON produit par `annualAiPayload(data)` dans `index.html`. Champs : `version=2`, `year`, `generatedAt`, `currentYearIncomplete`, `dataQuality`, `method`, `exercises`, `previousYear`, `qualitativeObjectives`, `quantitativeTerritoryTargets`, `riskCategoryCounts`, `commandChainAlerts`, `unresolvedPostures`, `monthlyRealizedCounts`, `recordedToolFlags`, `financeObservations`. Il s'agit d'agrégats et d'intitulés d'objectifs, sans enregistrement individuel.
- Sortie : `{"year":"2025","draft":"Texte français à relire…"}`. Texte brut, 1 à 12 000 caractères. En cas d'erreur, code HTTP non 2xx ; ne renvoyer aucun secret ni détail interne.
- Le serveur valide le schéma et la taille de la requête, contrôle année et valeurs, refuse les champs inattendus, impose un budget et un quota, et journalise uniquement les métadonnées nécessaires, sans contenu sensible.
- Le serveur choisit le modèle disponible avec `GET /v1/models` lors de sa configuration (type `text-generation`), puis appelle Albert avec `Authorization: Bearer <clé stockée dans un coffre de secrets serveur>`, `messages` et `model`.
- Instruction serveur : reprendre la formulation détaillée du script d'essai local. Le nombre de territoires ayant atteint un seuil quantitatif n'est pas un pourcentage d'objectifs qualitatifs. Les montants saisis ne prouvent ni déficit ni taux de financement. Les dispositifs déclarés ne prouvent pas la complétude de la saisie. Rédiger de façon descriptive, sans causalité ou jugement non étayé. Prévoir un contrôle automatique des chiffres cités avant restitution.
- Autoriser uniquement les personnes habilitées (SSO institutionnel ou délégation limitée documentée). Une origine CORS autorisée n'authentifie pas l'appelant. Si session par cookie, contrôler CSRF, `Origin` et compatibilité des navigateurs avec le widget intégré dans l'iframe Grist ; sinon retenir une authentification courte et spécifique au service. Un proxy public sans contrôle d'identité est exclu.
- Confirmer préalablement avec les responsables SSI et métier que les agrégats et intitulés transmis sont admissibles. Ne pas transmettre d'informations classifiées. Minimiser davantage les intitulés si le périmètre de données le demande.

## Activation du widget

Après déploiement et validation du service, remplacer `const ANNUAL_AI_SERVICE_URL='';` dans `index.html` par son URL HTTPS. Le bouton Albert devient actif uniquement après « Préparer les données ». Aucun envoi ne part à l'ouverture de la page ni lors du changement d'année. La saisie manuelle permet de tester dès maintenant la relecture et l'impression, sans service externe. Le brouillon reste en mémoire du navigateur, n'est pas enregistré dans Grist ; seul le texte explicitement relu et intégré apparaît à l'impression. Les textes sont effacés lorsque Grist recharge les tables.

## Essais de réception

1. Aucun appel réseau vers Albert ni vers le service lors de l'ouverture, du choix d'année, ou du clic « Préparer ».
2. Utilisateur non habilité : HTTP 401/403. CORS seul, lien GitHub Pages et origine `grist.numerique.gouv.fr` ne donnent aucun droit.
3. Une réponse Albert contenant des nombres divergents est signalée et refusée ou renvoyée avec une alerte permettant une vérification métier. Les chiffres du tableau ne sont jamais modifiés.
4. Changement d'année et rechargement des données : le brouillon d'une autre année n'est pas intégré. Tests 2024 sans objectifs qualitatifs et 2026 provisoire.
5. Cas d'erreur : délai 45 s, 401/403, 429, 503 ; l'état Grist et les chiffres du rapport restent accessibles.

Références : guide https://guides.ia.numerique.gouv.fr/albert-api ; clés https://guides.ia.numerique.gouv.fr/albert-api/compte-and-usage/api-keys ; démarrage https://guides.ia.numerique.gouv.fr/albert-api/prise-en-main/quickstart ; API https://albert.api.etalab.gouv.fr/reference ; droits des widgets https://support.getgrist.com/widget-custom/.
