import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { GET } from '../pages/sitemap.xml.js';

test('sitemap includes localized archives and excludes retired commerce pages', async () => {
  const xml = await (await GET()).text();
  assert.match(xml, /https:\/\/corn-comp\.com\/fr\/shop\//);
  assert.match(xml, /https:\/\/corn-comp\.com\/es\/blog\//);
  assert.match(xml, /https:\/\/corn-comp\.com\/ar\/%D[89]/);
  assert.doesNotMatch(xml, /%[0-9a-f]*[a-f][0-9a-f]*/);
  assert.doesNotMatch(xml, /\/cart\//);
  assert.doesNotMatch(xml, /\/checkout\//);
  assert.doesNotMatch(xml, /\/my-account\//);
});

test('robots advertises the production sitemap', async () => {
  const robots = await readFile(new URL('../../public/robots.txt', import.meta.url), 'utf8');
  assert.match(robots, /Sitemap: https:\/\/corn-comp\.com\/sitemap\.xml/);
});
