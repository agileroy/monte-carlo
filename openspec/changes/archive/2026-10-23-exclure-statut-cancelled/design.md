## Context

`historyJql()` produit : périmètre, `AND statusCategory = Done`, `AND resolved >= -27w`, `AND issuetype not in subTaskIssueTypes()`, `ORDER BY resolved ASC`. Le nom du statut d'annulation varie selon les workflows (« Cancelled », « Annulé », « Won't Do »…).

## Goals / Non-Goals

**Goals :** exclure par défaut les tickets annulés, avec une consigne claire quand le statut porte un autre nom.

**Non-Goals :** champ pour saisir le nom du statut (l'utilisateur adapte la requête dans Jira, comme il l'a demandé) ; exclusion par résolution (`resolution`), dont les valeurs varient tout autant.

## Decisions

- Ligne `AND status != "Cancelled"` juste après `AND statusCategory = Done`, entre guillemets pour supporter un nom avec espaces une fois adapté.
- Note sous la requête de l'étape 2, en encadré discret : « La ligne `AND status != "Cancelled"` écarte les tickets annulés, qui ne sont pas du travail livré. Si ce statut porte un autre nom dans ton projet (par exemple « Annulé »), adapte-le dans Jira, ou retire la ligne s'il n'existe pas : Jira signale une erreur pour un statut inconnu. »
- Mode d'emploi du modèle Excel : même consigne en une ligne.

## Risks / Trade-offs

- Projet sans statut « Cancelled » : Jira refuse la requête avec un message explicite → la note dit quoi faire.
