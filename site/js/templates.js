// Contenu des modèles d'import (Excel et CSV), produits dans le navigateur.

import { writeXlsx, STYLE } from './xlsx-lite.js';
import { addDays, mondayOf, frDate } from './forecast-core.js';

export const TEMPLATE_BASENAME = 'modele-monte-carlo';
export const HEADERS = ['Clé', 'Résumé', 'Résolu'];
export const DATA_SHEET = 'Tickets terminés';
export const HELP_SHEET = "Mode d'emploi";

export const JQL_HISTORY = 'project = EQ AND statusCategory = Done AND resolved >= -26w AND issuetype not in subTaskIssueTypes() ORDER BY resolved ASC';

/** Lignes d'exemple : 9 tickets terminés sur les trois semaines précédant `today`. */
export function exampleRows(today = new Date()) {
  const monday = mondayOf(today);
  const plan = [[3, 0], [3, 2], [3, 4], [2, 1], [2, 3], [1, 0], [1, 2], [1, 3], [1, 4]];
  return plan.map(([w, d], i) => [`EQ-${101 + i}`, 'Exemple : à remplacer par tes tickets', frDate(addDays(monday, -7 * w + d))]);
}

const HELP = [
  "Modèle d'import · Prévisions Monte Carlo",
  '',
  'Format principal : une ligne par ticket terminé, dans l\'onglet « Tickets terminés ».',
  '• Résolu (obligatoire) : date à laquelle le ticket a été terminé, au format jj/mm/aaaa.',
  '• Clé et Résumé (facultatifs) : pour contrôler l\'import.',
  'Remplace les lignes d\'exemple par tes tickets, puis importe le fichier dans l\'appli.',
  '',
  'Depuis Jira : recherche avancée en JQL, colonnes Clé, Résumé et Résolu, puis Exporter › Exporter Excel CSV (champs actuels).',
  `Requête conseillée (remplacer EQ par la clé du projet) : ${JQL_HISTORY}`,
  '',
  'Format alternatif, déjà agrégé : deux colonnes « Semaine » (date du lundi) et « Tickets terminés » (nombre).',
  '',
  'Conseils : au moins 8 semaines d\'historique, une seule équipe par fichier, sans sous-tâches. La semaine en cours est ignorée.',
];

/** Onglets du modèle Excel, au format de `writeXlsx`. */
export function templateSheets(today = new Date()) {
  return [
    {
      name: DATA_SHEET,
      freezeRows: 1,
      colWidths: [12, 44, 14],
      rows: [HEADERS.map((value) => ({ value, style: STYLE.header })), ...exampleRows(today)],
    },
    {
      name: HELP_SHEET,
      colWidths: [120],
      rows: HELP.map((line, i) => [i === 0 ? { value: line, style: STYLE.title } : line]),
    },
  ];
}

/** Octets du modèle Excel. */
export function xlsxTemplate(today = new Date()) { return writeXlsx(templateSheets(today)); }

/** Texte du modèle CSV : séparateur « ; » et BOM pour Excel en français. */
export function csvTemplate(today = new Date()) {
  return `﻿${[HEADERS, ...exampleRows(today)].map((r) => r.join(';')).join('\r\n')}\r\n`;
}

/** Onglet de données d'un classeur lu : le premier dont le nom n'évoque pas un mode d'emploi. */
export function dataSheet(sheets) {
  return sheets.find((s) => !/mode|emploi|instruction|aide|guide|help/i.test(s.name) && s.rows.length) ?? sheets[0];
}
