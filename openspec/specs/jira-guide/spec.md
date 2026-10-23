# Jira Guide Specification

## Purpose
Guide intégré pour extraire les données depuis Jira.

## Requirements

### Requirement: Guide d'extraction depuis Jira
La page SHALL contenir, toujours visible, un guide « Préparer les données depuis Jira » avec :
- les données requises : date de fin obligatoire (champ « Résolu », ou « Catégorie de statut modifiée » à défaut), clé et résumé facultatifs ;
- les bonnes pratiques : au moins 8 semaines d'historique (idéalement 12 à 26), une équipe par fichier, sans sous-tâches, mêmes règles pour compter les tickets restants, périodes atypiques à écarter, semaine en cours ignorée, format agrégé accepté ;
- les étapes pour Jira Cloud en français : recherche avancée en JQL, requête, colonnes, « Exporter › Exporter Excel CSV (champs actuels) », import ;
- deux requêtes JQL avec un bouton « Copier la requête » : l'historique des 26 dernières semaines sans sous-tâches, et le décompte des tickets restants d'une version ;
- la marche à suivre si le champ « Résolu » est vide.
Le lien « Quelles données extraire de Jira, et comment ? » du panneau des données SHALL faire défiler la page jusqu'au guide.

#### Scenario: Copier la requête d'historique
- **WHEN** l'utilisateur clique sur « Copier la requête » sous l'étape 2
- **THEN** la requête JQL complète est copiée et le bouton affiche « Copié »

#### Scenario: Accès depuis les données
- **WHEN** l'utilisateur clique sur « Quelles données extraire de Jira, et comment ? »
- **THEN** la page défile jusqu'au guide
