import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readXlsx } from '../site/js/xlsx-lite.js';
import { xlsxTemplate, csvTemplate, dataSheet, exampleRows, HEADERS, DATA_SHEET, HELP_SHEET } from '../site/js/templates.js';
import { interpretRows, parseCsv } from '../site/js/forecast-core.js';

const TODAY = new Date(2026, 9, 22);

test('modèle Excel : deux onglets, en-têtes, exemples', async () => {
  const { sheets } = await readXlsx(await xlsxTemplate(TODAY));
  assert.deepEqual(sheets.map((s) => s.name), [DATA_SHEET, HELP_SHEET]);
  assert.deepEqual(sheets[0].rows[0], HEADERS);
  assert.equal(sheets[0].rows.length, 1 + exampleRows(TODAY).length);
  assert.match(sheets[1].rows.flat().join('\n'), /Exporter Excel CSV/);
});

test('modèle Excel relu et importé tel quel : onglet de données choisi', async () => {
  const { sheets } = await readXlsx(await xlsxTemplate(TODAY));
  const sheet = dataSheet([...sheets].reverse());
  assert.equal(sheet.name, DATA_SHEET);
  const r = interpretRows(sheet.rows, TODAY);
  assert.equal(r.column, 'Résolu');
  assert.equal(r.tickets, 9);
  assert.deepEqual(r.weeks.map((w) => w.count), [3, 2, 4]);
});

test('modèle CSV : BOM, point-virgule, importable tel quel', () => {
  const text = csvTemplate(TODAY);
  assert.ok(text.startsWith('﻿Clé;Résumé;Résolu\r\n'));
  const r = interpretRows(parseCsv(text), TODAY);
  assert.equal(r.tickets, 9);
});
