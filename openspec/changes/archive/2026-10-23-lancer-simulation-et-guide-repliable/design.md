## Context

`ui.js` appelle `run()` 180 ms après chaque saisie, à chaque import, à chaque changement d'historique et d'onglet. Le guide est une `<section>` toujours dépliée en bas de page. Le pied de page contient un lien vers le dépôt GitHub.

## Goals / Non-Goals

**Goals :** l'utilisateur prépare ses données et ses réglages sans calcul intempestif, puis lance la simulation d'un geste ; la page reste compacte.

**Non-Goals :** déplacer le guide dans un onglet séparé ; mémoriser les réglages entre deux visites ; changer la méthode de calcul.

## Decisions

### Lancement explicite et résultats périmés

- Un bouton principal « Lancer la simulation », sous la question de l'onglet actif (tickets restants ou date cible). Entrée dans le champ de la question, le nombre de simulations ou la date de départ lance aussi la simulation.
- Une « signature » des entrées (données importées, historique, nombre de simulations, date de départ, et la valeur propre à l'onglet) est mémorisée avec chaque résultat. Quand la signature courante diffère de celle des résultats affichés, un bandeau signale qu'ils sont périmés et les résultats sont atténués, sans être effacés, pour garder un point de comparaison.
- Le graphique du débit hebdomadaire et les statistiques des données restent mis à jour immédiatement : ils décrivent les données, pas la simulation.
- Chaque onglet garde ses derniers résultats. Un onglet jamais simulé affiche « Lance la simulation pour voir la prévision » à la place des résultats.
- Les contrôles de validité (historique trop court, date cible trop proche, tickets restants à 0) s'affichent au clic, comme aujourd'hui.

Alternative écartée : désactiver le bouton tant que rien n'a changé. Relancer avec les mêmes réglages reste utile (le tirage aléatoire varie légèrement) et un bouton grisé sans explication déroute.

### Premier affichage

Une simulation « Quand ? » est lancée automatiquement une seule fois sur les données d'exemple : sans elle, la page s'ouvrirait sur un panneau vide et n'expliquerait pas ce qu'elle produit. L'onglet « Combien ? » attend un clic.

### Guide repliable

Élément natif `<details>` / `<summary>` : accessible au clavier, sans script, et le navigateur trouve le texte replié avec la recherche (Chrome, Edge, Firefox). Replié par défaut. Le lien du panneau des données ouvre le `<details>` avant de faire défiler. Le guide reste en bas de page plutôt que dans un onglet : il sert à préparer l'import, en dehors des deux questions.

### Exports limités à la clé et à la date

Le titre des tickets peut révéler des projets ou des clients et n'entre pas dans le calcul. Les modèles ne gardent que « Clé » (pour contrôler l'import) et « Résolu ». La lecture des fichiers ne change pas : un export qui contient encore « Résumé » est accepté, la colonne est simplement ignorée, et rien ne quitte le navigateur. Le guide l'indique pour que l'utilisateur retire la colonne dans Jira avant d'exporter.

### Pied de page

Le lien « Code source » est retiré ; le README reste la porte d'entrée du dépôt.

## Risks / Trade-offs

- Un utilisateur peut lire des résultats périmés sans relancer → bandeau visible au-dessus des tuiles et résultats atténués.
