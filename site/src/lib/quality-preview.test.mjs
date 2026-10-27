import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('quality preview keeps certificate scope, original documents and separate supplier provenance', async () => {
  const path = new URL('../../dist/design-preview/quality/index.html', import.meta.url);
  assert.ok(existsSync(path), 'quality design preview is generated');
  const html = await readFile(path, 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /id="certificate-viewer"/);
  assert.equal((html.match(/class="quality-certificate"/g) || []).length, 4);
  for (const value of ['01526Q60104R001', 'RINA-COC-001953', '10529571-1', 'CN24/00006923', '352 g/m²', 'Grade B', 'Hangzhou POLYFUL', 'Ningbo Millionpack']) assert.ok(html.includes(value), value);
  const materials = html.match(/<section id="materials"[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(materials, /\.pdf|Original PDF|data-certificate|<a\b/);
  assert.equal((materials.match(/data-overview/g) || []).length, 2, 'both overview images can be enlarged');
  assert.doesNotMatch(materials, /low-resolution/);
  for (const name of ['din-material-overview.jpg', 'din-container-overview.jpg']) {
    const bytes = await readFile(new URL('../../public/media/' + name, import.meta.url));
    assert.ok(bytes.length > 50000, name + ' retains readable detail');
  }
  for (const file of ['din-material-overview.jpg', 'din-container-overview.jpg']) assert.ok(materials.includes('/media/' + file), file);
  const exclusions = await readFile(new URL('../../dist/.assetsignore', import.meta.url), 'utf8');
  for (const file of ['din-straw-material-7w0517.pdf', 'din-kraft-food-container-7p1802.pdf']) assert.ok(exclusions.includes('/documents/certificates/' + file), file);
  assert.ok(html.includes('href="/contact/?category=Quality'));
  const hero = html.match(/<header class="quality-hero"[\s\S]*?<\/header>/)[0];
  assert.equal((hero.match(/class="hero-document"/g) || []).length, 4);
  assert.doesNotMatch(hero, /facility-photo|Explore our factory/);
  assert.ok(html.includes('href="https://corn-comp.com/quality/"'));
  const main = html.match(/<section id="documents"[\s\S]*?<\/section>/)[0];
  const sources = [...main.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(([, src]) => src);
  assert.equal(new Set(sources).size, sources.length, 'no repeated images');
  const formal = await readFile(new URL('../../dist/quality/index.html', import.meta.url), 'utf8');
  assert.match(formal, /class="quality-preview"/, 'approved layout is published');
  assert.doesNotMatch(formal, /DESIGN PREVIEW|href="[^"]*\.pdf/);
});
