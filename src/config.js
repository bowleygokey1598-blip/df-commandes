'use strict';

module.exports = {
  port: Number(process.env.PORT) || 3000,
  transporteur: {
    url: 'https://api.transporteur-fictif.example/v2',
    cleApi: process.env.DF_TRANSPORTEUR_API_KEY,
  },
};
