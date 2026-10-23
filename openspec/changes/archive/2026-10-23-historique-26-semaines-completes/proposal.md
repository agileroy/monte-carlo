## Why

Avec `resolved >= -26w`, un export ne donne que 25 semaines complètes dans l'appli : `-26w` remonte exactement 26 × 7 jours depuis l'instant de la recherche (pas jusqu'à un lundi), et l'appli écarte la semaine en cours, incomplète. La semaine la plus ancienne n'est alors couverte qu'en partie et, si elle contient des tickets, elle compte comme une semaine faible qui tire la prévision vers le bas avec « 26 semaines » ou « Tout l'historique ».

## What Changes

- La requête d'historique du guide passe à `resolved >= -27w` : le choix « 26 semaines » utilise 26 semaines complètes ; la semaine partielle devient la 27e, prise en compte seulement avec « Tout l'historique ».
- Le texte de l'étape 2 explique pourquoi la requête remonte à 27 semaines.
- Le mode d'emploi du modèle Excel (généré depuis la même fonction) et le README suivent.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `jira-guide` : fenêtre de la requête d'historique portée à 27 semaines.

## Impact

- `site/js/jira.js` et ses tests, `site/index.html` (texte de l'étape 2), README. Aucune autre logique ne change.
