// À compléter pendant l'exercice.
// Piège 1 : test volontairement faux, retiré à la fin de l'étape.
{
  const { test } = require('node:test'); // outil de test intégré à Node.js
  const assert = require('node:assert/strict'); // comparaison qui échoue au moindre écart
  const { calculerDevis } = require('../../src/devis/calcul'); // la fonction testée
  test('piège 1 : 100 vis à 10 € pour un client ordinaire', () => {
    const vis = { reference: 'VIS', prix_ht: 10 }; // un produit à 10 € HT
    const devis = calculerDevis({ grand_compte: 0 }, [{ produit: vis, quantite: 100 }]); // devis de 100 vis
    assert.equal(devis.totalHT, 881); // faux exprès : le bon total est 880
  });
}