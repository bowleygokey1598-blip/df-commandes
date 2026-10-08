'use strict';

const express = require('express');
const { calculerDevis } = require('../devis/calcul');

module.exports = function routesDevis(db) {
  const router = express.Router();

  router.post('/', (req, res) => {
    const { clientId, lignes } = req.body || {};
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(Number(clientId));
    if (!client) return res.status(404).json({ erreur: 'Client introuvable' });
    if (!Array.isArray(lignes)) return res.status(400).json({ erreur: 'lignes doit être une liste' });

    const lignesProduits = [];
    for (const ligne of lignes) {
      const produit = db.prepare('SELECT * FROM produits WHERE reference = ?').get(String(ligne.reference));
      if (!produit) return res.status(404).json({ erreur: `Produit introuvable : ${ligne.reference}` });
      lignesProduits.push({ produit, quantite: ligne.quantite });
    }

    let devis;
    try {
      devis = calculerDevis(client, lignesProduits);
    } catch (e) {
      return res.status(400).json({ erreur: e.message });
    }

    const date = new Date().toISOString().slice(0, 10);
    const { lastInsertRowid } = db
      .prepare('INSERT INTO devis (client_id, date, total_ht, total_ttc, detail) VALUES (?, ?, ?, ?, ?)')
      .run(client.id, date, devis.totalHT, devis.totalTTC, JSON.stringify(devis));
    res.status(201).json({ id: Number(lastInsertRowid), clientId: client.id, date, ...devis });
  });

  router.get('/:id', (req, res) => {
    const ligne = db.prepare('SELECT * FROM devis WHERE id = ?').get(Number(req.params.id));
    if (!ligne) return res.status(404).json({ erreur: 'Devis introuvable' });
    res.json({ id: ligne.id, clientId: ligne.client_id, date: ligne.date, ...JSON.parse(ligne.detail) });
  });

  return router;
};
