import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SUPPORTED_LANGUAGES, routeFor } from './localization.mjs';

test('homepage closing CTA offers localized inquiry and product destinations together', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const route = routeFor(language, 'home');
    const html = await readFile(new URL(`../../dist/${route.slice(1)}index.html`, import.meta.url), 'utf8');
    const section = html.match(/<section\b[^>]*id="packaging-enquiry"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(section, `Missing closing CTA for ${language}`);
    assert.ok(section.includes(`href="${routeFor(language, 'architecture:contact')}"`));
    assert.ok(section.includes(`href="${routeFor(language, 'architecture:products')}"`));
    assert.equal((section.match(/<h2\b/g) || []).length, 1);
  }
});
