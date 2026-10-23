# Data Import Specification

## Purpose
Import des fichiers CSV et Excel, détection de la date de fin, débit hebdomadaire et données d'exemple.

## Requirements

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

### Requirement: Détection de la colonne de date
Pour un fichier à une ligne par ticket, la colonne de date SHALL être la première dont l'en-tête évoque, par ordre de priorité, la résolution (« Résolu », « Resolved »), la fin (« Date de fin », « Terminé », « Done »), le changement de catégorie de statut, puis le mot « date », et dont au moins la moitié des valeurs non vides sont des dates. À défaut, ce SHALL être la première colonne dont au moins 80 % des valeurs sont des dates. Les formats `jj/mm/aaaa`, `jj/mm/aa`, `aaaa-mm-jj`, les dates Jira avec mois abrégé en français ou en anglais (`06/oct./26 10:15`, `06/Oct/26 10:15 AM`) et les dates Excel SHALL être reconnus ; le jour MUST toujours être lu avant le mois.

#### Scenario: Colonne « Résolution » sans date
- **GIVEN** une colonne « Résolution » contenant « Terminé » et une colonne « Résolu » contenant des dates
- **WHEN** le fichier est importé
- **THEN** la colonne « Résolu » est utilisée

#### Scenario: Date ambiguë
- **WHEN** une cellule contient « 03/04/2026 »
- **THEN** elle est lue comme le 3 avril 2026

### Requirement: Débit hebdomadaire
Les tickets SHALL être regroupés par semaine, du lundi au dimanche. Les semaines sans ticket entre la première et la dernière date SHALL compter pour 0. Pour un fichier à une ligne par ticket, la semaine en cours MUST être ignorée car incomplète. La page SHALL afficher le nombre total de tickets, le nombre de semaines, le débit moyen sur l'historique retenu et un graphique du débit par semaine où les semaines retenues pour la simulation sont mises en évidence. Moins de 8 semaines complètes SHALL déclencher un avertissement de fiabilité.

#### Scenario: Semaine sans ticket
- **GIVEN** des tickets terminés les semaines du 5 et du 19 octobre, aucun la semaine du 12
- **WHEN** le débit est calculé
- **THEN** la semaine du 12 octobre compte 0 ticket

#### Scenario: Semaine en cours
- **GIVEN** un export du jeudi contenant 3 tickets terminés depuis lundi
- **WHEN** le débit est calculé
- **THEN** la semaine en cours n'apparaît pas dans l'historique

### Requirement: Format agrégé par semaine
Un fichier avec une colonne de dates évoquant la semaine (« Semaine », « Week », « Date », « Période ») et une colonne de nombres évoquant des tickets terminés (« Tickets terminés », « Nombre », « Débit », « Throughput ») SHALL être lu comme un débit par semaine : chaque ligne donne le nombre de tickets de la semaine qui contient sa date.

#### Scenario: Débit déjà calculé
- **GIVEN** un fichier « Semaine ; Tickets terminés » de 12 lignes
- **WHEN** il est importé
- **THEN** la page affiche 12 semaines d'historique avec ces nombres

### Requirement: Données d'exemple
Au premier affichage, la page SHALL charger 26 semaines de données fictives, signalées par l'étiquette « Données d'exemple », et lancer une fois la simulation « Quand aura-t-on fini ? » avec les réglages par défaut. Après un import, l'étiquette SHALL devenir « Tes données ». « Revenir à l'exemple » SHALL recharger les données fictives sans lancer la simulation.

#### Scenario: Premier affichage
- **WHEN** l'utilisateur ouvre la page
- **THEN** une prévision « Quand aura-t-on fini ? » complète s'affiche avec l'étiquette « Données d'exemple »
