'use strict';

// Aucun secret dans le code : la clé vient uniquement de l'environnement
// (fichier .env non versionné en local, secret du dépôt en CI).
module.exports = {
  port: Number(process.env.PORT) || 3000,
  transporteur: {
    url: 'https://api.transporteur-fictif.example/v2',
    cleApi: process.env.DF_TRANSPORTEUR_API_KEY,
  },
};
