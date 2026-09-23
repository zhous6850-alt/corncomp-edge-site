import test from 'node:test';
import assert from 'node:assert/strict';
import records from '../data/records.json' with { type: 'json' };
import {
  ARCHITECTURE_PAGES,
  DUPLICATE_PRODUCT_ALIASES,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_BY_SLUG,
  canonicalProductRoute,
} from './site-architecture.mjs';

test('classifies every English-labelled product as canonical or duplicate', () => {
  const products = records.filter((record) => record.type === 'product' && record.language === 'en');
  const classified = products.filter((product) => PRODUCT_CATEGORY_BY_SLUG[product.slug] || DUPLICATE_PRODUCT_ALIASES[product.slug]);

  assert.equal(products.length, 82);
  assert.equal(classified.length, products.length);
  assert.equal(new Set(classified.map((product) => product.slug)).size, products.length);
});

test('every duplicate product alias resolves to a canonical English product', () => {
  for (const target of Object.values(DUPLICATE_PRODUCT_ALIASES)) {
    assert.ok(PRODUCT_CATEGORY_BY_SLUG[target], `Missing canonical target for ${target}`);
  }
});

test('builds unique products under the full group and category hierarchy', () => {
  const routes = Object.keys(PRODUCT_CATEGORY_BY_SLUG).map(canonicalProductRoute);

  assert.equal(new Set(routes).size, routes.length);
  for (const route of routes) assert.match(route, /^\/products\/[^/]+\/[^/]+\/[^/]+\/$/);
  assert.equal(canonicalProductRoute('single-wall-white-cardboard-paper-cup'), '/products/cups-bowls/paper-cups/single-wall-white-cardboard-paper-cup/');
});

test('publishes only supported independent product categories', () => {
  const slugs = PRODUCT_CATEGORIES.map((category) => category.slug);

  for (const supported of ['paper-cups', 'salad-bowls', 'soup-cups', 'ice-cream-cups', 'paper-food-boxes', 'sushi-boxes', 'paper-straws', 'disposable-cutlery', 'paper-plates']) assert.ok(slugs.includes(supported));
  for (const unsupported of ['paper-bags', 'compostable-paper-cups', 'compostable-waste-bags', 'soup-bowls']) assert.ok(!slugs.includes(unsupported));
});

test('includes the approved custom, application, resource, trust, and contact pages', () => {
  const routes = new Set(ARCHITECTURE_PAGES.map((page) => page.route));

  for (const route of ['/products/', '/custom-packaging/', '/custom-packaging/custom-printed-paper-cups/', '/custom-packaging/custom-paper-straws/', '/applications/', '/applications/takeaway-packaging/', '/applications/restaurant-packaging/', '/applications/fast-food-packaging/', '/applications/ice-cream-dessert-packaging/', '/resources/', '/resources/guides/paper-cup-sizes/', '/resources/guides/custom-printed-paper-cups/', '/resources/guides/food-packaging-certifications/', '/about/', '/about/factory/', '/quality/', '/contact/']) assert.ok(routes.has(route), `Missing ${route}`);
});
