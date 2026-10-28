'use strict';

// Tests écrits depuis docs/regles-remises.md, pas depuis le code :
// chaque test cite la règle qu'il vérifie.

// Ce fichier teste le module src/devis/calcul.js (prix d'une ligne, remises,
// plafond, frais de port, TVA, arrondis). C'est le corrigé du TP1 (ch02, tests
// écrits depuis la spec) : un describe par paragraphe de docs/regles-remises.md.
// Lancé contre le code d'origine de main, il donne 5 échecs, un par défaut caché :
// - seuil de 10 unités exclu au lieu d'inclus (§ 2) : 3 échecs ;
// - plafond de remise à 15 % absent (§ 4) : 1 échec ;
// - arrondi de 1,005 à 1,00 au lieu de 1,01 (§ 6) : 1 échec.
// Sur les branches corrige/*, le code est corrigé et les 26 tests passent.
// Au ch06, le participant ajoute en bas de ce fichier un test faux (881 attendu
// au lieu de 880) pour voir la CI bloquer, puis le retire.

const { describe, test } = require('node:test'); // describe regroupe les tests par paragraphe de la spec
const assert = require('node:assert/strict'); // comparaisons strictes
const { calculerDevis, calculerLigne, tauxRemiseQuantite, arrondir } = require('../../src/devis/calcul'); // fonctions testées

const vis = { reference: 'VIS', prix_ht: 10 }; // produit à 10 € HT : les calculs se font de tête
const client = { grand_compte: 0 }; // client ordinaire : pas de remise grand compte
const grandCompte = { grand_compte: 1 }; // client grand compte : 5 % supplémentaires (§ 3)

// § 1 : le brut d'une ligne, et le refus des quantités invalides.
describe('§ 1. Prix d’une ligne', () => {
  // Données : 3 vis à 10 €. Attendu : 30 € brut (prix unitaire x quantité).
  test('le brut est le prix unitaire multiplié par la quantité', () => {
    assert.equal(calculerLigne(vis, 3).brut, 30);
  });

  // Un test par valeur refusée par la règle "entier strictement positif" :
  // zéro, négatif, décimal, texte "3" (un nombre en chaîne, piège classique d'un
  // formulaire) et null. Attendu : une erreur dont le message contient
  // "Quantité invalide". Le défaut attrapé : une quantité qui passe sans contrôle.
  // Le code d'origine respecte déjà cette règle : ces 5 tests restent verts.
  for (const quantite of [0, -1, 2.5, '3', null]) { // les cinq formes de quantité invalide
    test(`la quantité ${JSON.stringify(quantite)} est refusée`, () => { // JSON.stringify affiche "3" entre guillemets, distinct de 3
      assert.throws(() => calculerLigne(vis, quantite), /Quantité invalide/); // l'appel doit lever une erreur, avec ce message
    });
  }
});

// § 2 : le taux de remise selon la quantité, seuils inclus.
describe('§ 2. Remise sur quantité, seuils inclus', () => {
  // Chaque paire [quantité, taux attendu] teste les deux bords de chaque tranche :
  // 9 et 10, 49 et 50, 99 et 100, plus 1 et 500 aux extrémités. Le cas [10, 0.05]
  // attrape le défaut du code d'origine (remise à partir de 11, seuil exclu).
  const cas = [[1, 0], [9, 0], [10, 0.05], [49, 0.05], [50, 0.08], [99, 0.08], [100, 0.12], [500, 0.12]]; // dernier sans remise, premier remisé, à chaque seuil
  for (const [quantite, taux] of cas) {
    test(`${quantite} unités donnent ${taux * 100} %`, () => { // un test par paire : le nom dit la quantité fautive
      assert.equal(tauxRemiseQuantite(quantite), taux);
    });
  }

  // Le même seuil vu sur une ligne entière : 10 vis à 10 €.
  // Attendu : 100 € brut, 5 € de remise (5 %), 95 € net. Échoue avec le seuil exclu.
  test('une ligne de 10 unités à 10 € coûte 95 € net', () => {
    const ligne = calculerLigne(vis, 10);
    assert.deepEqual([ligne.brut, ligne.remise, ligne.net], [100, 5, 95]); // les trois montants en une comparaison
  });
});

// § 3 : remise de 5 % pour un grand compte, appliquée après les remises de ligne.
describe('§ 3. Remise grand compte', () => {
  // Données : grand compte, 60 vis à 10 €. Attendu : remise client 27,60 et
  // total HT 524,40. Le défaut attrapé : 5 % calculés sur le brut (30) au lieu
  // du total après remise de ligne (27,60).
  test('5 % supplémentaires sur le total après remises de ligne', () => {
    const devis = calculerDevis(grandCompte, [{ produit: vis, quantite: 60 }]); // 60 : tranche à 8 %, sous le plafond de 15 %
    // 600 brut, 8 % de remise ligne = 552, puis 5 % = 27,60
    assert.equal(devis.remiseClient, 27.6);
    assert.equal(devis.totalHT, 524.4); // 552 - 27,60 ; port offert car >= 500
  });

  // Même commande pour un client ordinaire : aucune remise client.
  test('un client ordinaire n’a pas de remise grand compte', () => {
    assert.equal(calculerDevis(client, [{ produit: vis, quantite: 60 }]).remiseClient, 0);
  });
});

// § 4 : le total des remises ne dépasse jamais 15 % du brut ; c'est la remise
// grand compte qui est réduite.
describe('§ 4. Plafond de remise à 15 % du brut', () => {
  // Données : grand compte, 100 vis (tranche à 12 %). Sans plafond : 120 + 5 % de
  // 880 = 164 de remises, au-delà de 150. Attendu : remise client ramenée à 30,
  // total HT 850. Le défaut attrapé : le plafond absent du code d'origine.
  test('la remise grand compte est réduite pour respecter le plafond', () => {
    const devis = calculerDevis(grandCompte, [{ produit: vis, quantite: 100 }]); // 100 : plus forte remise de ligne, plafond franchi
    // 1000 brut, 12 % ligne = 120, plafond 150 : la remise client est ramenée à 30
    assert.equal(devis.remiseClient, 30); // 150 - 120
    assert.equal(devis.totalHT, 850); // 1000 - 150 ; port offert car >= 500
  });

  // Cas inverse : sous le plafond, la remise client n'est pas touchée.
  // Données : grand compte, 10 vis. Attendu : 4,75 (5 % de 95).
  // Sur le code d'origine, ce test échoue aussi, mais à cause du seuil de 10
  // (§ 2) : sans remise de ligne, la remise client vaut 5 % de 100 = 5.
  test('sous le plafond, la remise grand compte est entière', () => {
    const devis = calculerDevis(grandCompte, [{ produit: vis, quantite: 10 }]);
    // 100 brut, 5 net de remise ligne, 95 * 5 % = 4,75 ; total remises 9,75 < 15
    assert.equal(devis.remiseClient, 4.75);
  });
});

// § 5 : 25 € de port sous 500 € HT remisé, offerts à partir de 500 € (inclus),
// et le port entre dans la base de TVA.
describe('§ 5. Frais de port', () => {
  // Données : 49 vis, soit 490 brut, 465,50 après 5 % : sous 500. Attendu : 25.
  test('25 € sous 500 € HT remisé', () => {
    assert.equal(calculerDevis(client, [{ produit: vis, quantite: 49 }]).port, 25); // 49 : plus grosse quantité sans passer à 8 %
  });

  // Données : 1 produit à 500 € pile, sans remise. Attendu : port 0, total 500.
  // Le défaut attrapé : un "> 500" au lieu de ">= 500" sur le seuil inclus.
  test('offerts à exactement 500 € HT remisé', () => {
    const devis = calculerDevis(client, [{ produit: { reference: 'P', prix_ht: 500 }, quantite: 1 }]); // quantité 1 : aucune remise, le HT vaut exactement 500
    assert.equal(devis.port, 0);
    assert.equal(devis.totalHT, 500); // pas de port ajouté
  });

  // Données : 1 vis à 10 €, donc 25 € de port. Attendu : HT 35 (10 + 25),
  // TVA 7 (20 % de 35, port compris), TTC 42. Le défaut attrapé : une TVA
  // calculée sur les seuls produits (elle vaudrait 2).
  test('le port entre dans la base de TVA', () => {
    const devis = calculerDevis(client, [{ produit: vis, quantite: 1 }]);
    assert.deepEqual([devis.totalHT, devis.tva, devis.totalTTC], [35, 7, 42]);
  });
});

// § 6 : TVA à 20 % sur le HT déjà arrondi, arrondi au centime le plus proche.
describe('§ 6. TVA et arrondis', () => {
  // Données : 3 unités à 3,75 €, 11,25 de produits, 25 de port.
  // Attendu : HT 36,25, TVA 7,25, TTC 43,50 (TTC = HT + TVA, tous deux arrondis).
  test('la TVA se calcule sur le HT arrondi', () => {
    const devis = calculerDevis(client, [{ produit: { reference: 'R', prix_ht: 3.75 }, quantite: 3 }]); // 3 unités : pas de remise
    // 11,25 + 25 de port = 36,25 HT ; TVA 7,25 ; TTC 43,50
    assert.deepEqual([devis.totalHT, devis.tva, devis.totalTTC], [36.25, 7.25, 43.5]);
  });

  // Le centime fantôme : en virgule flottante, 1,005 x 100 vaut 100,4999...,
  // et Math.round(montant * 100) / 100 donne 1,00. La règle "centime le plus
  // proche" exige 1,01. Le défaut attrapé : l'arrondi naïf du code d'origine.
  test('une ligne de 1 unité à 1,005 € HT coûte 1,01 € net', () => {
    const devis = calculerDevis(client, [{ produit: { reference: 'C', prix_ht: 1.005 }, quantite: 1 }]); // 1,005 : valeur que le flottant ne représente pas exactement
    // 1,005 arrondi au centime le plus proche : 1,01 ; avec 25 de port : 26,01 HT
    assert.equal(devis.lignes[0].net, 1.01);
    assert.equal(devis.totalHT, 26.01);
  });

  // arrondir() appelée directement : elle ne doit pas abîmer les cas ordinaires.
  test('arrondir conserve deux décimales', () => {
    assert.equal(arrondir(1.005 * 1000), 1005); // 1.005 * 1000 vaut 1004.9999999999999 : doit revenir à 1005 (une troncature donnerait 1004.99)
    assert.equal(arrondir(2.344), 2.34); // troisième décimale < 5 : arrondi vers le bas
    assert.equal(arrondir(2.346), 2.35); // troisième décimale > 5 : arrondi vers le haut
  });
});

// § 7 : un devis sans ligne est refusé, avec un message qui contient
// "au moins une ligne". Le code d'origine respecte déjà cette règle.
describe('§ 7. Devis vide', () => {
  test('un devis sans ligne est refusé', () => {
    assert.throws(() => calculerDevis(client, []), /au moins une ligne/); // liste de lignes vide
  });
});

// Piège 1 : test volontairement faux, retiré plus loin.
{
  const { test } = require('node:test'); // outil de test intégré à Node.js
  const assert = require('node:assert/strict'); // comparaison qui échoue au moindre écart
  const { calculerDevis } = require('../../src/devis/calcul'); // la fonction testée

  test('piège 1 : 100 vis à 10 € pour un client ordinaire', () => {
    const vis = { reference: 'VIS', prix_ht: 10 }; // un produit à 10 € HT
    const devis = calculerDevis({ grand_compte: 0 }, [{ produit: vis, quantite: 100 }]); // devis de 100 vis
    assert.equal(devis.totalHT, 881); // faux exprès : le bon total est 880
  });
}
