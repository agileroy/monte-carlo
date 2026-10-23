## ADDED Requirements

### Requirement: Modèle Excel
« Modèle Excel » SHALL télécharger `modele-monte-carlo.xlsx`, produit dans le navigateur sans service tiers, avec deux onglets : « Tickets terminés », dont la ligne d'en-têtes « Clé », « Résumé », « Résolu » est figée et suivie de lignes d'exemple datées des semaines précédentes, et « Mode d'emploi », qui décrit les colonnes, l'export depuis Jira, la requête JQL conseillée et le format agrégé.

#### Scenario: Modèle rempli puis importé
- **GIVEN** le modèle Excel téléchargé, dont l'utilisateur a remplacé les exemples par 40 tickets
- **WHEN** il importe le fichier
- **THEN** l'onglet « Tickets terminés » est lu, l'onglet « Mode d'emploi » est ignoré et les 40 tickets sont pris en compte

### Requirement: Modèle CSV
« Modèle CSV » SHALL télécharger `modele-monte-carlo.csv` avec les mêmes colonnes et lignes d'exemple, séparées par des points-virgules, encodé en UTF-8 avec BOM pour s'ouvrir correctement dans Excel en français.

#### Scenario: Ouverture dans Excel
- **WHEN** l'utilisateur ouvre le modèle CSV dans Excel en français
- **THEN** les trois colonnes sont séparées et les accents s'affichent correctement

#### Scenario: Modèle importé tel quel
- **WHEN** l'utilisateur importe le modèle CSV sans le modifier
- **THEN** les tickets d'exemple sont lus sans erreur
