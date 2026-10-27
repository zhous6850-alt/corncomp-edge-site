import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { englishInventory, routeFor } from './localization.mjs';
import { FOOD_CATEGORY_PREVIEWS } from '../data/food-category-preview.mjs';

test('food preview pages retain distinct complete images and existing details alongside canonical pages', async () => {
  const inventory = englishInventory();
  for (const [category, config] of Object.entries(FOOD_CATEGORY_PREVIEWS)) {
    const html = await readFile(new URL(`../../dist/design-preview/food/${category}/index.html`, import.meta.url), 'utf8');
    for (const section of config.sections) {
      assert.ok(html.includes(`id="${section.id}"`));
      for (const slug of section.slugs) {
        const item = inventory.find((item) => item.type === 'product' && item.slug === slug);
        assert.ok(html.includes(routeFor('en', item.contentKey)), slug);
        assert.equal(html.split(`src="${item.featuredMedia.localPath}"`).length - 1, 1, slug);
      }
    }
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.ok(html.includes('object-fit: contain'));
  }
  const group = await readFile(new URL('../../dist/design-preview/food-boxes-containers/index.html', import.meta.url), 'utf8');
  for (const chapter of ['meals','handheld','display']) assert.ok(group.includes(`id="${chapter}"`));
  assert.equal((group.match(/class="range-card"/g) || []).length, 11);
  for (const category of Object.keys(FOOD_CATEGORY_PREVIEWS)) assert.ok(group.includes(`/design-preview/food/${category}/`));
  const formal = await readFile(new URL('../../dist/products/food-boxes-containers/index.html', import.meta.url), 'utf8');
  assert.ok(formal.includes('range-chapter'));
  assert.ok(!formal.includes('/design-preview/'));
});
