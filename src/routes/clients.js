'use strict';

const express = require('express');

/**
 * Routes /clients : consultation des clients (lecture seule).
 * GET /clients        liste triée par nom
 * GET /clients/:id    un client, 404 s'il n'existe pas
 * @param {import('node:sqlite').DatabaseSync} db Base ouverte.
 * @returns {import('express').Router}
 */
module.exports = function routesClients(db) {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json(db.prepare('SELECT * FROM clients ORDER BY nom').all());
  });

  router.get('/:id', (req, res) => {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(Number(req.params.id));
    if (!client) return res.status(404).json({ erreur: 'Client introuvable' });
    res.json(client);
  });

  return router;
};
