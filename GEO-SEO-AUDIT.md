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

---

# Multilingual preview verification checkpoint — 2026-09-25

## 1. Decision summary

- **Scope:** the synchronized English, French, Spanish and Arabic static output for `corn-comp.com`; 85 stable content identities per language; local build and deployment-safety checks performed on 2026-09-25.
- **Verdict:** Local drift, output and Worker gates passed. The final integration round was deployed only to the dedicated preview Worker from `wrangler.preview.jsonc` as version `04f93116-474c-4f80-a085-929c2869d90a`. The 28-route HTTP/SEO matrix, three representative Arabic alias variants, four reciprocal blog archives, four localized shared-layout contracts and three localized shop redirects passed live preview checks. Two additional serial CDP checks showed clean localized consent layouts without document overflow on French mobile and Arabic desktop. The earlier 40-screenshot boundary remains 37 numeric passes plus three manual visual-only screenshots. This checkpoint is not approval for production.
- **Next actions:**
  1. Preserve the visual evidence for version `254a0a55-08e7-4096-a68f-9de6f63176f0` and the final HTTP/accessibility evidence for version `6e0f1741-d007-4a19-bfd1-cc60f55f96b4`.
  2. Obtain native-language editorial review where commercial naturalness matters.
  3. Request explicit approval before any production action.

## 2. Evidence ledger

| ID | Class | Source | Scope/date | Observation |
|---|---|---|---|---|
| MV1 | Observed | `npm run build` | Local worktree, 2026-09-25 | Astro generated 348 pages from fresh source output. |
| MV2 | Observed | Node test runner | `site`, after the fresh build and accessibility repair, 2026-09-25 | 106 tests passed, 0 failed. |
| MV3 | Observed | Node test runner | Four scripts plus inquiry Worker, 2026-09-25 | 30 tests passed, 0 failed; all five named test files existed. |
| MV4 | Observed | Final localization drift gate | 3 translated locales × 85 keys, 2026-09-25 | Every translated entry matched the current English `sourceHash`; every translated post and buyer guide exposed a `YYYY-MM-DD` `dateModified`. |
| MV5 | Observed | Final built-output gate | 340 synchronized pages, 2026-09-25 | Every synchronized built page had the exact production self-canonical, reciprocal `en`, `fr`, `es`, `ar` alternates, English `x-default`, correct `lang`, and Arabic-only `dir="rtl"`. |
| MV6 | Derived | MV4-MV5 | Synchronized local output, 2026-09-25 | Local synchronized-entry coverage was 340/340 (100%); translated hash coverage was 255/255 (100%). |
| MV7 | Observed | `wrangler.preview.jsonc` | Deployment preflight, 2026-09-25 | Target name was `corncomp-edge-site-v2-preview`, `workers_dev` was `true`, no routes or custom domain were configured, and assets pointed to fresh `./site/dist`. |
| MV8 | Observed | Controller deployment result | Dedicated preview, 2026-09-25 | `wrangler.preview.jsonc` deployed `https://corncomp-edge-site-v2-preview.corncomp-edge.workers.dev` as version `d048d843-8695-4c92-bea4-3a9bb3293f7a`; the controller reported no production route, DNS, sitemap or inquiry change. |
| MV9 | Observed | Git checks | Local worktree, 2026-09-25 | `git diff --check` passed. |
| MV10 | Heuristic | Editorial review boundary | Four-language content, 2026-09-25 | Native-speaker review remains advisable for commercial tone and idiom; automated structural parity does not establish translation naturalness. |
| MV11 | Observed | Early acceptance tool probes | Subtask environment before controller fallback, 2026-09-25 | Direct Node fetch was denied with `EACCES`; the web reader reported the preview host inaccessible; Chrome headless was initially rejected before launch by sandbox policy; the available Node REPL failed to initialize its kernel assets. Later controller evidence superseded this early tooling gap for the bounded matrix described in MV12-MV19. |
| MV12 | Observed | `qa/http-acceptance.json` | Preview version `d048d843-8695-4c92-bea4-3a9bb3293f7a`, 2026-09-25 | 28/28 selected routes returned direct 200 and passed visible-language, direction, production canonical, four reciprocal alternates plus `x-default`, primary schema and internal-link-language checks. Three Arabic alias forms (canonical-percent, lowercase-percent and decoded) each returned one 301 preserving the query, followed by direct 200. |
| MV13 | Derived | MV12 | Four languages × seven page types, 2026-09-25 | Preview HTTP/SEO matrix coverage was 28/28 (100%); representative alias coverage was 3/3 (100%). |
| MV14 | Observed | Controller CDP browser checks and screenshots | Preview version `d048d843-8695-4c92-bea4-3a9bb3293f7a`, 2026-09-25 | 34/40 selected viewport checks had no document-level horizontal overflow. Six `390 × 844` checks overflowed: English multi-row and decimal products, Spanish multi-row product, Arabic decimal product, Arabic editorial and Arabic contact. No inquiry was submitted. |
| MV15 | Observed | Serial local Astro/CDP reproduction | Fresh repaired build, 2026-09-25 | Product grid minimum-content sizing, RTL off-canvas honeypots and an over-specific 850 px direct-image rule reproduced the failures. After the minimal CSS repairs, English/Spanish multi-row products, Arabic contact and Arabic editorial each reported `clientWidth=390`, `scrollWidth=390`; wide table rows remained inside the table scroller. |
| MV16 | Observed | RED/GREEN built-output tests | Fresh repaired build, 2026-09-25 | Three new regression tests failed against the pre-fix build and passed after the CSS changes: shrinkable product table content, direction-safe hidden honeypots and responsive direct editorial images. |
| MV17 | Observed | Controller final preview deployment and HTTP runner | Preview version `254a0a55-08e7-4096-a68f-9de6f63176f0`, 2026-09-25 | The repaired build was deployed with `wrangler.preview.jsonc` only. Final HTTP/SEO checks passed 28/28 routes and 3/3 Arabic alias variants; production remained untouched. |
| MV18 | Observed | Serial CDP screenshots and dimensions | Final repaired preview, 2026-09-25 | Forty final screenshots were generated under ignored `qa/screenshots-final/`. Thirty-seven runs returned valid numeric viewport/document dimensions and all had document width less than or equal to viewport width. Three runs returned blank metric JSON because of intermittent Windows process-start instability: English multi-row product mobile, Arabic category desktop and Arabic buyer guide mobile. Their screenshots rendered and were manually inspected without visible clipping or misalignment. |
| MV19 | Observed | Serial local Astro/CDP post-fix checks | Fresh repaired build, 2026-09-25 | Four critical former failure paths returned numeric `clientWidth=390`, `scrollWidth=390`: English and Spanish products, Arabic contact and Arabic editorial. This supports the repaired failure paths but does not convert the three MV18 manual-only preview checks into automated dimension checks. |
| MV20 | Observed | RED/GREEN built-output and Worker tests | Fresh local build after accessibility review, 2026-09-25 | All four built contact pages place the `website` honeypot label outside the accessibility tree with `aria-hidden="true"`, while retaining `name="website"` and `tabindex="-1"`. The focused regression was observed failing before the template fix and passing after it; the existing Worker test still confirms honeypot submissions return success without sending email. |
| MV21 | Observed | Controller final preview deployment, HTTP runner and live Node contact checks | Preview version `6e0f1741-d007-4a19-bfd1-cc60f55f96b4`, 2026-09-25 | Deployment used the isolated preview configuration. HTTP/SEO passed 28/28 routes and 3/3 Arabic alias variants. English, French, Spanish and Arabic contact routes each returned 200 and contained `<label class="honeypot" aria-hidden="true">` plus `<input name="website" tabindex="-1" autocomplete="off">`. No production route, DNS, sitemap or inquiry submission changed. |
| MV22 | Observed | Fresh Astro build and Node test runners | Local worktree after final integration fixes, 2026-09-25 | Astro generated 345 pages; the site suite passed 111/111 and the script/Worker suite passed 31/31. The three removed pages were the retired French, Spanish and Arabic `/shop/` archives. |
| MV23 | Observed | RED/GREEN route, output, sitemap, localization and Worker regressions | Local worktree after final integration fixes, 2026-09-25 | All four blog archives share reciprocal `en`/`fr`/`es`/`ar` alternates with English `x-default`; localized `/shop/` paths are absent from static output and sitemap and redirect one hop to their localized product hubs; shared localized layout labels and `og:locale` render for all four languages; inherited object properties are rejected; the French quality document CTA reads `Demander les documents`. These checks failed before the scoped changes and passed afterward. |
| MV24 | Observed | Controller final integration preview deployment, live contract runner and serial CDP checks | Preview version `04f93116-474c-4f80-a085-929c2869d90a`, 2026-09-25 | Deployment used the isolated preview configuration. HTTP/SEO passed 28/28 routes and 3/3 Arabic alias variants. All four blog archives exposed reciprocal `en`/`fr`/`es`/`ar` plus English `x-default`; all four language homes exposed their finite localized Header/Footer/consent labels and correct `og:locale`; all three localized `/shop/` paths returned one 301 preserving the query and were absent from the sitemap. French mobile consent measured `390/390` and Arabic desktop consent measured `1425/1440`; both screenshots were visually inspected clean. No production or inquiry action occurred. |

## 3. Findings

### Technical/crawl

**Final repaired-preview crawl and redirect delivery passed the agreed representative matrix (MV17, MV21).** Why it matters: this verifies the repaired dedicated Worker serves localized canonical HTML and one-hop reviewed Arabic redirects rather than only proving static build output. Recommended change: retain the generated matrix evidence and rerun it after any source or Worker change. Priority: maintain. Effort: S. Confidence: high. Verification: the same runner returns 28/28 route passes and 3/3 alias passes for final version `6e0f1741-d007-4a19-bfd1-cc60f55f96b4`.

**Preview configuration is isolated from production (MV7).** Why it matters: the next deployment can be tested without changing `corn-comp.com` routes. Recommended change: keep `wrangler.preview.jsonc` unchanged and never substitute `wrangler.jsonc`. Priority: maintain. Effort: S. Confidence: high. Verification: Wrangler deployment output names `corncomp-edge-site-v2-preview` and returns only a `workers.dev` URL.

### On-page

**Built self-canonicals, alternates, language and direction passed locally on 340/340 synchronized pages and on the 28-route preview sample (MV5-MV6, MV12-MV13).** Why it matters: complete reciprocal groups reduce ambiguity between reviewed language equivalents. Recommended change: no markup change; retain local exhaustive gates plus the cross-page-type preview sample. Priority: maintain. Effort: S. Confidence: high. Verification: local 340-page gate and deployed 28-route matrix remain green.

**The first executable mobile pass exposed evidence-backed responsive failures, and the repaired preview passed the bounded rerun (MV14-MV19).** Product tables expanded their grid column, an off-canvas honeypot enlarged RTL contact pages, and direct editorial images inherited an 850 px maximum with higher specificity than the global image rule. The minimal CSS repairs preserve local table scrolling and hidden-field behavior. The final preview produced 40 screenshots; 37 have passing numeric width evidence and three have manual visual-only evidence. Priority: maintain. Effort: S. Confidence: high for the 37 numeric preview checks and four local critical checks; medium for the three manual-only screenshots. Verification: retain serial probes and rerun any blank-metric rows when Windows process launch is stable.

**The contact-form honeypot is excluded from the accessibility tree in local and live preview output (MV20-MV21).** Why it matters: a screen-reader user should not encounter and fill the anti-spam field, which the Worker intentionally accepts without sending. Recommended change: retain the four-locale built-output regression. Priority: maintain. Effort: S. Confidence: high. Verification: all four live preview contact pages return 200 and contain `aria-hidden="true"` on the honeypot label while the input keeps `name="website"`, `tabindex="-1"` and `autocomplete="off"`.

**The final integration contracts pass locally and on the isolated preview (MV22-MV24).** Why it matters: blog archive language identity, retired localized shop paths, shared localized chrome and defensive lookup behavior now have executable local coverage, while the externally observable archive, redirect and layout contracts have live-preview evidence. Recommended change: retain both local exhaustive gates and the focused preview runner. Priority: maintain. Effort: S. Confidence: high. Verification: the local suites remain green and the preview contract runner repeats 4/4 blog archives, 4/4 shared-layout languages and 3/3 shop redirects.

### Content/citability

**Translated sources are current against all 85 English identities per locale (MV4, MV6).** Why it matters: stale source hashes would indicate untranslated English edits. Recommended change: retain the drift gate and obtain native-language editorial review for naturalness rather than treating structural parity as linguistic proof. Priority: P2. Effort: M. Confidence: high for parity, low for naturalness. Verification: future English copy changes fail the hash gate until reviewed locale updates are supplied; native-speaker review is recorded separately.

### Structured data

**Primary schema type/name was present on all 28 preview matrix pages (MV12-MV13).** Why it matters: deployment did not strip the structured data exercised across the seven page types. Recommended change: keep local schema/value tests and rerun the preview matrix after changes. Priority: maintain. Effort: S. Confidence: high. Verification: the machine-readable matrix continues to report a schema type and non-empty name for 28/28 routes.

### Search/competitors

**Rankings, indexing, traffic, backlinks, keyword metrics, competitors and AI citations were not observed.** Why it matters: local output and crawlability cannot establish search performance. Recommended change: use GSC and a dated market/device-specific third-party export after deployment; do not infer results from markup coverage. Priority: P2. Effort: M. Confidence: high. Verification: evidence cites the exact GSC or third-party report, date, country/database and device.

## 4. Semrush evidence

Semrush or compatible mirror evidence was **not observed** in this verification run. Database/country, device, date range, keyword volume, difficulty, rankings, traffic, backlinks and competitor metrics remain `not observed`.

## 5. Action plan

1. Preserve version `d048d843-8695-4c92-bea4-3a9bb3293f7a` as the pre-fix target, `254a0a55-08e7-4096-a68f-9de6f63176f0` as the repaired visual-preview target and `6e0f1741-d007-4a19-bfd1-cc60f55f96b4` as the final accessibility-preview target.
2. Rerun the three manual-only screenshot rows for numeric dimensions when Windows process launch is stable; do not treat this as a production blocker unless the screenshots or later metrics show a defect.
3. Record native-language editorial review separately from automated structural parity.
4. Preserve final integration preview version `04f93116-474c-4f80-a085-929c2869d90a` and its focused contract evidence.
5. Request explicit user approval before any production action.

## 6. Limitations

- The controller supplied preview deployment/version evidence and executed the machine-readable HTTP/SEO matrix; this subtask validated the resulting JSON evidence file.
- The HTTP matrix covered four languages and seven representative page types, not every deployed URL. Static tests provide the exhaustive 340-page metadata gate.
- Final executable browser screenshots were performed on the repaired preview. Thirty-seven of 40 rows have valid automated dimension metrics; three are manual visual-only because their metric JSON was blank. This is not claimed as 40/40 automated dimension coverage.
- One initial parallel CDP batch showed port/profile cross-talk. Root-cause, local post-fix and final-preview checks cited above used serial runs.
- New process launches later failed with Windows `CreateProcessWithLogonW` error 1909, preventing another preview probe. The three screenshot-only rows remain explicitly bounded rather than inferred from other routes.
- Inquiry submission and email delivery were intentionally not exercised.
- The 40 screenshot visual matrix belongs to preview version `254a0a55-08e7-4096-a68f-9de6f63176f0`; final version `6e0f1741-d007-4a19-bfd1-cc60f55f96b4` changed only the honeypot accessibility attribute and received fresh HTTP/SEO plus four-route live markup checks, not another screenshot matrix.
- MV22-MV23 are exhaustive local evidence; MV24 adds focused live-preview evidence for their externally observable archive, layout and redirect contracts. It does not replace the earlier 40-screenshot matrix or prove search performance.
- Production, DNS, cache and sitemap submission were not changed.
- GSC, Semrush/DataForSEO, ranking, traffic, backlink, competitor and AI-citation evidence was not observed.
