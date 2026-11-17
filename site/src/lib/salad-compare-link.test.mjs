import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { routeFor } from './localization.mjs';

test('Compare all sizes is present only on the English salad bowls page', async () => {
  for (const language of ['en', 'zh', 'fr', 'es', 'de', 'ar']) {
    for (const category of ['salad-bowls', 'paper-cups', 'soup-cups', 'ice-cream-cups']) {
      const route = routeFor(language, `architecture:products/cups-bowls/${category}`);
      const html = await readFile(new URL(`../../dist${route}index.html`, import.meta.url), 'utf8');
      const present = html.includes('Compare all sizes');
      assert.equal(present, language === 'en' && category === 'salad-bowls', `${language}:${category}`);
      if (language === 'en' && category === 'salad-bowls') {
        assert.match(html, /href="\/custom-packaging\/"[^>]*>How custom projects work/);
      } else if (category === 'salad-bowls') {
        assert.doesNotMatch(html, /How custom projects work/);
      }
    }
  }
});
