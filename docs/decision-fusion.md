# Décision de fusion : `nomFichierExport`

La proposition : `exercices/fusion/proposition.js`, ses tests `exercices/fusion/proposition-tests.js` et le message de l’assistant `exercices/fusion/message-assistant.txt`.

| Portique | Réponse (oui ou non) | Preuve |
|---|---|---|
| 1. Je sais l’expliquer ? | oui | Karim : relue ligne à ligne, cinq transformations de texte |
| 2. Lint et tests au vert ? | oui | Karim : `npm run proposition` : aucune alerte d’ESLint, `ℹ tests 3`, `ℹ fail 0` |
| 3. Analyse de sécurité propre ? | oui | Karim : ni entrée réseau, ni accès disque, ni requête ; aucune alerte |
| 4. Dépendances vérifiées, licences ? | non | `npm view slugify-fr-safe` : `npm error 404 Not Found`, le paquet recommandé n’existe pas ; `npm view slugify license` : `MIT`, licence permissive, compatible avec le projet |
| 5. Conforme aux conventions ? | oui | Karim : nom en français, module CommonJS comme le reste du projet |

Verdict (« on fusionne », ou « corriger » ou « refuser », avec ce qui bloque) : corriger. On fusionne la fonction et ses tests, sans `slugify-fr-safe`, paquet inexistant qu’un tiers pourrait publier demain sous ce nom. Pour les ligatures, `slugify` existe et sa licence MIT convient au projet : à proposer à l’équipe, pas à installer d’office.
