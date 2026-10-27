import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('custom service previews connect to the hub and preserve enquiry context', async () => {
  const hub = await readFile(new URL('../../dist/design-preview/custom-packaging/index.html', import.meta.url), 'utf8');
  for (const slug of ['custom-printed-paper-cups', 'custom-paper-straws']) {
    const route = '/design-preview/' + slug + '/';
    assert.ok(hub.includes('href="' + route + '"'));
    const html = await readFile(new URL('../../dist' + route + 'index.html', import.meta.url), 'utf8');
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.ok(html.includes('href="/design-preview/custom-packaging/"'));
    assert.ok(html.includes('source=%2Fcustom-packaging%2F' + slug + '%2F'));
    assert.ok(html.includes('product=Custom'));
    assert.ok(html.includes('application/ld+json'));
    const images = [...html.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(m => m[1]).filter(src => !src.includes('logo'));
    assert.equal(new Set(images).size, images.length, 'no repeated product images');
  }
});
