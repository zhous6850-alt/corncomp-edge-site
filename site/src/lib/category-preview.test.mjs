import test from 'node:test';
import assert from 'node:assert/strict';
import { englishInventory } from './localization.mjs';
import { categoryForProduct } from './site-architecture.mjs';
import { previewSections } from '../data/category-preview.mjs';

for (const category of ['soup-cups', 'ice-cream-cups', 'paper-cups']) {
  test(`${category} preview preserves every series once and keeps accessories after cups`, () => {
    const inventory = englishInventory();
    const expected = inventory.filter((item) => item.type === 'product' && categoryForProduct(item.slug)?.slug === category);
    const sections = previewSections(category, inventory);
    const slugs = sections.flatMap((section) => section.products.map((item) => item.slug));
    assert.deepEqual([...slugs].sort(), expected.map((item) => item.slug).sort());
    assert.equal(new Set(slugs).size, slugs.length);
    const images = sections.flatMap((section) => section.products.map((item) => item.featuredMedia.localPath));
    assert.equal(new Set(images).size, images.length, 'Every product image is used once per page');
    assert.ok(sections[0].products.every((item) => !/lid|sleeve/.test(item.slug)));
    assert.equal(sections.at(-1).id, 'accessories');
    assert.ok(sections.at(-1).products.every((item) => /lid|sleeve/.test(item.slug)));
  });
}
