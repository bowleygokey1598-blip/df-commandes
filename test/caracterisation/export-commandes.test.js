// Fichier de la formation : ne pas modifier.
'use strict';

// Tests de caractérisation : ils figent le comportement ACTUEL de l'export,
// bon ou mauvais. Une refactorisation doit les garder au vert sans les modifier.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ouvrirBase, peupler } = require('../../src/db');
const { exporterCommandes } = require('../../src/legacy/export-commandes');

const ATTENDU = fs.readFileSync(path.join(__dirname, 'export-attendu.csv'), 'utf8');

function exporter(db, depuis) {
  return new Promise((resolve, reject) => {
    exporterCommandes(db, depuis, (err, csv) => (err ? reject(err) : resolve(csv)));
  });
}

test('l’export complet est identique au fichier de référence', async () => {
  const db = peupler(ouvrirBase(), { commandes: 200, graine: 42 });
  assert.equal(await exporter(db, '2000-01-01'), ATTENDU);
});

test('le filtre de date exclut les commandes antérieures', async () => {
  const db = peupler(ouvrirBase(), { commandes: 200, graine: 42 });
  const csv = await exporter(db, '2026-01-01');
  const dates = csv.trim().split('\n').slice(1, -1).map((l) => l.split(';')[1]);
  assert.ok(dates.length > 0);
  assert.ok(dates.every((d) => d >= '2026-01-01'));
});

test('une base sans commande produit l’en-tête et zéro client actif', async () => {
  const db = ouvrirBase();
  assert.equal(await exporter(db, '2000-01-01'),
    'numero;date;client;ville;nb_lignes;total_ht;total_ttc\n# clients actifs;0\n');
});

test('les montants utilisent la virgule et deux décimales', async () => {
  const db = ouvrirBase();
  db.exec("INSERT INTO clients (nom, ville, grand_compte) VALUES ('Bâtir; et Fils', 'Lyon', 0)");
  db.exec("INSERT INTO produits (reference, libelle, categorie, prix_ht) VALUES ('X', 'X', 'x', 10.1)");
  db.exec("INSERT INTO commandes (client_id, date, statut) VALUES (1, '2026-01-05', 'livree')");
  db.exec('INSERT INTO lignes_commande (commande_id, produit_id, quantite, prix_unitaire) VALUES (1, 1, 3, 10.1)');
  assert.equal(await exporter(db, '2000-01-01'),
    'numero;date;client;ville;nb_lignes;total_ht;total_ttc\n'
    + '1;2026-01-05;Bâtir, et Fils;Lyon;1;30,30;36,36\n# clients actifs;1\n');
});

test('une commande annulée n’apparaît pas et ne compte pas comme client actif', async () => {
  const db = ouvrirBase();
  db.exec("INSERT INTO clients (nom, ville, grand_compte) VALUES ('A', 'Lyon', 0)");
  db.exec("INSERT INTO produits (reference, libelle, categorie, prix_ht) VALUES ('X', 'X', 'x', 5)");
  db.exec("INSERT INTO commandes (client_id, date, statut) VALUES (1, '2026-01-05', 'annulee')");
  db.exec('INSERT INTO lignes_commande (commande_id, produit_id, quantite, prix_unitaire) VALUES (1, 1, 2, 5)');
  assert.equal(await exporter(db, '2000-01-01'),
    'numero;date;client;ville;nb_lignes;total_ht;total_ttc\n# clients actifs;0\n');
});
