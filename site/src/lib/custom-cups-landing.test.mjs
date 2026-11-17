import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import records from '../data/records.json' with { type: 'json' };
import { paperCupSizeRows } from '../data/paper-cup-sizes.mjs';

const pagePath = new URL('../../dist/custom-packaging/custom-printed-paper-cups/index.html', import.meta.url);

function section(html, id) {
  const match = html.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`));
  assert.ok(match, `missing #${id}`);
  return match[0];
}

test('custom cups page renders the approved sections, six series and the catalogue size table', async () => {
  const html = await readFile(pagePath, 'utf8');
  for (const id of ['sizes', 'lids-sleeves', 'documents', 'moq', 'faq']) assert.ok(html.includes(`id="${id}"`), id);
  assert.match(html, /<title>Custom Printed Paper Cups and Lids \| Corncomp<\/title>/);
  assert.match(html, /"@type":"WebPage"[^<]*"name":"Custom Printed Paper Cups and Lids"/);
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
  const sizes = section(html, 'sizes');
  const seriesTable = sizes.match(/<table\b[\s\S]*?<\/table>/)[0];
  assert.equal((seriesTable.match(/<tr\b/g) || []).length, 7);
  const rows = paperCupSizeRows(records.filter((record) => record.language === 'en'));
  assert.equal(rows.length, 7);
  for (const row of rows) {
    assert.ok(sizes.includes(row.code), row.code);
    assert.ok(sizes.includes(String(row.volume)) && sizes.includes(String(row.top)) && sizes.includes(String(row.bottom)) && sizes.includes(String(row.height)), row.code);
  }
  const formats = section(html, 'formats');
  const lists = formats.match(/<ul class="series-links"[\s\S]*?<\/ul>/g);
  assert.equal(lists.length, 3);
  assert.equal((lists.join('').match(/<a\b/g) || []).length, 6);
  assert.doesNotMatch(formats, /bagasse|ripple-white-paper-cup/);
  const moq = section(html, 'moq');
  assert.match(moq, /50,000 pieces per item/);
  assert.match(moq, /30,000 pieces per item/);
  assert.match(moq, /about 30 days/);
});

test('visible custom-cup FAQ matches the FAQPage JSON-LD word for word', async () => {
  const html = await readFile(pagePath, 'utf8');
  const schemas = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)[1]);
  const faq = schemas.find((node) => node['@type'] === 'FAQPage');
  assert.equal(faq.mainEntity.length, 10);
  const visible = [...section(html, 'faq').matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3><p\b[^>]*>([\s\S]*?)<\/p>/g)].map((match) => [match[1], match[2]]);
  assert.deepEqual(visible, faq.mainEntity.map((item) => [item.name, item.acceptedAnswer.text]));
  assert.equal(visible.at(-1)[0], 'Which sleeve fits my cup?');
  assert.match(visible.at(-1)[1], /8oz single-wall paper cups/);
  assert.match(visible.at(-1)[1], /12, 16 and 20oz single-wall paper cups \(240, 360, 480 and 600 ml\)/);
});
