## 1. Lancement de la simulation

- [x] 1.1 `index.html` : bouton principal « Lancer la simulation » sous la question de l'onglet actif, bandeau « Les données ou les réglages ont changé : relance la simulation », zone « Lance la simulation pour voir la prévision ».
- [x] 1.2 `ui.js` : retirer les relances automatiques (saisie, import, historique, onglet, « Revenir à l'exemple ») ; lancement au clic et à Entrée (question, simulations, date de départ) ; signature des entrées mémorisée par onglet, bandeau et atténuation quand elle diffère, résultats conservés par onglet ; simulation unique au premier affichage sur l'onglet « Quand ? ».
- [x] 1.3 `app.css` : bouton principal, bandeau, résultats atténués, invitation à lancer.

## 2. Guide et pied de page

- [x] 2.1 Guide dans un `<details>` replié par défaut, titre dans `<summary>` avec un indicateur ouvert ou fermé ; le lien du panneau des données le déplie puis fait défiler.
- [x] 2.2 Pied de page : retirer le lien « Code source ».

## 3. Confidentialité des exports

- [x] 3.1 `templates.js` : colonnes « Clé » et « Résolu » seulement (Excel et CSV), mode d'emploi mis à jour ; tests des modèles adaptés (deux colonnes, import tel quel).
- [x] 3.2 Guide Jira : tableau des données requises sans « Résumé » et avec la consigne de confidentialité ; étape des colonnes réduite à « Clé » et « Résolu ». README aligné.

## 4. Vérification

- [x] 4.1 `npm test` (logique pure inchangée).
- [x] 4.2 Essai automatisé dans Chromium : un scénario par scénario des specs modifiées (premier affichage, import sans calcul, réglage puis lancement, Entrée, bandeau et retour aux mêmes entrées, onglet sans résultat, résultats conservés par onglet, guide replié puis déplié par le lien, pied de page, modèles téléchargés à deux colonnes et réimportés), à 390 px et 1280 px, thèmes clair et sombre ; captures.
