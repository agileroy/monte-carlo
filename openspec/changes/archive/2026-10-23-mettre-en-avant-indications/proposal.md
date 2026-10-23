## Why

Les indications de l'appli (aides sous les champs, consignes du guide, notes sur la confidentialité et le statut « Cancelled ») sont écrites en petit gris, comme du texte secondaire. Elles passent inaperçues alors qu'elles conditionnent la qualité des données et donc de la prévision.

## What Changes

- **Encadrés de note** pour les consignes, avec une icône et une bordure gauche colorée, sur fond teinté :
  - « conseil » en bleu (couleur d'accent) : comptage des tickets restants, colonne « Résolu » vide ;
  - « attention » en ambre : confidentialité des exports, nom du statut « Cancelled » à adapter.
- **Aides courtes** sous les champs et sous les graphiques (historique, date de départ, requête du board, périmètre, date cible, semaines en couleur) : petite icône d'information et texte dans une teinte de l'accent, au lieu du gris.
- Sobre : deux couleurs existantes du thème (accent et ambre), aucune animation, lisible en clair et en sombre.

## Capabilities

### New Capabilities

_Aucune._

### Modified Capabilities

- `site-publication` : exigence sur la mise en avant des indications.

## Impact

- `site/index.html` (classes et icônes des notes et aides), `site/app.css` (styles `.note` et `.hint`). Aucune logique modifiée.
