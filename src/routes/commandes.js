'use strict';

const express = require('express');
const config = require('../config');

module.exports = function routesCommandes(db) {
  const router = express.Router();

  router.post('/', (req, res) => {
    const { devisId } = req.body || {};
    const devis = db.prepare('SELECT * FROM devis WHERE id = ?').get(Number(devisId));
    if (!devis) return res.status(404).json({ erreur: 'Devis introuvable' });

    const detail = JSON.parse(devis.detail);
    const date = new Date().toISOString().slice(0, 10);
    const { lastInsertRowid } = db
      .prepare('INSERT INTO commandes (client_id, date, statut) VALUES (?, ?, ?)')
      .run(devis.client_id, date, 'en_preparation');
    const insLigne = db.prepare(
      'INSERT INTO lignes_commande (commande_id, produit_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)');
    for (const ligne of detail.lignes) {
      const produit = db.prepare('SELECT id FROM produits WHERE reference = ?').get(ligne.reference);
      insLigne.run(lastInsertRowid, produit.id, ligne.quantite, ligne.prixUnitaire);
    }
    res.status(201).json({ id: Number(lastInsertRowid), statut: 'en_preparation' });
  });

  router.post('/:id/expedition', (req, res) => {
    const commande = db.prepare('SELECT * FROM commandes WHERE id = ?').get(Number(req.params.id));
    if (!commande) return res.status(404).json({ erreur: 'Commande introuvable' });
    // L'appel réel au transporteur est désactivé hors production.
    const annonce = {
      url: `${config.transporteur.url}/expeditions`,
      entetes: { Authorization: `Bearer ${config.transporteur.cleApi ? '***' : 'absente'}` },
      commande: commande.id,
    };
    db.prepare('UPDATE commandes SET statut = ? WHERE id = ?').run('expediee', commande.id);
    res.json({ statut: 'expediee', annonce });
  });

  return router;
};
