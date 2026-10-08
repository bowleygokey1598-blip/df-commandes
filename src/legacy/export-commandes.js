// Export comptable des commandes, lancé chaque nuit par le cabinet comptable.
// Ne pas toucher : ça marche. (JM, 2021)
const TVA = 0.2;

function requete(db, sql, params, cb) {
  setImmediate(() => {
    let resultat;
    try {
      const stmt = db.prepare(sql);
      resultat = stmt.all(...params);
    } catch (erreur) {
      cb(erreur);
      return;
    }
    cb(null, resultat);
  });
}

function trouverClient(clients, clientId) {
  let clientTrouve = null;
  for (let index = 0; index < clients.length; index++) {
    if (clients[index].id === clientId) {
      clientTrouve = clients[index];
    }
  }
  return clientTrouve;
}

function calculerLignesCommande(lignes, commandeId) {
  let nombreLignes = 0;
  let totalHt = 0;
  for (let index = 0; index < lignes.length; index++) {
    if (lignes[index].commande_id === commandeId) {
      nombreLignes++;
      totalHt += lignes[index].quantite * lignes[index].prix_unitaire;
    }
  }
  return { nombreLignes, totalHt };
}

function formaterMontant(montant) {
  const arrondi = Math.round(montant * 100) / 100;
  let texte = String(arrondi);
  if (texte.indexOf('.') === -1) {
    return texte + ',00';
  }
  const parties = texte.split('.');
  if (parties[1].length === 1) {
    parties[1] += '0';
  }
  texte = parties[0] + ',' + parties[1];
  return texte;
}

function ajouterClientActif(clientsActifs, clientId) {
  for (let index = 0; index < clientsActifs.length; index++) {
    if (clientsActifs[index] === clientId) {
      return;
    }
  }
  clientsActifs.push(clientId);
}

function nettoyerChampCsv(valeur) {
  return valeur.indexOf(';') === -1 ? valeur : valeur.replace(/;/g, ',');
}

function exporterCommandes(db, depuis, callback) {
  let csv = 'numero;date;client;ville;nb_lignes;total_ht;total_ttc\n';
  requete(db, 'SELECT * FROM commandes WHERE date >= ? ORDER BY date, id', [depuis], (err, commandes) => {
    if (err) {
      callback(err);
      return;
    }
    requete(db, 'SELECT * FROM lignes_commande', [], (err2, lignes) => {
      if (err2) {
        callback(err2);
        return;
      }
      requete(db, 'SELECT * FROM clients', [], (err3, clients) => {
        if (err3) {
          callback(err3);
          return;
        }
        const clientsActifs = [];
        for (let index = 0; index < commandes.length; index++) {
          const commande = commandes[index];
          if (commande.statut === 'annulee') {
            continue;
          }
          const client = trouverClient(clients, commande.client_id);
          const lignesCommande = calculerLignesCommande(lignes, commande.id);
          const nom = nettoyerChampCsv(client ? client.nom : 'INCONNU');
          const ville = nettoyerChampCsv(client ? client.ville : '');
          const totalTtc = lignesCommande.totalHt * (1 + TVA);
          csv += commande.id + ';' + commande.date + ';' + nom + ';' + ville + ';'
            + lignesCommande.nombreLignes + ';' + formaterMontant(lignesCommande.totalHt) + ';'
            + formaterMontant(totalTtc) + '\n';
          ajouterClientActif(clientsActifs, commande.client_id);
        }
        csv += '# clients actifs;' + clientsActifs.length + '\n';
        callback(null, csv);
      });
    });
  });
}

module.exports = { exporterCommandes: exporterCommandes };
