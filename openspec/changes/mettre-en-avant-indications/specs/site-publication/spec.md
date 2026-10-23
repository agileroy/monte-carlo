## ADDED Requirements

### Requirement: Mise en avant des indications
Les consignes qui changent ce que fait l'utilisateur SHALL être présentées en encadré de note avec une icône, une bordure gauche colorée et un intitulé court : en couleur d'accent pour un conseil (compter les tickets restants, colonne « Résolu » vide), en ambre pour un point d'attention (confidentialité des exports, nom du statut « Cancelled » à adapter). Les aides courtes sous les champs et les graphiques SHALL être précédées d'une petite icône d'information et écrites dans une teinte de la couleur d'accent. Ces couleurs SHALL venir du thème et rester lisibles en clair et en sombre (contraste d'au moins 4,5:1), sans animation. Les messages d'état (import, erreur, résultats à relancer) MUST garder leur propre style.

#### Scenario: Consigne de confidentialité
- **GIVEN** le guide Jira déplié
- **WHEN** l'utilisateur lit les données requises
- **THEN** la consigne de confidentialité apparaît dans un encadré ambre avec une icône d'attention et l'intitulé « Confidentialité »

#### Scenario: Aide sous un champ
- **WHEN** l'utilisateur regarde le champ « Date de départ »
- **THEN** l'aide en dessous est précédée d'une icône d'information, dans une teinte de bleu et non en gris

#### Scenario: Thème sombre
- **GIVEN** le thème sombre
- **WHEN** l'utilisateur ouvre le guide
- **THEN** les encadrés et les aides restent lisibles, avec des couleurs adaptées au fond sombre
