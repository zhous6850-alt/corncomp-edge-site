import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';
import { matchImportedRecord } from './seed-locale-data.mjs';

const script = resolve('scripts/seed-locale-data.mjs');

test('the seeder rejects ambiguous same-type media matches', () => {
  const english = { type: 'product', slug: 'cup', featuredMediaId: 9 };
  const translations = [
    { language: 'fr', type: 'product', slug: 'gobelet-a', featuredMediaId: 9 },
    { language: 'fr', type: 'product', slug: 'gobelet-b', featuredMediaId: 9 },
  ];
  assert.throws(() => matchImportedRecord(english, translations, 'fr'), /Ambiguous fr match for cup: gobelet-a, gobelet-b/);
  assert.equal(matchImportedRecord(english, [{ ...translations[0], type: 'post' }], 'fr'), null);
  assert.equal(matchImportedRecord({ ...english, featuredMediaId: 0 }, translations, 'fr'), null);
});

test('the seeder writes deterministic draft data only to a caller-supplied safe path', async () => {
  const directory = await mkdtemp(resolve(tmpdir(), 'corncomp-seed-'));
  try {
    const first = resolve(directory, 'first.json');
    const second = resolve(directory, 'second.json');
    const run = (output) => spawnSync(process.execPath, [script, '--language', 'fr', '--output', output], { encoding: 'utf8' });
    const one = run(first);
    const two = run(second);
    assert.equal(one.status, 0, one.stderr);
    assert.equal(two.status, 0, two.stderr);
    assert.equal(await readFile(first, 'utf8'), await readFile(second, 'utf8'));
    assert.deepEqual(JSON.parse(one.stdout), JSON.parse(two.stdout));
    const report = JSON.parse(one.stdout);
    assert.deepEqual(Object.keys(report).sort(), ['ambiguous', 'matched', 'unmatched']);
    assert.equal(report.matched + report.unmatched + report.ambiguous, 85);
    assert.ok(report.matched > 0);
    const draft = JSON.parse(await readFile(first, 'utf8'));
    assert.equal(draft._meta.language, 'fr');
    assert.equal(draft._meta.sourceLanguage, 'en');
    assert.ok(Object.values(draft.content).every((entry) => entry.route && entry.title));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('the seeder requires explicit options and refuses committed locale paths', () => {
  const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
  assert.notEqual(run('--language', 'fr').status, 0);
  assert.notEqual(run('--language', 'de', '--output', resolve(tmpdir(), 'bad-locale.json')).status, 0);
  assert.notEqual(run('--language', 'fr', '--output', resolve('site/src/data/locales/fr.json')).status, 0);
  assert.notEqual(run('--language', 'fr', '--output', resolve('site/src/data/locales/nested/fr.json')).status, 0);
  const fromSite = spawnSync(process.execPath, [script, '--language', 'fr', '--output', resolve('site/src/data/locales/nested/fr.json')], {
    encoding: 'utf8', cwd: resolve('site'),
  });
  assert.match(fromSite.stderr, /Refusing to write inside site\/src\/data\/locales/);
});
