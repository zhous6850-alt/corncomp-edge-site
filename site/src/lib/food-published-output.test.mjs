import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { englishInventory, routeFor, SUPPORTED_LANGUAGES } from './localization.mjs';
import { FOOD_CATEGORY_PREVIEWS } from '../data/food-category-preview.mjs';

test('food group and all eleven category designs use canonical localized routes', async () => {
  const inventory = englishInventory();
  for (const language of SUPPORTED_LANGUAGES) {
    const groupRoute = routeFor(language, 'architecture:products/food-boxes-containers');
    const group = await readFile(new URL(`../../dist${groupRoute}index.html`, import.meta.url), 'utf8');
    assert.ok(group.includes('range-chapter'), `${language}: food group`);
    assert.ok(!group.includes('/design-preview/'));
    for (const [category, config] of Object.entries(FOOD_CATEGORY_PREVIEWS)) {
      const route = routeFor(language, `architecture:products/food-boxes-containers/${category}`);
      assert.ok(group.includes(route), `${language}:${category}: group entry`);
      const html = await readFile(new URL(`../../dist${route}index.html`, import.meta.url), 'utf8');
      assert.ok(html.includes('category-preview'), `${language}:${category}: new layout`);
      assert.ok(!html.includes('/design-preview/'));
      assert.ok(!html.includes('DESIGN PREVIEW'));
      assert.equal((html.match(/<h1\b/g) || []).length, 1);
      for (const slug of config.sections.flatMap((section) => section.slugs)) {
        const product = inventory.find((item) => item.type === 'product' && item.slug === slug);
        assert.ok(html.includes(routeFor(language, product.contentKey)), `${language}:${slug}`);
        assert.equal(html.split(`src="${product.featuredMedia.localPath}"`).length - 1, 1);
      }
      if (language === 'ar') assert.ok(html.includes('dir="rtl"'));
    }
  }
});
