'use strict';

const express = require('express');

module.exports = function routesProduits(db) {
  const router = express.Router();

  router.get('/', (req, res) => {
    const { categorie } = req.query;
    const produits = categorie
      ? db.prepare('SELECT * FROM produits WHERE categorie = ? ORDER BY reference').all(categorie)
      : db.prepare('SELECT * FROM produits ORDER BY reference').all();
    res.json(produits);
  });

  router.get('/:reference', (req, res) => {
    const produit = db.prepare('SELECT * FROM produits WHERE reference = ?').get(req.params.reference);
    if (!produit) return res.status(404).json({ erreur: 'Produit introuvable' });
    res.json(produit);
  });

  return router;
};
