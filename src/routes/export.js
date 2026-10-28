'use strict';

const express = require('express');
const { exporterCommandes } = require('../legacy/export-commandes');

/**
 * Routes /export : export comptable.
 * GET /export/commandes?depuis=AAAA-MM-JJ   CSV séparé par des points-virgules, hors commandes annulées
 * @param {import('node:sqlite').DatabaseSync} db Base ouverte.
 * @returns {import('express').Router}
 */
module.exports = function routesExport(db) {
  const router = express.Router();

  router.get('/commandes', (req, res, next) => {
    exporterCommandes(db, req.query.depuis || '2000-01-01', (err, csv) => {
      if (err) return next(err);
      res.type('text/csv').send(csv);
    });
  });

  return router;
};
