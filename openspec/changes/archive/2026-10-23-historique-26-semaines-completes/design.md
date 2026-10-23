## Context

`historyJql()` produit `resolved >= -26w`. L'appli découpe les semaines du lundi au dimanche et retire la semaine en cours pour un export « une ligne par ticket ». La sélection d'historique propose au plus « 26 semaines », puis « Tout l'historique ».

## Goals / Non-Goals

**Goals :** 26 semaines complètes disponibles pour le réglage « 26 semaines ».

**Non-Goals :** détecter et retirer automatiquement une semaine partielle (l'appli ne connaît pas la date de la recherche Jira) ; changer le découpage des semaines.

## Decisions

### `-27w` plutôt que `startOfWeek()`

`-27w` couvre 26 semaines complètes avant la semaine en cours, plus une partie de la 27e. Alternative écartée : `startOfWeek(-26w)`, qui démarrerait sur une limite de semaine, mais Jira Cloud fait commencer la semaine le dimanche par défaut alors que l'appli découpe du lundi au dimanche : la première semaine de l'appli ne contiendrait que ce dimanche. Un décalage du type `startOfWeek(-181d)` dépendrait du réglage de début de semaine de chaque instance Jira.

### Texte de l'étape 2

« Elle récupère les tickets terminés du périmètre choisi ci-dessus sur les 27 dernières semaines, sans sous-tâches : la semaine en cours étant écartée, tu disposes ainsi de 26 semaines complètes. »

## Risks / Trade-offs

- « Tout l'historique » inclut la 27e semaine, partielle → limite connue, documentée par le texte de l'étape ; le réglage par défaut (12 semaines) et « 26 semaines » ne sont pas concernés.
