'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculerDevis, appliquerRemiseExceptionnelle } = require('../../src/devis/calcul');

test('la remise exceptionnelle baisse le total HT', () => {
  const devis = calculerDevis({ grand_compte: 0 }, [{ produit: { reference: 'VIS', prix_ht: 10 }, quantite: 100 }]);
  assert.ok(appliquerRemiseExceptionnelle(devis, 0.1).totalHT < devis.totalHT);
});
