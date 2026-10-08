// Fichier de la formation : ne pas modifier.
'use strict';

// Lance un vérificateur d'exercice du dépôt voisin df-verifications.
//   node scripts/verifier.js <vérificateur> [arguments]
// Appelé par npm run arrondi, arrondi:appli, prix, reference, recherche,
// devis-du-jour, recette, intersession, fusion et anonymat.

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const [nom, ...args] = process.argv.slice(2);
const dossier = path.resolve(__dirname, '..', '..', 'df-verifications');
const verificateur = path.join(dossier, `${nom}.js`);

if (!fs.existsSync(verificateur)) {
  console.log('Vérificateur introuvable : le dossier df-verifications doit être cloné');
  console.log(`à côté de df-commandes, ici : ${dossier}`);
  console.log('Dans un terminal ouvert sur le dossier qui contient df-commandes, tapez :');
  console.log('git clone https://github.com/alexxzee/df-verifications');
  process.exit(1);
}

const resultat = spawnSync(process.execPath, [verificateur, ...args], { stdio: 'inherit' });
process.exit(resultat.status ?? 1);
