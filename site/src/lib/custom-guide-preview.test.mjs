import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('custom cup guide preview has linked sections, schema and contextual enquiry', async () => {
 const html = await readFile(new URL('../../dist/design-preview/custom-cup-guide/index.html', import.meta.url), 'utf8');
 const hub = await readFile(new URL('../../dist/design-preview/custom-packaging/index.html', import.meta.url), 'utf8');
 assert.ok(hub.includes('href="/design-preview/custom-cup-guide/"'));
 assert.equal((html.match(/<h1\b/g)||[]).length, 1);
 for(const id of ['choose','fit','artwork','samples','checklist']){
  assert.ok(html.includes('id="'+id+'"'));
  assert.ok(html.includes('href="#'+id+'"'));
 }
 assert.ok(html.includes('product=Custom+paper+cups'));
 assert.ok(html.includes('application/ld+json'));
 assert.ok(html.includes('<th'));
});
