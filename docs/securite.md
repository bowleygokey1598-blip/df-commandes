# Sécurité : procédure en cas de fuite de secret

## Ce qui s’est passé (rapport du TP3)

| Fuite | Où | Depuis |
|---|---|---|
| Clé de l’API transporteur dans `.env` | historique Git, commit « feat: annonce d’expédition au transporteur » | mai 2023 |
| Même clé en valeur par défaut dans `src/config.js` | code courant | mai 2023 |
| Instruction cachée pour un assistant IA | `docs/notes-fournisseur.md`, commentaire HTML | février 2024 |

## Ce qu’on fait, dans cet ordre

1. **Révoquer la clé** chez le transporteur et en émettre une nouvelle. Supprimer un fichier ne retire pas la clé de l’historique, ni des clones déjà faits : seule la révocation la rend inutile.
2. **Ranger la nouvelle clé** dans `.env` (local, ignoré par Git) et dans les secrets du dépôt GitHub (CI).
3. **Retirer la clé du code** : `src/config.js` ne lit plus que `process.env`.
4. **Déclarer les anciennes détections** dans `.gitleaksignore`, une fois la clé révoquée, pour que gitleaks ne bloque plus sur l’historique. Chaque empreinte se lit dans le rapport de `gitleaks git` (`Fingerprint`).
5. **Empêcher la récidive** : hook pre-commit gitleaks (`.githooks/pre-commit`, activé par `npm install`), `.env` dans `.gitignore`, règle dans `.github/copilot-instructions.md`.
6. **Réécrire l’historique** (`git filter-repo`) seulement si la politique de l’entreprise l’exige : c’est une opération lourde, qui oblige chaque développeur à recloner. Elle ne remplace jamais la révocation.

## Injection de prompt

L’instruction cachée de `docs/notes-fournisseur.md` a été retirée. Tout fichier venu de l’extérieur (fournisseur, ticket, page web) est relu avant d’être confié au mode agent, et toute modification proposée par l’agent est relue avant acceptation.
