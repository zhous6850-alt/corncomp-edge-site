# Corncomp Multilingual Content Synchronization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish complete French, Spanish, and Arabic counterparts for every active English Corncomp page while sharing product facts, preserving localized URLs, and producing reciprocal SEO metadata and `hreflang` groups.

**Architecture:** Build a stable `contentKey` inventory for the English homepage, 35 architecture pages, 44 canonical products, and five editorial posts. Store localized prose in one source-controlled JSON file per language, merge it with shared English facts at build time, and render every language through the same Astro components. Replace media-ID-based alternate discovery with `contentKey` groups and make coverage, source drift, route integrity, fact parity, and rendered SEO properties executable test gates.

**Tech Stack:** Astro 5.18.2, Node.js ESM, JSON locale data, Node's built-in test runner, Cloudflare Workers static assets, existing CSS/components only.

**Spec:** `docs/superpowers/specs/2026-09-24-multilingual-content-sync-design.md`

## Global Constraints

- The authoritative public domain is exactly `corn-comp.com`; do not configure `corncomp.com`.
- Supported languages are exactly `en`, `fr`, `es`, and `ar`.
- Do not add a runtime translation service, translation dependency, ecommerce feature, or new CMS.
- Existing supported product facts and qualifications must not be strengthened or changed.
- Preserve suitable existing localized URLs; any replaced alias must redirect in one hop.
- An indexable localized page must not fall back to English title, description, body, navigation, CTA, form label, or alt text.
- Arabic pages must render `lang="ar"` and `dir="rtl"`.
- English is `x-default` for every complete alternate group.
- Keep inquiry delivery, GA4 consent, and `generate_lead` behavior unchanged.
- Do not publish to production before explicit user approval of the multilingual preview.
- Use existing dependencies and Node standard-library modules only.

## File Structure

**Create**

- `site/src/lib/localization.mjs` — English inventory, stable keys, locale loading, source hashes, localized route lookup, alternate groups, and UI lookup.
- `site/src/lib/localization.test.mjs` — unit coverage for inventory, schema, hashes, routes, alternates, fact parity, and link localization.
- `site/src/lib/product-facts.mjs` — extract and render shared catalogue specification tables and immutable fact tokens from English product records.
- `site/src/lib/product-facts.test.mjs` — extraction and parity checks across all 44 products.
- `site/src/data/locales/fr.json` — French locale structure, then reviewed routes, metadata, UI, and page prose.
- `site/src/data/locales/es.json` — Spanish locale structure, then reviewed routes, metadata, UI, and page prose.
- `site/src/data/locales/ar.json` — Arabic locale structure, then reviewed routes, metadata, UI, and page prose.
- `site/src/components/HomePage.astro` — the existing homepage layout parameterized by localized content.
- `scripts/seed-locale-data.mjs` — one-time deterministic reuse of matching imported translations; emits uncommitted draft JSON for editorial completion.
- `scripts/seed-locale-data.test.mjs` — verifies deterministic matching and rejects ambiguous media matches.

**Modify**

- `site/src/lib/site-architecture.mjs` — expose stable architecture keys and separate shared evidence/facts from translatable strings.
- `site/src/lib/site-config.mjs` — read navigation and alternates from the localization registry rather than featured media.
- `site/src/lib/site-config.test.mjs` — assert complete reciprocal groups for all synchronized pages.
- `site/src/lib/content-routes.mjs` — localize internal URLs through stable content keys.
- `site/src/lib/content-routes.test.mjs` — reject English-link leakage and redirect loops.
- `site/src/pages/index.astro` — render `HomePage` with English content.
- `site/src/pages/[...path].astro` — generate and render localized home, architecture, product, post, shop, and blog routes.
- `site/src/pages/sitemap.xml.js` — include all localized canonical routes from the registry.
- `site/src/layouts/BaseLayout.astro` — localized Open Graph locale, consent copy, and alternate links.
- `site/src/components/Header.astro` — use localized architecture navigation and UI labels for every language.
- `site/src/components/Footer.astro` — localize public labels while preserving company facts and contact addresses.
- `site/src/lib/build-output.test.mjs` — assert built language, direction, content, schema, canonical, reciprocal `hreflang`, and absence of English placeholders.
- `site/src/lib/seo-output.test.mjs` — assert the expanded sitemap and canonical URL set.
- `site/src/lib/link-output.test.mjs` — assert localized internal-link consistency and one-hop aliases.
- `worker/index.mjs` — add only the localized alias redirects produced by the reviewed registry.
- `worker/inquiry.test.mjs` — keep inquiry tests green and add redirect-loop/one-hop checks if redirects share the Worker router.
- `GEO-SEO-AUDIT.md` — record preview evidence and remaining human-language limitations after implementation.

## Review Focus

1. Arabic percent-encoded routes containing lowercase escapes, decoded Unicode, or equivalent mixed forms must resolve to one uppercase-encoded canonical URL without duplicate output.
2. Two imported records sharing one featured-media ID must be rejected as ambiguous rather than paired to the wrong `contentKey`.
3. Item codes and numeric facts containing decimals, slashes, ranges, HTML entities, or units must survive localization exactly.
4. Localized HTML containing absolute `corn-comp.com` links, legacy aliases, or English canonical routes must resolve to the corresponding localized canonical page where one exists.
5. A stale localized entry whose English source changed must fail the source-hash test instead of silently shipping old copy.

---

### Task 1: Stable English inventory and locale registry

**Files:**
- Create: `site/src/lib/localization.mjs`
- Create: `site/src/lib/localization.test.mjs`
- Create: `scripts/seed-locale-data.mjs`
- Create: `scripts/seed-locale-data.test.mjs`
- Modify: `site/src/lib/site-architecture.mjs`

**Interfaces:**
- Consumes: `records`, `ARCHITECTURE_PAGES`, `PRODUCT_CATEGORY_BY_SLUG`, and `canonicalProductRoute(slug)`.
- Produces: `SUPPORTED_LANGUAGES`, `ENGLISH_HOME`, `englishInventory()`, `contentKeyForRecord(record)`, `contentKeyForArchitecture(page)`, `contentKeyFromRoute(route)`, `sourceHash(item)`, `normalizeLocalizedRoute(route)`, `localeData(language)`, `localizedEntry(language, contentKey)`, `routeFor(language, contentKey)`, `alternateGroup(contentKey)`, `allLocalizedEntries()`, `localizedRedirects()`, and `uiFor(language)`.

- [ ] **Step 1: Write failing inventory tests**

Add tests that pin the exact active inventory and the dangerous route cases:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SUPPORTED_LANGUAGES,
  englishInventory,
  normalizeLocalizedRoute,
  sourceHash,
} from './localization.mjs';

test('the English synchronization inventory contains 85 stable unique keys', () => {
  const inventory = englishInventory();
  assert.equal(inventory.length, 85);
  assert.equal(new Set(inventory.map((item) => item.contentKey)).size, 85);
  assert.deepEqual(
    Object.fromEntries(['home', 'architecture', 'product', 'post'].map((type) => [
      type,
      inventory.filter((item) => item.type === type).length,
    ])),
    { home: 1, architecture: 35, product: 44, post: 5 },
  );
});

test('stable keys do not depend on language or featured media', () => {
  const inventory = englishInventory();
  assert.ok(inventory.some((item) => item.contentKey === 'home'));
  assert.ok(inventory.some((item) => item.contentKey === 'architecture:products/cups-bowls/paper-cups'));
  assert.ok(inventory.some((item) => item.contentKey === 'product:kraft-paper-bowl'));
  assert.ok(inventory.some((item) => item.contentKey === 'post:eu-single-use-plastics-directive-explained'));
});

test('Arabic route normalization is canonical and idempotent', () => {
  const lower = '/ar/%d8%b9%d9%86-corncomp/';
  const upper = '/ar/%D8%B9%D9%86-corncomp/';
  assert.equal(normalizeLocalizedRoute(lower), upper);
  assert.equal(normalizeLocalizedRoute(upper), upper);
  assert.equal(normalizeLocalizedRoute('/ar/عن-corncomp/'), upper);
});

test('source hashes change when translatable English source changes', () => {
  const item = englishInventory().find(({ contentKey }) => contentKey === 'product:kraft-paper-bowl');
  assert.notEqual(sourceHash(item), sourceHash({ ...item, title: `${item.title} changed` }));
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `cd site; npm test -- --test-name-pattern="inventory|stable keys|Arabic route normalization|source hashes"`

Expected: FAIL because `localization.mjs` does not exist.

- [ ] **Step 3: Implement the minimal inventory and hashing model**

Use stable keys derived only from active English route identity:

```js
import { createHash } from 'node:crypto';
import records from '../data/records.json' with { type: 'json' };
import {
  ARCHITECTURE_PAGES,
  PRODUCT_CATEGORY_BY_SLUG,
  canonicalProductRoute,
} from './site-architecture.mjs';

import fr from '../data/locales/fr.json' with { type: 'json' };
import es from '../data/locales/es.json' with { type: 'json' };
import ar from '../data/locales/ar.json' with { type: 'json' };

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'ar'];

export const ENGLISH_HOME = {
  contentKey: 'home',
  type: 'home',
  route: '/',
  title: 'Paper Food Packaging Manufacturer | Corncomp',
  description: 'Corncomp manufactures paper cups, bowls, food boxes, paper straws and foodservice supplies for wholesale and custom packaging programs.',
  hero: {
    imageAlt: 'Corncomp paper food packaging in beverage service',
    eyebrow: 'Paper packaging manufacturer · Ningbo, China',
    heading: 'Paper Food Packaging, Built for Real Service',
    text: 'Cups, bowls, food boxes, paper straws and foodservice supplies for distributors, restaurant groups and custom packaging programs.',
    primaryLabel: 'Explore products',
    primaryKey: 'architecture:products',
    secondaryLabel: 'Request a quote',
    secondaryKey: 'architecture:contact',
  },
  proof: [
    ['8,000 m²', 'Manufacturing base'],
    ['6,000 m²', 'GMP-standard dust-free workshop'],
    ['60', 'Production lines'],
    ['2.5 billion', 'Annual paper straw capacity'],
  ],
  proofLabel: 'Manufacturing overview',
  productIntro: {
    eyebrow: 'Product architecture',
    heading: 'Find the format first.<br>Specify the order second.',
    text: 'Browse by packaging function, compare real catalogue products, and carry the selected item into a contextual inquiry. No shopping cart—just a clearer path from product research to a usable B2B specification.',
  },
  productPathways: [
    ['architecture:products/cups-bowls', 'Cups & Bowls', 'Paper cups, soup cups, salad bowls and ice cream cups with matching component options.'],
    ['architecture:products/food-boxes-containers', 'Food Boxes & Containers', 'Meal boxes, sandwich and sushi boxes, burger packs, wrap sleeves and fry packaging.'],
    ['architecture:products/foodservice-supplies', 'Foodservice Supplies', 'Paper straws, disposable cutlery and paper plates for distribution and custom programs.'],
  ],
  factory: {
    imageAlt: 'Corncomp manufacturing facility',
    eyebrow: 'Manufacturing evidence',
    heading: 'A supplier page should show what buyers need to verify.',
    text: 'Review Corncomp’s factory context, production responsibilities and quality systems. Then confirm which material, production line, certificate or report applies to the exact item you plan to order.',
    bullets: ['Catalogue-based product selection', 'Custom printing and private-label review', 'Specification, sample and packing confirmation', 'Product-specific document scope checks'],
    label: 'See factory & manufacturing',
    contentKey: 'architecture:about/factory',
  },
  programs: {
    eyebrow: 'Plan the complete program',
    heading: 'Products are only one part of the decision.',
    cards: [
      ['architecture:custom-packaging', 'Custom packaging', 'Prepare size, artwork, print, packing and destination requirements before sampling.'],
      ['architecture:applications', 'Application planning', 'Choose packaging around the food, temperature, holding time, display and delivery conditions.'],
      ['architecture:quality', 'Quality & certification', 'Understand company-level certificates, test reports and item-specific document scope.'],
      ['architecture:resources', 'Buyer resources', 'Use practical guides to compare sizes and prepare a more complete sourcing brief.'],
    ],
  },
  cta: {
    eyebrow: 'Ready to specify?',
    heading: 'Send the product, quantity and destination.',
    text: 'Add artwork, packing and document requirements when available. Corncomp will review feasibility before quoting.',
    label: 'Start an inquiry',
    contentKey: 'architecture:contact',
  },
};

export const ENGLISH_UI = {
  menu: 'Menu',
  allProducts: 'All Products',
  requestQuote: 'Request a quote',
  contactUs: 'Contact Us',
  analyticsSettings: 'Analytics settings',
  allowAnalytics: 'Allow analytics',
  declineAnalytics: 'Decline',
  productGroup: 'Product group',
  viewProductFamilies: 'View product families',
  relatedProducts: 'Related products',
  specifications: 'Catalogue specifications',
  orderingQuestions: 'Ordering questions',
};

export const contentKeyForArchitecture = (page) =>
  `architecture:${page.route.replace(/^\/+|\/+$/g, '')}`;

export const contentKeyForRecord = (record) => `${record.type}:${record.slug}`;

export function englishInventory() {
  const home = [ENGLISH_HOME];
  const architecture = ARCHITECTURE_PAGES.map((page) => ({
    ...page,
    contentKey: contentKeyForArchitecture(page),
    type: 'architecture',
  }));
  const products = records
    .filter((record) => record.language === 'en' && record.type === 'product' && PRODUCT_CATEGORY_BY_SLUG[record.slug])
    .map((record) => ({
      ...record,
      contentKey: contentKeyForRecord(record),
      route: canonicalProductRoute(record.slug),
    }));
  const posts = records
    .filter((record) => record.language === 'en' && record.type === 'post')
    .map((record) => ({ ...record, contentKey: contentKeyForRecord(record) }));
  return [...home, ...architecture, ...products, ...posts];
}

const hashableSource = (item) => ({
  contentKey: item.contentKey,
  route: item.route,
  title: item.title || '',
  description: item.description || item.seo?.description || '',
  intro: item.intro || '',
  body: item.body || '',
  sections: item.sections || [],
  links: item.links || [],
  preparedBy: item.preparedBy || '',
  reviewedLabel: item.reviewedLabel || '',
  table: item.table || null,
  sourceIntro: item.sourceIntro || '',
  sources: item.sources || [],
  hero: item.hero || null,
  proof: item.proof || [],
  proofLabel: item.proofLabel || '',
  productIntro: item.productIntro || null,
  productPathways: item.productPathways || [],
  factory: item.factory || null,
  programs: item.programs || null,
  cta: item.cta || null,
});

export const sourceHash = (item) => createHash('sha256')
  .update(JSON.stringify(hashableSource(item)))
  .digest('hex');

export function normalizeLocalizedRoute(route) {
  const decoded = decodeURI(route);
  return encodeURI(decoded).replace(/%[\da-f]{2}/gi, (part) => part.toUpperCase());
}

const localeByLanguage = { fr, es, ar };

export function localeData(language) {
  const locale = localeByLanguage[language];
  if (!locale) throw new Error(`Unsupported locale: ${language}`);
  return locale;
}

const englishByKey = () => new Map(englishInventory().map((item) => [item.contentKey, item]));

export function localizedEntry(language, contentKey) {
  if (language === 'en') return englishByKey().get(contentKey) || null;
  return localeData(language).content[contentKey] || null;
}

export function routeFor(language, contentKey) {
  return localizedEntry(language, contentKey)?.route || null;
}

export function allLocalizedEntries() {
  return SUPPORTED_LANGUAGES.flatMap((language) => englishInventory().flatMap((source) => {
    const entry = localizedEntry(language, source.contentKey);
    return entry ? [{ language, contentKey: source.contentKey, ...entry }] : [];
  }));
}

export function contentKeyFromRoute(route) {
  const normalized = normalizeLocalizedRoute(route);
  return allLocalizedEntries().find((entry) => normalizeLocalizedRoute(entry.route) === normalized)?.contentKey || null;
}

export function alternateGroup(contentKey) {
  return SUPPORTED_LANGUAGES.flatMap((language) => {
    const route = routeFor(language, contentKey);
    return route ? [{ language, route: normalizeLocalizedRoute(route) }] : [];
  });
}

export function uiFor(language) {
  return language === 'en' ? ENGLISH_UI : localeData(language).ui;
}

export function localizedRedirects() {
  const redirects = new Map();
  const canonicals = new Set(allLocalizedEntries().map(({ route }) => normalizeLocalizedRoute(route)));
  for (const entry of allLocalizedEntries()) {
    for (const alias of entry.aliases || []) {
      const source = normalizeLocalizedRoute(alias);
      const target = normalizeLocalizedRoute(entry.route);
      if (canonicals.has(source)) throw new Error(`Alias is canonical: ${source}`);
      if (redirects.has(source)) throw new Error(`Duplicate alias: ${source}`);
      redirects.set(source, target);
    }
  }
  for (const target of redirects.values()) {
    if (redirects.has(target)) throw new Error(`Redirect chain through ${target}`);
  }
  return redirects;
}
```

Add `contentKey` to the objects exported from `site-architecture.mjs` without changing English routes or copy.

Create all three locale files in this task with the exact non-indexed structure below so static JSON imports work before editorial completion. Do not add these routes to `getStaticPaths` or the sitemap until Task 7:

```json
{
  "_meta": { "language": "fr", "sourceLanguage": "en", "synchronizedOn": null },
  "ui": {},
  "content": {}
}
```

Use `es` and `ar` respectively in the other two files. The functions above return `null` for an unknown route or missing entry and throw only for an unsupported language or an invalid redirect map.

- [ ] **Step 4: Add deterministic seeding tests**

Test the one-time seeder with in-memory fixtures. It must reuse a record only when a static page mapping or a unique same-type media match identifies it, and it must throw on ambiguous matches:

```js
test('the seeder rejects ambiguous media matches', () => {
  const english = { type: 'product', slug: 'cup', featuredMediaId: 9 };
  const translated = [
    { language: 'fr', type: 'product', slug: 'gobelet-a', featuredMediaId: 9 },
    { language: 'fr', type: 'product', slug: 'gobelet-b', featuredMediaId: 9 },
  ];
  assert.throws(() => matchImportedRecord(english, translated, 'fr'), /ambiguous/i);
});
```

The seeder writes only to a caller-supplied output path and never overwrites `site/src/data/locales/*.json`.

- [ ] **Step 5: Implement the deterministic seeder**

Export and use this matcher:

```js
export function matchImportedRecord(english, records, language) {
  const candidates = records.filter((item) =>
    item.language === language
    && item.type === english.type
    && english.featuredMediaId
    && item.featuredMediaId === english.featuredMediaId);
  if (candidates.length > 1) {
    throw new Error(`Ambiguous ${language} match for ${english.slug}: ${candidates.map(({ slug }) => slug).join(', ')}`);
  }
  return candidates[0] || null;
}
```

The CLI accepts only `--language fr|es|ar` and `--output <path>`, rejects an output path inside `site/src/data/locales`, calls `englishInventory()`, records unambiguous imported title/body/route/SEO candidates, and emits a JSON report with `matched`, `unmatched`, and `ambiguous` counts. Use `node:fs/promises.writeFile`, `node:path.resolve`, and no dependency.

- [ ] **Step 6: Run the targeted tests and full site suite**

Run: `cd site; npm test -- --test-name-pattern="inventory|stable keys|Arabic route normalization|source hashes"`

Expected: PASS for all targeted tests.

Run: `node --test scripts/seed-locale-data.test.mjs; cd site; npm test`

Expected: seeder tests PASS and the existing site suite remains green.

- [ ] **Step 7: Commit**

```powershell
git add -- site/src/lib/localization.mjs site/src/lib/localization.test.mjs site/src/lib/site-architecture.mjs site/src/data/locales/fr.json site/src/data/locales/es.json site/src/data/locales/ar.json scripts/seed-locale-data.mjs scripts/seed-locale-data.test.mjs
git commit -m "Add stable multilingual content inventory"
```

### Task 2: Shared product fact extraction and parity gate

**Files:**
- Create: `site/src/lib/product-facts.mjs`
- Create: `site/src/lib/product-facts.test.mjs`

**Interfaces:**
- Consumes: English product records from `records.json`.
- Produces: `extractProductFacts(record)`, `factTokens(html)`, `localizedProductBody(entry, facts, ui)`, and `assertFactParity(sourceRecord, localizedHtml)`.

- [ ] **Step 1: Write failing fact extraction tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import records from '../data/records.json' with { type: 'json' };
import { assertFactParity, extractProductFacts, factTokens } from './product-facts.mjs';

const englishProduct = (slug) => records.find((item) =>
  item.language === 'en' && item.type === 'product' && item.slug === slug);

test('extracts every open-wrap-cup item code and decimal token', () => {
  const facts = extractProductFacts(englishProduct('cardboard-open-wrap-cup'));
  assert.deepEqual(facts.itemCodes, ['CC01OWC100K', 'CC01OWC5.5K', 'CC01OWC135K', 'CC01OWC160K']);
  assert.ok(factTokens(englishProduct('cardboard-open-wrap-cup').body).includes('5.5'));
});

test('all 44 canonical products expose one specification model', () => {
  const products = records.filter((item) =>
    item.language === 'en' && item.type === 'product' && PRODUCT_CATEGORY_BY_SLUG[item.slug]);
  assert.equal(products.length, 44);
  for (const product of products) {
    const facts = extractProductFacts(product);
    assert.ok(facts.tables.length >= 1, product.slug);
    assert.ok(facts.itemCodes.length >= 1, product.slug);
  }
});

test('fact parity allows translated prose but rejects changed immutable facts', () => {
  const product = englishProduct('brown-triangle-box-pla-window');
  assert.doesNotThrow(() => assertFactParity(product, product.body.replace('Ordering questions', 'Preguntas de compra')));
  assert.throws(() => assertFactParity(product, product.body.replace('CC01TRIWINK', 'CC01WRONG')), /CC01TRIWINK/);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `cd site; npm test -- --test-name-pattern="extracts every|44 canonical|immutable facts"`

Expected: FAIL because `product-facts.mjs` does not exist.

- [ ] **Step 3: Implement the smallest fact model**

Parse the consistent catalogue tables already present in English bodies. Preserve header keys and cell values as structured arrays; localize labels only when rendering:

```js
const itemCodePattern = /\bCC[\dA-Z.-]+\b/g;
const numberPattern = /\b\d+(?:\.\d+)?(?:\s*[×x/]\s*\d+(?:\.\d+)?)*\b/g;

export function factTokens(html = '') {
  const cleaned = html
    .replace(/&#\d+;|&#x[\da-f]+;|&[a-z]+;/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  return [...new Set([
    ...(html.match(itemCodePattern) || []),
    ...(cleaned.match(numberPattern) || []),
  ])].sort();
}

export function assertFactParity(sourceRecord, localizedHtml) {
  const localized = new Set(factTokens(localizedHtml));
  const missing = factTokens(sourceRecord.body).filter((token) => !localized.has(token));
  if (missing.length) throw new Error(`${sourceRecord.slug}: missing facts ${missing.join(', ')}`);
}
```

`extractProductFacts` must parse `<table>`, `<thead>`, `<tbody>`, `<th>`, and `<td>` using narrowly scoped existing markup; it must throw with the product slug if any table shape is inconsistent. Do not add an HTML parser dependency.

- [ ] **Step 4: Run targeted tests and the full suite**

Run: `cd site; npm test -- --test-name-pattern="extracts every|44 canonical|immutable facts"`

Expected: PASS.

Run: `cd site; npm test`

Expected: full site suite PASS.

- [ ] **Step 5: Commit**

```powershell
git add -- site/src/lib/product-facts.mjs site/src/lib/product-facts.test.mjs
git commit -m "Share and validate localized product facts"
```

### Task 3: Complete and review French locale data

**Files:**
- Modify: `site/src/data/locales/fr.json`
- Modify: `site/src/lib/localization.test.mjs`

**Interfaces:**
- Consumes: `englishInventory()`, `sourceHash(item)`, imported French records, and the locale schema from Task 1.
- Produces: a complete French locale object with `_meta`, `ui`, and exactly 85 `content` entries keyed by English `contentKey`.

**Editorial sub-skills:** Use `humanized-public-writing`, then its required `humanizer` pass, for newly drafted website prose. Recheck the humanized result against English facts before saving it.

- [ ] **Step 1: Write the failing French coverage test**

```js
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
```

Define the shared assertion directly above those tests:

```js
function assertLocaleHasNoEnglishPlaceholders(language, phrases) {
  const visible = JSON.stringify(localeData(language).content);
  for (const phrase of phrases) assert.equal(visible.includes(phrase), false, `${language}:${phrase}`);
}
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `cd site; npm test -- --test-name-pattern="French covers|French indexable"`

Expected: FAIL because `fr.json` does not exist.

- [ ] **Step 3: Generate an uncommitted French seed file**

Run:

```powershell
node scripts/seed-locale-data.mjs --language fr --output "$env:TEMP\corncomp-fr-seed.json"
```

Expected: the report identifies the 16 reusable imported records, all unmatched keys, and no ambiguous matches. It must not modify the committed locale path.

- [ ] **Step 4: Author the complete French locale file**

Use this exact top-level schema:

```json
{
  "_meta": { "language": "fr", "sourceLanguage": "en", "synchronizedOn": "2026-09-24" },
  "ui": {
    "menu": "Menu",
    "allProducts": "Tous les produits",
    "requestQuote": "Demander un devis",
    "contactUs": "Nous contacter",
    "analyticsSettings": "Paramètres d’analyse",
    "allowAnalytics": "Autoriser les données d’analyse",
    "declineAnalytics": "Refuser",
    "productGroup": "Groupe de produits",
    "viewProductFamilies": "Voir les familles de produits",
    "relatedProducts": "Produits associés",
    "specifications": "Spécifications du catalogue",
    "orderingQuestions": "Questions avant commande"
  },
  "content": {}
}
```

For every content entry, preserve the existing French route when it maps to the same page. Product entries must contain `summary`, `specificationHeading`, `comparisonHtml`, `orderingHeading`, `faq`, `documentScope`, `orderTerms`, and `alt`; architecture entries must contain localized `intro`, `sections`, and `links`; posts must contain reviewed localized `bodyHtml`. Copy no English prose into an indexable field.

Run a separate editorial pass that removes literal-English syntax and sales filler, then compare every supported claim and `sourceHash` with English.

- [ ] **Step 5: Run French coverage, fact, and link tests**

Run: `cd site; npm test -- --test-name-pattern="French|fact parity|localized links"`

Expected: all French tests PASS; the locale contains exactly 85 current entries.

- [ ] **Step 6: Commit**

```powershell
git add -- site/src/data/locales/fr.json site/src/lib/localization.test.mjs
git commit -m "Synchronize French site content"
```

### Task 4: Complete and review Spanish locale data

**Files:**
- Modify: `site/src/data/locales/es.json`
- Modify: `site/src/lib/localization.test.mjs`

**Interfaces:**
- Consumes: the same registry and locale schema as Task 3 plus 55 imported Spanish records.
- Produces: a complete Spanish locale object with exactly 85 current entries.

**Editorial sub-skills:** Use `humanized-public-writing`, then its required `humanizer` pass, for newly drafted website prose. Recheck the humanized result against English facts before saving it.

- [ ] **Step 1: Write the failing Spanish coverage and placeholder tests**

Mirror the French assertions with `localeData('es')` and these prohibited UI strings:

```js
test('Spanish indexable fields do not contain English UI placeholders', () => {
  assertLocaleHasNoEnglishPlaceholders('es', [
    'Request a quote', 'Explore products', 'Built for B2B sourcing',
    'Ordering questions', 'Contact Us', 'Analytics settings',
  ]);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `cd site; npm test -- --test-name-pattern="Spanish covers|Spanish indexable"`

Expected: FAIL because `es.json` does not exist.

- [ ] **Step 3: Generate an uncommitted Spanish seed file**

Run:

```powershell
node scripts/seed-locale-data.mjs --language es --output "$env:TEMP\corncomp-es-seed.json"
```

Expected: the report reuses only unambiguous matching records and lists missing/currently stale entries.

- [ ] **Step 4: Author and review all 85 Spanish entries**

Use the Task 3 schema with natural Spanish UI labels, including:

```json
{
  "menu": "Menú",
  "allProducts": "Todos los productos",
  "requestQuote": "Solicitar presupuesto",
  "contactUs": "Contacto",
  "analyticsSettings": "Preferencias de analítica",
  "allowAnalytics": "Permitir analítica",
  "declineAnalytics": "Rechazar",
  "productGroup": "Grupo de productos",
  "viewProductFamilies": "Ver familias de productos",
  "relatedProducts": "Productos relacionados",
  "specifications": "Especificaciones del catálogo",
  "orderingQuestions": "Preguntas antes de realizar el pedido"
}
```

Preserve matching existing Spanish URLs, natural buyer language, English facts, and product item codes. Complete the separate humanization and fact-review pass before committing.

- [ ] **Step 5: Run Spanish coverage, fact, and link tests**

Run: `cd site; npm test -- --test-name-pattern="Spanish|fact parity|localized links"`

Expected: all Spanish tests PASS and the locale contains exactly 85 current entries.

- [ ] **Step 6: Commit**

```powershell
git add -- site/src/data/locales/es.json site/src/lib/localization.test.mjs
git commit -m "Synchronize Spanish site content"
```

### Task 5: Complete and review Arabic locale data

**Files:**
- Modify: `site/src/data/locales/ar.json`
- Modify: `site/src/lib/localization.test.mjs`

**Interfaces:**
- Consumes: the same registry and locale schema as Task 3 plus 55 imported Arabic records.
- Produces: a complete Arabic locale object with exactly 85 current entries and canonical encoded routes.

**Editorial sub-skills:** Use `humanized-public-writing`, then its required `humanizer` pass, for newly drafted website prose. Recheck the humanized result against English facts before saving it.

- [ ] **Step 1: Write failing Arabic coverage, direction, and route tests**

```js
test('Arabic covers every active English key with canonical routes', () => {
  const locale = localeData('ar');
  assert.equal(Object.keys(locale.content).length, 85);
  for (const source of englishInventory()) {
    const entry = locale.content[source.contentKey];
    assert.equal(entry.sourceHash, sourceHash(source), source.contentKey);
    assert.equal(entry.route, normalizeLocalizedRoute(entry.route));
    assert.match(entry.route, /^\/ar\//);
  }
});

test('Arabic indexable fields do not contain English UI placeholders', () => {
  assertLocaleHasNoEnglishPlaceholders('ar', [
    'Request a quote', 'Explore products', 'Built for B2B sourcing',
    'Ordering questions', 'Contact Us', 'Analytics settings',
  ]);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `cd site; npm test -- --test-name-pattern="Arabic covers|Arabic indexable"`

Expected: FAIL because `ar.json` does not exist.

- [ ] **Step 3: Generate an uncommitted Arabic seed file**

Run:

```powershell
node scripts/seed-locale-data.mjs --language ar --output "$env:TEMP\corncomp-ar-seed.json"
```

Expected: the report normalizes all matched Arabic routes to uppercase percent escapes and reports no duplicate canonical route.

- [ ] **Step 4: Author and review all 85 Arabic entries**

Use the shared schema with Arabic labels, including:

```json
{
  "menu": "القائمة",
  "allProducts": "جميع المنتجات",
  "requestQuote": "طلب عرض سعر",
  "contactUs": "اتصل بنا",
  "analyticsSettings": "إعدادات التحليلات",
  "allowAnalytics": "السماح بالتحليلات",
  "declineAnalytics": "رفض",
  "productGroup": "مجموعة المنتجات",
  "viewProductFamilies": "عرض فئات المنتجات",
  "relatedProducts": "منتجات ذات صلة",
  "specifications": "مواصفات الكتالوج",
  "orderingQuestions": "أسئلة قبل الطلب"
}
```

Keep product codes, measurements, standards, URLs, and company facts exact. Review sentence direction, punctuation, embedded Latin item codes, and link placement separately from translation accuracy.

- [ ] **Step 5: Run Arabic coverage, fact, route, and link tests**

Run: `cd site; npm test -- --test-name-pattern="Arabic|fact parity|localized links|route normalization"`

Expected: all Arabic tests PASS and the locale contains exactly 85 current entries.

- [ ] **Step 6: Commit**

```powershell
git add -- site/src/data/locales/ar.json site/src/lib/localization.test.mjs
git commit -m "Synchronize Arabic site content"
```

### Task 6: Shared localized homepage, navigation, footer, and consent UI

**Files:**
- Create: `site/src/components/HomePage.astro`
- Modify: `site/src/pages/index.astro`
- Modify: `site/src/pages/[...path].astro`
- Modify: `site/src/components/Header.astro`
- Modify: `site/src/components/Footer.astro`
- Modify: `site/src/layouts/BaseLayout.astro`
- Modify: `site/src/lib/build-output.test.mjs`

**Interfaces:**
- Consumes: `localizedEntry(language, 'home')`, `uiFor(language)`, `routeFor(language, contentKey)`, and the current English images and company facts.
- Produces: one `HomePage` component and localized shared chrome for all four languages.

- [ ] **Step 1: Write failing built-output tests**

Add a helper that reads each built locale homepage and assert localized content, direction, and shared proof facts:

```js
async function readBuiltRoute(route) {
  const relative = route === '/' ? 'index.html' : `${decodeURI(route).replace(/^\/+|\/+$/g, '')}/index.html`;
  return readFile(new URL(`../../dist/${relative}`, import.meta.url), 'utf8');
}

test('all localized homepages use the current homepage layout and localized UI', async () => {
  const pages = [
    ['fr', 'Fabricant', 'Demander un devis', 'ltr'],
    ['es', 'Fabricante', 'Solicitar presupuesto', 'ltr'],
    ['ar', 'مصنع', 'طلب عرض سعر', 'rtl'],
  ];
  for (const [language, headingToken, quoteLabel, direction] of pages) {
    const route = routeFor(language, 'home');
    const html = await readBuiltRoute(route);
    assert.match(html, new RegExp(`<html lang="${language}" dir="${direction}"`));
    assert.match(html, new RegExp(headingToken));
    assert.match(html, new RegExp(quoteLabel));
    assert.match(html, /8,000 m²/);
    assert.match(html, /2\.5 billion|2,5 milliards|2,5 mil millones|2\.5 مليار/);
    assert.doesNotMatch(html, />Explore products</);
  }
});
```

Add the shared-UI assertion using the same built pages:

```js
test('localized shared UI uses the selected locale', async () => {
  for (const language of ['fr', 'es', 'ar']) {
    const html = await readBuiltRoute(routeFor(language, 'home'));
    const ui = uiFor(language);
    for (const label of [ui.menu, ui.allProducts, ui.contactUs, ui.analyticsSettings, ui.allowAnalytics, ui.declineAnalytics]) {
      assert.match(html, new RegExp(escapeRegExp(label)), `${language}:${label}`);
    }
  }
});
```

- [ ] **Step 2: Run a build and verify RED**

Run: `cd site; npm run build; npm test -- --test-name-pattern="localized homepages|localized shared UI"`

Expected: build succeeds with old pages, then the new localized-layout assertions FAIL.

- [ ] **Step 3: Extract and parameterize the homepage**

Move the current `index.astro` markup into `HomePage.astro` without changing classes or images. Accept exactly:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { routeFor } from '../lib/localization.mjs';
const { language, content, ui } = Astro.props;
const productImages = [
  '/media/wp/261--2026-07-25-100620.png',
  '/media/wp/164--2026-07-14-133106.png',
  '/media/wp/107--2026-07-14-101008.png',
];
---
<BaseLayout
  title={content.title}
  description={content.description}
  language={language}
  pathname={content.route}
  bodyClass="home-v2"
>
  <section class="home-hero">
    <div class="home-hero-media"><img src="/media/embedded/c97a5896-corncomp-homepage-hero-drink-compressed-copy.jpg.webp" alt={content.hero.imageAlt} width="1920" height="1080" fetchpriority="high" decoding="async"></div>
    <div class="content-shell home-hero-content"><p class="eyebrow">{content.hero.eyebrow}</p><h1>{content.hero.heading}</h1><p class="home-hero-copy">{content.hero.text}</p><div class="hero-actions"><a class="button-primary" href={routeFor(language, content.hero.primaryKey)}>{content.hero.primaryLabel}</a><a class="button-secondary" href={routeFor(language, content.hero.secondaryKey)}>{content.hero.secondaryLabel}</a></div></div>
  </section>
  <section class="content-shell home-proof" aria-label={content.proofLabel}>{content.proof.map(([value, label]) => <div><strong>{value}</strong><span>{label}</span></div>)}</section>
  <section class="content-shell home-section">
    <div class="section-heading split-heading"><div><p class="eyebrow">{content.productIntro.eyebrow}</p><h2 set:html={content.productIntro.heading} /></div><p>{content.productIntro.text}</p></div>
    <div class="home-product-grid">{content.productPathways.map(([contentKey, title, text], index) => <a class="home-product-card" href={routeFor(language, contentKey)}><img src={productImages[index]} alt="" loading="lazy" decoding="async"><div><p class="eyebrow">{ui.productGroup}</p><h3>{title}</h3><p>{text}</p><span>{ui.viewProductFamilies} →</span></div></a>)}</div>
  </section>
  <section class="home-factory"><div class="content-shell home-factory-grid"><div class="home-factory-media"><img src="/media/embedded/be53f20b-facility-showcase-1.jpg" alt={content.factory.imageAlt} loading="lazy" decoding="async"></div><div class="home-factory-copy"><p class="eyebrow">{content.factory.eyebrow}</p><h2>{content.factory.heading}</h2><p>{content.factory.text}</p><ul>{content.factory.bullets.map((item) => <li>{item}</li>)}</ul><a class="button-primary" href={routeFor(language, content.factory.contentKey)}>{content.factory.label}</a></div></div></section>
  <section class="content-shell home-section home-pathways"><div class="section-heading"><p class="eyebrow">{content.programs.eyebrow}</p><h2>{content.programs.heading}</h2></div><div class="architecture-grid">{content.programs.cards.map(([contentKey, title, text], index) => <a class="architecture-card" href={routeFor(language, contentKey)}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></a>)}</div></section>
  <section class="content-shell home-cta"><div><p class="eyebrow">{content.cta.eyebrow}</p><h2>{content.cta.heading}</h2><p>{content.cta.text}</p></div><a class="button-primary" href={routeFor(language, content.cta.contentKey)}>{content.cta.label}</a></section>
</BaseLayout>
```

`index.astro` renders English through the same component. `[...path].astro` adds the three localized home routes from the registry and renders `HomePage`.

- [ ] **Step 4: Localize shared components**

Replace English-only labels in `Header`, `Footer`, and `BaseLayout` with `uiFor(language)` values. Keep company name, address, phone numbers, email, social URLs, Worker form action, GA4 measurement ID, and consent storage keys unchanged.

The product mega-menu must use localized group/category entries from the registry for every language; remove the old split that renders the complete architecture only for English.

- [ ] **Step 5: Run build-output, analytics, and full tests**

Run: `cd site; npm run build; npm test -- --test-name-pattern="localized homepages|localized shared UI|analytics"`

Expected: localized tests PASS and all analytics tests remain PASS.

Run: `cd site; npm test`

Expected: full suite PASS.

- [ ] **Step 6: Commit**

```powershell
git add -- site/src/components/HomePage.astro site/src/pages/index.astro 'site/src/pages/[...path].astro' site/src/components/Header.astro site/src/components/Footer.astro site/src/layouts/BaseLayout.astro site/src/lib/build-output.test.mjs
git commit -m "Render shared site chrome in every language"
```

### Task 7: Localized page rendering, links, schema, sitemap, and redirects

**Files:**
- Modify: `site/src/pages/[...path].astro`
- Modify: `site/src/lib/site-config.mjs`
- Modify: `site/src/lib/site-config.test.mjs`
- Modify: `site/src/lib/content-routes.mjs`
- Modify: `site/src/lib/content-routes.test.mjs`
- Modify: `site/src/pages/sitemap.xml.js`
- Modify: `site/src/lib/build-output.test.mjs`
- Modify: `site/src/lib/seo-output.test.mjs`
- Modify: `site/src/lib/link-output.test.mjs`
- Modify: `worker/index.mjs`
- Modify: `worker/inquiry.test.mjs`

**Interfaces:**
- Consumes: complete locale registries, `extractProductFacts`, `localizedProductBody`, and `alternateGroup(contentKey)`.
- Produces: all localized canonical routes, reciprocal alternates, localized schema/navigation, and one-hop legacy redirects.

- [ ] **Step 1: Write failing reciprocal-alternate and route tests**

```js
test('every synchronized key has one reciprocal four-language alternate group', () => {
  for (const source of englishInventory()) {
    const group = alternateGroup(source.contentKey);
    assert.deepEqual(group.map(({ language }) => language), ['en', 'fr', 'es', 'ar'], source.contentKey);
    for (const alternate of group) {
      assert.deepEqual(alternateGroup(contentKeyFromRoute(alternate.route)), group, alternate.route);
    }
  }
});

test('localized routes are unique and aliases are one hop', () => {
  const routes = allLocalizedEntries().map(({ route }) => route);
  assert.equal(new Set(routes).size, routes.length);
  for (const [source, target] of localizedRedirects()) {
    assert.notEqual(source, target);
    assert.equal(localizedRedirects().has(target), false, `${source} redirects through ${target}`);
  }
});
```

- [ ] **Step 2: Write failing built-page SEO and link tests**

For one homepage, category, product, guide, post, and contact page per localized language, assert:

```js
assert.match(html, new RegExp(`<link rel="canonical" href="https://corn-comp.com${escapeRegExp(route)}"`));
for (const code of ['en', 'fr', 'es', 'ar', 'x-default']) {
  assert.match(html, new RegExp(`hreflang="${code}"`));
}
assert.equal(primarySchemaName(html), visibleHeading(html));
assertNoCrossLanguageLinks(html, language);
```

Define the schema helper in the same test file so `@graph`, array, and single-object output are handled consistently:

```js
function primarySchemaName(html) {
  const nodes = [...html.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/g)]
    .flatMap(([, json]) => {
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : (parsed['@graph'] || [parsed]);
    });
  return nodes.find((node) => ['Product', 'Article', 'WebPage', 'ItemList'].includes(node['@type']))?.name || '';
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const visibleHeading = (html) => (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function assertNoCrossLanguageLinks(html, language) {
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (!href.startsWith('/')) continue;
    const key = contentKeyFromRoute(href);
    if (!key) continue;
    assert.equal(normalizeLocalizedRoute(href), normalizeLocalizedRoute(routeFor(language, key)), href);
  }
}
```

Add an explicit absolute-link case to `content-routes.test.mjs`:

```js
test('absolute and legacy Corncomp links resolve to the localized canonical route', () => {
  const input = '<a href="https://corn-comp.com/products/cups-bowls/paper-cups/">cups</a>';
  const output = localizeInternalLinks(input, 'es');
  assert.match(output, new RegExp(`href="${routeFor('es', 'architecture:products/cups-bowls/paper-cups')}"`));
  assert.doesNotMatch(output, /href="\/products\/cups-bowls\/paper-cups\/"/);
});
```

Product samples must also call `assertFactParity(englishRecord, localizedProductHtml)`.

- [ ] **Step 3: Run the tests and verify RED**

Run: `cd site; npm test -- --test-name-pattern="every synchronized|localized routes|localized built-page"`

Expected: FAIL because the old media-based alternate and legacy rendering paths remain active.

- [ ] **Step 4: Generate all localized static paths**

In `[...path].astro`, replace language-specific special cases with registry-driven paths:

```js
const localizedPaths = ['fr', 'es', 'ar'].flatMap((language) =>
  englishInventory().map((source) => ({
    params: { path: contentPath(routeFor(language, source.contentKey)) },
    props: {
      language,
      contentKey: source.contentKey,
      source,
      localized: localizedEntry(language, source.contentKey),
    },
  }))
);
```

Keep `/fr/shop/`, `/es/shop/`, `/ar/shop/`, and localized blog archives as explicit archive keys, not duplicate product/page identities.

- [ ] **Step 5: Render localized architecture, products, posts, contact, and archives**

Use shared classes/components and select visible strings from locale data. Products merge localized prose with `extractProductFacts(source)`; guides keep shared source URLs/review dates and localize all visible captions/labels; contact forms keep field `name` attributes and `/api/inquiry` action unchanged while localizing labels and messages.

Resolve each internal content link by `contentKey`. Shared assets, external evidence sources, `mailto:`, `tel:`, WhatsApp, and social links remain language-neutral.

- [ ] **Step 6: Replace alternate and sitemap generation**

`pageAlternates(pathname)` becomes a compatibility wrapper around `contentKeyFromRoute(pathname)` and `alternateGroup(contentKey)`. Remove featured-media grouping after its tests are replaced.

Build the sitemap from English canonical inventory, all locale entries, and localized archive routes. Deduplicate normalized routes and keep retired commerce/legacy canonical routes excluded.

- [ ] **Step 7: Add reviewed one-hop localized aliases**

Generate `localizedRedirects()` from each locale entry's optional `aliases` array. Feed only that reviewed map into the Worker router. Reject an alias that is also a canonical route, points to another alias, or crosses to the wrong language.

- [ ] **Step 8: Run targeted tests, build, and the full suites**

Run: `cd site; npm test -- --test-name-pattern="every synchronized|localized routes|localized built-page|sitemap|schema|links"`

Expected: targeted site tests PASS.

Run: `cd site; npm run build; npm test`

Expected: production build and full site suite PASS.

Run: `node --test worker/inquiry.test.mjs`

Expected: Worker inquiry and redirect tests PASS with no email behavior changes.

- [ ] **Step 9: Commit**

```powershell
git add -- 'site/src/pages/[...path].astro' site/src/lib/site-config.mjs site/src/lib/site-config.test.mjs site/src/lib/content-routes.mjs site/src/lib/content-routes.test.mjs site/src/pages/sitemap.xml.js site/src/lib/build-output.test.mjs site/src/lib/seo-output.test.mjs site/src/lib/link-output.test.mjs worker/index.mjs worker/inquiry.test.mjs
git commit -m "Render complete multilingual canonical architecture"
```

### Task 8: Drift gate, preview deployment, and visual/content QA

**Files:**
- Modify: `site/src/lib/localization.test.mjs`
- Modify: `site/src/lib/build-output.test.mjs`
- Modify: `GEO-SEO-AUDIT.md`

**Interfaces:**
- Consumes: complete built output, the three locale files, the Cloudflare preview configuration, and the production English source hashes.
- Produces: a green final verification run, preview URL, QA evidence, and an explicit stop before production.

- [ ] **Step 1: Add final drift and whole-output tests**

```js
test('every localized entry matches its current English source revision', () => {
  for (const language of ['fr', 'es', 'ar']) {
    for (const source of englishInventory()) {
      assert.equal(
        localizedEntry(language, source.contentKey).sourceHash,
        sourceHash(source),
        `${language}:${source.contentKey}`,
      );
    }
  }
});

test('localized guides and posts record their synchronization date', () => {
  const datedSources = englishInventory().filter((source) =>
    source.type === 'post' || source.kind === 'guide');
  for (const language of ['fr', 'es', 'ar']) {
    for (const source of datedSources) {
      assert.match(localizedEntry(language, source.contentKey).dateModified, /^\d{4}-\d{2}-\d{2}$/);
    }
  }
});

test('all synchronized built pages publish self canonicals and complete alternates', async () => {
  for (const language of ['en', 'fr', 'es', 'ar']) {
    for (const source of englishInventory()) {
      const route = routeFor(language, source.contentKey);
      const html = await readBuiltRoute(route);
      assertSelfCanonical(html, route);
      assertCompleteAlternates(html, source.contentKey);
    }
  }
});
```

- [ ] **Step 2: Run all local verification**

Run: `$env:ASTRO_TELEMETRY_DISABLED='1'; cd site; npm test; npm run build; npm test`

Expected: every site test passes before build, Astro builds all localized routes, and every built-output test passes after build.

Run: `node --test scripts/*.test.mjs worker/inquiry.test.mjs`

Expected: all script and Worker tests PASS.

Run: `git diff --check`

Expected: no output.

- [ ] **Step 3: Deploy only to the preview Worker**

Run from the repository root using the existing authenticated Wrangler setup:

```powershell
wrangler.js deploy --config wrangler.preview.jsonc
```

Expected: deployment succeeds to the preview hostname; no `corn-comp.com/*` production route is changed.

- [ ] **Step 4: Inspect the preview acceptance matrix**

Inspect desktop and mobile rendering for each language across these page types:

- homepage;
- product group and product category;
- product detail with multi-row specifications;
- product detail containing decimal item/spec values;
- buyer guide with evidence table and source links;
- editorial article;
- contact/inquiry page.

For every sample, record route, HTTP status, visible language, direction, canonical, four alternates, schema type, internal-link language, and layout result. Do not send another inquiry unless the user explicitly approves a new test submission.

- [ ] **Step 5: Update the audit with observed preview evidence**

Add a dated section to `GEO-SEO-AUDIT.md` that separates:

- **Observed:** test counts, built route count, preview responses, tags, and visible UI;
- **Derived:** coverage percentages calculated from the 85-key inventory;
- **Heuristic:** any remaining native-speaker editorial recommendations.

Do not claim rankings, indexing, or translation quality not observed.

- [ ] **Step 6: Commit the final verification record**

```powershell
git add -- site/src/lib/localization.test.mjs site/src/lib/build-output.test.mjs GEO-SEO-AUDIT.md
git commit -m "Verify multilingual preview coverage"
```

- [ ] **Step 7: Stop before production**

Provide the preview URL, representative language routes, exact test/build results, and rollback commit. Request explicit approval before any production Cloudflare deployment or sitemap resubmission.

## Final Verification Commands

Run from the worktree root:

```powershell
$env:ASTRO_TELEMETRY_DISABLED='1'
Push-Location site
npm test
npm run build
npm test
Pop-Location
node --test scripts/export-wordpress.test.mjs scripts/import-content.test.mjs scripts/download-media.test.mjs scripts/seed-locale-data.test.mjs worker/inquiry.test.mjs
git diff --check
git status --short
```

Expected final state:

- all tests PASS;
- Astro builds every active English, French, Spanish, and Arabic canonical route;
- exactly 85 synchronized content keys exist in every language;
- every synchronized group has `en`, `fr`, `es`, `ar`, and English `x-default` alternates;
- localized pages have self canonicals, correct language/direction, localized UI/schema, and no prohibited English fallback;
- all 44 localized product sets preserve English item codes and numeric facts;
- Worker inquiry behavior remains unchanged;
- only preview is deployed; production remains untouched pending approval.
