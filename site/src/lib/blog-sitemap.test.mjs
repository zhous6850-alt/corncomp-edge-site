import assert from 'node:assert/strict';
import test from 'node:test';
import { GET } from '../pages/sitemap.xml.js';

test('every published language blog archive has a canonical sitemap entry', async () => {
  const xml = await (await GET()).text();
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  for (const route of ['/blog/', '/fr/blog/', '/es/blog/', '/ar/blog/', '/zh/blog/', '/de/blog/']) {
    assert.ok(locations.includes(`https://corn-comp.com${route}`), route);
  }
  assert.equal(new Set(locations).size, locations.length);
});
