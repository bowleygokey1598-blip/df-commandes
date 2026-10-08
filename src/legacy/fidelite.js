// Points de fidélité des clients, calculés pour le relevé mensuel.
// Repris de l'ancien prestataire en 2022, jamais documenté. Il tourne.
const MAX = 5000;
const x2 = 2;

function calculerFidelite(commandes, client, dateCalcul) {
  let d = new Date();
  if (dateCalcul) d = new Date(dateCalcul);
  const debut = new Date(d.getTime() - 365 * 24 * 60 * 60 * 1000);
  let pts = 0;
  for (let i = 0; i < commandes.length; i++) {
    const c = commandes[i];
    if (c.statut === 'annulee') {
      continue;
    }
    const dc = new Date(c.date);
    if (dc > debut) {
      if (dc <= d) {
        if (client.grandCompte === true || client.grand_compte === 1) {
          pts = pts + Math.floor(c.totalHt / 10) * x2;
        } else {
          pts = pts + Math.floor(c.totalHt / 10);
        }
      }
    }
  }
  pts = Math.min(pts, MAX);
  let palier = 'Bronze';
  if (pts >= 2000) {
    palier = 'Or';
  } else {
    if (pts > 500) {
      palier = 'Argent';
    }
  }
  return { points: pts, palier: palier };
}

module.exports = { calculerFidelite };
