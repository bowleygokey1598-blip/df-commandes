'use strict';

const SEUIL_ACOMPTE = 1000;
const TAUX_ACOMPTE = 0.3;
const DELAI_SOLDE_JOURS = 30;

function arrondir(montant) {
  return Math.round(montant * 100) / 100;
}

function conditionsPaiement(client, totalTTC) {
  if (typeof totalTTC !== 'number' || !(totalTTC > 0)) {
    throw new Error('Total TTC invalide');
  }
  let acompte = 0;
  if (!client.grand_compte && totalTTC > SEUIL_ACOMPTE) {
    acompte = arrondir(totalTTC * TAUX_ACOMPTE);
  }
  return {
    acompte,
    solde: arrondir(totalTTC - acompte),
    delaiSoldeJours: DELAI_SOLDE_JOURS,
  };
}

module.exports = { conditionsPaiement };
