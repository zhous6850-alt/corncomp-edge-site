import test from 'node:test';
import assert from 'node:assert/strict';
import { englishInventory } from './localization.mjs';
import { categoryForProduct, PRODUCT_CATEGORIES } from './site-architecture.mjs';
import { FOOD_CATEGORY_PREVIEWS } from '../data/food-category-preview.mjs';

test('all food category previews cover every product series exactly once', () => {
  const inventory = englishInventory();
  assert.equal(Object.keys(FOOD_CATEGORY_PREVIEWS).length, 11, 'All eleven food packaging categories have previews');
  assert.deepEqual(Object.keys(FOOD_CATEGORY_PREVIEWS).sort(), PRODUCT_CATEGORIES.filter((item) => item.group === 'food-boxes-containers' && item.slug !== 'paper-food-boxes').map((item) => item.slug).sort());
  for (const [category, config] of Object.entries(FOOD_CATEGORY_PREVIEWS)) {
    const slugs = config.sections.flatMap((section) => section.slugs);
    const expected = inventory.filter((item) => item.type === 'product' && categoryForProduct(item.slug)?.slug === category);
    assert.deepEqual([...slugs].sort(), expected.map((item) => item.slug).sort());
    assert.equal(new Set(slugs).size, slugs.length);
    const images = expected.map((item) => item.featuredMedia.localPath);
    assert.equal(new Set(images).size, images.length);
  }
});
