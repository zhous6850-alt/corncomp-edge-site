# Corncomp Sitewide Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved evidence-led editorial design to every major Corncomp page family, expose the blog through Resources, and add accurate product, factory, guide, and certificate imagery without changing production until preview approval.

**Architecture:** Add a small visual-media and certificate data layer, then consume it through focused Astro components used by the existing dynamic route. Split only the architecture and blog renderers out of the current large route; retain existing content, localization, SEO, analytics, and inquiry code as their sources of truth.

**Tech Stack:** Astro 5.18.2, JavaScript ES modules, Node test runner, Astro image pipeline, static assets, Cloudflare Workers.

**Spec:** `docs/superpowers/specs/2026-09-27-corncomp-sitewide-visual-redesign-design.md`

## Global Constraints

- Production domain is exactly `https://corn-comp.com`; do not configure or reference `corncomp.com`.
- Preserve existing routes, substantive copy, inquiry behavior, GA4 `G-R1SHNYEBN8`, schema, canonical links, hreflang, robots, and sitemap coverage.
- Preserve `inquiry@corn-comp.com` as both the public and sender address.
- Use real Corncomp product, factory, catalogue, and certificate assets before generated decorative imagery.
- Never present generated imagery as product, factory, certificate, test, or customer evidence.
- Company certificates, supplier documents, and SKU-specific certification claims must remain explicitly separated.
- English, French, Spanish, and Arabic share layout and media relationships; Arabic remains RTL and images are not mirrored.
- No cart, checkout, pricing engine, accounts, CMS, runtime database, client-side framework, or external image service.
- Deploy to a reviewable preview first. Production remains untouched until explicit user approval.
- Do not touch the pre-existing `.tmp-npm-cache/` or `.wrangler-dry-run/` directories.

## Review Focus

- A required manifest asset is missing: the build/test fails with the missing media key and path; optional media renders no broken image.
- A certificate lacks holder, number, scope, or validity: validation rejects it from the main certificate gallery.
- A localized route has no localized alt text: validation reports the language and media key instead of silently using mixed-language primary content.
- Resources is operated by keyboard or on mobile: Guides and Blog remain reachable, focusable, and closable without trapping focus.
- A long localized title or RTL page is rendered at narrow width: content wraps without overflow, image mirroring, or loss of navigation access.

---

## File map

**Create**

- `site/src/data/visual-media.mjs` — imports selected source images and defines page/content media assignments and localized alt text.
- `site/src/data/certificates.mjs` — defines current Corncomp certificates and separate supplier/material documents.
- `site/src/lib/visual-media.mjs` — validates and resolves media and certificate records.
- `site/src/lib/visual-media.test.mjs` — validates asset presence, localization, evidence type, and certificate completeness.
- `site/src/components/ResponsiveMedia.astro` — renders Astro-optimized images with explicit dimensions, loading priority, fit, and focal position.
- `site/src/components/PageHero.astro` — reusable evidence-led heading, intro, actions, and hero media.
- `site/src/components/EditorialCard.astro` — shared image-led card for products, applications, guides, and articles.
- `site/src/components/CertificateGallery.astro` — current company certificate gallery plus separated supply-chain documents.
- `site/src/components/ArchitecturePage.astro` — renders top-level architecture, guides, quality, about, and contact compositions.
- `site/src/components/BlogArchive.astro` — featured post plus responsive article grid.
- `site/src/components/BlogArticle.astro` — article hero, readable body, sources, and related posts.
- `site/public/documents/certificates/din-straw-material-7w0517.pdf` — current third-party material certificate source document.
- `site/public/documents/certificates/din-kraft-food-container-7p1802.pdf` — current affiliated-manufacturer document.

**Modify**

- `site/src/components/Header.astro` — Resources dropdown with Guides and Blog.
- `site/src/components/Footer.astro` — explicit localized Blog link.
- `site/src/lib/site-config.mjs` — localized Resources submenu configuration.
- `site/src/lib/localization.mjs` — localized visual labels, captions, and Blog/Guides UI strings.
- `site/src/lib/site-architecture.mjs` — page-family presentation metadata only where the renderer needs it.
- `site/src/pages/[...path].astro` — delegate architecture/blog rendering and enrich product/category composition.
- `site/src/layouts/BaseLayout.astro` — accept optimized social image paths without changing canonical/schema/analytics behavior.
- `site/src/styles/global.css` — evidence-led responsive layout, cards, certificate gallery, dropdown, and article styles.
- `site/src/lib/site-config.test.mjs` — Resources submenu and localized routes.
- `site/src/lib/localization.test.mjs` — localized visual labels and alt coverage.
- `site/src/lib/site-architecture.test.mjs` — supported page-family visual metadata.
- `site/src/lib/build-output.test.mjs` — rendered images, layouts, dropdown, certificate detail, and responsive hooks.
- `site/src/lib/seo-output.test.mjs` — unchanged SEO output plus article/certificate image assertions.
- `site/package.json` and `site/package-lock.json` — only if an explicit build-time image dependency is required after proving Astro's existing pipeline is insufficient.

## Task 1: Visual media and certificate data layer

**Files:**
- Create: `site/src/data/visual-media.mjs`
- Create: `site/src/data/certificates.mjs`
- Create: `site/src/lib/visual-media.mjs`
- Create: `site/src/lib/visual-media.test.mjs`
- Create: `site/public/documents/certificates/din-straw-material-7w0517.pdf`
- Create: `site/public/documents/certificates/din-kraft-food-container-7p1802.pdf`

**Interfaces:**
- Produces: `mediaFor(contentKey, language = 'en') -> VisualMedia | null`
- Produces: `mediaListFor(contentKey, language = 'en') -> VisualMedia[]`
- Produces: `validateVisualMedia({ publicDir }) -> string[]`
- Produces: `companyCertificates(language = 'en') -> CertificateRecord[]`
- Produces: `supplyChainDocuments(language = 'en') -> CertificateRecord[]`
- `VisualMedia`: `{ key, src, width, height, alt, fit, position, evidence }`
- `CertificateRecord`: `{ key, title, holder, certificateNumber, standard, scope, validUntil, image, documentUrl? }`

- [ ] **Step 1: Write failing media validation tests**

Add tests named `resolves localized visual media`, `reports missing required assets`, `requires all four localized alt values`, `keeps optional media nullable`, and `separates complete company certificates from supply-chain documents`. Assert the four current Corncomp certificate numbers and dates from the spec, including BPI scope `352 g/m²`.

- [ ] **Step 2: Run the focused test and verify failure**

Run from `site`: `node --test src/lib/visual-media.test.mjs`  
Expected: FAIL because the media resolver and data modules do not exist.

- [ ] **Step 3: Add selected real assets and exact evidence metadata**

Use existing local product, factory, blog, and certificate files. Copy only the two current DIN PDFs into the new public documents directory; do not copy the expired DIN document. Define complete localized alt text and mark each asset as `product`, `factory`, `certificate`, `application`, or `decorative`.

- [ ] **Step 4: Implement the resolver and validation interfaces**

Keep validation pure and dependency-free. A required missing file, invalid evidence value, missing language alt, or incomplete certificate returns a human-readable error containing the media/certificate key.

- [ ] **Step 5: Run focused and full data tests**

Run from `site`: `node --test src/lib/visual-media.test.mjs src/lib/localization.test.mjs`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add site/src/data/visual-media.mjs site/src/data/certificates.mjs site/src/lib/visual-media.mjs site/src/lib/visual-media.test.mjs site/public/documents/certificates
git commit -m "feat: add verified visual media data"
```

## Task 2: Shared evidence-led visual components

**Files:**
- Create: `site/src/components/ResponsiveMedia.astro`
- Create: `site/src/components/PageHero.astro`
- Create: `site/src/components/EditorialCard.astro`
- Create: `site/src/components/CertificateGallery.astro`
- Modify: `site/src/styles/global.css`
- Modify: `site/src/lib/build-output.test.mjs`

**Interfaces:**
- Consumes: `VisualMedia`, `CertificateRecord` from Task 1.
- Produces: `ResponsiveMedia` props `{ media: VisualMedia, eager?: boolean, class?: string }`.
- Produces: `PageHero` props `{ eyebrow, title, intro, media?, actions?, compact? }`.
- Produces: `EditorialCard` props `{ title, text, href, media?, label? }`.
- Produces: `CertificateGallery` props `{ company, supplyChain, language }`.

- [ ] **Step 1: Add failing rendered-output assertions**

Create fixture usage through an existing architecture page and assert explicit image width/height, eager hero loading, lazy card loading, empty alt for decorative media, certificate holder/number/scope/validity, and distinct company/supply-chain section hooks.

- [ ] **Step 2: Run the build-output test and verify failure**

Run from `site`: `npm run build && node --test src/lib/build-output.test.mjs`  
Expected: FAIL on the new component hooks and evidence fields.

- [ ] **Step 3: Implement the four focused Astro components**

Use Astro's image pipeline for imported editorial assets where possible. Do not add a package dependency unless the existing Astro pipeline cannot generate the required output. Optional media renders no `<img>`.

- [ ] **Step 4: Add the shared visual CSS**

Add editorial hero, split section, image-card, certificate-gallery, responsive table, and mobile/RTL rules. Preserve existing design tokens and `prefers-reduced-motion` behavior.

- [ ] **Step 5: Build and run focused tests**

Run from `site`: `npm run build && node --test src/lib/build-output.test.mjs src/lib/visual-media.test.mjs`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add site/src/components/ResponsiveMedia.astro site/src/components/PageHero.astro site/src/components/EditorialCard.astro site/src/components/CertificateGallery.astro site/src/styles/global.css site/src/lib/build-output.test.mjs
git commit -m "feat: add evidence-led page components"
```

## Task 3: Resources navigation and blog discovery

**Files:**
- Modify: `site/src/lib/site-config.mjs`
- Modify: `site/src/components/Header.astro`
- Modify: `site/src/components/Footer.astro`
- Modify: `site/src/styles/global.css`
- Modify: `site/src/lib/site-config.test.mjs`
- Modify: `site/src/lib/build-output.test.mjs`

**Interfaces:**
- Produces: `navigationFor(language).resources.children` with localized `Guides` and `Blog` entries.
- Preserves: `navigationFor(language).resources[0]` and existing public navigation consumers until the same task updates them.

- [ ] **Step 1: Write failing navigation tests**

Assert exact Guides and Blog routes for `en`, `fr`, `es`, and `ar`; rendered desktop markup uses a Resources disclosure; footer contains a direct localized Blog link; and the disclosure has keyboard-operable summary/link elements.

- [ ] **Step 2: Run focused tests and verify failure**

Run from `site`: `node --test src/lib/site-config.test.mjs src/lib/build-output.test.mjs`  
Expected: FAIL because Resources has no children and Blog is absent from the rendered primary/footer navigation.

- [ ] **Step 3: Implement the Resources dropdown and footer link**

Reuse the existing `<details>` navigation pattern. Desktop and mobile use the same semantic disclosure, and all link clicks retain the existing menu-close behavior.

- [ ] **Step 4: Add dropdown layout and focus styles**

Keep the current product and language dropdown behavior intact. Ensure the Resources submenu fits narrow desktop widths and becomes static inside the mobile menu.

- [ ] **Step 5: Build and run navigation tests**

Run from `site`: `npm run build && node --test src/lib/site-config.test.mjs src/lib/build-output.test.mjs`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add site/src/lib/site-config.mjs site/src/components/Header.astro site/src/components/Footer.astro site/src/styles/global.css site/src/lib/site-config.test.mjs site/src/lib/build-output.test.mjs
git commit -m "feat: expose guides and blog under resources"
```

## Task 4: Architecture, quality, about, resources, and contact pages

**Files:**
- Create: `site/src/components/ArchitecturePage.astro`
- Modify: `site/src/lib/site-architecture.mjs`
- Modify: `site/src/lib/localization.mjs`
- Modify: `site/src/pages/[...path].astro`
- Modify: `site/src/styles/global.css`
- Modify: `site/src/lib/site-architecture.test.mjs`
- Modify: `site/src/lib/localization.test.mjs`
- Modify: `site/src/lib/build-output.test.mjs`

**Interfaces:**
- Consumes: Task 1 resolver functions and Task 2 components.
- Produces: `ArchitecturePage` props `{ source, page, language, ui, contactRoute, labels, recentPosts }`.
- Preserves: inquiry form names, `/api/inquiry` action, hidden `sourcePath`, and query-prefill behavior.

- [ ] **Step 1: Add failing page-family tests**

Assert media-aware heroes and image cards for Products, Custom Packaging, Applications, Resources, About, and Contact; assert the Quality title precedes a two-column certificate gallery; assert the contact form's exact fields/action remain present; assert French, Spanish, and Arabic variants render localized labels.

- [ ] **Step 2: Run focused tests and verify failure**

Run from `site`: `node --test src/lib/site-architecture.test.mjs src/lib/localization.test.mjs src/lib/build-output.test.mjs`  
Expected: FAIL on the new visual/page-family hooks.

- [ ] **Step 3: Implement `ArchitecturePage.astro`**

Move only architecture-page rendering out of `[...path].astro`. Select the composition by existing `page.kind`; pass the three most recent localized blog entries as `recentPosts`; use real media assignments; keep guide tables, sources, CTA URLs, and inquiry markup unchanged in meaning.

- [ ] **Step 4: Add exact certificate and resource compositions**

Quality renders the approved top heading and two-column gallery followed by factory evidence and separate material documents. Resources renders one featured guide, remaining guide cards, and latest Blog entries.

- [ ] **Step 5: Add About and Contact visual compositions**

About alternates verified company/factory content with real factory media. Contact uses one supporting image next to the unchanged form and contact details.

- [ ] **Step 6: Build and run focused tests**

Run from `site`: `npm run build && node --test src/lib/site-architecture.test.mjs src/lib/localization.test.mjs src/lib/build-output.test.mjs`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add site/src/components/ArchitecturePage.astro site/src/lib/site-architecture.mjs site/src/lib/localization.mjs 'site/src/pages/[...path].astro' site/src/styles/global.css site/src/lib/site-architecture.test.mjs site/src/lib/localization.test.mjs site/src/lib/build-output.test.mjs
git commit -m "feat: redesign buyer and company pages"
```

## Task 5: Product groups, categories, and detail pages

**Files:**
- Modify: `site/src/pages/[...path].astro`
- Modify: `site/src/styles/global.css`
- Modify: `site/src/lib/build-output.test.mjs`
- Modify: `site/src/lib/seo-output.test.mjs`

**Interfaces:**
- Consumes: `mediaFor`, `mediaListFor`, `PageHero`, `EditorialCard`, and existing `extractProductFacts`.
- Preserves: product/category routes, item codes, product schema, quote query parameters, catalogue tables, related products, and localized bodies.

- [ ] **Step 1: Add failing product-family tests**

Assert image-led product-group/category pages, non-empty localized product alt text, evidence/media sections on representative product pages, unchanged Product schema/SKU, and absence of blanket SKU certification claims.

- [ ] **Step 2: Run focused tests and verify failure**

Run from `site`: `npm run build && node --test src/lib/build-output.test.mjs src/lib/seo-output.test.mjs`  
Expected: FAIL on new visual hooks while existing schema assertions continue to pass.

- [ ] **Step 3: Implement media-aware product directories**

Use real product images in group and category heroes/cards. Keep card counts, routes, and catalogue data driven by the existing inventory.

- [ ] **Step 4: Implement product evidence composition**

Retain the current product lead, specifications, buying note, and related products; add application/manufacturing/evidence media only when assigned. Keep company-level certificates visibly qualified.

- [ ] **Step 5: Build and run product/SEO tests**

Run from `site`: `npm run build && node --test src/lib/product-facts.test.mjs src/lib/build-output.test.mjs src/lib/seo-output.test.mjs`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add 'site/src/pages/[...path].astro' site/src/styles/global.css site/src/lib/build-output.test.mjs site/src/lib/seo-output.test.mjs
git commit -m "feat: add visual product sourcing pages"
```

## Task 6: Blog archive and article experience

**Files:**
- Create: `site/src/components/BlogArchive.astro`
- Create: `site/src/components/BlogArticle.astro`
- Modify: `site/src/pages/[...path].astro`
- Modify: `site/src/lib/localization.mjs`
- Modify: `site/src/styles/global.css`
- Modify: `site/src/lib/build-output.test.mjs`
- Modify: `site/src/lib/seo-output.test.mjs`

**Interfaces:**
- Produces: `BlogArchive` props `{ posts, language, labels }`.
- Produces: `BlogArticle` props `{ source, entry, bodyHtml, language, breadcrumbs, relatedPosts, labels }`.
- Preserves: 19 post content keys, localized archive routes, article routes, Article schema, featured images, and source links.

- [ ] **Step 1: Add failing blog tests**

Assert 19 posts remain discoverable across language inventories; each archive has a featured article and image grid; existing featured images render; long articles expose a content navigation hook; Article schema and canonical/hreflang remain unchanged.

- [ ] **Step 2: Run focused tests and verify failure**

Run from `site`: `npm run build && node --test src/lib/build-output.test.mjs src/lib/seo-output.test.mjs src/lib/localization.test.mjs`  
Expected: FAIL on featured/archive/article presentation hooks.

- [ ] **Step 3: Implement the archive component**

Use the first current-language post as featured and render the remainder through `EditorialCard`. Do not change sorting or URLs unless current data provides an explicit date order.

- [ ] **Step 4: Implement the article component**

Keep imported article HTML and source links. Add a media hero, readable content width, generated in-page heading navigation only when multiple `h2` sections exist, and related articles from the same language.

- [ ] **Step 5: Build and run blog/SEO tests**

Run from `site`: `npm run build && node --test src/lib/build-output.test.mjs src/lib/seo-output.test.mjs src/lib/localization.test.mjs`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add site/src/components/BlogArchive.astro site/src/components/BlogArticle.astro 'site/src/pages/[...path].astro' site/src/lib/localization.mjs site/src/styles/global.css site/src/lib/build-output.test.mjs site/src/lib/seo-output.test.mjs
git commit -m "feat: redesign multilingual blog experience"
```

## Task 7: Accessibility, responsive behavior, and regression coverage

**Files:**
- Modify: `site/src/styles/global.css`
- Modify: `site/src/layouts/BaseLayout.astro`
- Modify: `site/src/lib/analytics-behavior.test.mjs`
- Modify: `site/src/lib/build-output.test.mjs`
- Modify: `site/src/lib/link-output.test.mjs`
- Modify: `site/src/lib/seo-output.test.mjs`

**Interfaces:**
- Consumes: completed page/components from Tasks 2–6.
- Preserves: BaseLayout canonical, hreflang, schema array, analytics consent, and generate-lead behavior.

- [ ] **Step 1: Add failing regression assertions**

Cover the five Review Focus cases, explicit image dimensions/loading, RTL hooks, no horizontal overflow classes, reduced-motion support, focus-visible navigation, canonical domain, GA4 ID, inquiry email, schema, sitemap, and internal link integrity.

- [ ] **Step 2: Run the complete site test suite and record failures**

Run from `site`: `npm test`  
Expected: only the newly added assertions fail.

- [ ] **Step 3: Fix responsive, RTL, accessibility, and social-image integration**

Make surgical CSS/layout adjustments only. Keep images unmirrored in RTL and maintain logical DOM order. Update BaseLayout only as needed to accept optimized page images.

- [ ] **Step 4: Run full static verification**

Run from `site`: `npm test && npm run build`  
Expected: all tests PASS and Astro build completes with no missing route or asset.

- [ ] **Step 5: Run migration and Worker regressions**

Run from repository root:

```bash
node --test scripts/download-media.test.mjs scripts/export-wordpress.test.mjs scripts/import-content.test.mjs scripts/seed-locale-data.test.mjs worker/inquiry.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add site/src/styles/global.css site/src/layouts/BaseLayout.astro site/src/lib/analytics-behavior.test.mjs site/src/lib/build-output.test.mjs site/src/lib/link-output.test.mjs site/src/lib/seo-output.test.mjs
git commit -m "test: verify responsive visual redesign"
```

## Task 8: Visual QA and preview deployment

**Files:**
- Modify only if QA exposes a defect: files owned by Tasks 1–7.
- Create: `docs/qa/2026-09-27-sitewide-visual-preview.md`

**Interfaces:**
- Produces: a QA record with commit, test totals, representative routes, preview URL, screenshots/observations, rollback context, and `production untouched` status.

- [ ] **Step 1: Start a local production preview**

Run from `site`: `npm run build && npm run preview -- --host 127.0.0.1`  
Expected: local preview serves built pages without console or asset errors.

- [ ] **Step 2: Inspect representative desktop and mobile routes**

Check home, Products, one category, one product, Custom Packaging, Applications, Quality, Resources, Blog, one article, About, and Contact in English; check representative French, Spanish, and Arabic equivalents. Record image quality, overflow, RTL, focus, and form layout evidence.

- [ ] **Step 3: Verify inquiry behavior locally or against the existing preview Worker**

Submit one invalid payload and one authorized test payload. Expected: invalid returns `400`; valid returns `200`, sends to the existing recipient, and leaves public/sender email unchanged.

- [ ] **Step 4: Deploy only the preview Worker**

Run from repository root after authentication is confirmed: `npx wrangler deploy --config wrangler.preview.jsonc`  
Expected: a reviewable preview URL for the new commit; no route or deployment change to `corn-comp.com`.

- [ ] **Step 5: Perform live preview read-after-write checks**

Verify representative pages, Resources → Guides/Blog, canonical/hreflang/schema, robots/sitemap, image responses, responsive layouts, and inquiry endpoint. Stop on `502`, `503`, `504`, or `524` instead of retrying production-affecting actions.

- [ ] **Step 6: Write and commit the QA record**

```bash
git add docs/qa/2026-09-27-sitewide-visual-preview.md
git commit -m "docs: record visual redesign preview QA"
```

The QA record must explicitly state that production is untouched and request user approval before any merge or production deployment.

## Final acceptance gate

Do not merge or deploy to production as part of this plan. Present the preview URL, commit, test totals, visual QA summary, known limitations, and rollback context. Production integration is a separate user-approved action.
