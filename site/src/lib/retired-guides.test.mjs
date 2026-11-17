import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import test from 'node:test';
import { RETIRED_GUIDE_KEYS, removeRetiredGuideLinks } from './retired-guides.mjs';
import { SUPPORTED_LANGUAGES, routeFor, allLocalizedEntries } from './localization.mjs';

const retiredRoutes = new Set(SUPPORTED_LANGUAGES.flatMap(language => [...RETIRED_GUIDE_KEYS].map(key => routeFor(language, key))));

test('retired guide links are removed without changing external or surviving links', () => {
  assert.equal(removeRetiredGuideLinks('<a href="/resources/#sizes">Guide</a><a href="/blog/">Blog</a><a href="https://example.com/resources/">External</a>', retiredRoutes), '<a href="/blog/">Blog</a><a href="https://example.com/resources/">External</a>');
});

test('Guides and its three pages are absent from published routes and sitemap in all languages', async () => {
  assert.ok(allLocalizedEntries().every(entry => !RETIRED_GUIDE_KEYS.has(entry.contentKey)));
  const sitemap = await readFile(new URL('../../dist/sitemap.xml', import.meta.url), 'utf8');
  for (const route of retiredRoutes) {
    await assert.rejects(access(new URL('../../dist' + decodeURI(route) + 'index.html', import.meta.url)));
    assert.ok(!sitemap.includes('https://corn-comp.com' + route + '</loc>'), route);
  }
  for (const entry of allLocalizedEntries()) {
    const html = await readFile(new URL('../../dist' + decodeURI(entry.route) + 'index.html', import.meta.url), 'utf8');
    for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      const url = new URL(href, 'https://corn-comp.com');
      assert.ok(url.origin !== 'https://corn-comp.com' || !retiredRoutes.has(url.pathname), entry.route + ' links to ' + href);
    }
  }
});
