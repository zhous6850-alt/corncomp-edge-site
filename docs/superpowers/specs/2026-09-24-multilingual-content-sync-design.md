# Corncomp Multilingual Content Synchronization Design

**Date:** 2026-09-24  
**Status:** Approved by the user on 2026-09-24
**Authoritative domain:** `corn-comp.com`

## 1. Purpose

Synchronize the current English Corncomp website into French, Spanish, and Arabic without weakening the English source, inventing product claims, or relying on runtime machine translation.

The synchronized site must preserve the current public-site purpose: product catalogue, SEO/GEO content, evidence-oriented buyer guidance, and inquiry generation. Ecommerce, customer accounts, checkout, and online payment remain outside scope.

## 2. Current State

The site uses shared Astro layouts and styles, so global presentation and shared scripts already apply to localized pages. Content parity is incomplete:

- the current English architecture contains 35 architecture pages;
- 44 English products are mapped into the canonical product architecture;
- only 4 of the 35 architecture pages currently have complete localized alternate groups;
- only 6 of the 44 canonical English products currently have complete four-language alternate groups;
- Spanish and Arabic retain 55 imported content records each;
- French retains 16 imported content records and has the largest gap;
- localized pages primarily contain older imported copy rather than the current English architecture and buyer guidance.

Existing localized URLs and translated assets are valuable migration inputs, but they are not proof of parity with the current English page.

## 3. Goals

1. Provide a French, Spanish, and Arabic counterpart for every active English page in the synchronization inventory.
2. Keep factual product data, dimensions, item numbers, capacity, carton quantity, materials, certifications, and document-scope qualifications aligned with the English source.
3. Translate public prose naturally for buyers in each language rather than forcing literal English keyword strings.
4. Preserve existing indexed localized URLs whenever a suitable URL already exists.
5. Produce reciprocal `hreflang` groups with English as `x-default`.
6. Keep localized internal links within the visitor's selected language.
7. Make missing or stale translations detectable by automated tests before deployment.

## 4. Non-Goals

- Runtime or request-time machine translation.
- Automatic publication of unreviewed third-party translation output.
- New product, certification, sustainability, performance, MOQ, lead-time, or customer claims.
- Translating retired English routes that redirect to the current architecture.
- Redesigning the approved desktop or mobile visual system.
- Changing inquiry delivery, GA4 consent, or `generate_lead` behavior.
- Adding languages beyond English, French, Spanish, and Arabic.

## 5. Page Inventory

The implementation plan will generate an exact machine-readable inventory from the active English routes. The intended scope is:

- the homepage;
- all 35 entries in `ARCHITECTURE_PAGES`, including product groups, product categories, custom-packaging pages, application pages, trust pages, resources, and three buyer guides;
- all 44 canonical English product pages;
- all five active English editorial posts;
- localized shop and blog archives required to navigate those pages.

Retired English product URLs, checkout routes, account routes, and legacy aliases are excluded except where they require redirects.

## 6. Content Architecture

### 6.1 Stable content identity

Every synchronized page will have a stable language-independent `contentKey`. Routes and translated slugs are attributes of that key, not the identity itself.

Examples:

- `home`
- `architecture:products/paper-cups`
- `product:kraft-paper-bowl`
- `post:eu-single-use-plastics-directive-explained`

This replaces featured-image identity as the primary translation pairing mechanism. Media reuse can support matching during migration but must not control `hreflang` correctness.

### 6.2 Shared facts and localized prose

The system will distinguish two data classes:

- **Shared facts:** item numbers, dimensions, capacity, carton quantity, material labels, product images, evidence links, and qualified document statements. These remain sourced from the English record or shared structured data.
- **Localized prose:** page title, meta title, meta description, headings, summaries, section copy, FAQs, CTA labels, link labels, alt text, and translated route.

Localized pages may reorder sentences for natural language, but they must not alter shared facts or strengthen qualified claims.

### 6.3 Storage

Use explicit source-controlled locale data, not runtime translation:

- `site/src/data/locales/fr.json`
- `site/src/data/locales/es.json`
- `site/src/data/locales/ar.json`

Each file maps `contentKey` to its localized route and prose. Shared product facts remain in the existing English records and architecture definitions. A small localization module will merge shared facts with the selected locale overlay.

Existing localized records will be migrated into these files when they match the current English meaning. Missing or outdated fields will be translated from the current English source and reviewed against the facts.

### 6.4 No silent fallback on indexable pages

An indexable localized route must not silently display English body copy, English SEO metadata, or English navigation labels. Missing required localized content fails the coverage test and blocks the production build.

## 7. Routing and URL Policy

1. Keep existing French, Spanish, and Arabic routes when they already represent the same current page.
2. Assign a natural localized route only when no suitable route exists.
3. Redirect superseded localized aliases to the selected localized canonical URL in one hop.
4. Keep canonical tags self-referential for each localized page.
5. Use English as `x-default` for each complete alternate group.
6. Preserve Arabic percent-encoded URLs consistently and render the document with `dir="rtl"`.

No localized canonical URL may point to an English page solely because a translation is missing.

## 8. Translation and Editorial Rules

1. Reuse existing translations only after checking them against the current English source.
2. Preserve every supported fact and qualification.
3. Use natural buyer terminology in each language; do not force exact English keyword order.
4. Keep product codes, standards, measurements, company names, and URLs exact.
5. Translate link labels and alt text while preserving target meaning.
6. Do not translate quoted official standard names when that would make the reference ambiguous; add a natural explanation instead.
7. Run a separate humanization pass on newly drafted prose, then recheck it against the English facts.
8. Record the synchronization date for localized editorial and guide pages.

## 9. Page Rendering

The existing visual components remain shared across languages. Rendering changes should be limited to:

- loading localized page data by `contentKey` and language;
- rendering the current homepage and architecture layouts for all four languages;
- localizing breadcrumbs, CTAs, archive labels, form labels, validation messages, and related-content headings;
- resolving related products and internal links within the active language;
- retaining Arabic RTL behavior.

No separate duplicated Astro template will be created per language.

## 10. SEO, GEO, and Structured Data

Each localized page must output:

- a natural localized `<title>` and meta description;
- a self-referential canonical URL;
- reciprocal `hreflang` entries for `en`, `fr`, `es`, and `ar`;
- English `x-default`;
- localized Open Graph title, description, URL, and language;
- localized visible headings consistent with the metadata;
- schema whose names and descriptions match visible localized content;
- the same supported product facts and evidence links as English;
- localized breadcrumbs and language-consistent internal links.

Schema presence alone is insufficient: automated checks must compare critical schema values with visible content.

## 11. Validation

The change is complete only when all of the following pass:

1. **Inventory coverage:** every active English `contentKey` has French, Spanish, and Arabic entries.
2. **Required fields:** no localized page is missing route, title, description, H1, body/sections, or CTA labels required by its template.
3. **No silent English fallback:** indexable localized outputs do not contain known English placeholder UI or English metadata.
4. **Fact parity:** product codes, numerical specifications, and qualified document statements match the English source.
5. **Route integrity:** all localized routes are unique; aliases resolve in one hop; no internal link points to a retired route.
6. **Reciprocal alternates:** every synchronized page links to all four variants and each variant returns the same group.
7. **Canonical integrity:** each localized page canonicalizes to itself.
8. **Language and direction:** correct `lang`; Arabic has `dir="rtl"`.
9. **Structured data:** valid JSON-LD with localized text and matching visible facts.
10. **Build and regression:** the full site test suite and Astro production build pass.
11. **Preview QA:** representative homepage, category, product, guide, blog, and contact pages are inspected in all three localized languages on desktop and mobile.

## 12. Rollout and Recovery

1. Commit the content model and tests before bulk locale content.
2. Synchronize in dependency order: shared UI and core pages, category architecture, product pages, buyer guides/editorial posts.
3. Deploy a preview only after local tests and build pass.
4. Review representative pages and the generated alternate groups before production deployment.
5. Publish to `corn-comp.com` only after explicit user approval of the preview.
6. Retain the previous Cloudflare Worker version and Git commit for immediate rollback.
7. After production deployment, verify HTTP status, canonical, `hreflang`, schema, localized navigation, and inquiry behavior on sampled pages.

## 13. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Translation changes a product fact | Keep facts shared; test codes and numeric specifications against English. |
| Existing indexed localized URL is replaced | Reuse the route or create a one-hop redirect. |
| Low-quality keyword stuffing | Translate for buyer intent and semantic coverage, not exact English phrase order. |
| Arabic layout regression | Keep shared responsive templates and add RTL screenshot checks. |
| Incomplete `hreflang` groups | Generate groups from `contentKey`; fail tests on missing reciprocity. |
| English updates become stale later | Store a source fingerprint or English revision marker with each locale entry and test for drift. |
| Production regression | Preview approval, fresh tests/build, live checks, and retained Worker rollback version. |

## 14. Acceptance Decision

The selected approach is explicit source-controlled localization with shared facts and localized prose. Runtime automatic translation, partial `hreflang`-only synchronization, and duplicated per-language templates are rejected.
