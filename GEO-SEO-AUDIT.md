# Corncomp Edge Migration: Pre-Cutover GEO/SEO Audit

Audit date: 2026-09-22  
Production domain in scope: `https://corn-comp.com`  
Edge preview: `https://corncomp-edge-site.corncomp-edge.workers.dev`  
Languages: English, French, Spanish, Arabic

## 1. Decision summary

**Decision: do not switch the production domain yet.**

### Remediation update — 2026-09-22

The first remediation pass has been implemented locally and verified after a fresh build:

- wrong-domain public email occurrences: **819 → 0**
- missing meta descriptions: **34 → 0**
- pages with an invalid H1 count: **3 → 0**
- broken internal-link references: **60 → 0**
- missing local assets: **0 → 0**
- automated tests: **27/27 passed**, plus **8/8 Worker tests passed**

The 12 legacy category redirects are implemented and covered by Worker tests. Production cutover remains blocked until the updated Worker is deployed and checked live, a rate-limited sitemap crawl is completed, and multilingual hreflang coverage is resolved with a verified translation map.

The static site builds successfully, the automated test suite passes, the sitemap contains 272 URLs, all referenced local media assets exist, and the inquiry form has already completed a real delivery through Resend. However, four release blockers remain:

1. Twelve old WordPress category archive URLs currently return 404 on the edge preview.
2. Twelve translated articles contain 60 broken internal-link references to 23 nonexistent localized targets.
3. The public site still renders `inquiry@corncomp.com` instead of the required `inquiry@corn-comp.com` throughout the generated pages.
4. Important multilingual SEO metadata is incomplete: 34 pages lack meta descriptions, 240 of 272 sitemap pages lack hreflang, and three localized homepages contain two H1 elements.

## 2. Evidence ledger

| Label | Evidence | Result |
|---|---|---|
| Observed | `npm test` | 23/23 tests passed. |
| Observed | `ASTRO_TELEMETRY_DISABLED=1 npm run build` | Static build succeeded; 273 HTML pages were generated, including the 404 page. |
| Observed | Generated `sitemap.xml` | 272 unique public URLs. |
| Observed | Old WordPress sitemap set | 154 unique old-site paths across posts, pages, products, categories and product categories. |
| Derived | Old-versus-preview URL comparison | 15 old paths are absent from the new sitemap: 3 retired commerce paths and 12 category archives. |
| Observed | Preview checks for `/cart`, `/checkout`, `/my-account` | Each returns 301 to `/shop/`. |
| Observed | Preview checks for 12 missing category archive paths | Each returns 404. |
| Observed | Local HTML scan | 273 HTML files; 11,728 internal link references; 2,256 local asset references; zero missing local assets. |
| Observed | Local anchor scan | 60 broken internal-link references across 12 translated articles, pointing to 23 nonexistent localized routes. |
| Observed | Four live contact pages | EN/FR/ES/AR pages return 200 and contain a POST form targeting `/api/inquiry`. |
| Observed | Inquiry integration | A real Resend submission returned 200 and the recipient confirmed delivery. |
| Observed | Email-string scan | `inquiry@corncomp.com` occurs 819 times in generated HTML; the four live contact pages each expose it three times. |
| Observed | Metadata scan | 34 pages lack meta descriptions; 3 pages have two H1 elements; canonical, viewport, structured data and image-alt coverage are otherwise complete. |
| Observed | Hreflang scan | 240 of 272 sitemap pages have no hreflang. Source configuration defines alternates for only eight page groups. |
| Observed | Robots file | Allows crawling, blocks `/api/`, and advertises `https://corn-comp.com/sitemap.xml`. |
| Heuristic | Search impact | Broken legacy URLs, broken internal links and missing language relationships can waste crawl signals and weaken international indexing after cutover. |

## 3. Findings

### Technical and crawl

#### P0 — Preserve the 12 old category archive URLs

The following old URLs are absent from the preview sitemap and return 404:

- `/category/company-industry/`
- `/category/company-industry-fr/`
- `/category/company-industry-es/`
- `/category/company-industry-ar/`
- `/category/compliance-regulations/`
- `/category/compliance-regulations-fr/`
- `/es/category/compliance-regulations-es/`
- `/ar/category/compliance-regulations-ar/`
- `/category/material-guides/`
- `/category/material-guides-fr/`
- `/category/material-guides-es/`
- `/category/material-guides-ar/`

Add explicit permanent redirects to the closest language-specific blog/archive destination, or recreate equivalent archive pages. Do not redirect every URL blindly to the homepage.

The retired WooCommerce paths `/cart/`, `/checkout/` and `/my-account/` already redirect to `/shop/` and are not blockers.

#### P0 — Repair translated article links

There are 60 broken references across 12 translated FR/ES/AR articles. The main failure pattern is mechanically prefixing English slugs with a language folder, for example:

- `/es/certifications/` instead of `/es/certificaciones-de-corncomp/`
- `/fr/certifications/` instead of `/fr/certifications-corncomp/`
- `/ar/certifications/` instead of the actual Arabic certification route
- `/fr|es|ar/pla-vs-bagasse-vs-fsc-paper/`
- `/fr|es|ar/eu-single-use-plastics-directive-explained/`
- `/fr|es|ar/us-state-plastic-packaging-laws-explained/`
- `/fr|es|ar/how-to-verify-supplier-sustainability-certifications/`
- `/fr|es|ar/bpi-vs-fsc-certification/`

Map each translated article to the real translated route rather than generating a language prefix from the English slug.

#### P1 — Complete a bounded live response crawl

A high-concurrency attempt against all 272 preview URLs was throttled/timed out and is not valid evidence of page failure. Before cutover, rerun a rate-limited crawl and require every sitemap URL to return 200 and every preserved legacy URL to return 200 or one intentional 301.

### On-page SEO

#### P0 — Correct the public email domain

The required address is `inquiry@corn-comp.com`. The layout and footer currently contain `inquiry@corncomp.com`, producing 819 occurrences in generated HTML. The Resend sender is already correct; update the visible email, `mailto:` links and Organization schema, then rebuild and rescan for zero wrong-domain occurrences.

#### P1 — Add missing descriptions or remove low-value archives

Thirty-four pages have no meta description:

- 11 root product-category routes, including French-labelled routes and `/product-category/uncategorized/`
- `/fr/blog/`, `/fr/shop/`, `/fr/product-category/paille-en-papier/`
- 8 Spanish blog/shop/category pages
- 10 Arabic blog/shop/category pages

Write descriptions for indexable commercial/category pages. Remove `uncategorized` from the sitemap and apply `noindex`, unless it has a deliberate search purpose.

#### P1 — Fix duplicate H1s

These localized homepages contain two H1 elements:

- `/fr/corncomp-pailles-en-papier-et-emballages-alimentaires-biodegradables/`
- `/es/corncomp-pajitas-de-papel-y-envases-de-alimentos-sostenibles/`
- `/ar/corncomp-مصاصات-ورقية-وعبوات-أغذية-مستدامة/`

Keep the primary page title as H1 and demote the duplicated body heading to H2.

#### P2 — Remove duplicate localized blog titles

`/fr/blog/` and `/es/blog/` both use `Blog | Corncomp`. Give each a language-specific title.

### Content and citability

#### Positive observations

- The edge sitemap expands coverage from 154 old unique paths to 272 URLs, primarily through localized pages and products.
- Every scanned page has a canonical, viewport tag and structured data.
- All 2,256 referenced local static assets exist.
- No image in the generated HTML is missing alt text.
- Product schema appears on 176 pages; Organization schema appears sitewide; FAQ schema appears on four FAQ pages.

#### P1 — Investigate language-route ownership

Several French product/category routes live at the root rather than under `/fr/`. This may preserve historical WordPress URLs, but it should be documented and deliberately mapped. Do not move them merely for visual consistency without redirect and canonical planning.

### Structured data

Organization schema is present sitewide, but its public email uses the wrong domain. Correct it to `inquiry@corn-comp.com`. Product and FAQ schema coverage is otherwise present in the generated output; schema validity still needs a post-deployment rich-results check on representative pages.

### Search and competitor evidence

No current Google Search Console, Semrush position data, competitor SERP sample or index-coverage export was used in this audit. This report establishes technical migration readiness, not current ranking performance.

## 4. Semrush evidence

Not collected in this pass. No ranking, traffic, volume or keyword-difficulty claim is made.

## 5. Action plan

### Before production cutover

1. Correct all public email references to `inquiry@corn-comp.com`.
2. Add redirects or replacement archives for all 12 old category URLs.
3. Repair the 60 translated internal-link references using an explicit language-route map.
4. Add the 34 missing descriptions, except pages deliberately removed/noindexed.
5. Fix the three duplicate-H1 pages and two duplicate localized blog titles.
6. Generate reciprocal hreflang for actual translation groups, including products, categories and articles; add `x-default` where appropriate.
7. Rebuild and rerun tests, metadata scan, broken-link scan and a rate-limited live crawl.

### Cutover gate

Proceed only when:

- all automated tests and the production build pass;
- wrong-domain email occurrences equal zero;
- broken internal-link references equal zero;
- all 272 sitemap URLs return 200;
- all 154 preserved old URLs return 200 or an intentional 301;
- EN/FR/ES/AR inquiry submissions each deliver successfully;
- desktop and mobile checks pass for homepage, shop, category, product, article and contact templates.

### After cutover

Submit `https://corn-comp.com/sitemap.xml` to Google Search Console, monitor 404s and indexing for 7–14 days, and keep the Vultr/WordPress origin available as rollback during that period. Cancel it only after traffic, forms and critical URLs remain stable.

## 6. Limitations

- The production domain still serves the WordPress site, so final custom-domain behavior cannot be verified until the route is attached or a controlled host override is used.
- The 272-URL concurrent preview crawl timed out and was excluded as failure evidence; it must be repeated at a lower request rate.
- No authenticated Google Search Console or Semrush dataset was inspected.
- Visual parity and responsive QA were not completed in this pass.
- The audit did not submit four additional live inquiry emails; it verified form presence on all four languages and relied on the already confirmed end-to-end delivery test.
