import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { englishInventory } from './localization.mjs';

test('35 approved pale product images use forest backgrounds without the rejected darkening filter', async () => {
  const { FOREST_PRODUCT_IMAGES, PRODUCT_IMAGE_BACKGROUND } = await import('../data/product-image-background.mjs');
  assert.equal(FOREST_PRODUCT_IMAGES.size,35);
  assert.equal(PRODUCT_IMAGE_BACKGROUND,'#244936');
  const products=englishInventory().filter(x=>x.type==='product');
  assert(FOREST_PRODUCT_IMAGES.has(products.find(x=>x.slug==='white-cardboard-box-wire-handle').featuredMedia.localPath));
  assert(!FOREST_PRODUCT_IMAGES.has(products.find(x=>x.slug==='kraft-square-food-box').featuredMedia.localPath));
  assert(!FOREST_PRODUCT_IMAGES.has('/media/products-showroom-user-20261017.jpg'));
  const media=await readFile(new URL('../components/ResponsiveMedia.astro',import.meta.url),'utf8');
  assert.match(media,/FOREST_PRODUCT_IMAGES\.has\(media\.src\)/);
  assert.match(media,/background: \$\{PRODUCT_IMAGE_BACKGROUND\}/);
  assert.doesNotMatch(media,/corncomp-product-tone/);
  const layout=await readFile(new URL('../layouts/BaseLayout.astro',import.meta.url),'utf8');
  assert.doesNotMatch(layout,/corncomp-product-tone/);
});
