import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseDate, parseNumber, parseCsv, interpretRows, weeksFromCounts, sampleWeeks, lastWeeks, clampSims, historyProblem,
  simulateWhen, simulateHowMany, percentile, atLeast, forecastWhen, forecastHowMany, summaryWhen, summaryHowMany,
  mondayOf, isoDate, ForecastError, ZONE, DEFAULT_SIMS, MAX_SIMS, MIN_SIMS, MAX_BINS,
} from '../site/js/forecast-core.js';

const d = (s) => { const [y, m, j] = s.split('-').map(Number); return new Date(y, m - 1, j); };
const iso = (x) => (x ? isoDate(x) : x);
/** Générateur pseudo-aléatoire reproductible. */
function seeded(seed = 42) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }

// ---------------------------------------------------------------- Dates

test('dates : formats reconnus, jour avant mois', () => {
  assert.equal(iso(parseDate('03/04/2026')), '2026-04-03');
  assert.equal(iso(parseDate('3/4/26')), '2026-04-03');
  assert.equal(iso(parseDate('2026-10-06')), '2026-10-06');
  assert.equal(iso(parseDate('2026-10-06T14:30:00')), '2026-10-06');
  assert.equal(iso(parseDate('06.10.2026')), '2026-10-06');
});

test('dates : formats Jira, mois en français ou en anglais', () => {
  assert.equal(iso(parseDate('06/oct./26 10:15')), '2026-10-06');
  assert.equal(iso(parseDate('06/Oct/26 10:15 AM')), '2026-10-06');
  assert.equal(iso(parseDate('12/févr./26 09:00')), '2026-02-12');
  assert.equal(iso(parseDate('02/juin/26')), '2026-06-02');
  assert.equal(iso(parseDate('02/juil./26')), '2026-07-02');
  assert.equal(iso(parseDate('15/août/26')), '2026-08-15');
  assert.equal(iso(parseDate('15/Aug/2026')), '2026-08-15');
});

test('dates : numéro de série Excel et objets Date', () => {
  assert.equal(iso(parseDate(46301)), '2026-10-06');
  assert.equal(iso(parseDate(new Date(2026, 9, 6, 15, 30))), '2026-10-06');
});

test('dates : valeurs refusées', () => {
  for (const v of ['', null, undefined, 'Terminé', 'EQ-12', '31/02/2026', '13/13/2026', 5, '12', 'Fixed']) {
    assert.equal(parseDate(v), null, String(v));
  }
});

test('nombres', () => {
  assert.equal(parseNumber('12'), 12);
  assert.equal(parseNumber('2,5'), 2.5);
  assert.equal(parseNumber(7), 7);
  assert.equal(parseNumber('abc'), null);
  assert.equal(parseNumber(-1), null);
});

// ---------------------------------------------------------------- CSV

test('CSV : point-virgule, guillemets, BOM, fins de ligne Windows', () => {
  const rows = parseCsv('﻿Clé;Résumé;Résolu\r\nEQ-1;"Texte; avec ""guillemets"""\r\nEQ-2;"Sur\ndeux lignes";06/10/2026');
  assert.deepEqual(rows, [['Clé', 'Résumé', 'Résolu'], ['EQ-1', 'Texte; avec "guillemets"'], ['EQ-2', 'Sur\ndeux lignes', '06/10/2026']]);
});

test('CSV : virgule détectée', () => {
  assert.deepEqual(parseCsv('a,b\n1,2\n'), [['a', 'b'], ['1', '2']]);
});

// ---------------------------------------------------------------- Interprétation

const TODAY = d('2026-10-22'); // jeudi

test('export Jira : la colonne « Résolu » est choisie, pas « Résolution »', () => {
  const rows = parseCsv([
    'Clé;Résumé;Résolution;Créé;Résolu',
    'EQ-1;A;Terminé;01/09/26 10:00;06/oct./26 10:15',
    'EQ-2;B;Terminé;01/09/26 10:00;07/oct./26 11:00',
    'EQ-3;C;Terminé;01/09/26 10:00;20/oct./26 09:00',
  ].join('\n'));
  const r = interpretRows(rows, TODAY);
  assert.equal(r.kind, 'tickets');
  assert.equal(r.column, 'Résolu');
  assert.equal(r.tickets, 2, 'le ticket de la semaine en cours est ignoré');
  assert.deepEqual(r.weeks.map((w) => [iso(w.start), w.count]), [['2026-10-05', 2], ['2026-10-12', 0]]);
});

test('semaine sans ticket comptée pour 0', () => {
  const r = interpretRows([['Résolu'], ['06/10/2026'], ['20/10/2026']], d('2026-11-02'));
  assert.deepEqual(r.weeks.map((w) => [iso(w.start), w.count]), [['2026-10-05', 1], ['2026-10-12', 0], ['2026-10-19', 1]]);
});

test('semaine en cours ignorée', () => {
  const r = interpretRows([['Résolu'], ['13/10/2026'], ['19/10/2026'], ['20/10/2026'], ['21/10/2026']], TODAY);
  assert.deepEqual(r.weeks.map((w) => [iso(w.start), w.count]), [['2026-10-12', 1]]);
});

test('colonne sans en-tête reconnu : 80 % de dates', () => {
  const r = interpretRows([['Ticket', 'Fin'], ['A', '01/10/2026'], ['B', '08/10/2026']], TODAY);
  assert.equal(r.column, 'Fin');
});

test('format agrégé par semaine', () => {
  const rows = [['Semaine', 'Tickets terminés'], ...Array.from({ length: 12 }, (_, i) => [isoDate(new Date(2026, 6, 6 + 7 * i)), String(i % 4 + 3)])];
  const r = interpretRows(rows, TODAY);
  assert.equal(r.kind, 'weekly');
  assert.equal(r.weeks.length, 12);
  assert.deepEqual(r.weeks.slice(0, 4).map((w) => w.count), [3, 4, 5, 6]);
});

test('erreurs : sans date, trop court, seulement la semaine en cours', () => {
  assert.throws(() => interpretRows([['Clé', 'Résumé'], ['EQ-1', 'A']], TODAY), (e) => e instanceof ForecastError && /Aucune colonne de date/.test(e.message));
  assert.throws(() => interpretRows([['Résolu']], TODAY), ForecastError);
  assert.throws(() => interpretRows([['Résolu'], ['20/10/2026']], TODAY), /semaine en cours/);
});

test('lignes vides et cellules manquantes (classeur clairsemé)', () => {
  const rows = [['Clé', , 'Résolu'], [], ['EQ-1', , '06/10/2026'], ['', '', ''], ['EQ-2', , '13/10/2026']];
  assert.equal(interpretRows(rows, TODAY).tickets, 2);
});

test('weeksFromCounts : semaines consécutives', () => {
  const counts = new Map([[d('2026-09-07').getTime(), 2], [d('2026-09-28').getTime(), 1]]);
  assert.equal(weeksFromCounts(counts, { today: TODAY }).length, 4);
});

// ---------------------------------------------------------------- Réglages

test('données d\'exemple : 26 semaines terminées la semaine dernière', () => {
  const w = sampleWeeks(TODAY);
  assert.equal(w.length, 26);
  assert.equal(iso(w[25].start), '2026-10-12');
  assert.equal(iso(mondayOf(TODAY)), '2026-10-19');
});

test('historique retenu et nombre de simulations', () => {
  const w = sampleWeeks(TODAY);
  assert.equal(lastWeeks(w, 8).length, 8);
  assert.equal(lastWeeks(w, 0).length, 26);
  assert.equal(clampSims(''), DEFAULT_SIMS);
  assert.equal(clampSims(10), MIN_SIMS);
  assert.equal(clampSims(1e9), MAX_SIMS);
  assert.equal(clampSims('25000'), 25000);
});

test('historique insuffisant ou sans ticket', () => {
  assert.match(historyProblem([1, 2, 3]), /au moins 4 semaines/);
  assert.match(historyProblem([0, 0, 0, 0]), /Aucun ticket/);
  assert.equal(historyProblem([0, 1, 0, 2]), null);
  assert.throws(() => forecastWhen({ sample: [0, 0, 0, 0], remaining: 10, sims: 100, start: TODAY }), /élargis l'historique/);
});

// ---------------------------------------------------------------- Simulations

test('percentiles', () => {
  const sorted = Float64Array.from({ length: 100 }, (_, i) => i + 1);
  assert.equal(percentile(sorted, 0.5), 50);
  assert.equal(percentile(sorted, 0.85), 85);
  assert.equal(atLeast(sorted, 0.85), 16);
  assert.equal(atLeast(sorted, 0.5), 51);
});

test('Quand ? débit constant : 40 tickets à 5 par semaine = 8 semaines', () => {
  const r = forecastWhen({ sample: [5, 5, 5, 5, 5, 5], remaining: 40, sims: 1000, start: d('2026-10-26') });
  assert.deepEqual(r.levels.map((l) => l.weeks), [8, 8, 8]);
  assert.equal(iso(r.levels[0].date), '2026-12-21');
  assert.equal(r.bars.length, 1);
  assert.equal(r.bars[0].cumulative, 1);
});

test('Quand ? semaines à 0 prises en compte', () => {
  const res = simulateWhen([0, 10, 0, 10], 10, 2000, seeded(1));
  assert.ok(res[0] >= 1);
  assert.ok(res[res.length - 1] > 2, 'certaines simulations tirent plusieurs semaines à 0');
});

test('Quand ? zones et courbe cumulée cohérentes', () => {
  const r = forecastWhen({ sample: [2, 7, 4, 9, 1, 6, 5, 3], remaining: 40, sims: 5000, start: TODAY, rng: seeded(7) });
  const [p50, p85, p95] = r.levels.map((l) => l.weeks);
  assert.ok(p50 <= p85 && p85 <= p95);
  for (const b of r.bars) {
    assert.equal(b.zone, b.weeks < p50 ? ZONE.risk : b.weeks < p85 ? ZONE.likely : ZONE.safe);
  }
  assert.ok(r.bars.find((b) => b.weeks === p85).cumulative >= 0.85);
  assert.ok((r.bars.find((b) => b.weeks === p85 - 1)?.cumulative ?? 0) < 0.85);
  assert.equal(r.bars.at(-1).cumulative, 1);
  assert.equal(r.bars.reduce((s, b) => s + b.count, 0), 5000);
});

test('Quand ? nombre de tickets restants invalide', () => {
  assert.throws(() => forecastWhen({ sample: [5, 5, 5, 5], remaining: 0, sims: 100, start: TODAY }), /supérieur à zéro/);
});

test('Combien ? débit constant : 10 semaines à 5 = au moins 50 tickets', () => {
  const start = d('2026-10-26');
  const r = forecastHowMany({ sample: [5, 5, 5, 5], target: d('2027-01-04'), sims: 1000, start });
  assert.equal(r.weeks, 10);
  assert.deepEqual(r.levels.map((l) => l.tickets), [50, 50, 50]);
});

test('Combien ? date cible trop proche', () => {
  assert.throws(() => forecastHowMany({ sample: [5, 5, 5, 5], target: d('2026-10-29'), sims: 100, start: d('2026-10-26') }), /au moins une semaine/);
});

test('Combien ? niveaux décroissants, tranches et probabilités', () => {
  const r = forecastHowMany({ sample: [0, 3, 12, 25, 1, 8], target: d('2027-06-01'), sims: 5000, start: TODAY, rng: seeded(3) });
  const [x50, x85, x95] = r.levels.map((l) => l.tickets);
  assert.ok(x50 >= x85 && x85 >= x95);
  assert.ok(r.bars.length <= MAX_BINS);
  assert.equal(r.bars[0].atLeast, 1);
  for (let i = 1; i < r.bars.length; i++) assert.ok(r.bars[i].atLeast <= r.bars[i - 1].atLeast);
  const res = simulateHowMany([0, 3, 12, 25, 1, 8], r.weeks, 5000, seeded(3));
  assert.ok(res.filter((v) => v >= x85).length / 5000 >= 0.85);
});

test('synthèses', () => {
  const w = forecastWhen({ sample: [5, 5, 5, 5], remaining: 40, sims: 10000, start: d('2026-10-26') });
  assert.match(summaryWhen(w), /^D'après 10\s000 simulations .* 4 dernières semaines, les 40 tickets restants ont 50 % de chances d'être terminés avant le 21 déc\. 2026/);
  const h = forecastHowMany({ sample: [5, 5, 5, 5], target: d('2027-01-04'), sims: 10000, start: d('2026-10-26') });
  assert.match(summaryHowMany(h), /d'ici le 4 janv\. 2027 \(10 semaines\), l'équipe livrera au moins 50 tickets avec 85 % de confiance/);
});
