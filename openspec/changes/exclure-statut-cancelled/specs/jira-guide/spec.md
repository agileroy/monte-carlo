## MODIFIED Requirements

### Requirement: Guide d'extraction depuis Jira
La page SHALL contenir, en bas de page, un guide repliable « Préparer les données depuis Jira », replié par défaut, qui s'ouvre et se referme au clic ou au clavier sur son titre. Déplié, il SHALL contenir :
- les données requises : date de fin obligatoire (champ « Résolu », ou « Catégorie de statut modifiée » à défaut) et clé facultative ; le guide SHALL préciser que le titre (« Résumé ») et la description ne sont pas utilisés et ne doivent pas être exportés, par confidentialité ;
- les bonnes pratiques : au moins 8 semaines d'historique (idéalement 12 à 26), une équipe par fichier, sans sous-tâches, mêmes règles pour compter les tickets restants, périodes atypiques à écarter, semaine en cours ignorée, format agrégé accepté ;
- le choix du périmètre (voir l'exigence « Périmètre de la requête ») ;
- les étapes pour Jira Cloud en français : recherche avancée en JQL, requête, colonnes réduites à « Clé » et « Résolu », « Exporter › Exporter Excel CSV (champs actuels) », import ;
- une requête JQL d'historique (27 dernières semaines, pour disposer de 26 semaines complètes une fois la semaine en cours écartée, sans sous-tâches, sans les tickets au statut « Cancelled ») avec un bouton « Copier la requête » ; le texte de l'étape SHALL expliquer pourquoi la requête remonte à 27 semaines, et une note SHALL indiquer que les tickets annulés ne sont pas des tickets terminés et qu'il faut adapter le nom du statut (ou retirer la ligne) s'il diffère dans le projet, Jira signalant une erreur pour un statut inconnu ;
- la marche à suivre si le champ « Résolu » est vide.
Le guide MUST NOT proposer de requête pour compter les tickets restants. Le lien « Quelles données extraire de Jira, et comment ? » du panneau des données SHALL déplier le guide puis faire défiler la page jusqu'à lui.

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
- **THEN** la requête JQL complète, telle qu'affichée, est copiée et le bouton affiche « Copié »

#### Scenario: 26 semaines complètes
- **GIVEN** un export réalisé un vendredi avec la requête du guide, pour une équipe qui termine des tickets chaque semaine
- **WHEN** l'utilisateur l'importe et choisit « 26 semaines »
- **THEN** les 26 semaines utilisées sont complètes, du lundi au dimanche ; seule la 27e, la plus ancienne, peut être partielle

#### Scenario: Note sur le statut annulé
- **GIVEN** le guide déplié
- **WHEN** l'utilisateur lit l'étape 2
- **THEN** une note explique que la ligne `AND status != "Cancelled"` exclut les tickets annulés et qu'il faut adapter le nom du statut s'il diffère dans son projet

#### Scenario: Plus d'étape pour les tickets restants
- **GIVEN** le guide déplié
- **WHEN** l'utilisateur lit les étapes
- **THEN** elles s'arrêtent à l'export et à l'import, sans requête des tickets restants

#### Scenario: Accès depuis les données
- **GIVEN** le guide replié
- **WHEN** l'utilisateur clique sur « Quelles données extraire de Jira, et comment ? »
- **THEN** le guide se déplie et la page défile jusqu'à lui

### Requirement: Périmètre de la requête
Le guide SHALL proposer de définir le périmètre de la requête d'historique de deux façons, au choix : « Projet » ou « Requête du board ».
- En mode « Projet », un champ accepte la clé ou le nom du projet (100 caractères au plus, espaces superflus retirés) ; la requête commence par `project = <projet>`. Une valeur faite uniquement de lettres, chiffres et `_` SHALL être reprise telle quelle ; toute autre valeur SHALL être mise entre guillemets doubles, avec ses guillemets et barres obliques inverses échappés.
- En mode « Requête du board », une zone de texte reçoit la requête de filtre du board (2 000 caractères au plus) et le guide SHALL indiquer où la trouver dans Jira. La requête d'historique SHALL être `(<requête du board>) AND statusCategory = Done AND status != "Cancelled" AND resolved >= -27w AND issuetype not in subTaskIssueTypes() ORDER BY resolved ASC`, après retrait du `ORDER BY` final de la requête collée (un `ORDER BY` entre guillemets MUST NOT être retiré) et remplacement des retours à la ligne par des espaces.
Chaque saisie ou changement de mode SHALL mettre à jour immédiatement la requête affichée et copiée. Un champ vide (ou une requête réduite à un `ORDER BY`) SHALL donner l'exemple `project = EQ` avec une invitation à compléter. Le mode, le projet et la requête du board SHALL être mémorisés dans le navigateur et repris à la visite suivante ; ils MUST NOT être envoyés à un serveur.

#### Scenario: Clé de projet
- **GIVEN** le mode « Projet »
- **WHEN** l'utilisateur saisit « PAY »
- **THEN** la requête commence par `project = PAY` et « Copier la requête » copie cette version

#### Scenario: Nom avec espaces
- **WHEN** l'utilisateur saisit le projet « Paiement mobile »
- **THEN** la requête contient `project = "Paiement mobile"`

#### Scenario: Requête d'un board multi-projets
- **GIVEN** le mode « Requête du board »
- **WHEN** l'utilisateur colle `project in (PAY, MOB) AND component = Front ORDER BY Rank ASC`
- **THEN** la requête affichée est `(project in (PAY, MOB) AND component = Front) AND statusCategory = Done AND status != "Cancelled" AND resolved >= -27w AND issuetype not in subTaskIssueTypes() ORDER BY resolved ASC`, sur plusieurs lignes

#### Scenario: Changement de mode
- **GIVEN** « PAY » en mode « Projet » et une requête de board saisie
- **WHEN** l'utilisateur passe d'un mode à l'autre
- **THEN** la requête affichée suit le mode choisi, et chaque champ garde sa valeur

#### Scenario: Champ vide
- **GIVEN** le mode « Requête du board » sans requête collée
- **THEN** la requête affichée utilise `project = EQ` et le guide invite à coller la requête du board

#### Scenario: Périmètre mémorisé
- **GIVEN** le mode « Requête du board » et une requête saisis lors d'une visite précédente
- **WHEN** l'utilisateur rouvre la page et déplie le guide
- **THEN** le mode « Requête du board » est sélectionné, avec sa requête, et la requête d'historique l'utilise
