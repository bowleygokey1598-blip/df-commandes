# Changelog

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versions selon [SemVer](https://semver.org/lang/fr/).

## [1.5.0] - non publiée

### Ajouté
- Tests du calcul des devis écrits depuis `docs/regles-remises.md` (couverture de `src/devis/calcul.js` à 100 %).
- JSDoc des fonctions de calcul et des routes, README complet.

### Corrigé
- La remise sur quantité s’applique dès 10 unités, seuil inclus, comme le prévoit la spec.
- Le cumul des remises est plafonné à 15 % du brut ; la remise grand compte est réduite d’autant.
- Les montants s’arrondissent au centime le plus proche, y compris au demi-centime : 1,005 € donne 1,01 € (l’arrondi en virgule flottante donnait 1 €).

## [1.4.2] - 2024-02-08

### Ajouté
- Notes d’intégration du fournisseur Matériaux Rivière.
