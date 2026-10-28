'use strict';

// Export comptable des commandes, lancé chaque nuit par le cabinet comptable.
// Refactorisé sous le filet des tests de caractérisation : le format de sortie
// est identique au caractère près, y compris le TTC calculé sur le HT non arrondi.

const TAUX_TVA = 0.2;
const EN_TETE = 'numero;date;client;ville;nb_lignes;total_ht;total_ttc\n';

/** Formate un montant en euros avec deux décimales et une virgule. */
function formaterMontant(montant) {
  return (Math.round(montant * 100) / 100).toFixed(2).replace('.', ',');
}

/** Neutralise le séparateur CSV dans un texte libre. */
function nettoyer(texte) {
  return texte.replace(/;/g, ',');
}

/** Regroupe les lignes par commande : nombre de lignes et total HT brut. */
function totauxParCommande(lignes) {
  const totaux = new Map();
  for (const ligne of lignes) {
    const total = totaux.get(ligne.commande_id) || { nb: 0, ht: 0 };
    total.nb += 1;
    total.ht += ligne.quantite * ligne.prix_unitaire;
    totaux.set(ligne.commande_id, total);
  }
  return totaux;
}

function ligneCsv(commande, client, total) {
  const nom = client ? nettoyer(client.nom) : 'INCONNU';
  const ville = client ? nettoyer(client.ville) : '';
  return [
    commande.id, commande.date, nom, ville, total.nb,
    formaterMontant(total.ht), formaterMontant(total.ht * (1 + TAUX_TVA)),
  ].join(';') + '\n';
}

/** Construit le CSV de façon synchrone à partir de la base. */
function construireCsv(db, depuis) {
  const commandes = db.prepare('SELECT * FROM commandes WHERE date >= ? ORDER BY date, id').all(depuis);
  const totaux = totauxParCommande(db.prepare('SELECT * FROM lignes_commande').all());
  const clients = new Map(db.prepare('SELECT * FROM clients').all().map((c) => [c.id, c]));
  const actifs = new Set();
  let csv = EN_TETE;
  for (const commande of commandes) {
    if (commande.statut === 'annulee') continue;
    csv += ligneCsv(commande, clients.get(commande.client_id), totaux.get(commande.id) || { nb: 0, ht: 0 });
    actifs.add(commande.client_id);
  }
  return `${csv}# clients actifs;${actifs.size}\n`;
}

/**
 * Exporte les commandes non annulées depuis une date, au format CSV.
 * Contrat conservé : rappel (err, csv) appelé de façon asynchrone.
 * @param {import('node:sqlite').DatabaseSync} db Base ouverte.
 * @param {string} depuis Date incluse, AAAA-MM-JJ.
 * @param {(err: Error|null, csv?: string) => void} callback
 */
function exporterCommandes(db, depuis, callback) {
  setImmediate(() => {
    let csv;
    try {
      csv = construireCsv(db, depuis);
    } catch (err) {
      callback(err);
      return;
    }
    callback(null, csv);
  });
}

module.exports = { exporterCommandes, formaterMontant };
