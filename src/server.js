// Fichier de la formation : ne pas modifier.
'use strict';

const { ouvrirBase, peupler } = require('./db');
const { creerApp } = require('./app');
const config = require('./config');

const db = peupler(ouvrirBase(), { commandes: 2000 });
creerApp(db).listen(config.port, () => {
  console.log(`D&F Commandes écoute sur http://localhost:${config.port}`);
});
