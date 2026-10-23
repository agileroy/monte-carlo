## MODIFIED Requirements

### Requirement: Réglages de la simulation
La page SHALL proposer : l'historique utilisé (8, 12, 16 ou 26 dernières semaines, ou tout l'historique ; 12 par défaut), le nombre de simulations (de 1 000 à 100 000 ; 10 000 par défaut) et la date de départ (aujourd'hui par défaut). Une valeur hors limites du nombre de simulations SHALL être ramenée dans les limites. Modifier un réglage MUST NOT lancer la simulation ; le choix de l'historique SHALL toutefois mettre à jour immédiatement les semaines mises en évidence et le débit moyen.

#### Scenario: Historique réduit
- **GIVEN** 26 semaines importées
- **WHEN** l'utilisateur choisit « 8 semaines »
- **THEN** seules les 8 dernières semaines sont mises en évidence dans le graphique du débit, et aucune simulation n'est lancée

## ADDED Requirements

### Requirement: Lancement de la simulation
Le panneau de prévision SHALL proposer un bouton « Lancer la simulation » qui calcule la prévision de l'onglet actif avec les données et les réglages en cours. Appuyer sur Entrée dans le champ de la question, le nombre de simulations ou la date de départ SHALL produire le même effet. Le bouton SHALL rester utilisable même si rien n'a changé depuis la dernière simulation.

#### Scenario: Préparer puis lancer
- **GIVEN** la page ouverte sur les données d'exemple
- **WHEN** l'utilisateur importe son fichier, choisit « 26 semaines », saisit 60 tickets restants, puis clique sur « Lancer la simulation »
- **THEN** une seule simulation est calculée, avec son fichier, 26 semaines d'historique et 60 tickets restants

#### Scenario: Entrée au clavier
- **WHEN** l'utilisateur saisit 80 dans « Tickets restants à terminer » et appuie sur Entrée
- **THEN** la simulation est lancée avec 80 tickets restants

### Requirement: Résultats périmés
Chaque résultat SHALL être associé aux entrées qui l'ont produit : données, historique, nombre de simulations, date de départ, et tickets restants ou date cible. Dès que l'une de ces entrées diffère de celles du résultat affiché, la page SHALL afficher au-dessus des résultats « Les données ou les réglages ont changé : relance la simulation » et atténuer les résultats sans les effacer. Le message SHALL disparaître si les entrées reviennent à celles du résultat ou après une nouvelle simulation.

#### Scenario: Réglage modifié
- **GIVEN** une prévision affichée pour 40 tickets restants
- **WHEN** l'utilisateur saisit 50
- **THEN** les résultats pour 40 tickets restent visibles, atténués, avec le message invitant à relancer

#### Scenario: Retour aux mêmes entrées
- **GIVEN** des résultats marqués périmés après le passage de 40 à 50 tickets restants
- **WHEN** l'utilisateur remet 40
- **THEN** le message disparaît et les résultats ne sont plus atténués

### Requirement: Résultats par question
Chaque onglet (« Quand aura-t-on fini ? », « Combien d'ici une date ? ») SHALL conserver ses derniers résultats. Changer d'onglet MUST NOT lancer de simulation. Un onglet sans résultat SHALL afficher « Lance la simulation pour voir la prévision » à la place des tuiles et des graphiques.

#### Scenario: Premier passage sur « Combien ? »
- **GIVEN** la page qui vient de s'ouvrir
- **WHEN** l'utilisateur ouvre l'onglet « Combien d'ici une date ? »
- **THEN** l'onglet invite à lancer la simulation, sans résultat

#### Scenario: Retour sur un onglet déjà simulé
- **GIVEN** des simulations lancées dans les deux onglets
- **WHEN** l'utilisateur passe d'un onglet à l'autre
- **THEN** chaque onglet affiche ses propres derniers résultats, sans nouveau calcul
