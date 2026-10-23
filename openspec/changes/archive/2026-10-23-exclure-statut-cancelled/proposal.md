## Why

La requête d'historique prend tous les tickets de la catégorie « Terminé ». Or, dans les projets de l'auteur, les tickets annulés (statut « Cancelled ») sont aussi dans cette catégorie : ils ne correspondent à aucun travail livré et gonflent le débit, donc rendent la prévision trop optimiste.

## What Changes

- La requête d'historique du guide ajoute `AND status != "Cancelled"`, en mode projet comme en mode requête du board.
- Une note sous la requête explique pourquoi et rappelle d'adapter le nom du statut (par exemple « Annulé ») ou de retirer la ligne s'il n'existe pas dans le projet : Jira signale alors une erreur.
- Le mode d'emploi du modèle Excel (généré depuis la même fonction) et le README suivent.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `jira-guide` : exclusion du statut « Cancelled » et note d'adaptation.

## Impact

- `site/js/jira.js` et ses tests, `site/index.html` (note de l'étape 2), `site/js/templates.js` (mode d'emploi), README.
