import assert from 'node:assert/strict';
import test from 'node:test';
import { navigationFor, pageAlternates } from './site-config.mjs';

test('translated navigation stays inside the selected language', () => {
  assert.equal(navigationFor('fr').product[1], '/fr/shop/');
  assert.equal(navigationFor('es').blog[1], '/es/blog/');
  assert.equal(navigationFor('ar').contact[1].startsWith('/ar/'), true);
});

test('known page groups expose four hreflang alternatives', () => {
  assert.deepEqual(pageAlternates('/products/').map((item) => item.language), ['en', 'fr', 'es', 'ar']);
  assert.deepEqual(pageAlternates('/product/paper-lid/'), []);
});
