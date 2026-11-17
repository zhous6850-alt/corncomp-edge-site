import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { routeFor } from './localization.mjs';

async function html(route) {
  return readFile(new URL(`../../dist${route}index.html`, import.meta.url), 'utf8');
}

test('the straws page stays on the previous three-link service and omits the cup sections', async () => {
  const page = await html('/custom-packaging/custom-paper-straws/');
  assert.match(page, /<title>Custom paper straws \| Corncomp<\/title>/);
  assert.match(page, /<h1\b[^>]*>Custom paper<br\b[^>]*><em\b[^>]*>straws<\/em><\/h1>/);
  const nav = page.match(/<nav class="section-nav"[\s\S]*?<\/nav>/)[0];
  assert.deepEqual([...nav.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]), ['formats', 'details', 'artwork']);
  for (const id of ['sizes', 'lids-sleeves', 'documents', 'moq', 'faq']) assert.equal(page.includes(`id="${id}"`), false, id);
  assert.doesNotMatch(page, /Which sleeve fits my cup\?/);
});

test('locale custom pages do not receive the English cup FAQ or MOQ section', async () => {
  for (const language of ['zh', 'fr', 'es', 'de', 'ar']) {
    const page = await html(routeFor(language, 'architecture:custom-packaging/custom-printed-paper-cups'));
    assert.doesNotMatch(page, /Which paper cups can be custom printed\?/);
    assert.doesNotMatch(page, /id="moq"/);
    assert.doesNotMatch(page, /Which sleeve fits my cup\?/);
  }
});

test('the hub keeps two brand stamps and adds the salad bowl card', async () => {
  const page = await html('/custom-packaging/');
  assert.equal((page.match(/class="brand-stamp"/g) || []).length, 2);
  assert.match(page, /<h3\b[^>]*>Custom printed paper cups and lids<\/h3>/);
  assert.match(page, /<h3\b[^>]*>Custom printed salad bowls<\/h3>/);
  assert.match(page, /href="\/products\/cups-bowls\/salad-bowls\/#salad-specifications"/);
  assert.match(page, /Paper cups · Salad bowls · Paper straws/);
  assert.match(page, /Explore custom paper cup, salad bowl and paper straw projects with Corncomp\./);
});
