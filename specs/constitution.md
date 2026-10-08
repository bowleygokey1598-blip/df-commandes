<!-- Fichier de la formation : ne pas modifier. -->

# Constitution de D&F Commandes

Les principes que toute évolution respecte. L’agent les lit avant d’écrire une spec, un plan, des tâches ou du code.

## Code

1. Node.js 24, modules CommonJS : `'use strict';` en première ligne, `require(...)`, `module.exports = { ... }`.
2. Aucune dépendance ajoutée.
3. Noms de fonctions, de variables et de champs JSON en français, en camelCase, sans accent : `totalHT`, `clientId`.
4. Une erreur HTTP renvoie un corps `{ "erreur": "<message en français>" }`.
5. Les dates sont au format AAAA-MM-JJ, en UTC, comme la date des devis.

## Tests

6. Toute règle métier a ses tests `node:test` dans `test/`, avec la même arborescence que `src/`.
7. `npm test` reste vert après chaque tâche.

## Fichiers protégés

8. Un fichier qui commence par « Fichier de la formation : ne pas modifier. » ne se modifie jamais.

## Méthode

9. Une spec dit quoi et pourquoi, jamais comment : ni nom de fonction, ni fichier, ni bibliothèque.
10. Ce que la spec ne tranche pas va dans « Questions ouvertes », jamais dans une supposition silencieuse.
11. On ne planifie et on n’implémente qu’une spec relue par un humain.
