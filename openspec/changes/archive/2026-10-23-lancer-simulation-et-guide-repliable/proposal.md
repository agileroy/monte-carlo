## Why

Premiers retours de l'auteur sur la version en ligne :
- la prévision se relance à chaque modification, alors qu'on veut d'abord déposer le fichier et ajuster les réglages, puis lancer la simulation quand tout est prêt ;
- le guide Jira, toujours déplié en bas de page, prend beaucoup de place alors qu'on ne le consulte qu'à la préparation des données ;
- le lien « Code source » du pied de page n'a pas d'intérêt pour les utilisateurs de l'appli ;
- les modèles et le guide font exporter le titre des tickets (« Résumé »), inutile au calcul et sensible : les exports doivent se limiter à la clé et à la date.

## What Changes

- **Bouton « Lancer la simulation »** dans le panneau de prévision. Importer un fichier, changer un réglage, le nombre de tickets restants, la date cible ou l'onglet ne lance plus rien : les résultats affichés sont marqués comme périmés (« Les données ou les réglages ont changé : relance la simulation ») jusqu'au prochain clic. Entrée dans un champ de la prévision lance aussi la simulation.
- **Premier affichage** : une simulation est lancée une fois sur les données d'exemple, pour que la page montre d'emblée à quoi ressemblent les résultats.
- **Onglets** : chaque question garde ses derniers résultats ; un onglet jamais simulé affiche une invitation à lancer la simulation.
- **Guide Jira repliable**, replié par défaut ; le lien « Quelles données extraire de Jira, et comment ? » le déplie et fait défiler la page jusqu'à lui.
- **Pied de page** : suppression du lien « Code source » ; la mention de confidentialité reste.
- **Confidentialité des exports** : modèles Excel et CSV réduits aux colonnes « Clé » et « Résolu » (plus de « Résumé ») ; mode d'emploi et guide Jira demandent de n'exporter que ces deux colonnes. Un fichier qui contient d'autres colonnes reste accepté : elles sont ignorées.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `data-import` : l'import ne met plus à jour la prévision ; premier affichage simulé une fois.
- `forecast` : lancement explicite, résultats périmés, résultats par onglet.
- `data-template` : modèles sans colonne « Résumé ».
- `jira-guide` : guide replié par défaut, export limité à la clé et à la date.
- `site-publication` : pas de lien vers le code source dans l'interface.

## Impact

- `site/index.html` (bouton, guide dans un élément repliable, pied de page, colonnes du guide), `site/app.css`, `site/js/ui.js`, `site/js/templates.js` et ses tests, README. Logique pure (`forecast-core.js`) inchangée.
- Essai automatisé dans Chromium à adapter (clic sur « Lancer la simulation »).
