import assert from 'node:assert/strict';
import test from 'node:test';
import { ARCHITECTURE_PAGES } from './site-architecture.mjs';
import { extractProductFacts, localizedProductBody, assertFactParity, factTokens } from './product-facts.mjs';
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
  assert.notEqual(sourceHash(product), sourceHash({ ...product, featuredMedia: { ...product.featuredMedia, alt: 'Changed product image alt text' } }));
  assert.equal(sourceHash(product), sourceHash({ ...product, featuredMediaId: 123456 }));
  assert.equal(sourceHash(product), sourceHash({ ...product, featuredMedia: { ...product.featuredMedia, id: 123456, sourceUrl: 'https://example.com/other.png', localPath: '/media/other.png' } }));
  assert.notEqual(sourceHash(ENGLISH_HOME), sourceHash({ ...ENGLISH_HOME, hero: { ...ENGLISH_HOME.hero, heading: 'Changed heading' } }));
  const guide = englishInventory().find(({ route }) => route === '/resources/guides/paper-cup-sizes/');
  assert.notEqual(sourceHash(guide), sourceHash({ ...guide, table: { ...guide.table, caption: 'Changed caption' } }));
});

test('unfinished locale shells remain non-indexed and missing routes return null', () => {
  assert.deepEqual(SUPPORTED_LANGUAGES, ['en', 'fr', 'es', 'ar']);
  for (const language of ['es', 'ar']) {
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
  assert.deepEqual(alternateGroup('home'), [{ language: 'en', route: '/' }, { language: 'fr', route: '/fr/' }]);
  assert.equal(allLocalizedEntries().length, 170);
  assert.deepEqual([...localizedRedirects()], [[
    '/fr/corncomp-pailles-en-papier-et-emballages-alimentaires-biodegradables/', '/fr/',
  ]]);
  assert.equal(uiFor('en').menu, 'Menu');
  assert.throws(() => localeData('de'), /Unsupported locale/);
  assert.throws(() => localizedEntry('de', 'home'), /Unsupported locale/);
});

function assertLocaleContract(locale, sources = englishInventory()) {
  const nonempty = (value, label) => assert.ok(typeof value === 'string' && value.trim(), label);
  const structure = (source, entry, path) => {
    if (typeof source === 'string') nonempty(entry, path);
    else if (Array.isArray(source)) {
      assert.ok(Array.isArray(entry), path);
      assert.equal(entry.length, source.length, path);
      source.forEach((value, index) => structure(value, entry[index], `${path}[${index}]`));
    } else if (source && typeof source === 'object') {
      for (const [key, value] of Object.entries(source)) structure(value, entry?.[key], `${path}.${key}`);
    }
  };
  const routes = new Set();
  for (const source of sources) {
    const key = source.contentKey;
    const entry = locale.content[key];
    assert.ok(entry, key);
    for (const field of ['route', 'title', 'description']) nonempty(entry[field], `${key}:${field}`);
    assert.ok(entry.route.startsWith('/fr/'), `${key}:locale route`);
    assert.equal(entry.route, normalizeLocalizedRoute(entry.route), `${key}:normalized route`);
    assert.ok(entry.route.endsWith('/') && !entry.route.includes('//'), `${key}:route shape`);
    assert.ok(!routes.has(entry.route), `${key}:duplicate route`);
    routes.add(entry.route);
    assert.equal(entry.sourceHash, sourceHash(source), `${key}:sourceHash`);
    if (source.featuredMedia) nonempty(entry.alt, `${key}:alt`);
    if (source.type === 'home') {
      for (const field of ['hero', 'proof', 'proofLabel', 'productIntro', 'productPathways', 'factory', 'programs', 'cta']) {
        structure(source[field], entry[field], `${key}:${field}`);
      }
    } else if (source.type === 'architecture') {
      for (const field of ['intro', 'sections', 'links']) structure(source[field], entry[field], `${key}:${field}`);
      for (const field of ['preparedBy', 'reviewedLabel', 'table', 'sourceIntro', 'sources']) {
        if (source[field]) structure(source[field], entry[field], `${key}:${field}`);
      }
    } else if (source.type === 'product') {
      for (const field of ['summary', 'specificationHeading', 'comparisonHtml', 'orderingHeading', 'faq', 'documentScope', 'orderTerms', 'alt']) {
        nonempty(entry[field], `${key}:${field}`);
      }
      const facts = extractProductFacts(source);
      for (const header of facts.tables.flatMap(({ headers }) => headers)) {
        nonempty(locale.ui.specificationHeaders?.[header], `ui.specificationHeaders:${header}`);
      }
      assertFactParity(source, localizedProductBody(entry, facts, locale.ui));
    } else if (source.type === 'post') {
      nonempty(entry.bodyHtml, `${key}:bodyHtml`);
      for (const image of entry.bodyHtml.matchAll(/<img\b[^>]*>/g)) {
        nonempty(image[0].match(/\balt="([^"]*)"/)?.[1], `${key}:body image alt`);
      }
    }
    if (source.type === 'post' || source.kind === 'guide') {
      assert.match(entry.dateModified || '', /^\d{4}-\d{2}-\d{2}$/, `${key}:dateModified`);
    }
  }
}

function assertLocaleHasNoEnglishPlaceholders(language, phrases) {
  const locale = localeData(language);
  const text = JSON.stringify({ ui: locale.ui, content: locale.content });
  for (const phrase of phrases) assert.ok(!text.includes(phrase), `${language}:English placeholder ${phrase}`);
}

test('French covers every active English key with current source hashes', () => {
  const expected = englishInventory();
  const locale = localeData('fr');
  assert.equal(Object.keys(locale.content).length, 85);
  for (const source of expected) {
    const entry = locale.content[source.contentKey];
    assert.ok(entry, source.contentKey);
    assert.equal(entry.sourceHash, sourceHash(source), source.contentKey);
    for (const field of ['route', 'title', 'description']) assert.ok(entry[field]?.trim(), `${source.contentKey}:${field}`);
  }
});

test('French indexable fields do not contain English UI placeholders', () => {
  assertLocaleHasNoEnglishPlaceholders('fr', [
    'Request a quote', 'Explore products', 'Built for B2B sourcing',
    'Ordering questions', 'Contact Us', 'Analytics settings',
  ]);
});

test('French commercial prose uses spaces rather than comma thousands separators', () => {
  const violations = [];
  const fields = ['title', 'description', 'summary', 'comparisonHtml', 'faq', 'documentScope', 'orderTerms', 'alt'];
  for (const source of englishInventory().filter(({ type }) => type === 'product')) {
    const entry = localeData('fr').content[source.contentKey];
    for (const field of fields) {
      if (/\b\d{1,3}(?:,\d{3})+\b/.test(entry[field] || '')) violations.push(`${source.contentKey}:${field}`);
    }
  }
  assert.deepEqual(violations, [], 'English comma thousands in French commercial prose');
});

test('French satisfies page-type contracts and shared product fact parity', () => {
  const locale = localeData('fr');
  assert.deepEqual(locale._meta, { language: 'fr', sourceLanguage: 'en', synchronizedOn: '2026-09-24' });
  for (const key of Object.keys(uiFor('en'))) assert.ok(locale.ui[key]?.trim(), `ui:${key}`);
  assertLocaleContract(locale);
});

test('French contracts reject missing prose, routes, alt text, product fields, headers and stale hashes', () => {
  const cases = [
    ['architecture:products', (entry) => { delete entry.intro; }, /intro/],
    ['home', (entry) => { entry.hero.imageAlt = ''; }, /imageAlt/],
    ['product:kraft-paper-bowl', (entry) => { entry.alt = ''; }, /alt/],
    ['product:kraft-paper-bowl', (entry) => { delete entry.documentScope; }, /documentScope/],
    ['post:eu-single-use-plastics-directive-explained', (entry) => { delete entry.bodyHtml; }, /bodyHtml/],
    ['post:eu-single-use-plastics-directive-explained', (entry) => { entry.bodyHtml = '<img src="/media/image.jpg" alt="">'; }, /body image alt/],
    ['home', (entry) => { entry.route = '/'; }, /locale route/],
    ['architecture:products', (entry) => { entry.route = '/fr/'; }, /duplicate route/],
    ['home', (entry) => { entry.sourceHash = 'stale'; }, /sourceHash/],
  ];
  for (const [key, mutate, error] of cases) {
    const locale = structuredClone(localeData('fr'));
    assert.ok(locale.content[key], key);
    mutate(locale.content[key]);
    assert.throws(() => assertLocaleContract(locale), error);
  }
  const locale = structuredClone(localeData('fr'));
  delete locale.ui.specificationHeaders;
  assert.throws(() => assertLocaleContract(locale), /specificationHeaders/);
  for (const field of ['summary', 'specificationHeading', 'comparisonHtml', 'orderingHeading', 'faq', 'documentScope', 'orderTerms', 'alt']) {
    const changed = structuredClone(localeData('fr'));
    delete changed.content['product:kraft-paper-bowl'][field];
    assert.throws(() => assertLocaleContract(changed), new RegExp(field));
  }
});

test('French localized links resolve to French entries and preserve guide evidence URLs', () => {
  const locale = localeData('fr');
  const routes = new Set(Object.values(locale.content).map(({ route }) => route));
  for (const source of englishInventory()) {
    const entry = locale.content[source.contentKey];
    for (const link of entry.links || []) assert.ok(routes.has(link.route), `${source.contentKey}:${link.route}`);
    for (const field of ['bodyHtml', 'comparisonHtml', 'faq']) {
      for (const [, href] of (entry[field] || '').matchAll(/href="([^"]+)"/g)) {
        if (href.startsWith('https:') && !href.includes('corn-comp.com')) continue;
        assert.ok(routes.has(href), `${source.contentKey}:${href}`);
      }
    }
    if (source.sources) assert.deepEqual(entry.sources.map(({ url }) => url), source.sources.map(({ url }) => url));
  }
});

test('French specification display values translate source cells without changing fact tokens', () => {
  const values = localeData('fr').ui.specificationValues;
  assert.ok(values && Object.keys(values).length, 'French specificationValues must cover prose cells');
  const cells = new Set(englishInventory().filter(({ type }) => type === 'product')
    .flatMap((source) => extractProductFacts(source).tables.flatMap(({ rows }) => rows.flat())));
  for (const [source, translated] of Object.entries(values)) {
    assert.ok(cells.has(source), `Unknown specification cell: ${source}`);
    assert.ok(typeof translated === 'string' && translated.trim(), source);
    assert.deepEqual(factTokens(translated), factTokens(source), source);
  }
  for (const source of [
    'Material', 'Standard Lead Time', 'Available on request; applicability must be confirmed for the order',
    'Brown / White, for 8oz cups', '50pcs × 20 shrink packs', 'Pointed tip',
    '30,000 units standard; 50,000 units for custom printing',
  ]) assert.ok(values[source]?.trim(), source);
});
