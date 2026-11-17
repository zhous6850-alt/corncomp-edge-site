import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker, { REDIRECTS } from './index.mjs';
import { allLocalizedEntries, normalizeLocalizedRoute, retiredGuideRedirects } from '../site/src/lib/localization.mjs';
import { RETIRED_GUIDE_KEYS } from '../site/src/lib/retired-guides.mjs';

const assets = { ASSETS: { fetch: async () => new Response('page', { status: 200 }) } };
const blogArchives = new Set(['/blog/', '/fr/blog/', '/es/blog/', '/ar/blog/', '/zh/blog/', '/de/blog/'].map((route) => normalizeLocalizedRoute(route)));
const published = new Set(allLocalizedEntries().map((entry) => normalizeLocalizedRoute(entry.route)));
const retired = retiredGuideRedirects();

test('retired guide URLs redirect in one hop and keep the query string', async () => {
  assert.equal(retired.size, 24);
  for (const [source, target] of retired) {
    assert.equal(REDIRECTS.get(source), target, source);
    assert.ok(published.has(target) || blogArchives.has(target), target);
    assert.equal(REDIRECTS.has(target), false, 'redirect chain: ' + target);
    const expected = new URL(target, 'https://corn-comp.com');
    expected.search = '?utm_source=preview';
    for (const method of ['GET', 'HEAD']) {
      for (const path of [source, decodeURI(source)]) {
        const response = await worker.fetch(new Request('https://corn-comp.com' + path + '?utm_source=preview', { method }), assets);
        assert.equal(response.status, 301, path);
        assert.equal(decodeURI(response.headers.get('location')), decodeURI(expected.href), path);
      }
    }
  }
  const http = await worker.fetch(new Request('http://corn-comp.com/resources/guides/paper-cup-sizes/'), assets);
  assert.equal(http.status, 301);
  assert.equal(http.headers.get('location'), 'https://corn-comp.com/products/cups-bowls/paper-cups/');
});

test('faq stays off the redirect list and retired targets are not redirect sources', async () => {
  assert.equal(REDIRECTS.has('/faq/'), false);
  const retiredRoutes = new Set(retired.keys());
  for (const value of REDIRECTS.values()) {
    assert.equal(retiredRoutes.has(value) || retiredRoutes.has(decodeURI(value)), false, value);
    assert.equal(REDIRECTS.has(value), false, value);
  }
  const faq = await worker.fetch(new Request('https://corn-comp.com/faq/'), assets);
  assert.ok(faq.status < 300 || faq.status >= 400, String(faq.status));
  assert.equal(RETIRED_GUIDE_KEYS.size, 4);
});
