// Fichier de la formation : ne pas modifier.
// Proposition d'un assistant, à évaluer avant fusion (micro-exercice du ch04).
// Demande de Karim : « Écris une fonction qui transforme une raison sociale
// en nom de fichier d'export comptable, sans accent ni espace. »
'use strict';

function nomFichierExport(raisonSociale, date) {
  const base = raisonSociale
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base}-${date}.csv`;
}

module.exports = { nomFichierExport };
