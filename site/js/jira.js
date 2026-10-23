// Requêtes JQL du guide, construites pour le projet saisi par l'utilisateur. Module pur, testé avec `npm test`.

export const EXAMPLE_PROJECT = 'EQ';
export const MAX_PROJECT_LENGTH = 100;

/** Projet tel qu'il s'écrit après `project =` : clé ou nom simple tel quel, sinon entre guillemets échappés. */
export function projectClause(input) {
  const value = String(input ?? '').trim().replace(/\s+/g, ' ').slice(0, MAX_PROJECT_LENGTH).trim();
  if (!value) return EXAMPLE_PROJECT;
  if (/^[A-Za-z0-9_]+$/.test(value)) return value;
  return `"${value.replace(/[\\"]/g, (c) => `\\${c}`)}"`;
}

/** Tickets terminés sur les 26 dernières semaines, sans sous-tâches. */
export function historyJql(project, separator = '\n') {
  return [
    `project = ${projectClause(project)} AND statusCategory = Done`,
    'AND resolved >= -26w',
    'AND issuetype not in subTaskIssueTypes()',
    'ORDER BY resolved ASC',
  ].join(separator);
}

/** Tickets restants d'une version (à adapter dans Jira), sans sous-tâches. */
export function remainingJql(project, separator = '\n') {
  return [
    `project = ${projectClause(project)} AND statusCategory != Done`,
    'AND fixVersion = "Version 2.4"',
    'AND issuetype not in subTaskIssueTypes()',
  ].join(separator);
}
