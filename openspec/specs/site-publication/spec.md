# Site Publication Specification

## Purpose
Publication sur GitHub Pages, confidentialité des données, interface et thème.

## Requirements

### Requirement: Publication automatique
Le site SHALL être publié sur GitHub Pages, à l'adresse https://vinchou59.github.io/monte-carlo/, à chaque push sur `main`. Les tests automatiques SHALL être lancés avant la publication, et la publication MUST NOT avoir lieu si un test échoue. Les tests SHALL aussi être lancés sur chaque pull request, sans publication.

#### Scenario: Test en échec
- **GIVEN** un push sur `main` qui casse un test
- **WHEN** le workflow GitHub Actions s'exécute
- **THEN** le job de tests échoue et le site publié reste la version précédente

### Requirement: Confidentialité et services tiers
Les données importées MUST rester dans le navigateur : aucune requête réseau ne SHALL les transmettre. Le site MUST NOT charger de ressource depuis un autre domaine que le sien (ni CDN, ni police web, ni traceur) ; une bibliothèque éventuelle SHALL être copiée dans `site/vendor/` avec sa licence.

#### Scenario: Import hors ligne
- **GIVEN** la page chargée, puis le réseau coupé
- **WHEN** l'utilisateur importe un fichier et change les réglages
- **THEN** la prévision se met à jour normalement

### Requirement: Interface et appareils
L'interface SHALL être en français et utilisable sur ordinateur et sur téléphone (largeur de 360 px et plus) sans défilement horizontal de la page. Les commandes SHALL être utilisables au clavier, avec un indicateur de focus visible.

#### Scenario: Affichage sur téléphone
- **GIVEN** un téléphone de 390 px de large
- **WHEN** l'utilisateur ouvre la page
- **THEN** les panneaux s'empilent sur une colonne et la page ne défile pas horizontalement

### Requirement: Choix du thème clair ou sombre
Par défaut, le thème SHALL suivre le réglage du système. Un bouton SHALL basculer entre thème clair et thème sombre ; son libellé accessible SHALL indiquer le thème vers lequel il bascule. Le choix SHALL être mémorisé dans le navigateur et appliqué dès l'affichage de la page, sans clignotement.

#### Scenario: Choix mémorisé
- **GIVEN** un utilisateur qui a choisi le thème sombre
- **WHEN** il recharge la page avec un système en thème clair
- **THEN** la page s'affiche directement en thème sombre, graphiques compris

### Requirement: Pied de page
Le pied de page SHALL rappeler que les fichiers importés restent dans le navigateur. L'interface MUST NOT afficher de lien vers le code source ou le dépôt GitHub.

#### Scenario: Pied de page
- **WHEN** l'utilisateur fait défiler la page jusqu'en bas
- **THEN** il lit la mention de confidentialité, sans lien « Code source »
