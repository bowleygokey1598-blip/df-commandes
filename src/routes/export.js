'use strict';

const express = require('express');
const { exporterCommandes } = require('../legacy/export-commandes');

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
