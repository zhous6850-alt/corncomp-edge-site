import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { SUPPORTED_LANGUAGES, routeFor } from './localization.mjs';

test('each homepage places the eleven customer logos after the factory figures, with Disney first', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const route = routeFor(language, 'home');
    const html = await readFile(new URL(`../../dist/${route === '/' ? '' : route.slice(1)}index.html`, import.meta.url), 'utf8');
    const section = html.match(/<section class="customer-logos"[\s\S]*?<\/section>/)?.[0];
    assert.ok(section, `${language} customer section exists`);
    assert.ok(html.indexOf('class="content-shell home-proof"') < html.indexOf(section));
    assert.ok(html.indexOf(section) < html.indexOf('class="home-product-grid"'));
    const logos = [...section.matchAll(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]+)"/g)];
    assert.equal(logos.length, 11);
    assert.equal(logos[0][2], 'Disney');
    assert.equal(new Set(logos.map((logo) => logo[2])).size, 11);
    for (const logo of logos) {
      assert.match(logo[1], /^\/media\/(?:optimized\/)?customers\//);
      await access(new URL(`../../public${logo[1]}`, import.meta.url));
    }
    assert.match(section, /aria-pressed="false"/);
  }
});
