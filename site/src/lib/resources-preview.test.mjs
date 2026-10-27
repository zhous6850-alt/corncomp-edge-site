import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('resources design preview preserves guide and article journeys without promoting production', async () => {
  const html = await readFile(new URL('../../dist/design-preview/resources/index.html', import.meta.url), 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(html.includes('href="/design-preview/paper-cup-sizes/"'));
  for (const slug of ['custom-printed-paper-cups', 'food-packaging-certifications']) assert.ok(html.includes('href="/resources/guides/' + slug + '/"'));
  for (const id of ['sizes', 'guides', 'articles']) assert.ok(html.includes('id="' + id + '"'));
  assert.ok(html.includes('href="/design-preview/blog/"'));
  assert.equal((html.match(/class="article"/g) || []).length, 3);
  assert.ok(html.includes('https://corn-comp.com/resources/'));
  assert.ok(html.includes('CollectionPage'));
  for (const image of ['resources-cup-sizes-v2.png', 'resources-cup-print-v2.png']) assert.ok(html.includes(image));
  assert.doesNotMatch(html, /Built for B2B sourcing/);
  const formal = await readFile(new URL('../../dist/resources/index.html', import.meta.url), 'utf8');
  assert.match(formal, /resources-preview/);
  assert.ok(formal.includes('href="/resources/guides/paper-cup-sizes/"'));
  assert.ok(formal.includes('href="/blog/"'));
  assert.doesNotMatch(formal, /DESIGN PREVIEW|href="\/design-preview/);
});
