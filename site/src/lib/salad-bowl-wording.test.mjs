import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { routeFor } from './localization.mjs';

test('bowl-and-lid wording appears only on the English salad bowls category', async () => {
  for (const language of ['en', 'zh', 'fr', 'es', 'de', 'ar']) {
    for (const category of ['salad-bowls', 'paper-cups', 'soup-cups', 'ice-cream-cups']) {
      const route = routeFor(language, `architecture:products/cups-bowls/${category}`);
      const html = await readFile(new URL(`../../dist${route}index.html`, import.meta.url), 'utf8');
      const present = html.includes('bowl-and-lid');
      assert.equal(present, language === 'en' && category === 'salad-bowls', `${language}:${category}`);
      if (language === 'en' && category !== 'salad-bowls') assert.match(html, /cup-and-lid/);
    }
  }
});
