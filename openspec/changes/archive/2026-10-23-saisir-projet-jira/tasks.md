## 1. Logique pure

- [x] 1.1 `site/js/jira.js` : `projectClause`, `historyJql`, `remainingJql` ; `templates.js` utilise `historyJql()` pour le mode d'emploi à la place de `JQL_HISTORY`. Vérification : `tests/jira.test.mjs` (clé, nom avec espaces, guillemets et barre oblique inverse, vide, espaces superflus, 100 caractères) et tests des modèles inchangés.

## 2. Interface

- [x] 2.1 `index.html` : champ « Projet Jira (clé ou nom) » au-dessus des étapes du guide, texte de l'étape 2 sans « Remplace EQ », requêtes remplies par le script.
- [x] 2.2 `ui.js` : mise à jour des deux requêtes à chaque saisie, invitation quand le champ est vide, mémorisation dans le navigateur (lecture et écriture protégées). `app.css` : champ texte.

## 3. Vérification

- [x] 3.1 `npm test`.
- [x] 3.2 Essai automatisé dans Chromium : un test par scénario de la spec (clé, nom avec espaces, champ vidé, projet mémorisé après rechargement, copie de la requête affichée), 390 px et 1280 px, thèmes clair et sombre ; captures.
