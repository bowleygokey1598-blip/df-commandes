// Fichier de la formation : ne pas modifier.
'use strict';

const { DatabaseSync } = require('node:sqlite');

const SCHEMA = `
  CREATE TABLE clients (
    id INTEGER PRIMARY KEY,
    nom TEXT NOT NULL,
    ville TEXT NOT NULL,
    grand_compte INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE produits (
    id INTEGER PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    libelle TEXT NOT NULL,
    categorie TEXT NOT NULL,
    prix_ht REAL NOT NULL
  );
  CREATE TABLE devis (
    id INTEGER PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    date TEXT NOT NULL,
    total_ht REAL NOT NULL,
    total_ttc REAL NOT NULL,
    detail TEXT NOT NULL
  );
  CREATE TABLE commandes (
    id INTEGER PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    date TEXT NOT NULL,
    statut TEXT NOT NULL
  );
  CREATE TABLE lignes_commande (
    id INTEGER PRIMARY KEY,
    commande_id INTEGER NOT NULL REFERENCES commandes(id),
    produit_id INTEGER NOT NULL REFERENCES produits(id),
    quantite INTEGER NOT NULL,
    prix_unitaire REAL NOT NULL
  );
`;

const VILLES = ['Lyon', 'Villeurbanne', 'Grenoble', 'Saint-Étienne', 'Annecy', 'Chambéry', 'Valence', 'Bourg-en-Bresse'];
const PREFIXES = ['Bâtir', 'Atelier', 'Rénov', 'Construction', 'Menuiserie', 'Plomberie', 'Électricité', 'Charpente'];
const SUFFIXES = ['du Rhône', 'Alpes', 'et Fils', 'Services', 'Pro', 'Associés'];
const CATALOGUE = [
  ['VIS-INOX-6X60', 'Vis inox 6x60, boîte de 100', 'quincaillerie', 18.9],
  ['CHEV-MOL-8', 'Chevilles Molly 8 mm, boîte de 50', 'quincaillerie', 24.5],
  ['PLAQ-BA13', 'Plaque de plâtre BA13 2,5 m', 'plâtrerie', 9.8],
  ['RAIL-R48', 'Rail R48 3 m', 'plâtrerie', 4.35],
  ['LAINE-R5', 'Laine de verre R5, rouleau', 'isolation', 42.0],
  ['PANN-OSB-18', 'Panneau OSB 18 mm', 'bois', 21.4],
  ['TUBE-PER-16', 'Tube PER 16 mm, couronne 50 m', 'plomberie', 56.9],
  ['RACC-LAI-16', 'Raccord laiton 16 mm', 'plomberie', 3.75],
  ['CABLE-R2V-3G25', 'Câble R2V 3G2,5, 50 m', 'électricité', 89.0],
  ['DISJ-20A', 'Disjoncteur 20 A', 'électricité', 12.6],
  ['GAINE-ICTA-20', 'Gaine ICTA 20 mm, 100 m', 'électricité', 31.2],
  ['MORT-COLLE-25', 'Mortier colle 25 kg', 'maçonnerie', 14.9],
  ['PARP-20', 'Parpaing creux 20 cm', 'maçonnerie', 1.48],
  ['CIM-35', 'Ciment 35 kg', 'maçonnerie', 11.3],
  ['PEINT-BL-10', 'Peinture blanche mate 10 L', 'finition', 64.0],
  ['ENDUIT-15', 'Enduit de lissage 15 kg', 'finition', 27.8],
];

/** Générateur pseudo-aléatoire déterministe : même graine, mêmes données. */
function generateur(graine) {
  let etat = graine >>> 0;
  return () => {
    etat = (etat + 0x6d2b79f5) >>> 0;
    let t = etat;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ouvrirBase(chemin = ':memory:') {
  const db = new DatabaseSync(chemin);
  db.exec(SCHEMA);
  return db;
}

function insererClients(db, nombre, hasard, entier) {
  const ins = db.prepare('INSERT INTO clients (nom, ville, grand_compte) VALUES (?, ?, ?)');
  for (let i = 0; i < nombre; i++) {
    const nom = `${PREFIXES[i % PREFIXES.length]} ${SUFFIXES[entier(0, SUFFIXES.length - 1)]} ${i + 1}`;
    ins.run(nom, VILLES[entier(0, VILLES.length - 1)], hasard() < 0.2 ? 1 : 0);
  }
}

function insererProduits(db) {
  const ins = db.prepare('INSERT INTO produits (reference, libelle, categorie, prix_ht) VALUES (?, ?, ?, ?)');
  for (const [reference, libelle, categorie, prix] of CATALOGUE) {
    ins.run(reference, libelle, categorie, prix);
  }
}

function insererCommandes(db, nombre, nbClients, hasard, entier) {
  const insCommande = db.prepare('INSERT INTO commandes (client_id, date, statut) VALUES (?, ?, ?)');
  const insLigne = db.prepare(
    'INSERT INTO lignes_commande (commande_id, produit_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)');
  const debut = Date.UTC(2025, 0, 2);
  for (let i = 0; i < nombre; i++) {
    const date = new Date(debut + entier(0, 600) * 86400000).toISOString().slice(0, 10);
    const statut = hasard() < 0.08 ? 'annulee' : 'livree';
    const { lastInsertRowid } = insCommande.run(entier(1, nbClients), date, statut);
    const nbLignes = entier(1, 6);
    for (let j = 0; j < nbLignes; j++) {
      const produit = entier(1, CATALOGUE.length);
      insLigne.run(lastInsertRowid, produit, entier(1, 120), CATALOGUE[produit - 1][3]);
    }
  }
}

/** Remplit la base avec des données fictives et déterministes. */
function peupler(db, options = {}) {
  const { clients = 30, commandes = 300, graine = 42 } = options;
  const hasard = generateur(graine);
  const entier = (min, max) => min + Math.floor(hasard() * (max - min + 1));
  db.exec('BEGIN');
  insererClients(db, clients, hasard, entier);
  insererProduits(db);
  insererCommandes(db, commandes, clients, hasard, entier);
  db.exec('COMMIT');
  return db;
}

module.exports = { ouvrirBase, peupler };
