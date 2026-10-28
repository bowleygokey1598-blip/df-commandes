# Fuite de la clé du transporteur

## Ce qui a fui

| Fuite | Fichier | Commit | Fichier encore présent ? |
|---|---|---|---|
| clé du transporteur | .env | 1ddf3b0 | non, lisible avec git show 1ddf3b0:.env |
| clé du transporteur, en valeur par défaut | src/config.js | 91f0955 | oui |

## Ce qu’on fait, dans l’ordre

1. Révoquer la clé chez le transporteur et en émettre une nouvelle : c’est la seule étape qui rend la fuite inoffensive.
2. Ranger la nouvelle clé dans .env en local et dans les secrets du dépôt pour la CI.
3. Prévenir la récidive : clé lue dans l’environnement, .env ignoré, hook gitleaks, règle dans les instructions de l’assistant.

Le hook n’a pas vu : le mot de passe de la base (ligne 2 de piege.js), parce qu’il ressemble à un mot ordinaire suivi d’une année, pas à une clé aléatoire.
