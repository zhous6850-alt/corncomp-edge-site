# Multilingual parity review — 2026-11-25

Scope: compare published English page layouts with fr/es/ar/zh/de, repair identified omissions, deploy preview only.

Confirmed root causes:
- English Custom Packaging overview/services had dedicated templates; localized routes used the older generic ArchitecturePage.
- FactoryPage was explicitly English-only in the shared route.
- Four cup/bowl categories replaced English-specific introduction/section copy with generic translated strings.
- FAQ existed only as an English static page and navigation hard-coded /faq/.
- Three articles lacked the English lead comparison tables. Matching sourceHash values did not detect this omission.
- Article visible covers differed from OG/Article schema cover URLs.

Changes:
- Shared custom overview/service components, reviewed five-language dictionaries, localized product links and inquiry source context.
- Factory template reused in all six languages, preserving qualified company-supplied facility context.
- Category-specific localized copy for paper cups, salad bowls, soup cups and ice cream cups.
- Five FAQ routes, complete twelve-question translations, localized FAQ schema, navigation, language switching, sitemap and alternates.
- Restored article tables and Canada comparison example; corrected material-table qualifiers and substantive Chinese certificate-verification errors.
- Shared article cover mapping for displayed cover, OG and Article schema.
- Shorter French/Spanish/Arabic navigation labels avoid using lengthy page titles as menu labels.

Verification:
- Live English/Chinese overview and cup service read before edits confirmed the mismatch.
- Reproduction test failed against prior build, then passed with shared-template parity.
- Build: 927 pages including design previews, image optimizer completed.
- Browser: Chinese/German/Arabic mobile at 390px; French desktop at 1440px. No horizontal overflow observed in checked mobile pages; French navigation confirmed on one line after label fix.
- Full regression result recorded in tmp/multilingual-full-tests.log.
- No real inquiry was submitted; no production deployment or GitHub push in this task.

Boundaries:
- Product technical tables remain shared source data, with existing localized body presentation rather than identical heading counts.
- Existing English brand vision artwork wording remains intentionally English across locales.
- This is translation/content parity work, not a fresh regulatory audit. Pre-existing English materials article prose still merits a separate factual consistency review.

Final result:
- npm test --prefix site: 277 passed, 0 failed (after build/image optimization completed).
- Preview deployed: 51dd07d1-6123-4a95-9992-660e2fff7f6e.
- Remote check: 30 six-language custom/service/factory/FAQ pages HTTP 200 with correct template marker, one H1, language and production canonical; sitemap includes all six FAQ routes.
- Preview URL: https://corncomp-edge-site-v2-preview.corncomp-edge.workers.dev/zh/custom-packaging/?review=51dd07d1
