# Prévisions Monte Carlo

Application web d'une seule page pour prévoir la livraison d'une équipe à partir de son débit réel (nombre de tickets terminés par semaine), par simulation de Monte Carlo.

Elle répond à deux questions :

- **Quand aura-t-on fini ?** À partir d'un nombre de tickets restants, elle donne les dates de fin à 50 %, 85 % et 95 % de confiance.
- **Combien d'ici une date ?** À partir d'une date cible, elle donne le nombre de tickets livrables à 50 %, 85 % et 95 % de confiance.

Chaque prévision affiche l'histogramme des simulations (zones risquée, probable et sûre), la courbe de probabilité cumulée et une phrase de synthèse à copier.

## Utilisation

Ouvre `index.html` dans un navigateur, ou publie le dépôt avec GitHub Pages. Rien à installer : tout tourne dans le navigateur et les données importées ne quittent pas ton poste.

1. Télécharge le modèle Excel ou CSV depuis l'appli, ou exporte directement depuis Jira (le guide est intégré à la page).
2. Importe le fichier par glisser-déposer.
3. Règle l'historique utilisé, le nombre de simulations (10 000 par défaut) et la date de départ.
4. Choisis la question et lis le résultat.

## Format des données

**Format principal** : une ligne par ticket terminé, avec au minimum une colonne de date de fin.

| Clé | Résumé | Résolu |
|-----|--------|--------|
| EQ-101 | Exemple de ticket | 06/10/2026 |

La colonne de date est détectée automatiquement (`Résolu`, `Resolved`, `Date de fin`, `Catégorie de statut modifiée`…). Formats acceptés : `jj/mm/aaaa`, `aaaa-mm-jj`, dates Jira (`06/oct./26 10:15`, `06/Oct/26 10:15 AM`) et dates Excel.

**Format agrégé** (optionnel) : une colonne `Semaine` (date) et une colonne `Tickets terminés` (nombre).

La semaine en cours est ignorée, car elle est incomplète.

## Extraire les données de Jira

Requête JQL conseillée (remplacer `EQ` par la clé du projet) :

```
project = EQ AND statusCategory = Done
AND resolved >= -26w
AND issuetype not in subTaskIssueTypes()
ORDER BY resolved ASC
```

Garder les colonnes Clé, Résumé et Résolu, puis **Exporter › Exporter Excel CSV (champs actuels)**.

## Méthode

Pour chaque simulation, l'appli tire au hasard, semaine après semaine, un débit parmi les semaines d'historique retenues (rééchantillonnage avec remise) :

- *Quand ?* : on additionne jusqu'à atteindre le nombre de tickets restants ; on compte les semaines.
- *Combien ?* : on additionne sur le nombre de semaines complètes jusqu'à la date cible.

Les percentiles des résultats donnent les niveaux de confiance.

## Technique

- Un seul fichier `index.html` (HTML, CSS, JavaScript).
- [Chart.js](https://www.chartjs.org/) 4.4.1 pour les graphiques et [SheetJS](https://sheetjs.com/) 0.18.5 pour lire et générer les fichiers Excel, chargés depuis cdnjs.

## Licence

MIT
