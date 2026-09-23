# Corncomp Post-Cutover GEO/SEO Audit

Audit date: 2026-09-23
Production domain: `https://corn-comp.com`
Primary market/language: global B2B buyers, English-first; French, Spanish and Arabic retained
Business goal: product discovery, trust evidence and qualified inquiry; no ecommerce checkout

## 1. Decision summary

The production migration and core technical SEO are complete enough to remain live. The site is crawlable, the 241-URL sitemap was accepted by Google Search Console, representative pages return the expected status codes, legacy English routes redirect in one hop, and every generated HTML page has a title, description, canonical and exactly one H1.

SEO and GEO are not finished. The highest-value remaining work is to add measurement for inquiry conversions, strengthen visible factory and certification evidence, create page-specific social images for priority guides, and decide whether Cloudflare should allow ClaudeBot.

Top actions, in dependency order:

1. Add measurement: GA4/GTM or an approved alternative plus a successful-inquiry conversion event.
2. Strengthen visible factory and certification evidence without extending claims beyond the supporting records.
3. Create page-specific social images for the highest-priority guides.
4. Monitor verified hreflang clusters and do not map pages without a true translated equivalent.
5. Review Cloudflare AI crawler controls; allow ClaudeBot if Claude visibility is desired.

## 2. Evidence ledger

| ID | Class | Source | Scope/date | Observation |
|---|---|---|---|---|
| E1 | Observed | Production HTTP checks | `corn-comp.com`, 2026-09-23 | Home, `/products/`, category and canonical product returned 200; `/shop/`, old product URL and `www` returned one-hop 301; no checked URL returned 502/503/504/524. |
| E2 | Observed | GSC sitemap screenshot supplied by user | URL-prefix property, 2026-09-23 | Sitemap status was Success and 241 pages were discovered; the final zero was discovered videos, not indexed pages. |
| E3 | Observed | Production sitemap and robots | 2026-09-23 | Sitemap contains 241 `<loc>` entries; robots allows public crawling, disallows `/api/`, and points to the production sitemap. |
| E4 | Observed | Full generated-HTML scan | 241 HTML files, 2026-09-23 | Missing title 0; missing description 0; missing canonical 0; pages without exactly one H1 0; noindex pages 0; invalid JSON-LD blocks 0. |
| E5 | Observed | Full generated-HTML scan | 2026-09-23 | 75 pages now belong to verified hreflang clusters; 166 of 241 pages have no hreflang. There are 91 English, 18 French, 66 Spanish and 66 Arabic documents. |
| E6 | Derived | E4-E5 | 2026-09-23 | 68.9% of generated HTML pages have no hreflang cluster (`166 / 241`). This is expected where no verified equivalent exists; the new clusters cover top-level pages, five article topics and six products with one unambiguous source record per language. |
| E7 | Observed | Parser-based metadata scan | 2026-09-23 | French and Spanish blog archives share the title `Blog | Corncomp`; the French, Spanish and Arabic blog descriptions duplicate their corresponding shop descriptions; canonical URLs are unique. An earlier regex-only scan incorrectly truncated descriptions containing apostrophes and has been discarded. |
| E8 | Observed | Full schema scan | 2026-09-23 | Types found: Organization 244, Product 138, BreadcrumbList 79, ItemList 15, FAQPage 4 and Article 3. All JSON-LD parsed successfully. |
| E9 | Observed | Product schema scan | 138 Product nodes, 2026-09-23 | 33 Product names retain HTML entities such as `&#8211;`; zero Product nodes contain `sku`; zero contain `offers`. Visible product content often contains exact item numbers and specification tables. |
| E10 | Observed | Representative product page | Kraft burrito sleeve, 2026-09-23 | 537 words, one specifications table, visible applications and FAQ, Product + Breadcrumb schema and contextual inquiry links. |
| E11 | Observed | FAQ and resource-page audit | 2026-09-23 | FAQ has 1,397 words, 21 visible Q&A pairs and matching FAQPage schema. Paper Cup Sizes Guide has 296 words, no table and no external authority source. |
| E12 | Observed | Blog article audit | 2026-09-23 | EU regulation article has 1,561 words and two authority links but only Organization schema; certification-verification article has 866 words, no external authority links and only Organization schema. |
| E13 | Observed | Organization JSON-LD | Representative pages, 2026-09-23 | Name, canonical URL, `inquiry@corn-comp.com`, telephone, Ningbo address, logo and three sameAs links are present. The LinkedIn sameAs target is a personal profile rather than an observed company page. |
| E14 | Observed | User-agent fetch tests | 2026-09-23 | Googlebot, Bingbot, OAI-SearchBot, GPTBot, ChatGPT-User, PerplexityBot, Google-Extended, CCBot, Applebot-Extended and Meta-ExternalAgent returned 200. ClaudeBot and Amazonbot returned Cloudflare 403. |
| E15 | Observed | Discovery-file checks | 2026-09-23 | `/llms.txt` and `/ai.txt` return 404. These files are optional and their absence is not an indexing error. |
| E16 | Observed | Static source scan | 2026-09-23 | No exact GA4, GTM, Google Analytics or Microsoft Clarity tag was found in the generated HTML/source inspected. Search Console search-performance data was not available in this audit. |
| E17 | Observed | Live cache headers | Representative pages, 2026-09-23 | Cloudflare returned `CF-Cache-Status: HIT` on key pages; HTML uses `public, max-age=0, must-revalidate`. |
| E18 | Observed | Inquiry delivery test and user confirmation | 2026-09-23 | Production `/api/inquiry` returned `200 {"ok":true}` and the user confirmed receipt of the test email. |
| E19 | Observed | Production buyer-guide checks | Three guides, Worker `16457987-79e5-42e5-8918-22531a35e479`, 2026-09-23 | All three returned direct 200 responses and expose visible Corncomp authorship, a 23 September 2026 review date, buyer checklist tables, official primary-source links, contextual inquiry links and Article `dateModified`. A post-deployment inquiry test returned `200 {"ok":true}`. |

## 3. Findings

### Technical and crawl

**Core production discovery is healthy (E1-E4, E17).** Sitemap, robots, canonicals, HTTP status and edge delivery passed. Priority: completed. Verification: continue monitoring GSC Page indexing and Crawl stats.

**Verified deep multilingual equivalence is partially implemented (E5-E6).** Reciprocal clusters now cover the unambiguous article and product groups, and every emitted target exists and links back to the same cluster. Remaining legacy product/category translations should not be paired until their incorrect WordPress language labels and broader category mismatches are resolved. Priority: P2. Effort: M. Confidence: high.

**Conversion measurement was not observed (E16, E18).** GSC can measure search queries, but not the complete inquiry journey. Recommended change: add an approved analytics tool and fire a conversion only after `/api/inquiry` succeeds; document consent requirements for target markets. Priority: P1. Effort: S-M. Confidence: medium because edge-injected analytics was not inspected. Verification: one test inquiry appears once in analytics debug/realtime reporting.

**ClaudeBot and Amazonbot are blocked by Cloudflare (E14).** This does not block Google. It limits discovery by those systems and may be intentional anti-scraping policy. Recommended change: explicitly decide crawler policy; if Claude visibility is desired, allow verified ClaudeBot without weakening general bot protection. Priority: P1 for Claude-focused GEO, P3 otherwise. Effort: S. Confidence: high for the observed 403, medium for its exact Cloudflare rule. Verification: verified-bot request returns 200 and ordinary hostile bot controls remain active.

**`llms.txt` is absent (E15).** This is optional and not a substitute for crawlable HTML, schema or robots. Add only after higher-priority fixes, with links to canonical company, product, quality and resource pages. Priority: P3. Effort: S. Confidence: high.

### On-page

**Baseline metadata is strong, with a small localized-archive duplication pocket (E4, E7).** Give the French, Spanish and Arabic blog archives distinct, accurate titles and descriptions rather than reusing the shop metadata. Priority: P1. Effort: S. Confidence: high. Verification: parser-based site scan shows distinct blog and shop metadata in each language.

**Social metadata exists but is generic on guides.** Representative pages contain Open Graph and Twitter tags, but guide pages use the company logo and `og:type=website`. Recommended change: use page-specific 1200x630 images and article type for editorial pages. Priority: P2. Effort: M. Confidence: high. Verification: social debugger shows the guide-specific image and title.

### Structured data

**Structured data parses, but Product markup is incomplete for rich-result eligibility (E8-E10).** Google's Product snippet documentation requires `name` and at least one of `review`, `aggregateRating` or `offers`. Corncomp is inquiry-led and has no public price or verified review data, so do not invent these fields. Retain truthful Product markup for entity understanding, add visible SKU/item numbers and variant relationships where supported, and accept that price/rating rich snippets may not be available. [Google Product snippet requirements](https://developers.google.com/search/docs/appearance/structured-data/product-snippet). Priority: P1 for correctness, P2 for rich-result expansion. Effort: M. Confidence: high.

**Thirty-three Product names contain literal HTML entities and none exposes SKU (E9).** Decode titles before JSON serialization. For single-item pages add the visible SKU; for multi-size pages model the parent/variants only when each item number and attribute is visible. Priority: P1. Effort: M. Confidence: high. Verification: JSON-LD contains human-readable dashes, visible identifiers and no invented attributes.

**Imported blog articles lack Article and Breadcrumb schema (E8, E12).** Add headline, canonical `mainEntityOfPage`, representative image, author/publisher Organization, and truthful datePublished/dateModified. Keep every value visible or supported by source data. Google advises complete, accurate structured data rather than many partial properties. [Google structured-data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies). Priority: P1. Effort: M. Confidence: high. Verification: Rich Results Test and local JSON parse pass, and values match visible content.

**FAQ schema is internally aligned (E11), but should not be sold as a guaranteed Google FAQ rich result.** It is useful for machine understanding and answer extraction; Google controls display eligibility. Priority: maintain. Confidence: high.

**Organization entity is coherent with one identity caveat (E13).** Prefer an official Corncomp LinkedIn company page in `sameAs`; if none exists, do not represent a personal profile as the company entity. Add stable identifiers only when verified. Priority: P2. Effort: S. Confidence: high.

### Content and GEO citability

**Product pages are the strongest answer assets (E10).** Specifications, item numbers, applications, documentation caveats and FAQs create quote-sized factual passages. Preserve these facts and expand only from verified catalog or factory evidence. Priority: maintain. Confidence: high.

**The three buyer guides now expose stronger evidence and decision support (E11, E19).** Each guide has a buyer checklist table, visible authorship and review date, official primary-source links, Article `dateModified` and a contextual inquiry route. Worked examples and guide-specific social images remain optional depth improvements; add them only where they answer a real buyer question. Priority: completed for the evidence baseline. Confidence: high for implementation; citation impact remains heuristic.

**Authority sourcing is inconsistent (E12).** The EU article links to European Commission/EUR-Lex; the certification-verification article does not link to the official FSC, BPI or BRC verification sources it tells buyers to use. Add primary links beside the relevant claims and show a reviewed date. Priority: P1. Effort: S-M. Confidence: high.

**Factory and quality claims need visible evidence paths.** The factory page states 8,000 m², 60 lines and 2.5 billion paper straws annually; the quality page lists certification types. Link claims to clearly labelled certificate/facility evidence and scope disclaimers, without implying every SKU holds every certificate. Priority: P1. Effort: M. Confidence: medium because independent verification was outside this audit.

### Search and competitors

Sitemap discovery is observed, but indexing, rankings, impressions, clicks, country/device split, backlinks, competitor gaps and AI citation frequency are not observed. Existing on-page keyword placement does not prove ranking. Use GSC after data accumulates and use a dated, market-specific Semrush/DataForSEO export for competitive decisions.

## 4. Semrush evidence

No live Semrush or mirror metrics were available in this run. Database/country, device, date range, keyword volume, difficulty, rankings, traffic and backlinks are `not observed`.

## 5. 30-day action plan

### Days 1-3

- Implement inquiry conversion measurement.
- Fix localized duplicate blog titles and descriptions.
- Decode Product JSON-LD titles and add truthful SKU/variant data.
- Add Article/Breadcrumb schema to existing blog articles.
- Decide and test the Cloudflare ClaudeBot rule.

### Days 4-10

- Build verified reciprocal hreflang clusters for true multilingual equivalents.
- Add official verification links and evidence scope to quality/certification content.
- Create page-specific social images for the highest-priority guides.

### Days 11-30

- Review GSC Page indexing exclusions, Crawl stats and search queries weekly; do not repeatedly resubmit the sitemap.
- Check old URL redirects and 404 logs after Google recrawls.
- Record baseline leads and top landing pages by country/device.
- Use GSC plus a dated third-party keyword export to choose the next content batch.

## 6. Verified remediation status

Build and production verification on 2026-09-23 (Worker version `16457987-79e5-42e5-8918-22531a35e479`):

- Product schema names with encoded HTML entities: **33 → 0**.
- Product nodes with a truthful single `sku`: **0 → 3**. Multi-item pages intentionally do not claim one SKU.
- Product nodes with visible item numbers represented as `additionalProperty`: **0 → 122**.
- Article nodes: **3 → 22**.
- BreadcrumbList nodes: **79 → 98**.
- French, Spanish and Arabic blog archive metadata is now distinct from the corresponding shop archive.
- Verified hreflang coverage: **32 → 75 pages**. The 297 emitted language links have zero missing targets and zero non-reciprocal clusters.
- All 241 generated HTML files retain valid JSON-LD; the build completed and all 42 automated tests passed.
- Representative English, French, Spanish and Arabic article/product alternates returned direct 200 responses and reciprocal clusters in production; the partial three-language article cluster also passed.
- The three English buyer guides now expose visible Corncomp authorship, a reviewed date, responsive specification checklists, official primary sources, contextual inquiry links and Article `dateModified`.
- All three guide URLs returned direct 200 responses with the expected live markup, and the post-deployment inquiry test returned `200 {"ok":true}`.

No prices, offers, ratings, reviews or publication dates were invented. Inquiry conversion tracking remains pending because no verified analytics provider or measurement ID is currently configured.

## 7. Limitations

- GSC query, ranking and Page indexing reports were not available; only the user-provided successful sitemap screenshot was observed.
- No live Semrush/DataForSEO dataset or competitor export was available.
- Google PageSpeed Insights API returned HTTP 429 for the shared project, so no current Lighthouse score is claimed. Live response and cache checks are not a substitute for lab or CrUX data.
- User-agent simulation proves the observed HTTP response, not that every named crawler used the same IP verification path.
- Google Rich Results Test was not run in its interactive UI; this audit parsed JSON-LD and compared representative values with visible content.
- `llms.txt` is an optional ecosystem convention, not a proven ranking or citation control.
