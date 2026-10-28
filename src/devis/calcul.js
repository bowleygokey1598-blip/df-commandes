'use strict';

const TAUX_TVA = 0.2;
const SEUIL_PORT_GRATUIT = 500;
const FRAIS_PORT = 25;
const REMISE_GRAND_COMPTE = 0.05;
const PLAFOND_REMISE = 0.15;

/**
 * Arrondit un montant au centime le plus proche (docs/regles-remises.md § 6).
 * @param {number} montant Montant en euros.
 * @returns {number} Montant arrondi à deux décimales.
 */
function arrondir(montant) {
  // En virgule flottante, 1.005 * 100 vaut 100.49999999999999 : le produit est
  // ramené à 15 chiffres significatifs avant l'arrondi au centime le plus proche.
  return Math.round(Number((montant * 100).toPrecision(15))) / 100;
}

/**
 * Taux de remise sur quantité d'une ligne, seuils inclus (§ 2).
 * @param {number} quantite Quantité commandée sur la ligne.
 * @returns {number} Taux entre 0 et 0,12.
 */
function tauxRemiseQuantite(quantite) {
  if (quantite >= 100) return 0.12;
  if (quantite >= 50) return 0.08;
  if (quantite >= 10) return 0.05;
  return 0;
}

/**
 * Calcule le brut, la remise et le net d'une ligne de devis (§ 1 et 2).
 * @param {{reference: string, prix_ht: number}} produit Produit du catalogue.
 * @param {number} quantite Entier strictement positif.
 * @returns {{reference: string, quantite: number, prixUnitaire: number, brut: number, remise: number, net: number}}
 * @throws {Error} « Quantité invalide » si la quantité n'est pas un entier positif.
 */
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

/**
 * Calcule un devis complet : remises, plafond, port, TVA et arrondis (§ 1 à 7).
 * @param {{grand_compte: number}} client Client du devis ; grand_compte vaut 1 pour un grand compte.
 * @param {Array<{produit: {reference: string, prix_ht: number}, quantite: number}>} lignes Lignes du devis.
 * @returns {{lignes: object[], totalBrut: number, remiseClient: number, port: number, totalHT: number, tva: number, totalTTC: number}}
 * @throws {Error} si le devis est vide ou si une quantité est invalide.
 * @example
 * calculerDevis({ grand_compte: 0 }, [{ produit: { reference: 'VIS', prix_ht: 10 }, quantite: 10 }]);
 * // => { totalBrut: 100, port: 25, totalHT: 120, tva: 24, totalTTC: 144, ... }
 */
function calculerDevis(client, lignes) {
  if (!Array.isArray(lignes) || lignes.length === 0) {
    throw new Error('Un devis contient au moins une ligne');
  }
  const details = lignes.map((l) => calculerLigne(l.produit, l.quantite));
  const totalBrut = details.reduce((somme, d) => somme + d.brut, 0);
  let totalNet = details.reduce((somme, d) => somme + d.net, 0);

  let remiseClient = 0;
  if (client.grand_compte) {
    const remisesLignes = totalBrut - totalNet;
    const plafond = totalBrut * PLAFOND_REMISE;
    remiseClient = Math.min(totalNet * REMISE_GRAND_COMPTE, Math.max(0, plafond - remisesLignes));
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
