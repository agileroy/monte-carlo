## Context

Les aides utilisent `.hint` (0,75 rem, `--ink-3`) ou `small muted` ; les deux consignes du guide utilisent `.msg.info` (fond gris). Les couleurs du thème : accent bleu (`--accent`, `--accent-soft`) et ambre (`--likely`, `--likely-soft`), déjà définies en clair et en sombre.

## Goals / Non-Goals

**Goals :** que l'œil s'arrête sur les consignes, sans alourdir la page.

**Non-Goals :** refonte de la mise en page ; changement des textes.

## Decisions

### Deux niveaux

- **Note** (`.note`, `.note.warn`) pour les consignes qui changent ce que l'utilisateur fait : fond teinté (`--accent-soft` ou `--likely-soft`), bordure gauche de 3 px dans la couleur pleine, coins arrondis à droite seulement, icône SVG en ligne de 16 px (« i » dans un cercle pour le conseil, triangle pour l'attention), texte en `--ink`. Un intitulé court en gras ouvre la note (« Conseil », « Confidentialité », « À vérifier »).
- **Aide** (`.hint`) pour les précisions courtes : nouvelle variable `--hint` (bleu de l'accent atténué : `#3e57b5` en clair, `#9db0ff` en sombre, contraste AA sur le fond des panneaux), petite icône « i » de 12 px en début de ligne via un masque CSS, pour ne pas toucher au balisage de chaque aide.
- Les messages d'état (import réussi, erreur, résultats à relancer) gardent leur style : ce sont des retours, pas des indications.

### Contraste

Texte des notes en `--ink` sur fond teinté (contraste supérieur à 7:1 dans les deux thèmes) ; couleur `--hint` vérifiée au moins 4,5:1 sur `--surface`.

## Risks / Trade-offs

- Trop de couleur banaliserait les notes → deux notes « attention » seulement, et l'ambre reste réservé à ce qui peut fausser les données.
