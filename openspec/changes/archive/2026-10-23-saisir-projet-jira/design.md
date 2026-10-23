## Context

Les requêtes sont écrites en dur dans deux `<pre>` de `index.html` ; `templates.js` en garde une copie (`JQL_HISTORY`) pour le mode d'emploi du modèle Excel. Les boutons « Copier la requête » copient le texte du `<pre>`.

## Goals / Non-Goals

**Goals :** des requêtes prêtes à coller pour le projet de l'utilisateur, sans retouche.

**Non-Goals :** vérifier que le projet existe dans Jira (aucun appel à Jira) ; personnaliser la version, la période ou les types de tickets ; mettre le projet dans le modèle Excel.

## Decisions

### Module pur `jira.js`

- `projectClause(input)` : texte nettoyé (espaces en trop retirés, 100 caractères au plus) ; vide → `EQ`. Une clé ou un nom fait uniquement de lettres, chiffres et `_` reste tel quel ; sinon il est mis entre guillemets doubles, les `"` et `\` internes étant échappés (`"Paiement \"mobile\""`). JQL accepte indifféremment la clé ou le nom après `project =`.
- `historyJql(project)` et `remainingJql(project)` renvoient les requêtes sur plusieurs lignes, identiques à celles d'aujourd'hui hormis le projet. `templates.js` utilise `historyJql()` sur une ligne pour le mode d'emploi, ce qui supprime la copie en dur.
- Testé avec `npm test` : clé simple, nom avec espaces, guillemets, vide, espaces superflus, longueur maximale.

### Interface

- Champ texte « Projet Jira (clé ou nom) » avec l'exemple `EQ` en texte indicatif, placé sous les deux colonnes d'introduction du guide déplié, au-dessus des étapes, pour qu'il soit vu avant de copier.
- Chaque saisie réécrit le texte des deux `<pre>` ; les boutons de copie ne changent pas puisqu'ils lisent le texte affiché.
- Mémorisation dans `localStorage` (`monte-carlo.jira-project`), lecture et écriture protégées comme pour le thème : sans stockage, le champ fonctionne simplement sans mémoire.
- Le projet reste dans le navigateur, comme les fichiers importés.

## Risks / Trade-offs

- Un nom de projet mal orthographié produit une requête qui ne renvoie rien dans Jira → le message d'erreur de Jira est explicite ; l'appli ne peut pas le vérifier sans connexion à Jira.
