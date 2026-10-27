import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { routeFor, SUPPORTED_LANGUAGES } from './localization.mjs';

test('product overview hero uses only the user-selected showroom photograph', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const route = routeFor(language, 'architecture:products');
    const html = await readFile(new URL(`../../dist${route}index.html`, import.meta.url), 'utf8');
    const hero = html.match(/<header class="directory-hero[^\"]*"[\s\S]*?<\/header>/)?.[0] || '';
    assert.equal((hero.match(/<img\b/g) || []).length, 1, language);
    assert.ok(hero.includes('/media/products-showroom-user-20261017.jpg'), language);
    assert.doesNotMatch(hero, /home-lifestyle-/);
  }
});

test('product directory hides waste bags while preserving other category cards and destinations', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const route = routeFor(language, 'architecture:products');
    const html = await readFile(new URL(`../../dist${route}index.html`, import.meta.url), 'utf8');
    const cards = [...html.matchAll(/<a\b[^>]*data-product-category="([^"]+)"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
    assert.equal(cards.length, 23, language);
    assert.equal(new Set(cards.map((card) => card[1])).size, 23, language);
    assert.ok(!cards.some((card) => card[1] === 'compostable-waste-bags'), language);
    assert.ok(html.includes('compostable-waste-bags/'), `${language}: navigation retained`);
    for (const [, slug, href, body] of cards) {
      assert.ok(existsSync(new URL(`../../dist${href}index.html`, import.meta.url)), `${language}:${slug}`);
      const image = body.match(/<img[^>]*src="([^"]+)"/);
      assert.ok(image, `${language}:${slug}: image missing`);
      assert.ok(existsSync(new URL(`../../public${image[1]}`, import.meta.url)), image[1]);
    }
    for (const slug of ['cups-bowls', 'food-boxes-containers', 'foodservice-supplies', 'bagasse']) {
      assert.ok(html.includes(`href="#range-${slug}"`), `${language}:${slug}: jump link`);
      assert.ok(html.includes(`id="range-${slug}"`), `${language}:${slug}: jump destination`);
    }
    assert.ok(html.includes('href="/media/wp/231-corncomp-catalogue.pdf"'), language);
  }
});
