## Why

Retours de l'auteur sur le guide Jira :
- l'étape 5 (« Compter les tickets restants ») apporte peu : sa requête doit de toute façon être adaptée dans Jira (version, epic…), et l'équipe connaît déjà son périmètre ;
- beaucoup de boards Jira couvrent plusieurs projets ou filtrent par composant, libellé ou équipe : le seul champ « Projet » ne permet pas de reproduire le périmètre réel d'un board.

## What Changes

- **Suppression de l'étape 5** et de sa requête. L'aide du champ « Tickets restants à terminer » ne renvoie plus vers elle.
- **Choix du périmètre** dans le guide : « Projet » (comportement actuel) ou « Requête du board ». En mode board, l'utilisateur colle la requête de filtre de son board (où la trouver est indiqué) ; la requête de l'étape 2 devient `(<requête du board>) AND statusCategory = Done AND resolved >= -26w AND issuetype not in subTaskIssueTypes() ORDER BY resolved ASC`, en retirant le `ORDER BY` éventuel de la requête collée.
- Le mode choisi, le projet et la requête du board sont mémorisés dans le navigateur.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `jira-guide` : une seule requête (historique), périmètre par projet ou par requête du board.

## Impact

- `site/js/jira.js` (périmètre, retrait du `ORDER BY`, suppression de la requête des tickets restants) et ses tests ; `site/index.html` (choix du périmètre, zone de saisie, étape 5 retirée, aide des tickets restants), `site/js/ui.js`, `site/app.css`.
