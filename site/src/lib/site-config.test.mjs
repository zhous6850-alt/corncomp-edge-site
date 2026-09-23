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

test('verified translated articles expose reciprocal deep-page alternatives', () => {
  const route = '/eu-single-use-plastics-directive-explained/';
  const alternatives = pageAlternates(route);

  assert.deepEqual(alternatives.map((item) => item.language), ['en', 'fr', 'es', 'ar']);
  assert.equal(alternatives[1].route, '/fr/directive-europeenne-sur-les-plastiques-a-usage-unique-ce-quelle-signifie-pour-les-acheteurs-demballages/');
  for (const alternate of alternatives) assert.deepEqual(pageAlternates(alternate.route), alternatives);
});

test('verified translated products use the canonical English architecture route', () => {
  const route = '/products/food-boxes-containers/sushi-boxes/black-white-cardboard-sushi-box-pla-window/';
  const alternatives = pageAlternates(route);

  assert.deepEqual(alternatives.map((item) => item.language), ['en', 'fr', 'es', 'ar']);
  assert.equal(alternatives[0].route, route);
  assert.equal(alternatives[1].route, '/fr/product/boite-a-sushi-noire-blanche-en-carton-fenetre-pla/');
  for (const alternate of alternatives) assert.deepEqual(pageAlternates(alternate.route), alternatives);
});

test('partial translation groups omit missing languages instead of inventing routes', () => {
  assert.deepEqual(pageAlternates('/us-state-plastic-packaging-laws-explained/').map((item) => item.language), ['en', 'es', 'ar']);
});
