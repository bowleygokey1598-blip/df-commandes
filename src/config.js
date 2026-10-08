'use strict';

// Valeur par défaut temporaire pour que l'appli démarre en local
const TRANSPORTEUR_API_KEY = 'dftr_live_R713KRpj65mfjxzZEKk6swxD3kADMjyz';

module.exports = {
  port: Number(process.env.PORT) || 3000,
  transporteur: {
    url: 'https://api.transporteur-fictif.example/v2',
    cleApi: process.env.DF_TRANSPORTEUR_API_KEY || TRANSPORTEUR_API_KEY,
  },
};
