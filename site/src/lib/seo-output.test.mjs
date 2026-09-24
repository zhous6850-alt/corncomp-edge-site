import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { GET } from '../pages/sitemap.xml.js';
import { allLocalizedEntries, localizedRedirects, normalizeLocalizedRoute } from './localization.mjs';

test('sitemap includes localized archives and excludes retired commerce pages', async () => {
  const xml = await (await GET()).text();
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expectedRoutes = [
    ...allLocalizedEntries().map(({ route }) => normalizeLocalizedRoute(route)),
    '/blog/', '/fr/shop/', '/fr/blog/', '/es/shop/', '/es/blog/', '/ar/shop/', '/ar/blog/',
  ];
  assert.equal(locations.length, expectedRoutes.length);
  assert.equal(new Set(locations).size, locations.length);
  for (const route of expectedRoutes) assert.ok(locations.includes(`https://corn-comp.com${route}`), route);
  for (const alias of localizedRedirects().keys()) assert.ok(!locations.includes(`https://corn-comp.com${alias}`), alias);
  assert.match(xml, /https:\/\/corn-comp\.com\/products\/cups-bowls\/paper-cups\//);
  assert.match(xml, /https:\/\/corn-comp\.com\/products\/cups-bowls\/paper-cups\/single-wall-white-cardboard-paper-cup\//);
  assert.match(xml, /https:\/\/corn-comp\.com\/applications\/fast-food-packaging\//);
  assert.match(xml, /https:\/\/corn-comp\.com\/resources\/guides\/paper-cup-sizes\//);
  assert.match(xml, /https:\/\/corn-comp\.com\/fr\/shop\//);
  assert.match(xml, /https:\/\/corn-comp\.com\/es\/blog\//);
  assert.match(xml, /https:\/\/corn-comp\.com\/ar\/%D[89]/);
  assert.doesNotMatch(xml, /%[0-9a-f]*[a-f][0-9a-f]*/);
  assert.doesNotMatch(xml, /\/cart\//);
  assert.doesNotMatch(xml, /\/checkout\//);
  assert.doesNotMatch(xml, /\/my-account\//);
  assert.doesNotMatch(xml, /https:\/\/corn-comp\.com\/shop\//);
  assert.doesNotMatch(xml, /https:\/\/corn-comp\.com\/product\//);
  assert.doesNotMatch(xml, /https:\/\/corn-comp\.com\/product-category\//);
  assert.doesNotMatch(xml, /https:\/\/corn-comp\.com\/contact-us\//);
});

test('robots advertises the production sitemap', async () => {
  const robots = await readFile(new URL('../../public/robots.txt', import.meta.url), 'utf8');
  assert.match(robots, /Sitemap: https:\/\/corn-comp\.com\/sitemap\.xml/);
});
