import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { routeFor } from './localization.mjs';
import { SALAD_COMPARISON_LABELS } from '../data/salad-bowl-comparison.mjs';

test('Compare all sizes jumps to the salad specification table in every language', async () => {
  for (const language of ['en', 'zh', 'fr', 'es', 'de', 'ar']) {
    const label = SALAD_COMPARISON_LABELS[language].compareAll;
    const note = SALAD_COMPARISON_LABELS[language].sizeTable;
    for (const category of ['salad-bowls', 'paper-cups', 'soup-cups', 'ice-cream-cups']) {
      const route = routeFor(language, `architecture:products/cups-bowls/${category}`);
      const html = await readFile(new URL(`../../dist${route}index.html`, import.meta.url), 'utf8');
      const present = html.includes(label) && html.includes(`href="#salad-specifications"`);
      assert.equal(present, category === 'salad-bowls', `${language}:${category}`);
      if (category === 'salad-bowls') {
        assert.ok(html.includes(note), `${language}:size table label`);
        assert.equal(html.includes('Compare all sizes'), language === 'en', `${language}:english label`);
      }
      if (language === 'en' && category === 'salad-bowls') {
        assert.match(html, /href="\/custom-packaging\/"[^>]*>How custom projects work/);
      } else if (category === 'salad-bowls') {
        assert.doesNotMatch(html, /How custom projects work/);
      }
    }
  }
});
