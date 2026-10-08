// Fichier de la formation : ne pas modifier.
'use strict';

const express = require('express');
const routesClients = require('./routes/clients');
const routesProduits = require('./routes/produits');
const routesDevis = require('./routes/devis');
const routesCommandes = require('./routes/commandes');
const routesExport = require('./routes/export');

function creerApp(db) {
  const app = express();
  app.use(express.json());
  app.get('/sante', (req, res) => res.json({ statut: 'ok' }));
  app.use('/clients', routesClients(db));
  app.use('/produits', routesProduits(db));
  app.use('/devis', routesDevis(db));
  app.use('/commandes', routesCommandes(db));
  app.use('/export', routesExport(db));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur interne' });
  });
  return app;
}

module.exports = { creerApp };
