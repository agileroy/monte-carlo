## MODIFIED Requirements

### Requirement: Import d'un fichier
La page SHALL permettre d'importer un fichier `.csv`, `.txt` ou `.xlsx` par glisser-déposer ou par sélection, au clavier comme à la souris. Le fichier SHALL être lu dans le navigateur et MUST NOT être envoyé à un serveur. Un fichier de plus de 2 Mo, illisible ou sans colonne de date exploitable SHALL être refusé avec un message qui indique quoi corriger ; les données déjà chargées SHALL alors rester inchangées. Un import réussi SHALL mettre à jour les statistiques et le graphique du débit, et MUST NOT lancer la simulation.

#### Scenario: Export Jira
- **GIVEN** un export CSV Jira séparé par des points-virgules, avec les colonnes « Clé », « Résumé », « Résolution » et « Résolu »
- **WHEN** l'utilisateur dépose le fichier
- **THEN** la page indique le nombre de tickets, la colonne lue (« Résolu ») et la période couverte, met à jour le graphique du débit, et signale que les résultats affichés sont à relancer

#### Scenario: Fichier sans date
- **GIVEN** un fichier dont aucune colonne ne contient de dates
- **WHEN** l'utilisateur l'importe
- **THEN** la page affiche « Aucune colonne de date trouvée » avec la colonne attendue, et les données précédentes restent affichées

#### Scenario: Ancien format Excel
- **WHEN** l'utilisateur importe un fichier `.xls`
- **THEN** la page lui demande de l'enregistrer au format Excel (.xlsx) ou CSV

### Requirement: Données d'exemple
Au premier affichage, la page SHALL charger 26 semaines de données fictives, signalées par l'étiquette « Données d'exemple », et lancer une fois la simulation « Quand aura-t-on fini ? » avec les réglages par défaut. Après un import, l'étiquette SHALL devenir « Tes données ». « Revenir à l'exemple » SHALL recharger les données fictives sans lancer la simulation.

#### Scenario: Premier affichage
- **WHEN** l'utilisateur ouvre la page
- **THEN** une prévision « Quand aura-t-on fini ? » complète s'affiche avec l'étiquette « Données d'exemple »
