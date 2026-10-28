# Utiliser ce dépôt pendant la formation

Fichier de la formation : ne pas modifier.

## Installation, une fois

### 1. Créer votre dépôt depuis le modèle

1. Ouvrez https://github.com/alexxzee/df-commandes, connecté à votre compte GitHub.
2. Bouton **Use this template**, puis **Create a new repository**. Propriétaire : votre compte. Nom : `df-commandes`. Cochez **Private**, puis **Create repository**.
3. Dans votre nouveau dépôt : **Settings**, **Collaborators**, **Add people** : ajoutez le compte GitHub du formateur. Il lira votre travail ; vous restez propriétaire du dépôt.

### 2. Cloner votre dépôt et les vérificateurs, côte à côte

Dans votre dépôt, bouton **Code**, onglet **HTTPS** : copiez l’adresse. Puis, dans un terminal ouvert sur le dossier où vous rangez vos projets :

```bash
git clone <adresse de votre dépôt>
git clone https://github.com/alexxzee/df-verifications
cd df-commandes
npm install
npm test
```

`npm test` se termine par `ℹ fail 0`. Les deux dossiers doivent être **côte à côte**. Ouvrez ensuite **seulement** `df-commandes` dans VS Code (**Fichier**, **Ouvrir le dossier**) : l’assistant lit tout le dossier ouvert, et `df-verifications` contient les cas attendus des exercices. Les commandes ci-dessous l’appellent, vous n’avez pas à l’ouvrir.

## Rendre votre travail : un push par jour

Ni branche ni pull request par exercice : vous travaillez sur `main`. En fin de journée, une fois, dans le terminal ouvert sur `df-commandes` :

```bash
git add -A
git commit -m "Travail du jour"
git push
```

Le formateur lit votre dépôt sur GitHub.

## Commandes de vérification

| Commande | Ce qu’elle vérifie |
|---|---|
| `npm test` | tous les tests du dossier `test/` |
| `npm run lint` | la qualité du code (ESLint) |
| `npm run arrondi` | `arrondirAuCentime`, dans `src/utils/arrondi.js` |
| `npm run arrondi:appli` | `arrondir`, dans `src/devis/calcul.js` |
| `npm run prix` | `formaterPrix`, dans `src/utils/format.js` |
| `npm run reference` | la fonction exportée par `src/validation/reference.js` |
| `npm run tva` | les tests de `exercices/tva/tva.js` : ils passent sur le code, et échouent quand le calcul de la TVA ou du port est faussé |
| `npm run tva:couverture` | les lignes de `src/devis/` exécutées par les tests de `exercices/tva/tva.js` |
| `npm run devis-du-jour` | la page `GET /devis/du-jour` (exercice des agents) |
| `npm run recette` | la durée de validité des devis, contre les décisions du métier |
| `npm run reprise -- ch07` | repartir de l’état prêt d’une étape (remplace votre travail en cours) |
| `npm test -- exercices/agents/par-defaut.js` | les tests d’un fichier de l’atelier « agent testeur » (même forme pour `testeur.js`) |
| `npm run test:caracterisation` | le comportement de l’export comptable |
| `npm run bench` | le temps de l’export comptable |
| `npm run doublons -- origine` | le temps d’une version de `exercices/doublons/` (même forme pour `proposition-1` et `proposition-2`), et si son résultat est celui de la version d’origine |
| `npm run test:intersession` | les tests du travail intersession, dans `exercices/intersession/` |
| `npm run intersession` | le travail intersession sur les points de fidélité |
| `npm run proposition` | le lint et les tests de la proposition de `exercices/fusion/` |
| `npm run fusion` | la grille de décision de `docs/decision-fusion.md` |
| `npm run anonymat` | le ticket anonymisé et masqué de `exercices/confidentialite/ticket-anonymise.txt` |
| `npm run chiffrer` | chiffre `exercices/confidentialite/export-clients.csv` dans `export-clients.chiffre`, avec la phrase de passe de la variable `DF_CLE_EXPORT` (`npm run chiffrer -- --dechiffrer` l’affiche en clair) |
| `npm run hook` | le hook branché dans le fichier de votre outil, sur des actions simulées, sans l’assistant |
| `npm run failles` | la grille de `docs/failles.md`, posée sur `exercices/failles/import-clients.js` |
| `npm run consigne` | la consigne de délégation de `docs/consigne-delegation.md` |

Si une commande affiche « Vérificateur introuvable », `df-verifications` n’est pas cloné à côté de `df-commandes` : la commande indique quoi taper.

## Fichiers à remplir pendant les exercices

Ils existent déjà, vides : ouvrez-les et remplissez-les, sans créer de dossier ni de fichier. Chacun commence par la ligne « À compléter pendant l’exercice », que vous pouvez effacer.

## Fichiers à ne pas modifier

Les fichiers qui commencent par le commentaire « Fichier de la formation : ne pas modifier. », ainsi que `package.json`, `package-lock.json`, `test/caracterisation/export-attendu.csv` et `exercices/confidentialite/export-clients.csv`, qui ne peuvent pas porter de commentaire.

Les agents fournis sont aussi des fichiers de la formation : ne les modifiez pas. Leur en-tête doit rester en première ligne, la mention vient donc juste après lui. Ce sont `.github/agents/refacto.agent.md`, `chef-equipe-web.agent.md`, `dev-web.agent.md`, `testeur-web.agent.md` et `relecteur-web.agent.md`, les agents de l’équipe web de `.claude/agents/` (`chef-equipe-web.md`, `dev-web.md`, `testeur-web.md`, `relecteur-web.md`), et les agents fournis dans `.codex/agents/` (`refacto.toml`, `dev-web.toml`, `testeur-web.toml`, `relecteur-web.toml`). Les specs `docs/conditions-paiement.md` et `docs/programme-fidelite.md`, la constitution `specs/constitution.md` et la spec reçue `specs/annulation-commande.md` ne se modifient pas non plus.

Les fichiers d’agent `.github/agents/relecteur-securite.agent.md` et `testeur.agent.md`, l’agent testeur de Claude Code (`.claude/agents/testeur.md`) et de Codex (`.codex/agents/testeur.toml`), les fichiers de hooks `.claude/settings.json`, `.github/hooks/proteger.json` et `.codex/hooks.json` (au format JSON, qui n’admet pas de commentaire : ils contiennent une liste de hooks vide), les instructions `AGENTS.md`, `CLAUDE.md` et `.github/copilot-instructions.md`, ainsi que les fichiers de `specs/` marqués « À compléter », sont à remplir pendant les exercices. Chaque outil lit son fichier d’instructions : Copilot `.github/copilot-instructions.md` (et `AGENTS.md`), Codex `AGENTS.md`, Claude Code `CLAUDE.md` (il ignore `AGENTS.md` dès qu’un `CLAUDE.md` existe). Ces fichiers ne renvoient pas l’un à l’autre : quand vous en remplissez plusieurs, gardez-leur le même contenu.
