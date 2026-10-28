# D&F Commandes

API REST de devis et de commandes de **Delmas & Fournier**, développée et maintenue par **Néotis**. Elle gère les clients, le catalogue de matériel technique pour le bâtiment, le calcul des devis (remises, port, TVA), les commandes et l’export comptable.

Toutes les clés et tous les mots de passe présents dans ce dépôt, y compris dans son historique, sont fictifs et invalides.

## Prérequis

- Node.js 22.13 ou plus récent (Node 24 LTS recommandé), pour le module intégré `node:sqlite`
- npm

## Installation et lancement

```bash
npm install
npm start            # http://localhost:3000, base en mémoire peuplée de données fictives
```

Variables d’environnement :

| Variable | Rôle | Défaut |
|---|---|---|
| `PORT` | Port d’écoute | `3000` |
| `DF_TRANSPORTEUR_API_KEY` | Clé de l’API du transporteur | aucune |

## Points d’entrée

| Méthode | Chemin | Rôle |
|---|---|---|
| GET | `/sante` | Vérifie que l’API répond |
| GET | `/clients`, `/clients/:id` | Clients |
| GET | `/produits?categorie=`, `/produits/:reference` | Catalogue |
| POST | `/devis` | Calcule et enregistre un devis |
| GET | `/devis/:id` | Relit un devis |
| POST | `/commandes` | Transforme un devis en commande |
| POST | `/commandes/:id/expedition` | Expédie une commande |
| GET | `/export/commandes?depuis=AAAA-MM-JJ` | Export comptable CSV |

Exemple :

```bash
curl -X POST http://localhost:3000/devis \
  -H 'content-type: application/json' \
  -d '{"clientId":1,"lignes":[{"reference":"VIS-INOX-6X60","quantite":10}]}'
```

Les règles de calcul des devis sont décrites dans [docs/regles-remises.md](docs/regles-remises.md).

## Développement

```bash
npm test                    # tous les tests (node:test)
npm run test:couverture     # couverture de code
npm run test:caracterisation # tests qui figent l’export comptable
npm run lint                # ESLint
npm run bench               # temps de l’export comptable
```

## Limites connues

- Base en mémoire : les données sont perdues à l’arrêt.
- L’appel réel au transporteur est désactivé hors production.
- L’export comptable est lent au-delà de quelques milliers de commandes.

## Pour la formation

1. Sur https://github.com/alexxzee/df-commandes : **Use this template**, **Create a new repository**, dépôt **privé** nommé `df-commandes`, sur votre compte.
2. Dans votre dépôt : **Settings**, **Collaborators** : ajoutez le compte GitHub du formateur.
3. Clonez votre dépôt et `df-verifications` côte à côte, puis `npm install`, et rendez votre travail par un push en fin de journée : détail dans `FORMATION.md`.
