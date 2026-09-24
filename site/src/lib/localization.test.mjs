import assert from 'node:assert/strict';
import test from 'node:test';
import { ARCHITECTURE_PAGES } from './site-architecture.mjs';
import {
  SUPPORTED_LANGUAGES,
  ENGLISH_HOME,
  englishInventory,
  contentKeyForRecord,
  contentKeyForArchitecture,
  contentKeyFromRoute,
  sourceHash,
  normalizeLocalizedRoute,
  localeData,
  localizedEntry,
  routeFor,
  alternateGroup,
  allLocalizedEntries,
  localizedRedirects,
  uiFor,
} from './localization.mjs';

test('inventory contains exactly 85 stable unique English keys in source order', () => {
  const inventory = englishInventory();
  assert.equal(inventory.length, 85);
  assert.equal(new Set(inventory.map(({ contentKey }) => contentKey)).size, 85);
  assert.deepEqual(Object.fromEntries(['home', 'architecture', 'product', 'post'].map((type) => [
    type, inventory.filter((item) => item.type === type).length,
  ])), { home: 1, architecture: 35, product: 44, post: 5 });
  assert.equal(inventory[0], ENGLISH_HOME);
  assert.deepEqual(inventory.slice(1, 36).map(({ route }) => route), ARCHITECTURE_PAGES.map(({ route }) => route));
  assert.ok(inventory.slice(36, 80).every(({ route }) => route?.startsWith('/products/')));
  assert.ok(inventory.slice(80).every(({ type }) => type === 'post'));
});

test('stable keys do not depend on language or featured media', () => {
  const inventory = englishInventory();
  for (const key of ['home', 'architecture:products/cups-bowls/paper-cups', 'product:kraft-paper-bowl', 'post:eu-single-use-plastics-directive-explained']) {
    assert.ok(inventory.some(({ contentKey }) => contentKey === key), key);
  }
  assert.equal(contentKeyForArchitecture({ route: '/products/cups-bowls/paper-cups/' }), 'architecture:products/cups-bowls/paper-cups');
  assert.equal(contentKeyForRecord({ type: 'product', slug: 'kraft-paper-bowl', language: 'ar', featuredMediaId: 99 }), 'product:kraft-paper-bowl');
  assert.ok(ARCHITECTURE_PAGES.every((page) => page.contentKey === contentKeyForArchitecture(page)));
});

test('Arabic route normalization is canonical and idempotent', () => {
  const canonical = '/ar/%D8%B9%D9%86-corncomp/';
  for (const route of ['/ar/%d8%b9%d9%86-corncomp/', canonical, '/ar/عن-corncomp/']) {
    assert.equal(normalizeLocalizedRoute(route), canonical);
    assert.equal(normalizeLocalizedRoute(normalizeLocalizedRoute(route)), canonical);
  }
});

test('source hashes detect translatable English changes but ignore featured media identity', () => {
  const product = englishInventory().find(({ contentKey }) => contentKey === 'product:kraft-paper-bowl');
  assert.notEqual(sourceHash(product), sourceHash({ ...product, title: `${product.title} changed` }));
  assert.notEqual(sourceHash(product), sourceHash({ ...product, body: `${product.body} changed` }));
  assert.notEqual(sourceHash(product), sourceHash({ ...product, seo: { ...product.seo, title: 'Changed SEO title' } }));
  assert.equal(sourceHash(product), sourceHash({ ...product, featuredMediaId: 123456 }));
  assert.notEqual(sourceHash(ENGLISH_HOME), sourceHash({ ...ENGLISH_HOME, hero: { ...ENGLISH_HOME.hero, heading: 'Changed heading' } }));
  const guide = englishInventory().find(({ route }) => route === '/resources/guides/paper-cup-sizes/');
  assert.notEqual(sourceHash(guide), sourceHash({ ...guide, table: { ...guide.table, caption: 'Changed caption' } }));
});

test('empty locale shells remain non-indexed and missing routes return null', () => {
  assert.deepEqual(SUPPORTED_LANGUAGES, ['en', 'fr', 'es', 'ar']);
  for (const language of ['fr', 'es', 'ar']) {
    assert.deepEqual(localeData(language), {
      _meta: { language, sourceLanguage: 'en', synchronizedOn: null }, ui: {}, content: {},
    });
    assert.equal(localizedEntry(language, 'home'), null);
    assert.equal(routeFor(language, 'home'), null);
    assert.deepEqual(uiFor(language), {});
  }
  assert.equal(routeFor('en', 'home'), '/');
  assert.equal(contentKeyFromRoute('/'), 'home');
  assert.equal(contentKeyFromRoute('/not-an-active-page/'), null);
  assert.deepEqual(alternateGroup('home'), [{ language: 'en', route: '/' }]);
  assert.equal(allLocalizedEntries().length, 85);
  assert.equal(localizedRedirects().size, 0);
  assert.equal(uiFor('en').menu, 'Menu');
  assert.throws(() => localeData('de'), /Unsupported locale/);
  assert.throws(() => localizedEntry('de', 'home'), /Unsupported locale/);
});
