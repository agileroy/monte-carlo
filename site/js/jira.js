// Requête JQL d'historique du guide, construite pour le périmètre saisi : un projet ou la requête de filtre
// d'un board. Module pur, testé avec `npm test`.

export const EXAMPLE_PROJECT = 'EQ';
export const MAX_PROJECT_LENGTH = 100;
export const MAX_FILTER_LENGTH = 2000;
export const SCOPE = Object.freeze({ project: 'project', board: 'board' });

/** Projet tel qu'il s'écrit après `project =` : clé ou nom simple tel quel, sinon entre guillemets échappés. */
export function projectClause(input) {
  const value = String(input ?? '').trim().replace(/\s+/g, ' ').slice(0, MAX_PROJECT_LENGTH).trim();
  if (!value) return EXAMPLE_PROJECT;
  if (/^[A-Za-z0-9_]+$/.test(value)) return value;
  return `"${value.replace(/[\\"]/g, (c) => `\\${c}`)}"`;
}

/** Retire le `ORDER BY` final d'une requête JQL, sans tenir compte du texte entre guillemets. */
export function stripOrderBy(jql) {
  const text = String(jql ?? '');
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'") quote = c;
    else if (/^order\s+by\b/i.test(text.slice(i)) && (i === 0 || /[\s)]/.test(text[i - 1]))) return text.slice(0, i).trim();
  }
  return text.trim();
}

/** Requête du board nettoyée : une ligne, sans `ORDER BY`, 2 000 caractères au plus (vide si rien d'exploitable). */
export function cleanFilter(input) {
  return stripOrderBy(String(input ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_FILTER_LENGTH));
}

/**
 * Condition de périmètre : `(<requête du board>)` en mode board si elle n'est pas vide, sinon `project = <projet>`.
 * `scope` : `{ mode, project, filter }`, ou simplement un nom de projet.
 */
export function scopeClause(scope) {
  const { mode = SCOPE.project, project = '', filter = '' } = typeof scope === 'object' && scope !== null ? scope : { project: scope };
  if (mode === SCOPE.board) {
    const clean = cleanFilter(filter);
    if (clean) return `(${clean})`;
    return `project = ${EXAMPLE_PROJECT}`;
  }
  return `project = ${projectClause(project)}`;
}

/** Le périmètre est-il renseigné (sinon la requête utilise l'exemple) ? */
export function scopeIsSet(scope) {
  return scope.mode === SCOPE.board ? Boolean(cleanFilter(scope.filter)) : Boolean(String(scope.project ?? '').trim());
}

/**
 * Tickets terminés du périmètre sur les 27 dernières semaines, sans sous-tâches. `-27w` remonte 27 × 7 jours depuis la
 * recherche : une fois la semaine en cours écartée, il reste 26 semaines complètes (la 27e, la plus ancienne, est partielle).
 */
export function historyJql(scope, separator = '\n') {
  return [
    scopeClause(scope),
    'AND statusCategory = Done',
    'AND resolved >= -27w',
    'AND issuetype not in subTaskIssueTypes()',
    'ORDER BY resolved ASC',
  ].join(separator);
}
