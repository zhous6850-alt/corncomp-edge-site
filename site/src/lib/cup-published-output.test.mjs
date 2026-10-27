import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { englishInventory, SUPPORTED_LANGUAGES, routeFor } from './localization.mjs';
import { categoryForProduct } from './site-architecture.mjs';

test('approved cup landing pages publish on canonical routes in all six languages', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const groupRoute = routeFor(language, 'architecture:products/cups-bowls');
    const group = await readFile(new URL(`../../dist${groupRoute}index.html`, import.meta.url), 'utf8');
    assert.ok(group.includes('group-preview'));
    assert.ok(!group.includes('/design-preview/'));
    for (const category of ['salad-bowls', 'soup-cups', 'ice-cream-cups', 'paper-cups']) {
      const categoryRoute = routeFor(language, `architecture:products/cups-bowls/${category}`);
      const html = await readFile(new URL(`../../dist${categoryRoute}index.html`, import.meta.url), 'utf8');
      assert.ok(html.includes('category-preview'), `${language}/${category}`);
      assert.ok(!html.includes('/design-preview/'));
      assert.ok(!html.includes('DESIGN PREVIEW'));
      for (const item of englishInventory().filter((item) => item.type === 'product' && categoryForProduct(item.slug)?.slug === category)) assert.ok(html.includes(routeFor(language, item.contentKey)), item.slug);
      assert.equal((html.match(/<h1\b/g) || []).length, 1);
      if (language === 'ar') assert.ok(html.includes('dir="rtl"'));
    }
  }
});
