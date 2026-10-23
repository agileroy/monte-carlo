// Logique métier pure des prévisions Monte Carlo : lecture des dates et des fichiers, débit par semaine,
// simulations et résultats. Aucun accès au DOM : le module est testé tel quel avec `npm test`.

export const DAY = 86_400_000;
export const MIN_WEEKS = 4;
export const RELIABLE_WEEKS = 8;
export const MAX_WEEKS_PER_RUN = 520;
export const DEFAULT_SIMS = 10_000;
export const MIN_SIMS = 1_000;
export const MAX_SIMS = 100_000;
export const MAX_BINS = 45;
export const LEVELS = Object.freeze([0.5, 0.85, 0.95]);
export const ZONE = Object.freeze({ risk: 'risk', likely: 'likely', safe: 'safe' });

/** Erreur de lecture ou de calcul, au message destiné à l'utilisateur. */
export class ForecastError extends Error {}

// ---------------------------------------------------------------- Dates

export function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
export function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
/** Lundi de la semaine qui contient `d`. */
export function mondayOf(d) { const x = startOfDay(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
export function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function fromIsoDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s ?? '');
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}
export function formatDate(d, withYear = false) {
  return d.toLocaleDateString('fr-FR', withYear ? { day: 'numeric', month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short' });
}
export function frDate(d) {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

const MONTHS = { jan: 0, feb: 1, fev: 1, mar: 2, apr: 3, avr: 3, may: 4, mai: 4, jun: 5, juin: 5, jul: 6, juil: 6, aug: 7, aou: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
const fullYear = (y) => (+y < 100 ? 2000 + +y : +y);
function validDate(y, m, d) {
  const x = new Date(y, m, d);
  return x.getFullYear() === y && x.getMonth() === m && x.getDate() === d && y > 1990 && y < 2100 ? x : null;
}

/**
 * Lit une date : objet Date, numéro de série Excel, `aaaa-mm-jj`, `jj/mm/aaaa` (ou `jj/mm/aa`, `.` ou `-`),
 * ou date Jira à mois abrégé en français ou en anglais (`06/oct./26 10:15`, `06/Oct/26 10:15 AM`).
 * Le jour est toujours lu avant le mois. Renvoie `null` si la valeur n'est pas une date.
 */
export function parseDate(v) {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : startOfDay(v);
  if (typeof v === 'number') {
    if (v <= 20000 || v >= 80000) return null;
    const d = new Date(1899, 11, 30);
    d.setDate(d.getDate() + Math.floor(v));
    return d;
  }
  const s = String(v).trim();
  let m;
  if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?!\d)/.exec(s))) return validDate(+m[1], +m[2] - 1, +m[3]);
  if ((m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})(?!\d)/.exec(s))) return validDate(fullYear(m[3]), +m[2] - 1, +m[1]);
  if ((m = /^(\d{1,2})[/\-\s]([A-Za-zÀ-ÿ.]+)[/\-\s](\d{2}|\d{4})(?!\d)/.exec(s))) {
    const name = m[2].normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\./g, '');
    const month = MONTHS[name.slice(0, 4)] ?? MONTHS[name.slice(0, 3)];
    if (month !== undefined) return validDate(fullYear(m[3]), month, +m[1]);
  }
  return null;
}

/** Lit un nombre positif (`12`, `12,5`, `12.5`) ; `null` sinon. */
export function parseNumber(v) {
  if (typeof v === 'number') return Number.isFinite(v) && v >= 0 ? v : null;
  const s = String(v ?? '').trim().replace(',', '.');
  return /^\d+(\.\d+)?$/.test(s) ? Number(s) : null;
}

// ---------------------------------------------------------------- Fichiers

/** Lit un texte CSV : séparateur détecté sur la première ligne (`;`, `,` ou tabulation), guillemets, BOM. */
export function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const first = text.split(/\r?\n/, 1)[0] ?? '';
  const delim = [';', ',', '\t'].map((d) => [d, first.split(d).length]).sort((a, b) => b[1] - a[1])[0][0];
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false; } else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === delim) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
const hasContent = (row) => Array.isArray(row) && row.some((c) => !isBlank(c));

function share(rows, col, read) {
  let n = 0;
  let ok = 0;
  for (const r of rows) {
    if (isBlank(r[col])) continue;
    n++;
    if (read(r[col]) !== null) ok++;
  }
  return n ? ok / n : 0;
}

const DATE_HEADERS = [
  /r[ée]solu|resolved|resolution ?date|date de r[ée]solution/i,
  /date de fin|termin|done|fini|livr|end ?date/i,
  /status ?category ?changed|cat[ée]gorie de statut/i,
  /date/i,
];
const COUNT_HEADER = /termin|nombre|^nb|count|throughput|d[ée]bit|livr/i;
const WEEK_HEADER = /semaine|week|date|p[ée]riode/i;

/**
 * Interprète les lignes d'un fichier (tableau de tableaux) :
 * - format agrégé : une colonne de semaines et une colonne de nombres de tickets terminés ;
 * - sinon une ligne par ticket, avec une colonne de date de fin.
 * Renvoie `{ kind: 'tickets' | 'weekly', column, tickets, weeks }` ; lève `ForecastError` si rien n'est exploitable.
 */
export function interpretRows(rows, today = new Date()) {
  rows = rows.filter(hasContent);
  if (rows.length < 2) throw new ForecastError('Le fichier ne contient pas assez de lignes : il faut une ligne d\'en-têtes puis au moins une ligne de données.');
  let h = 0;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    if (rows[i].some((c) => typeof c === 'string' && c.trim() && parseDate(c) === null && parseNumber(c) === null)) { h = i; break; }
  }
  const head = Array.from(rows[h], (c) => String(c ?? '').trim());
  const data = rows.slice(h + 1);
  const find = (re, read, min) => head.findIndex((t, i) => re.test(t) && share(data, i, read) >= min);

  const countCol = find(COUNT_HEADER, parseNumber, 0.8);
  const weekCol = find(WEEK_HEADER, parseDate, 0.8);
  if (countCol >= 0 && weekCol >= 0 && countCol !== weekCol) {
    const counts = new Map();
    for (const r of data) {
      const d = parseDate(r[weekCol]);
      const n = parseNumber(r[countCol]);
      if (d && n !== null) { const k = mondayOf(d).getTime(); counts.set(k, (counts.get(k) ?? 0) + n); }
    }
    if (!counts.size) throw new ForecastError('Aucune semaine exploitable dans ce fichier.');
    const weeks = weeksFromCounts(counts, { dropCurrent: false, today });
    return { kind: 'weekly', column: head[countCol], tickets: weeks.reduce((s, w) => s + w.count, 0), weeks };
  }

  let col = -1;
  for (const re of DATE_HEADERS) { col = find(re, parseDate, 0.5); if (col >= 0) break; }
  if (col < 0) col = head.findIndex((_, i) => share(data, i, parseDate) >= 0.8);
  if (col < 0) {
    throw new ForecastError('Aucune colonne de date trouvée. Ajoute une colonne « Résolu » (ou « Date de fin ») avec la date de fin de chaque ticket.');
  }
  const dates = data.map((r) => parseDate(r[col])).filter(Boolean);
  const counts = new Map();
  for (const d of dates) { const k = mondayOf(d).getTime(); counts.set(k, (counts.get(k) ?? 0) + 1); }
  const weeks = weeksFromCounts(counts, { dropCurrent: true, today });
  return { kind: 'tickets', column: head[col], tickets: weeks.reduce((s, w) => s + w.count, 0), weeks };
}

/**
 * Transforme des nombres par lundi en semaines consécutives `{ start, count }`, semaines vides à 0.
 * Avec `dropCurrent`, la semaine de `today` (incomplète) et les suivantes sont retirées.
 */
export function weeksFromCounts(counts, { dropCurrent = true, today = new Date() } = {}) {
  const keys = [...counts.keys()].sort((a, b) => a - b);
  if (!keys.length) throw new ForecastError('Aucune date exploitable dans ce fichier.');
  const current = mondayOf(today).getTime();
  let last = keys[keys.length - 1];
  if (dropCurrent && last >= current) last = addDays(new Date(current), -7).getTime();
  const weeks = [];
  for (let d = new Date(keys[0]); d.getTime() <= last; d = addDays(d, 7)) weeks.push({ start: new Date(d), count: counts.get(d.getTime()) ?? 0 });
  if (!weeks.length) throw new ForecastError('Pas encore de semaine complète dans ce fichier : la semaine en cours est ignorée.');
  return weeks;
}

/** 26 semaines fictives, terminées la semaine dernière (données d'exemple du premier affichage). */
export function sampleWeeks(today = new Date()) {
  const base = [5, 7, 4, 8, 6, 3, 7, 9, 5, 6, 2, 7, 8, 5, 6, 4, 9, 6, 5, 7, 3, 8, 6, 5, 7, 6];
  const current = mondayOf(today);
  return base.map((count, i) => ({ start: addDays(current, -7 * (base.length - i)), count }));
}

/** Les `n` dernières semaines (toutes si `n` vaut 0). */
export function lastWeeks(weeks, n) { return n > 0 ? weeks.slice(-n) : weeks.slice(); }

export function clampSims(v) {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_SIMS;
  return Math.min(MAX_SIMS, Math.max(MIN_SIMS, n));
}

/** Message d'erreur si l'historique ne permet pas de simuler, sinon `null`. */
export function historyProblem(sample) {
  if (sample.length < MIN_WEEKS) return `Il faut au moins ${MIN_WEEKS} semaines d'historique pour simuler.`;
  if (!sample.some((v) => v > 0)) return 'Aucun ticket terminé sur la période choisie : élargis l\'historique utilisé.';
  return null;
}

// ---------------------------------------------------------------- Simulations

/** Semaines nécessaires pour terminer `remaining` tickets, pour chaque simulation (triées). */
export function simulateWhen(sample, remaining, sims, rng = Math.random) {
  const L = sample.length;
  const res = new Int32Array(sims);
  for (let s = 0; s < sims; s++) {
    let done = 0;
    let w = 0;
    while (done < remaining && w < MAX_WEEKS_PER_RUN) { done += sample[Math.floor(rng() * L)]; w++; }
    res[s] = w;
  }
  return res.sort();
}

/** Tickets terminés en `weeks` semaines, pour chaque simulation (triés). */
export function simulateHowMany(sample, weeks, sims, rng = Math.random) {
  const L = sample.length;
  const res = new Float64Array(sims);
  for (let s = 0; s < sims; s++) {
    let done = 0;
    for (let w = 0; w < weeks; w++) done += sample[Math.floor(rng() * L)];
    res[s] = done;
  }
  return res.sort();
}

/** Plus petite valeur atteinte par au moins `p` des simulations (résultats triés, croissants). */
export function percentile(sorted, p) { return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1))]; }
/** Plus grande valeur atteinte ou dépassée par au moins `p` des simulations. */
export function atLeast(sorted, p) { return sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor((1 - p) * sorted.length)))]; }

/**
 * « Quand aura-t-on fini ? ». Renvoie les niveaux (semaines et dates) et, par durée possible,
 * le nombre de simulations, la zone et la probabilité d'avoir fini à cette date.
 */
export function forecastWhen({ sample, remaining, sims, start, rng = Math.random }) {
  const problem = historyProblem(sample);
  if (problem) throw new ForecastError(problem);
  if (!(remaining >= 1)) throw new ForecastError('Indique un nombre de tickets restants supérieur à zéro.');
  const res = simulateWhen(sample, remaining, sims, rng);
  const end = (w) => addDays(start, w * 7);
  const levels = LEVELS.map((p) => { const weeks = percentile(res, p); return { p, weeks, date: end(weeks) }; });
  const [p50, p85] = levels.map((l) => l.weeks);
  const bars = [];
  let i = 0;
  let acc = 0;
  for (let w = res[0]; w <= res[res.length - 1]; w++) {
    let count = 0;
    while (i < res.length && res[i] === w) { count++; i++; }
    acc += count;
    bars.push({ weeks: w, date: end(w), count, share: count / sims, cumulative: acc / sims, zone: w < p50 ? ZONE.risk : w < p85 ? ZONE.likely : ZONE.safe });
  }
  return { sims, remaining, weeksUsed: sample.length, start, levels, bars, capped: res[res.length - 1] >= MAX_WEEKS_PER_RUN };
}

/**
 * « Combien d'ici une date ? ». Renvoie les niveaux (au moins X tickets) et, par tranche de résultats
 * (45 au plus), le nombre de simulations, la zone et la probabilité de livrer au moins le bas de la tranche.
 */
export function forecastHowMany({ sample, target, sims, start, rng = Math.random }) {
  const problem = historyProblem(sample);
  if (problem) throw new ForecastError(problem);
  const weeks = target ? Math.floor((startOfDay(target) - startOfDay(start)) / DAY / 7) : 0;
  if (weeks < 1) throw new ForecastError('Choisis une date cible au moins une semaine après la date de départ.');
  const res = simulateHowMany(sample, weeks, sims, rng);
  const levels = LEVELS.map((p) => ({ p, tickets: atLeast(res, p) }));
  const [x50, x85] = levels.map((l) => l.tickets);
  const min = res[0];
  const max = res[res.length - 1];
  const size = Math.max(1, Math.ceil((max - min + 1) / MAX_BINS));
  const bars = [];
  let i = 0;
  for (let lo = min; lo <= max; lo += size) {
    const hi = lo + size - 1;
    const below = i;
    let count = 0;
    while (i < res.length && res[i] <= hi) { count++; i++; }
    const mid = lo + (size - 1) / 2;
    bars.push({ low: lo, high: hi, count, share: count / sims, atLeast: (sims - below) / sims, zone: mid > x50 ? ZONE.risk : mid > x85 ? ZONE.likely : ZONE.safe });
  }
  return { sims, weeks, weeksUsed: sample.length, start, target, levels, bars, binSize: size };
}

// ---------------------------------------------------------------- Textes

const fmtInt = (n) => n.toLocaleString('fr-FR');

export function summaryWhen(r) {
  const [a, b, c] = r.levels;
  return `D'après ${fmtInt(r.sims)} simulations basées sur le débit des ${r.weeksUsed} dernières semaines, les ${r.remaining} tickets restants ont 50 % de chances d'être terminés avant le ${formatDate(a.date, true)}, 85 % de chances avant le ${formatDate(b.date, true)} et 95 % avant le ${formatDate(c.date, true)}.`;
}

export function summaryHowMany(r) {
  const [a, b, c] = r.levels;
  return `D'après ${fmtInt(r.sims)} simulations basées sur le débit des ${r.weeksUsed} dernières semaines, d'ici le ${formatDate(r.target, true)} (${r.weeks} semaines), l'équipe livrera au moins ${b.tickets} tickets avec 85 % de confiance, au moins ${c.tickets} avec 95 % de confiance, et ${a.tickets} dans un scénario sur deux.`;
}
