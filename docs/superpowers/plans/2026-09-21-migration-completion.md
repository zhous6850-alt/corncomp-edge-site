# Corncomp Migration Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the visitor-facing and technical migration gaps without changing the imported WordPress copy or the production domain.

**Architecture:** Keep the existing static Astro build and Cloudflare Worker. Add small shared route/site configuration helpers, enrich the existing templates, generate static SEO endpoints, and use Worker redirects only for obsolete aliases and commerce routes.

**Tech Stack:** Astro, Node.js test runner, Cloudflare Workers.

**Spec:** The migration gap checklist approved in the conversation on 2026-09-21.

## Global Constraints

- Preserve all imported WordPress body copy and existing Corncomp imagery.
- Keep `https://corn-comp.com` as the canonical production origin.
- Do not change production DNS or disable WordPress/Vultr in this phase.
- Do not add dependencies when Astro, Node, HTML, and CSS already cover the requirement.
- Every behavior change starts with a failing test and ends with the full suite and production build passing.

## Review Focus

- Translated pages must never link their primary navigation to the wrong language.
- Product pages with no excerpt, category, or related products must still render valid HTML.
- Arabic pages must retain RTL direction and readable navigation order.
- Sitemap and canonical URLs must exclude cart, checkout, and account pages.
- Redirect handling must not intercept assets or the inquiry API.

---

### Task 1: Global navigation and footer parity

**Files:**
- Create: `site/src/lib/site-config.mjs`
- Modify: `site/src/components/Header.astro`
- Modify: `site/src/components/Footer.astro`
- Modify: `site/src/layouts/BaseLayout.astro`
- Modify: `site/src/lib/build-output.test.mjs`

**Interfaces:**
- Produces: `navigationFor(language)`, `languageHomes`, `pageAlternates(pathname)`.
- Consumes: existing `language` and `pathname` layout props.

- [ ] Add failing output tests for full navigation, product categories, language choices, company contact details, social links, copyright, and floating contact actions.
- [ ] Run `npm run build && npm test` and confirm the new tests fail because the elements are absent.
- [ ] Implement the smallest shared configuration and component changes.
- [ ] Run `npm run build && npm test` and confirm all tests pass.

### Task 2: Product context and multilingual shop directories

**Files:**
- Modify: `site/src/pages/[...path].astro`
- Modify: `site/src/lib/content-routes.mjs`
- Modify: `site/src/styles/global.css`
- Modify: `site/src/lib/content-routes.test.mjs`
- Modify: `site/src/lib/build-output.test.mjs`

**Interfaces:**
- Consumes: category/product data and `navigationFor(language)` from Task 1.
- Produces: localized `/fr/shop/`, `/es/shop/`, `/ar/shop/`; product breadcrumb, excerpt, categories, and related products; `localizeInternalLinks(html)`.

- [ ] Add failing helper/output tests for relative internal links, three translated shop routes, and product context.
- [ ] Run targeted tests and confirm the expected failures.
- [ ] Implement localized archives and product context without modifying imported copy.
- [ ] Run the complete site test suite and build.

### Task 3: Technical SEO, redirects, and inquiry confirmation

**Files:**
- Create: `site/src/pages/sitemap.xml.js`
- Create: `site/src/pages/404.astro`
- Create: `site/public/robots.txt`
- Modify: `site/src/layouts/BaseLayout.astro`
- Modify: `site/src/pages/[...path].astro`
- Modify: `worker/index.mjs`
- Modify: `worker/inquiry.test.mjs`
- Modify: `site/src/lib/build-output.test.mjs`

**Interfaces:**
- Consumes: page metadata and the route set from Task 2.
- Produces: sitemap, robots, canonical/social metadata, organization/product/breadcrumb JSON-LD, safe legacy redirects, and a visible inquiry-success state.

- [ ] Add failing build/Worker tests for SEO files, commerce redirects, known translated aliases, and inquiry success messaging.
- [ ] Run targeted tests and confirm the expected failures.
- [ ] Implement only the endpoints, metadata, redirect table, and success UI required by those tests.
- [ ] Run all site, import, and Worker tests plus a clean production build.
- [ ] Inspect the generated route count and scan generated HTML for broken internal targets.

