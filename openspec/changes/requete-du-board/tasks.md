## 1. Logique pure

- [ ] 1.1 `jira.js` : `stripOrderBy`, `scopeClause`, `historyJql(scope)` (projet ou requête du board), suppression de `remainingJql`. Vérification : tests (projet, requête multi-projets avec `ORDER BY Rank ASC`, `order by` minuscule, `ORDER BY` entre guillemets conservé, retours à la ligne, requête vide ou réduite à `ORDER BY`, 2 000 caractères).

## 2. Interface

- [ ] 2.1 `index.html` : choix « Projet » / « Requête du board », zone de texte avec l'aide « Paramètres du tableau › Général › Requête de filtre », étape 5 supprimée, aide du champ des tickets restants sans renvoi à l'étape 5.
- [ ] 2.2 `ui.js` : affichage du champ du mode choisi, mise à jour de la requête à chaque saisie ou changement de mode, invitations, mémorisation (`monte-carlo.jira-scope`, reprise de `monte-carlo.jira-project`). `app.css` : choix du mode et zone de texte.

## 3. Vérification

- [ ] 3.1 `npm test`.
- [ ] 3.2 Essai automatisé dans Chromium : un test par scénario de la spec (dont copie de la requête du board et mémorisation après rechargement), 390 px et 1280 px, thèmes clair et sombre ; captures.
