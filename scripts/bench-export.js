// Fichier de la formation : ne pas modifier.
'use strict';

// Mesure le temps de l'export comptable sur un volume réaliste.
// Usage : npm run bench            (5 000 commandes)
//         npm run bench -- 20000   (volume personnalisé)

const { ouvrirBase, peupler } = require('../src/db');
const { exporterCommandes } = require('../src/legacy/export-commandes');

const volume = Number(process.argv[2]) || 5000;
const db = peupler(ouvrirBase(), { commandes: volume, graine: 7 });

function exporter() {
  return new Promise((resolve, reject) => {
    exporterCommandes(db, '2000-01-01', (err, csv) => (err ? reject(err) : resolve(csv)));
  });
}

(async () => {
  await exporter();
  const mesures = [];
  for (let i = 0; i < 5; i++) {
    const debut = process.hrtime.bigint();
    await exporter();
    mesures.push(Number(process.hrtime.bigint() - debut) / 1e6);
  }
  mesures.sort((a, b) => a - b);
  console.log(`${volume} commandes : médiane ${mesures[2].toFixed(1)} ms (min ${mesures[0].toFixed(1)}, max ${mesures[4].toFixed(1)})`);
})();
