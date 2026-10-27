import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { SUPPORTED_LANGUAGES, routeFor } from './localization.mjs';

test('homepage product directory exposes all six ranges and localized working destinations', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const route = routeFor(language, 'home');
    const html = await readFile(new URL(`../../dist/${route.slice(1)}index.html`, import.meta.url), 'utf8');
    const section = html.match(/<section[^>]*id="product-ranges"[\s\S]*?<\/section>/)?.[0];
    assert.ok(section, `${language}: product directory exists`);
    assert.equal((section.match(/<article\b/g) || []).length, 6);
    for (const key of [
      'architecture:products/cups-bowls/paper-cups',
      'architecture:products/cups-bowls',
      'architecture:products/cups-bowls/ice-cream-cups',
      'architecture:products/food-boxes-containers',
      'architecture:products/foodservice-supplies/paper-straws',
      'architecture:products/foodservice-supplies',
      'architecture:products', 'architecture:custom-packaging',
    ]) {
      const destination = routeFor(language, key);
      assert.ok(destination, key);
      assert.ok(section.includes(`href="${destination}"`), `${language}: ${key}`);
      await access(new URL(`../../dist/${destination.slice(1)}index.html`, import.meta.url));
    }
    const images = [...section.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/g)];
    assert.equal(images.length, 6, `${language}: one lifestyle scene per range`);
    assert.equal(new Set(images.map(([, src]) => src)).size, 6);
    assert.deepEqual(images.map(([, src]) => src.replace('/media/optimized/', '/media/').replace(/\.[a-f0-9]{12}-600.webp$/, '')), [
      '/media/generated/home-lifestyle-v1/cups.webp',
      '/media/generated/home-lifestyle-v2/bowls.webp',
      '/media/generated/home-lifestyle-v1/icecream.webp',
      '/media/generated/home-lifestyle-v2/boxes.webp',
      '/media/generated/home-lifestyle-v1/straws.webp',
      '/media/generated/home-lifestyle-v2/tableware.webp',
    ]);
    for (const [image, src] of images) {
      assert.match(image, /data-image-kind="ai-lifestyle"/);
      await access(new URL(`../../public${src}`, import.meta.url));
    }
    assert.doesNotMatch(section, /Find the format first|Product architecture|No shopping cart/);
  }
});
