import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { englishInventory } from './localization.mjs';

test('every English product hero uses Add to enquiry and retains contact prefill', async () => {
  for (const product of englishInventory().filter(({ type }) => type === 'product')) {
    const html = await readFile(new URL(`../../dist${product.route}index.html`, import.meta.url), 'utf8');
    const hero = html.match(/<header\b[^>]*product-summary[\s\S]*?<\/header>/)?.[0];
    assert.ok(hero, product.route);
    const button = hero.match(/<a class="button-primary" href="([^"]+)">([^<]+)<\/a>/);
    assert.ok(button, product.route);
    assert.equal(button[2], 'Add to enquiry', product.route);
    const href = new URL(button[1].replace(/&(?:amp|#38);/g, '&'), 'https://corn-comp.com');
    assert.equal(href.pathname, '/contact/');
    assert.ok(href.searchParams.get('product'));
    assert.equal(href.searchParams.get('source'), product.route);
    assert.ok(html.includes('Request a quote'), 'global quote navigation remains unchanged');
  }
});
