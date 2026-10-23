## Why

Les deux requêtes JQL du guide contiennent `project = EQ` : l'utilisateur doit penser à remplacer `EQ` après avoir copié la requête, ce qui est source d'oubli et d'erreur (une requête sur le mauvais projet renvoie de mauvaises données sans alerte).

## What Changes

- Un champ « Projet Jira » en tête du guide déplié, avant les étapes. La saisie met à jour immédiatement les deux requêtes affichées, et donc ce que copient les boutons « Copier la requête ».
- Le champ accepte la clé (`PAY`) ou le nom du projet (`Paiement mobile`) ; un nom qui contient des espaces ou des caractères spéciaux est mis entre guillemets dans la requête.
- Champ vide : les requêtes gardent l'exemple `EQ` et le texte rappelle de saisir le projet.
- Le projet saisi est mémorisé dans le navigateur et reproposé à la visite suivante.
- Le texte de l'étape « Coller la requête » ne demande plus de remplacer `EQ` à la main.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `jira-guide` : champ de projet et requêtes générées.

## Impact

- Nouveau module pur `site/js/jira.js` (mise en forme du projet, construction des requêtes) et ses tests ; `templates.js` réutilise la requête d'historique ; `site/index.html` (champ, requêtes), `site/js/ui.js`, `site/app.css`.
- Hors périmètre, à voir ensuite si utile : un champ pour la version de la seconde requête.
