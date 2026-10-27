import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('about preview links factory preview and distinguishes total and factory area', () => {
  const about = readFileSync(new URL('../components/AboutPage.astro', import.meta.url), 'utf8');
  const factory = readFileSync(new URL('../components/FactoryPage.astro', import.meta.url), 'utf8');
  assert.ok(about.includes('6,800'));
  assert.ok(!about.includes('6,000'));
  assert.ok(factory.includes('6,800'));
  for (const text of ['8,000', 'Total company area', 'Factory area']) {
    assert.ok(about.includes(text), `About missing ${text}`);
    assert.ok(factory.includes(text), `Factory missing ${text}`);
  }
  assert.ok(about.includes("preview ? '/design-preview/factory/' : '/about/factory/'"));
  assert.match(about, /AboutPage/);
  assert.doesNotMatch(about, /GMP-certified|2\.5 billion paper straws/);
});
