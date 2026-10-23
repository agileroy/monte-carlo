## 1. Structure du projet

- [ ] 1.1 Dossier `site/` (`index.html`, `app.css`, `js/`), `package.json` (`npm test` avec `node --test`), `tests/`, retrait de l'`index.html` racine et des dépendances CDN (Chart.js, SheetJS, polices Google).
- [ ] 1.2 Workflow `.github/workflows/pages.yml` : tests sur chaque push et pull request, publication de `site/` sur GitHub Pages depuis `main` seulement si les tests passent, versionnage des fichiers contre le cache.

## 2. Logique pure

- [ ] 2.1 `forecast-core.js` : lecture des dates, lecture CSV, interprétation des lignes (colonne de date, format agrégé, erreurs), semaines (lundi, semaines à 0, semaine en cours), données d'exemple, simulations « Quand ? » et « Combien ? » avec fonction aléatoire injectable, percentiles, zones, histogramme regroupé, courbe cumulée, phrases de synthèse. Vérification : un test par scénario des specs `data-import` et `forecast`.
- [ ] 2.2 `xlsx-lite.js` repris de matrice-competences, et `templates.js` (contenu des modèles Excel et CSV). Vérification : tests d'aller-retour (modèle écrit puis relu et interprété), lecture du premier onglet de données, refus d'un fichier qui n'est pas un classeur.

## 3. Interface

- [ ] 3.1 `charts.js` : histogramme, courbe cumulée avec repères et points, barres d'historique, en SVG aux couleurs du thème, infobulle au survol et au toucher.
- [ ] 3.2 `ui.js` : import (glisser-déposer, clavier), messages, statistiques, réglages, onglets, tuiles, synthèse et copie, téléchargement des modèles, lien vers le guide ; `theme.js` et script de thème en tête de page.
- [ ] 3.3 Guide Jira dans la page, requêtes copiables.
- [ ] 3.4 Vérification : essai automatisé dans Chromium (import du modèle téléchargé, import CSV Jira, deux onglets, erreurs) à 390 px et 1280 px, thèmes clair et sombre, sans requête vers un autre domaine ; captures.

## 4. Documentation

- [ ] 4.1 README : utilisation, format des données, export Jira, méthode, structure du projet, tests, activation de GitHub Pages par GitHub Actions.
