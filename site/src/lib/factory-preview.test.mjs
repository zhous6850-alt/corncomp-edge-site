import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('factory preview separates source-backed capability from alliance scope', () => {
  const source = readFileSync(new URL('../components/FactoryPage.astro', import.meta.url), 'utf8');
  assert.match(source, /ALLIANCE SUPPLY/);
  assert.match(source, /2024 company profile/);
  assert.doesNotMatch(source, /2\.5 billion paper straws|GMP-certified/);
  for (const anchor of ['facility', 'process', 'scope', 'quality']) assert.ok(source.includes(`id="${anchor}"`));
  assert.ok(existsSync(new URL('../pages/design-preview/factory.astro', import.meta.url)));
});
