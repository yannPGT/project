# Raccordement Albert API — synthèse annuelle

État au 17 octobre 2026 : interface du widget préparée ; aucun appel à Albert n'est activé. Le bouton « Préparer les données à transmettre » affiche localement le JSON qui serait envoyé et permet désormais de le copier. Aucune clé et aucune donnée d'exercice individuelle ne figurent dans ce fichier.

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
3. Le script appelle Albert depuis votre poste et affiche seulement un **brouillon** dans le terminal. Si besoin, définir `ALBERT_MODEL` dans l'environnement ; par défaut `openweight-small` selon le guide. Comparer chaque nombre et chaque affirmation à la synthèse Grist. Ne pas publier le texte automatiquement.

L'usage d'une clé temporaire rend cet essai réversible ; **il ne rend pas acceptable l'insertion de la clé dans le JavaScript du widget**. Pour une utilisation collective, passer par le service authentifié ci-dessous.

## Architecture

Navigateur Grist → widget hébergé sur GitHub Pages → service institutionnel authentifié → Albert API (`POST https://albert.api.etalab.gouv.fr/v1/chat/completions`). Le retour est un brouillon modifiable et relu avant d'être inséré dans le rapport imprimable. Le widget demeure responsable des calculs ; Albert ne recalcule aucun indicateur.

## Contrat du service

- Route envisagée : `POST /api/syntheses-annuelles/rediger` sur un domaine institutionnel HTTPS.
- Entrée : JSON produit par `annualAiPayload(data)` dans `index.html`. Champs : `version=1`, `year`, `generatedAt`, `provisional`, `method`, `exercises`, `previousYear`, `objectives`, `goalAttainment`, `risks`, `monthly`, `missingDates`, `tools`, `finances`. Il s'agit d'agrégats et d'intitulés d'objectifs, sans enregistrement individuel.
- Sortie : `{"year":"2025","draft":"Texte français à relire…"}`. Texte brut, 1 à 12 000 caractères. En cas d'erreur, code HTTP non 2xx ; ne renvoyer aucun secret ni détail interne.
- Le serveur valide le schéma et la taille de la requête, contrôle année et valeurs, refuse les champs inattendus, impose un budget et un quota, et journalise uniquement les métadonnées nécessaires, sans contenu sensible.
- Le serveur choisit le modèle disponible avec `GET /v1/models` lors de sa configuration (type `text-generation`), puis appelle Albert avec `Authorization: Bearer <clé stockée dans un coffre de secrets serveur>`, `messages` et `model`.
- Instruction serveur : rédaction factuelle, respect des chiffres et des années, qualifier 2026 de provisoire, distinguer hypothèse et fait, ne pas déduire de cause ou de recommandation sans source ; signaler les champs absents ; retourner du texte brut. Prévoir un contrôle automatique des chiffres cités avant restitution.
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
