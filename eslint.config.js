// Fichier de la formation : ne pas modifier.
'use strict';

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/', 'coverage/'] },
  js.configs.recommended,
  {
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      complexity: ['warn', 10],
      'max-depth': ['warn', 4],
      'no-var': 'warn',
      eqeqeq: 'warn',
    },
  },
];
