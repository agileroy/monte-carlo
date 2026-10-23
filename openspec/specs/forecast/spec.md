# Forecast Specification

## Purpose
Réglages, simulations « Quand aura-t-on fini ? » et « Combien d'ici une date ? », résultats et graphiques.

## Requirements

### Requirement: Réglages de la simulation
La page SHALL proposer : l'historique utilisé (8, 12, 16 ou 26 dernières semaines, ou tout l'historique ; 12 par défaut), le nombre de simulations (de 1 000 à 100 000 ; 10 000 par défaut) et la date de départ (aujourd'hui par défaut). Une valeur hors limites du nombre de simulations SHALL être ramenée dans les limites. Modifier un réglage MUST NOT lancer la simulation ; le choix de l'historique SHALL toutefois mettre à jour immédiatement les semaines mises en évidence et le débit moyen.

#### Scenario: Historique réduit
- **GIVEN** 26 semaines importées
- **WHEN** l'utilisateur choisit « 8 semaines »
- **THEN** seules les 8 dernières semaines sont mises en évidence dans le graphique du débit, et aucune simulation n'est lancée

### Requirement: Méthode de simulation
Chaque simulation SHALL tirer au hasard, avec remise et semaine après semaine, un débit parmi les semaines de l'historique retenu, semaines à 0 comprises. La simulation MUST NOT démarrer avec moins de 4 semaines d'historique ou un historique sans aucun ticket terminé ; la page SHALL alors expliquer comment corriger.

#### Scenario: Historique sans ticket
- **GIVEN** un historique retenu où toutes les semaines valent 0
- **WHEN** la prévision est calculée
- **THEN** la page indique qu'aucun ticket n'a été terminé sur la période et propose d'élargir l'historique

### Requirement: Quand aura-t-on fini ?
Avec un nombre de tickets restants (au moins 1), chaque simulation SHALL compter les semaines nécessaires pour les terminer (520 au plus). La page SHALL afficher les dates de fin à 50 %, 85 % et 95 % de chances (date de départ plus le nombre de semaines du percentile), avec le nombre de semaines. Le percentile p SHALL être la plus petite durée atteinte par au moins p % des simulations.

#### Scenario: Débit constant
- **GIVEN** un historique où chaque semaine vaut 5 tickets, 40 tickets restants et un départ le lundi 26 octobre 2026
- **WHEN** la prévision est calculée
- **THEN** les trois tuiles affichent 8 semaines, soit le 21 décembre 2026

### Requirement: Combien d'ici une date ?
Avec une date cible au moins une semaine après la date de départ, chaque simulation SHALL additionner le débit tiré sur le nombre de semaines complètes jusqu'à la date cible. La page SHALL afficher le nombre de tickets livrés « au moins » à 50 %, 85 % et 95 % de confiance ; le niveau p SHALL être le plus grand nombre atteint ou dépassé par au moins p % des simulations. Une date cible trop proche SHALL afficher un message au lieu des résultats.

#### Scenario: Débit constant
- **GIVEN** un historique où chaque semaine vaut 5 tickets et une date cible 10 semaines après le départ
- **WHEN** la prévision est calculée
- **THEN** les trois tuiles affichent « ≥ 50 tickets »

#### Scenario: Date cible trop proche
- **WHEN** la date cible est 3 jours après la date de départ
- **THEN** la page demande de choisir une date au moins une semaine après le départ

### Requirement: Graphiques des résultats
Pour chaque question, la page SHALL afficher :
- un histogramme du nombre de simulations par résultat (date de fin ou nombre de tickets, regroupés en 45 colonnes au plus), coloré en trois zones : risqué (moins de 50 % de chances), probable (de 50 à 85 %), sûr (85 % et plus), avec sa légende ;
- une courbe de probabilité cumulée (avoir fini avant chaque date, ou livrer au moins chaque nombre de tickets), de 0 à 100 %, avec des lignes de repère à 50, 85 et 95 % et un point sur chacun de ces seuils.
Le survol ou le toucher d'une colonne SHALL afficher sa valeur (nombre et part des simulations, ou probabilité). Les dates de l'axe SHALL inclure l'année quand la prévision change d'année. Les couleurs SHALL suivre le thème clair ou sombre.

#### Scenario: Lecture d'une probabilité
- **WHEN** l'utilisateur survole la courbe cumulée sur la date du 4 décembre
- **THEN** une infobulle indique la probabilité d'avoir fini avant cette date

### Requirement: Phrase de synthèse
Chaque prévision SHALL s'accompagner d'une phrase reprenant le nombre de simulations, l'historique utilisé et les trois niveaux de confiance, avec un bouton « Copier ». Si le presse-papiers est indisponible, le bouton SHALL indiquer de sélectionner le texte.

#### Scenario: Copie pour un mail
- **WHEN** l'utilisateur clique sur « Copier »
- **THEN** la phrase est dans le presse-papiers et le bouton affiche « Copié » quelques instants

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
