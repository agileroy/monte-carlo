## Context

`jira.js` construit `historyJql(project)` et `remainingJql(project)` ; le guide affiche les deux, avec un champ « Projet Jira » mémorisé (`monte-carlo.jira-project`).

## Goals / Non-Goals

**Goals :** une requête d'historique prête à coller, qui reprend exactement le périmètre du board de l'équipe quand il ne se résume pas à un projet.

**Non-Goals :** valider la syntaxe JQL (seul Jira peut le faire) ; récupérer la requête du board automatiquement (aucune connexion à Jira).

## Decisions

### Combinaison avec la requête du board

- La requête collée est mise entre parenthèses, car elle peut contenir des `OR` : sans parenthèses, `A OR B AND statusCategory = Done` ne filtrerait que B.
- JQL n'accepte `ORDER BY` qu'en fin de requête : celui de la requête du board (souvent `ORDER BY Rank ASC`) est retiré avant l'ajout des conditions. La recherche du `ORDER BY` ignore le texte entre guillemets simples ou doubles, pour ne pas couper une valeur comme `summary ~ "order by"`.
- La requête collée est nettoyée (retours à la ligne et espaces multiples ramenés à un espace, 2 000 caractères au plus). Vide, ou réduite à un `ORDER BY`, elle est remplacée par l'exemple `project = EQ` avec une invitation à coller la requête.
- `jira.js` expose `scopeClause({ mode, project, filter })`, `stripOrderBy(jql)` et `historyJql(scope, separator)` ; `historyJql` accepte encore un simple nom de projet (utilisé par le mode d'emploi du modèle Excel). `remainingJql` est supprimé.

### Interface

- Deux boutons radio « Projet » et « Requête du board », puis le champ du mode choisi : champ texte pour le projet, zone de texte pour la requête. Le champ de l'autre mode est masqué mais garde sa valeur.
- Aide du mode board : dans Jira, « Paramètres du tableau › Général › Requête de filtre ».
- Mémorisation dans `localStorage` (`monte-carlo.jira-scope` : mode, projet, requête), lecture et écriture protégées ; l'ancienne clé `monte-carlo.jira-project` est reprise si elle existe.
- Étape 5 supprimée ; l'aide du champ « Tickets restants à terminer » devient : compter dans Jira les tickets non terminés du périmètre (version, epic, release), sans sous-tâches.

## Risks / Trade-offs

- Une requête de board invalide produit une requête invalide → Jira l'indique à l'utilisateur au moment de la recherche.
