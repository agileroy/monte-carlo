// Interface : import, réglages, onglets, résultats, modèles et guide. Toute la logique de calcul est dans forecast-core.js.

import {
  ForecastError, interpretRows, parseCsv, sampleWeeks, lastWeeks, clampSims, forecastWhen, forecastHowMany,
  summaryWhen, summaryHowMany, formatDate, isoDate, fromIsoDate, addDays, startOfDay, RELIABLE_WEEKS,
} from './forecast-core.js';
import { readXlsx, XlsxError, MAX_FILE_BYTES } from './xlsx-lite.js';
import { xlsxTemplate, csvTemplate, dataSheet, TEMPLATE_BASENAME } from './templates.js';
import { drawChart } from './charts.js';
import { historyJql, remainingJql } from './jira.js';

const $ = (id) => document.getElementById(id);
const nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
const pct = (x) => `${nf.format(Math.round(x * 1000) / 10)} %`;
const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
const today = startOfDay(new Date());

const SAMPLE_MESSAGE = 'Exemple fictif chargé : 26 semaines de tickets terminés. Importe ton propre export pour remplacer ces données.';
// `version` change à chaque nouveau jeu de données ; `results` garde le dernier résultat de chaque onglet.
const state = { weeks: sampleWeeks(today), sample: true, version: 0, tab: 'quand', results: { quand: null, combien: null } };

$('start').value = isoDate(today);
$('target').value = isoDate(addDays(today, 70));

function setMsg(el, kind, text) { el.className = `msg ${kind}`; el.textContent = text; el.hidden = false; }

// ---------------------------------------------------------------- Données

function usedWeeks() { return lastWeeks(state.weeks, Number($('win').value)); }

function renderData() {
  const weeks = state.weeks;
  const used = usedWeeks();
  $('st-tickets').textContent = weeks.reduce((s, w) => s + w.count, 0).toLocaleString('fr-FR');
  $('st-weeks').textContent = weeks.length;
  $('st-avg').textContent = nf.format(used.reduce((s, w) => s + w.count, 0) / used.length);
  $('hist-range').textContent = `${formatDate(weeks[0].start, true)} → ${formatDate(addDays(weeks.at(-1).start, 6), true)}`;
  $('source-pill').className = `pill ${state.sample ? 'sample' : 'real'}`;
  $('source-text').textContent = state.sample ? "Données d'exemple" : 'Tes données';
  const first = weeks.length - used.length;
  drawChart($('ch-hist'), {
    type: 'bars',
    label: 'Nombre de tickets terminés par semaine',
    labels: weeks.map((w) => formatDate(w.start)),
    values: weeks.map((w) => w.count),
    muted: new Set(weeks.map((_, i) => i).filter((i) => i < first)),
    tooltip: (i) => ({ title: `Semaine du ${formatDate(weeks[i].start, true)}`, text: `${plural(weeks[i].count, 'ticket')} ${weeks[i].count > 1 ? 'terminés' : 'terminé'}` }),
  });
}

async function readRows(file) {
  const ext = (file.name.split('.').pop() ?? '').toLowerCase();
  if (file.size > MAX_FILE_BYTES) throw new ForecastError('Fichier trop volumineux (2 Mo au plus) : limite l\'export à l\'historique utile.');
  if (ext === 'xls') throw new ForecastError('Ancien format Excel (.xls) : enregistre le fichier au format Excel (.xlsx) ou CSV, puis réessaie.');
  if (ext === 'xlsx') {
    try {
      const { sheets } = await readXlsx(new Uint8Array(await file.arrayBuffer()));
      return dataSheet(sheets)?.rows ?? [];
    } catch (error) {
      if (error instanceof XlsxError) throw new ForecastError('Fichier illisible : enregistre-le au format Excel (.xlsx) ou CSV, puis réessaie.');
      throw error;
    }
  }
  return parseCsv(await file.text());
}

async function handleFile(file) {
  if (!file) return;
  const msg = $('import-msg');
  try {
    const r = interpretRows(await readRows(file), today);
    state.weeks = r.weeks;
    state.sample = false;
    state.version++;
    const w = r.weeks;
    const period = `du ${formatDate(w[0].start, true)} au ${formatDate(addDays(w.at(-1).start, 6), true)}`;
    if (w.length < RELIABLE_WEEKS) {
      const s = w.length > 1 ? 's' : '';
      setMsg(msg, 'err', `${file.name} importé, mais seulement ${w.length} semaine${s} complète${s} : la prévision sera peu fiable. Vise au moins ${RELIABLE_WEEKS} semaines.`);
    } else if (r.kind === 'tickets') {
      setMsg(msg, 'ok', `${file.name} importé : ${plural(r.tickets, 'ticket')}, date lue dans la colonne « ${r.column} », ${period}.`);
    } else {
      setMsg(msg, 'ok', `${file.name} importé : ${w.length} semaines de débit, lues dans la colonne « ${r.column} », ${period}.`);
    }
    renderData();
    refresh();
  } catch (error) {
    setMsg(msg, 'err', error instanceof ForecastError ? error.message : 'Impossible de lire ce fichier. Vérifie qu\'il s\'agit d\'un fichier CSV ou Excel (.xlsx).');
  }
}

// ---------------------------------------------------------------- Prévision

const REF_LINES = [{ value: 50, label: '50 %', cls: 'risk' }, { value: 85, label: '85 %', cls: 'likely' }, { value: 95, label: '95 %', cls: 'safe' }];

/** Entrées de la simulation de l'onglet `tab`, sous une forme comparable. */
function inputs(tab = state.tab) {
  const common = [state.version, $('win').value, clampSims($('sims').value), $('start').value];
  return JSON.stringify(tab === 'quand' ? [...common, Math.round(Number($('remaining').value))] : [...common, $('target').value]);
}

function setTiles(values) {
  ['50', '85', '95'].forEach((k, i) => { $(`t${k}`).textContent = values[i][0]; $(`t${k}s`).textContent = values[i][1]; });
}

/** Lance la simulation de l'onglet actif et mémorise son résultat. */
function launch() {
  const tab = state.tab;
  const sample = usedWeeks().map((w) => w.count);
  const sims = clampSims($('sims').value);
  const start = fromIsoDate($('start').value) ?? today;
  const entry = { sig: inputs(tab), sims, weeksUsed: sample.length };
  try {
    entry.result = tab === 'quand'
      ? forecastWhen({ sample, remaining: Math.round(Number($('remaining').value)), sims, start })
      : forecastHowMany({ sample, target: fromIsoDate($('target').value), sims, start });
  } catch (error) {
    if (!(error instanceof ForecastError)) throw error;
    entry.error = error.message;
  }
  state.results[tab] = entry;
  show();
}

/** Affiche le résultat mémorisé de l'onglet actif (ou l'invitation, ou l'erreur). */
function show() {
  const entry = state.results[state.tab];
  $('res-empty').hidden = Boolean(entry);
  $('res-err').hidden = !entry?.error;
  $('res-err').textContent = entry?.error ?? '';
  $('results').hidden = !entry?.result;
  if (entry?.result) {
    $('sim-note').textContent = `${entry.sims.toLocaleString('fr-FR')} simulations · ${entry.weeksUsed} semaines`;
    if (state.tab === 'quand') renderWhen(entry.result); else renderHowMany(entry.result);
  }
  refresh();
}

/** Signale des résultats périmés : entrées différentes de celles du résultat affiché. */
function refresh() {
  const entry = state.results[state.tab];
  const stale = Boolean(entry) && entry.sig !== inputs();
  $('stale').hidden = !stale;
  $('results').classList.toggle('is-stale', stale);
  $('res-err').classList.toggle('is-stale', stale);
  updateTargetHint();
}

function updateTargetHint() {
  const start = fromIsoDate($('start').value) ?? today;
  const target = fromIsoDate($('target').value);
  const weeks = target ? Math.floor((target - start) / 86_400_000 / 7) : 0;
  $('target-hint').textContent = weeks >= 1 ? `Soit ${plural(weeks, 'semaine')} complète${weeks > 1 ? 's' : ''} de travail à partir du ${formatDate(start, true)}.` : '';
}

function renderWhen(r) {
  const withYear = r.levels[2].date.getFullYear() !== r.start.getFullYear();
  setTiles(r.levels.map((l) => [formatDate(l.date, withYear), `dans ${plural(l.weeks, 'semaine')}`]));
  const labels = r.bars.map((b) => formatDate(b.date, withYear));
  $('h-dist').textContent = 'Date de fin selon les simulations';
  $('h-cum').textContent = "Probabilité d'avoir fini avant…";
  drawChart($('ch-dist'), {
    type: 'bars', label: 'Histogramme des dates de fin simulées', labels, values: r.bars.map((b) => b.count), zones: r.bars.map((b) => b.zone),
    tooltip: (i) => ({ title: `Fin le ${formatDate(r.bars[i].date, true)} (${plural(r.bars[i].weeks, 'semaine')})`, text: `${r.bars[i].count.toLocaleString('fr-FR')} simulations (${pct(r.bars[i].share)})` }),
  });
  const levelWeeks = new Set(r.levels.map((l) => l.weeks));
  drawChart($('ch-cum'), {
    type: 'line', label: "Probabilité d'avoir fini selon la date", labels, values: r.bars.map((b) => b.cumulative * 100),
    yMax: 100, yTicks: [0, 25, 50, 75, 100], yFormat: (v) => `${v} %`, refLines: REF_LINES,
    markers: r.bars.map((b, i) => (levelWeeks.has(b.weeks) ? i : -1)).filter((i) => i >= 0),
    tooltip: (i) => ({ title: `Avant le ${formatDate(r.bars[i].date, true)}`, text: `${pct(r.bars[i].cumulative)} de chances d'avoir fini` }),
  });
  $('summary').textContent = summaryWhen(r);
}

function renderHowMany(r) {
  setTiles(r.levels.map((l) => [`≥ ${plural(l.tickets, 'ticket')}`, `d'ici le ${formatDate(r.target, true)}`]));
  const range = (b) => (b.low === b.high ? String(b.low) : `${b.low}–${b.high}`);
  const labels = r.bars.map(range);
  $('h-dist').textContent = 'Tickets livrés selon les simulations';
  $('h-cum').textContent = 'Probabilité de livrer au moins…';
  drawChart($('ch-dist'), {
    type: 'bars', label: 'Histogramme des nombres de tickets livrés simulés', labels, values: r.bars.map((b) => b.count), zones: r.bars.map((b) => b.zone),
    tooltip: (i) => ({ title: `${range(r.bars[i])} tickets livrés`, text: `${r.bars[i].count.toLocaleString('fr-FR')} simulations (${pct(r.bars[i].share)})` }),
  });
  const levelTickets = r.levels.map((l) => l.tickets);
  drawChart($('ch-cum'), {
    type: 'line', label: 'Probabilité de livrer au moins chaque nombre de tickets', labels, values: r.bars.map((b) => b.atLeast * 100),
    yMax: 100, yTicks: [0, 25, 50, 75, 100], yFormat: (v) => `${v} %`, refLines: REF_LINES,
    markers: r.bars.map((b, i) => (levelTickets.some((x) => x >= b.low && x <= b.high) ? i : -1)).filter((i) => i >= 0),
    tooltip: (i) => ({ title: `Au moins ${plural(r.bars[i].low, 'ticket')}`, text: `${pct(r.bars[i].atLeast)} de chances` }),
  });
  $('summary').textContent = summaryHowMany(r);
}

// ---------------------------------------------------------------- Interactions

function setTab(tab) {
  state.tab = tab;
  for (const [id, name] of [['tab-quand', 'quand'], ['tab-combien', 'combien']]) {
    $(id).setAttribute('aria-selected', String(tab === name));
    $(id).tabIndex = tab === name ? 0 : -1;
  }
  $('q-quand').hidden = tab !== 'quand';
  $('q-combien').hidden = tab !== 'combien';
  show();
}
$('tab-quand').addEventListener('click', () => setTab('quand'));
$('tab-combien').addEventListener('click', () => setTab('combien'));
document.querySelector('[role=tablist]').addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  const next = state.tab === 'quand' ? 'combien' : 'quand';
  setTab(next);
  $(`tab-${next}`).focus();
});

$('launch').addEventListener('click', launch);
for (const id of ['remaining', 'target', 'sims', 'start']) {
  $(id).addEventListener('input', refresh);
  $(id).addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (id === 'sims') $('sims').value = clampSims($('sims').value);
    launch();
  });
}
$('sims').addEventListener('change', () => { $('sims').value = clampSims($('sims').value); refresh(); });
$('win').addEventListener('change', () => { renderData(); refresh(); });
$('to-guide').addEventListener('click', (event) => {
  event.preventDefault();
  $('guide').open = true;
  $('guide').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('guide-summary').focus({ preventScroll: true });
});

const drop = $('drop');
const input = $('file');
drop.addEventListener('click', () => input.click());
drop.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input.click(); } });
input.addEventListener('change', () => { handleFile(input.files[0]); input.value = ''; });
for (const type of ['dragenter', 'dragover']) drop.addEventListener(type, (event) => { event.preventDefault(); drop.classList.add('over'); });
for (const type of ['dragleave', 'drop']) drop.addEventListener(type, (event) => { event.preventDefault(); drop.classList.remove('over'); });
drop.addEventListener('drop', (event) => handleFile(event.dataTransfer.files[0]));
$('reset-sample').addEventListener('click', () => {
  state.weeks = sampleWeeks(today);
  state.sample = true;
  state.version++;
  setMsg($('import-msg'), 'info', SAMPLE_MESSAGE);
  renderData();
  refresh();
});

// ---------------------------------------------------------------- Projet Jira du guide

const PROJECT_KEY = 'monte-carlo.jira-project';
function renderJql() {
  const project = $('jira-project').value;
  $('jql1').textContent = historyJql(project);
  $('jql2').textContent = remainingJql(project);
  $('jira-project-hint').textContent = project.trim()
    ? 'Les requêtes ci-dessous utilisent ce projet. Il est mémorisé dans ton navigateur.'
    : 'Saisis ton projet : les requêtes ci-dessous se mettent à jour.';
}
try { $('jira-project').value = localStorage.getItem(PROJECT_KEY) ?? ''; } catch { /* stockage indisponible */ }
$('jira-project').addEventListener('input', () => {
  renderJql();
  try { localStorage.setItem(PROJECT_KEY, $('jira-project').value.trim()); } catch { /* stockage indisponible : projet non mémorisé */ }
});
renderJql();

// ---------------------------------------------------------------- Copie et modèles

async function copy(text, button) {
  const label = button.textContent;
  try { await navigator.clipboard.writeText(text); button.textContent = 'Copié'; } catch { button.textContent = 'Sélectionne et copie le texte'; }
  setTimeout(() => { button.textContent = label; }, 1600);
}
$('copy-sum').addEventListener('click', (event) => copy($('summary').textContent, event.currentTarget));
for (const button of document.querySelectorAll('[data-copy]')) button.addEventListener('click', () => copy($(button.dataset.copy).textContent, button));

function save(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
$('dl-xlsx').addEventListener('click', async () => {
  save(new Blob([await xlsxTemplate(today)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${TEMPLATE_BASENAME}.xlsx`);
});
$('dl-csv').addEventListener('click', () => save(new Blob([csvTemplate(today)], { type: 'text/csv;charset=utf-8' }), `${TEMPLATE_BASENAME}.csv`));

// Premier affichage : une simulation « Quand ? » sur les données d'exemple, pour montrer les résultats.
setMsg($('import-msg'), 'info', SAMPLE_MESSAGE);
renderData();
launch();
