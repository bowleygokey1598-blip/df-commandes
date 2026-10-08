'use strict';

const TAUX_TVA = 0.2;
const SEUIL_PORT_GRATUIT = 500;
const FRAIS_PORT = 25;
const REMISE_GRAND_COMPTE = 0.05;

function arrondir(montant) {
  return Math.round(montant * 100) / 100;
}

function tauxRemiseQuantite(quantite) {
  if (quantite >= 100) return 0.12;
  if (quantite >= 50) return 0.08;
  if (quantite > 10) return 0.05;
  return 0;
}

function calculerLigne(produit, quantite) {
  if (!Number.isInteger(quantite) || quantite <= 0) {
    throw new Error('Quantité invalide');
  }
  const brut = produit.prix_ht * quantite;
  const remise = brut * tauxRemiseQuantite(quantite);
  return {
    reference: produit.reference,
    quantite,
    prixUnitaire: produit.prix_ht,
    brut: arrondir(brut),
    remise: arrondir(remise),
    net: arrondir(brut - remise),
  };
}

function calculerDevis(client, lignes) {
  if (!Array.isArray(lignes) || lignes.length === 0) {
    throw new Error('Un devis contient au moins une ligne');
  }
  const details = lignes.map((l) => calculerLigne(l.produit, l.quantite));
  const totalBrut = details.reduce((somme, d) => somme + d.brut, 0);
  let totalNet = details.reduce((somme, d) => somme + d.net, 0);

  let remiseClient = 0;
  if (client.grand_compte) {
    remiseClient = totalNet * REMISE_GRAND_COMPTE;
    totalNet -= remiseClient;
  }

  const port = totalNet >= SEUIL_PORT_GRATUIT ? 0 : FRAIS_PORT;
  const totalHT = arrondir(totalNet + port);
  const tva = arrondir(totalHT * TAUX_TVA);

  return {
    lignes: details,
    totalBrut: arrondir(totalBrut),
    remiseClient: arrondir(remiseClient),
    port,
    totalHT,
    tva,
    totalTTC: arrondir(totalHT + tva),
  };
}

module.exports = { calculerDevis, calculerLigne, tauxRemiseQuantite, arrondir };
