## Why

Les équipes s'engagent sur des dates à partir d'estimations, souvent fausses et coûteuses à produire. Leur débit réel (tickets terminés par semaine) est déjà dans Jira : rejouer des milliers de futurs possibles à partir de cet historique donne une prévision probabiliste (« 85 % de chances de finir avant le 18 décembre ») plus honnête qu'une date unique, sans estimer quoi que ce soit.

Une première version a été prototypée sous forme de page unique (Chart.js et SheetJS chargés depuis des CDN, polices Google). Ce changement en fait un projet aligné sur matrice-competences et poker-planning : modules sans dépendance tierce, tests, publication automatique.

## What Changes

- **Importer les données** : fichier CSV ou Excel (.xlsx), une ligne par ticket terminé (format d'un export Jira) ou un débit déjà agrégé par semaine. La colonne de date est détectée automatiquement ; la semaine en cours, incomplète, est ignorée. Données d'exemple au premier affichage.
- **Télécharger un modèle** Excel ou CSV, prérempli de lignes d'exemple, avec un mode d'emploi dans le modèle Excel.
- **Régler la simulation** : historique utilisé (8, 12, 16, 26 semaines ou tout), nombre de simulations (10 000 par défaut), date de départ.
- **Deux questions** : « Quand aura-t-on fini ? » et « Combien d'ici une date ? ». Résultats en tuiles P50, P85, P95, histogramme des simulations coloré par zone (risqué, probable, sûr), courbe de probabilité cumulée avec les seuils, phrase de synthèse à copier.
- **Guide Jira intégré** : données requises, bonnes pratiques, étapes d'export et requêtes JQL à copier.
- **Projet** : code dans `site/` en modules ES ; lecture et écriture des `.xlsx` par `xlsx-lite.js` (repris de matrice-competences) au lieu de SheetJS ; graphiques SVG maison au lieu de Chart.js ; polices système ; tests Node ; publication GitHub Pages par GitHub Actions après les tests.

## Capabilities

### New Capabilities

- `data-import` : import CSV et Excel, détection de la date, débit hebdomadaire, données d'exemple.
- `data-template` : modèles Excel et CSV téléchargeables.
- `forecast` : réglages, simulations « Quand ? » et « Combien ? », résultats et graphiques.
- `jira-guide` : guide d'extraction des données depuis Jira.
- `site-publication` : publication, interface, thème, confidentialité des données.

### Modified Capabilities

_Aucune._

## Impact

- Remplace `index.html` à la racine par `site/` (`index.html`, `app.css`, `js/forecast-core.js`, `js/xlsx-lite.js`, `js/charts.js`, `js/templates.js`, `js/theme.js`, `js/ui.js`), ajoute `tests/`, `package.json` et `.github/workflows/pages.yml`.
- GitHub Pages doit être configuré avec la source « GitHub Actions » au lieu de « Deploy from a branch ».
- Le fichier `.xls` (ancien format Excel) n'est plus accepté : `xlsx-lite.js` ne lit que le `.xlsx`.
