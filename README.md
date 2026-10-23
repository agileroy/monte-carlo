# Prévisions Monte Carlo

Application web pour prévoir la livraison d'une équipe à partir de son débit réel (nombre de tickets terminés par semaine), par simulation de Monte Carlo. Aucune estimation n'est nécessaire.

En ligne : https://vinchou59.github.io/monte-carlo/

Elle répond à deux questions :

- **Quand aura-t-on fini ?** À partir d'un nombre de tickets restants, elle donne les dates de fin à 50 %, 85 % et 95 % de chances.
- **Combien d'ici une date ?** À partir d'une date cible, elle donne le nombre de tickets livrables à 50 %, 85 % et 95 % de confiance.

Chaque prévision affiche l'histogramme des simulations (zones risquée, probable et sûre), la courbe de probabilité cumulée et une phrase de synthèse à copier.

Les fichiers importés restent dans le navigateur : rien n'est envoyé, et la page ne charge aucune ressource externe.

## Utilisation

1. Télécharge le modèle Excel ou CSV depuis l'appli, ou exporte directement depuis Jira (le guide est intégré à la page).
2. Importe le fichier par glisser-déposer.
3. Règle l'historique utilisé, le nombre de simulations (10 000 par défaut) et la date de départ.
4. Choisis la question, puis clique sur **Lancer la simulation** (ou appuie sur Entrée). Si tu modifies ensuite les données ou les réglages, les résultats sont signalés comme à relancer.

## Format des données

**Format principal** : une ligne par ticket terminé, avec au minimum une colonne de date de fin.

| Clé | Résolu |
|-----|--------|
| EQ-101 | 06/10/2026 |

Par confidentialité, n'exporte ni le titre (Résumé) ni la description des tickets : ils ne servent pas au calcul. Un fichier qui en contient reste accepté, ces colonnes sont ignorées.

La colonne de date est détectée automatiquement (`Résolu`, `Resolved`, `Date de fin`, `Catégorie de statut modifiée`…). Formats acceptés : `jj/mm/aaaa`, `aaaa-mm-jj`, dates Jira (`06/oct./26 10:15`, `06/Oct/26 10:15 AM`) et dates Excel. Fichiers `.csv` et `.xlsx` (2 Mo au plus).

**Format agrégé** (optionnel) : une colonne `Semaine` (date) et une colonne `Tickets terminés` (nombre).

La semaine en cours est ignorée, car elle est incomplète.

## Extraire les données de Jira

Requête JQL conseillée (remplacer `EQ` par la clé du projet) :

```
project = EQ AND statusCategory = Done
AND status != "Cancelled"
AND resolved >= -27w
AND issuetype not in subTaskIssueTypes()
ORDER BY resolved ASC
```

La ligne `status != "Cancelled"` écarte les tickets annulés, qui ne sont pas du travail livré : adapte le nom du statut s'il diffère dans ton projet (par exemple « Annulé »), ou retire la ligne s'il n'existe pas.

`-27w` remonte 27 × 7 jours depuis la recherche : une fois la semaine en cours écartée par l'appli, il reste 26 semaines complètes (la plus ancienne, partielle, n'est utilisée qu'avec « Tout l'historique »).

Pour un board qui couvre plusieurs projets, le guide accepte aussi la requête de filtre du board (Paramètres du tableau › Général › Requête de filtre) : elle est mise entre parenthèses, sans son tri final, à la place de `project = EQ`.

Ne garder que les colonnes Clé et Résolu, puis **Exporter › Exporter Excel CSV (champs actuels)**.

## Méthode

Pour chaque simulation, l'appli tire au hasard, semaine après semaine, un débit parmi les semaines d'historique retenues (avec remise, semaines à 0 comprises) :

- *Quand ?* : on additionne jusqu'à atteindre le nombre de tickets restants ; on compte les semaines.
- *Combien ?* : on additionne sur le nombre de semaines complètes jusqu'à la date cible.

Les percentiles des résultats donnent les niveaux de confiance.

## Développement

HTML, CSS et JavaScript vanilla en modules ES, sans framework ni étape de build, comme matrice-competences et poker-planning.

```
site/
  index.html, app.css, img/
  js/forecast-core.js   logique pure : dates, lecture des données, semaines, simulations, percentiles
  js/xlsx-lite.js       lecture et écriture des .xlsx sans bibliothèque (repris de matrice-competences)
  js/templates.js       modèles Excel et CSV
  js/jira.js            requête JQL du guide, pour le projet ou la requête du board saisis
  js/charts.js          graphiques SVG
  js/ui.js              interface
  js/theme.js           thème clair ou sombre
tests/                  tests Node (npm test)
openspec/               spécifications et changements (OpenSpec)
```

- Tests : `npm test` (Node.js 22).
- Essai local : `python3 -m http.server -d site`, puis http://localhost:8000.
- Évolutions : avec OpenSpec (`/opsx:propose`, `/opsx:apply`, `/opsx:archive`), artefacts en français.

## Publication

Le workflow `.github/workflows/pages.yml` lance les tests à chaque push et pull request, puis publie `site/` sur GitHub Pages depuis `main` si les tests passent. Dans **Settings › Pages**, la source doit être **GitHub Actions**.

## Licence

MIT
