import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  projectClause, stripOrderBy, cleanFilter, scopeClause, scopeIsSet, historyJql, MAX_PROJECT_LENGTH, MAX_FILTER_LENGTH,
} from '../site/js/jira.js';

// ---------------------------------------------------------------- Projet

test('clé de projet reprise telle quelle', () => {
  assert.equal(projectClause('PAY'), 'PAY');
  assert.equal(projectClause('team_42'), 'team_42');
});

test('nom avec espaces entre guillemets', () => {
  assert.equal(projectClause('Paiement mobile'), '"Paiement mobile"');
  assert.equal(projectClause('Équipe-Front'), '"Équipe-Front"');
});

test('guillemets et barre oblique inverse échappés', () => {
  assert.equal(projectClause('Projet "Alpha" \\ 2'), '"Projet \\"Alpha\\" \\\\ 2"');
});

test('vide ou espaces : exemple EQ', () => {
  assert.equal(projectClause(''), 'EQ');
  assert.equal(projectClause('   '), 'EQ');
  assert.equal(projectClause(null), 'EQ');
});

test('espaces superflus retirés, longueur maximale', () => {
  assert.equal(projectClause('  PAY  '), 'PAY');
  assert.equal(projectClause('Paiement    mobile '), '"Paiement mobile"');
  assert.equal(projectClause('A'.repeat(150)), 'A'.repeat(MAX_PROJECT_LENGTH));
});

// ---------------------------------------------------------------- Requête du board

test('ORDER BY final retiré, en majuscules ou minuscules', () => {
  assert.equal(stripOrderBy('project in (PAY, MOB) ORDER BY Rank ASC'), 'project in (PAY, MOB)');
  assert.equal(stripOrderBy('project = PAY order   by rank'), 'project = PAY');
  assert.equal(stripOrderBy('filter = 123'), 'filter = 123');
});

test('ORDER BY entre guillemets conservé', () => {
  assert.equal(stripOrderBy('summary ~ "order by" ORDER BY Rank'), 'summary ~ "order by"');
  assert.equal(stripOrderBy("labels = 'order by x' AND project = A"), "labels = 'order by x' AND project = A");
  assert.equal(stripOrderBy('summary ~ "a \\" order by" ORDER BY Rank'), 'summary ~ "a \\" order by"');
});

test('mot contenant « order » non coupé', () => {
  assert.equal(stripOrderBy('labels = reorder_by AND project = A'), 'labels = reorder_by AND project = A');
});

test('requête du board : retours à la ligne, vide, longueur', () => {
  assert.equal(cleanFilter('project = PAY\n  AND component = Front\r\nORDER BY Rank'), 'project = PAY AND component = Front');
  assert.equal(cleanFilter('ORDER BY Rank ASC'), '');
  assert.equal(cleanFilter('   '), '');
  assert.ok(cleanFilter('x'.repeat(3000)).length === MAX_FILTER_LENGTH);
});

test('périmètre : projet ou requête du board entre parenthèses', () => {
  assert.equal(scopeClause('PAY'), 'project = PAY');
  assert.equal(scopeClause({ mode: 'project', project: 'PAY', filter: 'x = 1' }), 'project = PAY');
  assert.equal(scopeClause({ mode: 'board', project: 'PAY', filter: 'project = A OR project = B' }), '(project = A OR project = B)');
  assert.equal(scopeClause({ mode: 'board', project: 'PAY', filter: '' }), 'project = EQ');
  assert.equal(scopeIsSet({ mode: 'board', filter: 'ORDER BY Rank' }), false);
  assert.equal(scopeIsSet({ mode: 'project', project: 'PAY' }), true);
});

test('requête d\'historique : projet', () => {
  assert.equal(historyJql('PAY'), 'project = PAY\nAND statusCategory = Done\nAND status != "Cancelled"\nAND resolved >= -27w\nAND issuetype not in subTaskIssueTypes()\nORDER BY resolved ASC');
  assert.equal(historyJql('', ' '), 'project = EQ AND statusCategory = Done AND status != "Cancelled" AND resolved >= -27w AND issuetype not in subTaskIssueTypes() ORDER BY resolved ASC');
});

test('requête d\'historique : board multi-projets', () => {
  const jql = historyJql({ mode: 'board', filter: 'project in (PAY, MOB) AND component = Front ORDER BY Rank ASC' }, ' ');
  assert.equal(jql, '(project in (PAY, MOB) AND component = Front) AND statusCategory = Done AND status != "Cancelled" AND resolved >= -27w AND issuetype not in subTaskIssueTypes() ORDER BY resolved ASC');
});
