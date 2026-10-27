import assert from 'node:assert/strict';
import test from 'node:test';
import records from '../data/records.json' with { type: 'json' };
import { PRODUCT_CATEGORY_BY_SLUG } from './site-architecture.mjs';
import { assertFactParity, extractProductFacts, factTokens, localizedProductBody } from './product-facts.mjs';

const englishProduct = (slug) => records.find((item) =>
  item.language === 'en' && item.type === 'product' && item.slug === slug);

test('extracts every open-wrap-cup item code and decimal token', () => {
  const product = englishProduct('cardboard-open-wrap-cup');
  const facts = extractProductFacts(product);

  assert.deepEqual(facts.itemCodes, ['CC01OWC100K', 'CC01OWC5.5K', 'CC01OWC135K', 'CC01OWC160K']);
  assert.deepEqual(facts.tables[0].headers, ['Item No.', 'Front/Back Height', 'Bottom', 'CTN']);
  assert.deepEqual(facts.tables[0].rows[1], ['CC01OWC5.5K', '72mm / 120mm', '60mm', '50pcs x 20 polybags']);
  assert.ok(factTokens(product.body).includes('5.5'));
});

test('95 canonical products expose tables and preserve absent source item codes', () => {
  const products = records.filter((item) =>
    item.language === 'en' && item.type === 'product' && PRODUCT_CATEGORY_BY_SLUG[item.slug]);
  assert.equal(products.length, 95);

  const withoutCodes = [];
  for (const product of products) {
    const facts = extractProductFacts(product);
    assert.ok(facts.tables.length >= 1, product.slug);
    if (!facts.itemCodes.length) withoutCodes.push(product.slug);
  }
  assert.deepEqual(withoutCodes.sort(), [
    'bendy', 'big-dot-paper-straws', 'printed-stripe-paper-straws', 'sharp-edge', 'small-dot-paper-straws', 'solid-colors-with-bamboo-fiber-wooden-fiber', 'stripe-colors', 'stripe-colors-2', 'wave-paper-straws',
  ]);
});

test('immutable facts permit translated prose but reject a changed item code', () => {
  const product = englishProduct('brown-triangle-box-pla-window');
  assert.doesNotThrow(() => assertFactParity(product, product.body.replace('Foodservice applications', 'Aplicaciones de restauración')));
  assert.throws(() => assertFactParity(product, product.body.replace('CC01TRIWINK', 'CC01WRONG')), /brown-triangle-box-pla-window: missing facts CC01TRIWINK/);
});

test('fact tokens preserve decimals and dimensions through HTML entities', () => {
  const tokens = factTokens('<td>CC01OWC5.5K</td><td>5.5&nbsp;oz</td><td>170 &#215; 130 mm</td><td>50/4</td>');
  for (const token of ['CC01OWC5.5K', '5.5', '170 x 130', '50/4']) assert.ok(tokens.includes(token), token);
});

test('fact parity detects a changed number attached to a unit', () => {
  const product = englishProduct('round-paper-plate');
  assert.ok(factTokens('127mm').includes('127'));
  assert.ok(factTokens(product.body).includes('127'));
  assert.throws(() => assertFactParity(product, product.body.replace('(127mm)', '(999mm)')), /127/);
});

test('fact parity treats entity and literal dimension separators alike', () => {
  const source = { slug: 'entity-dimension', body: '<td>170 &#215; 130 mm</td>' };
  assert.doesNotThrow(() => assertFactParity(source, '<td>170 x 130 mm</td>'));
  assert.throws(() => assertFactParity(source, '<td>170 x 999 mm</td>'), /130/);
});

test('extractProductFacts reports the product slug for malformed table rows', () => {
  const product = englishProduct('brown-triangle-box-pla-window');
  const malformed = { ...product, body: product.body.replace('<td>200</td>', '') };
  assert.throws(() => extractProductFacts(malformed), /brown-triangle-box-pla-window/);
});

test('localizedProductBody renders translated labels with shared rows and reviewed HTML', () => {
  const facts = extractProductFacts(englishProduct('brown-triangle-box-pla-window'));
  const entry = {
    summary: 'Boîte <tranche> & fenêtre',
    specificationHeading: 'Spécifications <catalogue>',
    comparisonHtml: '<p>Comparer les formats.</p>',
    orderingHeading: 'Avant <commande>',
    faq: '<p>Questions fréquentes.</p>',
    documentScope: 'Vérifier <chaque> document.',
    orderTerms: 'Confirmer quantité & délai.',
  };
  const ui = { specificationHeaders: {
    'Item No.': 'Référence',
    'Size (L x W x H)': 'Taille (L x l x H)',
    Packaging: 'Emballage',
    'PCS/CTN': 'Pièces/carton',
  } };
  const html = localizedProductBody(entry, facts, ui);

  assert.match(html, /<th>Référence<\/th>/);
  assert.match(html, /<td>CC01TRIWINK<\/td>/);
  assert.match(html, /<td>170 x 170 x 130 mm<\/td>/);
  assert.match(html, /Boîte &lt;tranche&gt; &amp; fenêtre/);
  assert.match(html, /Spécifications &lt;catalogue&gt;/);
  assert.match(html, /Avant &lt;commande&gt;/);
  assert.match(html, /Vérifier &lt;chaque&gt; document\./);
  assert.match(html, /Confirmer quantité &amp; délai\./);
  assert.match(html, /<p>Comparer les formats\.<\/p>/);
  assert.match(html, /<p>Questions fréquentes\.<\/p>/);
  assert.doesNotMatch(html, /<th>Item No\.<\/th>/);
});

test('localizedProductBody rejects a missing translated specification header', () => {
  const facts = extractProductFacts(englishProduct('brown-triangle-box-pla-window'));
  assert.throws(() => localizedProductBody({}, facts, { specificationHeaders: { 'Item No.': 'Référence' } }), /Size \(L x W x H\)/);
});
