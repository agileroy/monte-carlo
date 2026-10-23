## MODIFIED Requirements

### Requirement: Guide d'extraction depuis Jira
La page SHALL contenir, en bas de page, un guide repliable « Préparer les données depuis Jira », replié par défaut, qui s'ouvre et se referme au clic ou au clavier sur son titre. Déplié, il SHALL contenir :
- les données requises : date de fin obligatoire (champ « Résolu », ou « Catégorie de statut modifiée » à défaut) et clé facultative ; le guide SHALL préciser que le titre (« Résumé ») et la description ne sont pas utilisés et ne doivent pas être exportés, par confidentialité ;
- les bonnes pratiques : au moins 8 semaines d'historique (idéalement 12 à 26), une équipe par fichier, sans sous-tâches, mêmes règles pour compter les tickets restants, périodes atypiques à écarter, semaine en cours ignorée, format agrégé accepté ;
- les étapes pour Jira Cloud en français : recherche avancée en JQL, requête, colonnes réduites à « Clé » et « Résolu », « Exporter › Exporter Excel CSV (champs actuels) », import ;
- deux requêtes JQL avec un bouton « Copier la requête » : l'historique des 26 dernières semaines sans sous-tâches, et le décompte des tickets restants d'une version ;
- la marche à suivre si le champ « Résolu » est vide.
Le lien « Quelles données extraire de Jira, et comment ? » du panneau des données SHALL déplier le guide puis faire défiler la page jusqu'à lui.

#### Scenario: Guide replié à l'ouverture
- **WHEN** l'utilisateur ouvre la page
- **THEN** seul le titre du guide est visible en bas de page

#### Scenario: Colonnes à exporter
- **GIVEN** le guide déplié
- **WHEN** l'utilisateur lit l'étape des colonnes
- **THEN** elle demande de ne garder que « Clé » et « Résolu » et de retirer « Résumé »

#### Scenario: Copier la requête d'historique
- **GIVEN** le guide déplié
- **WHEN** l'utilisateur clique sur « Copier la requête » sous l'étape 2
- **THEN** la requête JQL complète est copiée et le bouton affiche « Copié »

#### Scenario: Accès depuis les données
- **GIVEN** le guide replié
- **WHEN** l'utilisateur clique sur « Quelles données extraire de Jira, et comment ? »
- **THEN** le guide se déplie et la page défile jusqu'à lui
