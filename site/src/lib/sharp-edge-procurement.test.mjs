import assert from 'node:assert/strict';
import test from 'node:test';
import records from '../data/records.json' with { type: 'json' };
import { extractProductFacts, localizedProductBody, productForLanguage } from './product-facts.mjs';
import { localizedEntry, sourceHash, uiFor } from './localization.mjs';

const product = records.find((record) => record.id === 104 && record.language === 'en');

test('sharp-edge size chart parses without inventing an item code or size combination', () => {
  const facts = extractProductFacts(product);
  assert.deepEqual(facts.itemCodes, []);
  assert.deepEqual(facts.tables[0].headers, ['Length (mm)', 'Diameter (mm)']);
  assert.equal(facts.tables[0].rows.length, 10);
  assert.equal(facts.tables[0].rows.reduce((total, row) => total + row[1].split(',').length, 0), 48);
  assert.deepEqual(facts.tables[0].rows[0], ['140', '5.5, 6, 7, 8']);
  assert.deepEqual(facts.tables[0].rows[3], ['197', '5.5, 6, 7, 8, 10, 12']);
  assert.deepEqual(facts.tables[0].rows[9], ['260', '6, 7, 8, 10, 12']);
  assert.doesNotMatch(product.body + product.excerpt + product.seo.description, /500 pcs\/pack|10 packs\/carton|500 straws per pack/);
});

test('English-only procurement update preserves the reviewed translation source', () => {
  assert.equal(productForLanguage(product, 'en'), product);
  for (const language of ['fr', 'es', 'ar', 'zh', 'de']) {
    const source = productForLanguage(product, language);
    const facts = extractProductFacts(source);
    assert.deepEqual(facts.tables[0].headers, ['Attribute', 'Detail']);
    assert.ok(facts.tables[0].rows.some((row) => row[1] === '500 pcs/pack, 10 packs/carton'));
    assert.equal(sourceHash(source), sourceHash(product));
    assert.doesNotThrow(() => localizedProductBody(localizedEntry(language, 'product:sharp-edge'), facts, uiFor(language)));
  }
  assert.notEqual(sourceHash(product), sourceHash({ ...product, localizedSource: { ...product.localizedSource, body: product.localizedSource.body + ' changed' } }));
});
