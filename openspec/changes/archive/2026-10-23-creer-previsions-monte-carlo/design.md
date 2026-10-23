## Context

Prototype validé avec l'auteur : une page unique avec import CSV/Excel, deux questions, histogramme et courbe cumulée. Les autres projets de l'auteur (matrice-competences, poker-planning) partagent une stack : HTML/CSS/JavaScript vanilla en modules ES dans `site/`, sans build, sans service tiers, tests avec le lanceur intégré de Node.js et publication GitHub Pages par GitHub Actions.

## Goals / Non-Goals

**Goals :** prévisions fiables et lisibles à partir d'un export Jira ; aucun envoi de données ; code testable et cohérent avec les autres projets.

**Non-Goals (pour l'instant) :** connexion directe à Jira ; lecture d'une capture du diagramme de flux cumulé ; plusieurs utilisateurs ou sauvegarde des données importées ; prévision par estimation de tâches (optimiste, probable, pessimiste) ; format `.xls`.

## Decisions

### Rééchantillonnage du débit hebdomadaire

Chaque simulation tire au hasard, avec remise, un débit parmi les semaines de l'historique retenu, semaine après semaine :
- *Quand ?* : on cumule jusqu'à atteindre le nombre de tickets restants et on compte les semaines (plafond de 520 semaines par simulation, pour qu'un historique très faible ne bloque pas la page) ;
- *Combien ?* : on cumule sur le nombre de semaines complètes entre la date de départ et la date cible.

La semaine est le pas de temps : le débit journalier est trop irrégulier (week-ends, mises en production groupées), et la semaine correspond au rythme des équipes. Les semaines sans ticket terminé comptent pour 0 : les ignorer rendrait la prévision trop optimiste.

Percentiles : *Quand ?* prend la plus petite durée atteinte par au moins p % des simulations ; *Combien ?* prend le plus grand nombre de tickets atteint par au moins p % des simulations (« au moins X tickets »). Les zones de couleur en découlent : risqué sous P50, probable de P50 à P85, sûr à partir de P85.

L'aléa vient de `Math.random` ; `forecast-core.js` accepte une fonction aléatoire en paramètre pour des tests reproductibles.

### Lecture des fichiers

- **CSV** : séparateur détecté sur la ligne d'en-têtes (`;`, `,` ou tabulation), guillemets gérés, BOM retiré.
- **Excel** : `xlsx-lite.js`, copié de matrice-competences (lecture des cellules texte et nombre). Premier onglet dont le nom n'évoque pas un mode d'emploi. SheetJS est écarté pour les mêmes raisons que dans matrice-competences : version des CDN exposée à des failles connues à la lecture de fichiers, et près de 1 Mo.
- **Dates** : `jj/mm/aaaa`, `aaaa-mm-jj`, formats Jira (`06/oct./26 10:15`, `06/Oct/26 10:15 AM`, mois en français ou en anglais), numéros de série Excel. L'ordre jour/mois est toujours européen.
- **Colonne de date** : la première dont l'en-tête évoque, par priorité, la résolution (« Résolu », « Resolved »), la fin (« Date de fin », « Terminé », « Done »), le changement de catégorie de statut, puis « date », et dont au moins la moitié des valeurs sont des dates. À défaut, la première colonne dont 80 % des valeurs sont des dates.
- **Format agrégé** : une colonne de nombres dont l'en-tête évoque un nombre de tickets terminés et une colonne de dates évoquant la semaine.
- **Semaines** : du lundi au dimanche ; les semaines vides entre la première et la dernière date comptent pour 0 ; la semaine en cours est retirée pour le format par ticket.
- Fichier de 2 Mo au plus (limite de `xlsx-lite.js`, appliquée aussi au CSV).

### Graphiques en SVG maison

Chart.js ne peut pas être chargé depuis un CDN (aucun service tiers) et les besoins sont limités : histogramme, courbe et barres d'historique. `charts.js` dessine des SVG dont les couleurs viennent des variables CSS du thème, ce qui gère le clair et le sombre sans redessiner. Une infobulle suit le pointeur (souris ou toucher) et lit la colonne survolée.

### Modèles

Modèle Excel : onglet « Tickets terminés » (Clé, Résumé, Résolu, avec des lignes d'exemple, dates écrites en texte `jj/mm/aaaa` pour rester lisibles quel que soit le tableur) et onglet « Mode d'emploi ». Modèle CSV : mêmes colonnes, séparateur `;` et BOM pour une ouverture correcte dans Excel en français.

### Interface

Deux colonnes sur ordinateur (données à gauche, prévision à droite), une seule sur téléphone ; guide Jira en bas de page. Recalcul automatique 180 ms après chaque modification. Bouton de thème et mémorisation comme dans matrice-competences.

## Risks / Trade-offs

- Débit stable supposé : une équipe qui change de composition ou de façon de découper les tickets fausse la prévision → le choix de l'historique et les bonnes pratiques du guide l'atténuent.
- Tickets de tailles très différentes : la méthode suppose une taille moyenne stable, ce que le guide rappelle (exclure les sous-tâches, mêmes règles pour les tickets restants).
- Les intitulés des menus Jira varient selon la version (Cloud, Data Center) : le guide vise Jira Cloud en français.
