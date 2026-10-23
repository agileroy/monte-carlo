import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projectClause, historyJql, remainingJql, MAX_PROJECT_LENGTH } from '../site/js/jira.js';

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

test('requêtes générées', () => {
  assert.equal(historyJql('PAY'), 'project = PAY AND statusCategory = Done\nAND resolved >= -26w\nAND issuetype not in subTaskIssueTypes()\nORDER BY resolved ASC');
  assert.ok(remainingJql('Paiement mobile').startsWith('project = "Paiement mobile" AND statusCategory != Done\n'));
  assert.equal(historyJql('', ' '), 'project = EQ AND statusCategory = Done AND resolved >= -26w AND issuetype not in subTaskIssueTypes() ORDER BY resolved ASC');
});
