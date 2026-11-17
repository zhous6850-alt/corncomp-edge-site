import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('faq no longer points at /resources/ and the cups page links to the size table', async () => {
  const faq = await readFile(new URL('../../dist/faq/index.html', import.meta.url), 'utf8');
  assert.equal(faq.includes('/resources/'), false);
  const cups = await readFile(new URL('../../dist/custom-packaging/custom-printed-paper-cups/index.html', import.meta.url), 'utf8');
  assert.match(cups, /href="\/products\/cups-bowls\/paper-cups\/#paper-cup-sizes"/);
});
