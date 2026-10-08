// Fichier de la formation : ne pas modifier.
// Tests livrés avec la proposition de l'assistant (micro-exercice du ch04).
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { nomFichierExport } = require('./proposition');

test('retire les accents et les espaces', () => {
  assert.equal(
    nomFichierExport('Électricité du Rhône 23', '2026-03-03'),
    'electricite-du-rhone-23-2026-03-03.csv',
  );
});

test('remplace la ponctuation par un seul tiret', () => {
  assert.equal(nomFichierExport('Bâtir & Fils, Pro', '2026-03-03'), 'batir-fils-pro-2026-03-03.csv');
});

test('aucun tiret en début ni en fin de nom', () => {
  assert.equal(nomFichierExport('  Rénov Alpes 12 !', '2026-03-03'), 'renov-alpes-12-2026-03-03.csv');
});
