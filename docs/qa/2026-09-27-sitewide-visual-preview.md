# Sitewide visual redesign preview QA — 2026-09-27

Status: **partial local verification; browser acceptance and preview deployment blocked**. This record is not a release approval.

## 2026-09-28 resumed verification

The user explicitly authorized continuation and network access. The application baseline remained unchanged; documentation baseline was `74ffb2c828870747f3cae755587a092268fc6597`.

- A fresh stable build completed: **345 pages**, exit 0, **24.69 seconds**. Command from the worktree: `$env:ASTRO_TELEMETRY_DISABLED='1'; npm run build --prefix site`.
- Re-read computer-use version `26.924.22138` and its required guidance/confirmations. Native `@oai/sky` application discovery succeeded and found Chrome installed with no open browser window. The subsequent `sky.launch_app({app:'Chrome'})` operation did not return within the requested 30-second tool timeout and was interrupted; no new browser visual acceptance was completed. The earlier unverified viewport/state matrix below therefore remains outstanding. No authentication UI was automated.
- npm cache and Wrangler logs were redirected under the existing ignored orchestration directory: `.superpowers/sdd/2026-09-27-corncomp-sitewide-visual-redesign/runtime/`. Neither pre-existing temp directory was used or changed.
- `npx --yes wrangler whoami` remained silent during package resolution and ultimately returned **EACCES** fetching `https://registry.npmjs.org/wrangler`, despite the resumed network authorization. It was not retried.
- Used the already-installed binary instead: **`.\.wrangler-cli\node_modules\.bin\wrangler.cmd whoami`** with the worktree-local cache/log paths and `WRANGLER_SEND_METRICS=false`. Wrangler **4.135.0** completed, exit 0, with **`You are not authenticated. Please run wrangler login.`** This is not a successful authenticated-account check. No login URL was returned. No login command or temporary-account deployment was initiated.
- Reconfirmed that `wrangler.preview.jsonc` targets only `corncomp-edge-site-v2-preview` with `workers_dev: true` and no production routes; the separate production config was only read for target comparison.

**Current deployment blocker: Cloudflare authentication is absent.** No deployment, live preview read-after-write, or valid inquiry was performed. No preview URL/version was produced, and production remains untouched. There is no remote rollback to perform. After user-completed authentication, confirm the account using the existing local binary, then continue only with the explicit preview config and remaining acceptance checks. The prior single authorized valid preview inquiry remains unsent. User approval is still required before merge or production deployment.

**production untouched** — no production deployment, route change, merge, or external inquiry was performed. Explicit user approval remains required after completed preview review and before any merge or production deployment.

## Baseline and local environment

- Application commit: `870d3dd1515e96b3a041d733273ef05d83c4ae13` (`test: verify responsive visual redesign`). Task 8 made no application changes.
- Approved baseline: `docs/superpowers/specs/2026-09-27-corncomp-sitewide-visual-redesign-design.md` and the matching implementation plan; evidence-led editorial direction, existing real assets, unchanged evidence classification.
- Worktree: `corncomp-edge-site/.worktrees/seo-architecture-v2`.
- Local production build: **345 pages**, exit 0, 24.94 seconds.
- Local Astro production preview used <http://127.0.0.1:4321/>. Started from `site` with `$env:ASTRO_TELEMETRY_DISABLED='1'; npm run preview -- --host 127.0.0.1`; ready signal reported Astro 5.18.2. Server session `97346` was stopped after QA; restart with the same command for review.
- The first preview start omitted the telemetry setting and failed trying to create the restricted roaming Astro configuration directory. Setting the existing telemetry opt-out resolved the startup; no application repair was required.

## Executed browser evidence

The Codex in-app browser rendered the English homepage at **1440 × 900**. The screenshot is recorded in the Task 8 tool transcript under `Inspect home at desktop viewport`; it was not exported as a separate image file.

Observed:

- The Corncomp logo, primary navigation, green/paper palette, white hero headline, product/service photograph and both hero actions loaded visibly.
- Hero text has a clear hierarchy and readable contrast. The service image remains recognizable behind the overlay; its embedded upper-right wordmark is partially cropped at this desktop ratio. This was recorded as an existing crop observation, not changed as a content or asset decision.
- The optional analytics panel appeared at the lower right. Clicking **Decline** removed it, confirmed by the next accessibility snapshot.
- A read-only browser DOM measurement returned `innerWidth=1440`, `innerHeight=900`, and `document.documentElement.scrollWidth=1425`: no horizontal page overflow in this state.
- The accessibility snapshot exposed the primary and footer navigation, Resources disclosure, quote actions, factory section and contact links. This establishes their presence, not their untested keyboard behavior.
- The tool emitted a Statsig initialization warning. No page-console collection was completed, so this record does not assert a clean site console.

After the interrupted network-permission request, the bound browser reported `Browser is not available: 1`. Browser discovery returned `Unable to load browser request-header policy`; one bounded retry returned the same error. Both discovery calls completed in approximately 20 seconds. Further browser actions stopped, following recovery guidance. The disconnected browser also prevented resetting its temporary viewport override.

| Viewport | Executable visual coverage | Remaining acceptance |
| --- | --- | --- |
| 390 × 844 | Not executed | All representative routes; mobile menu, Contact form, Quality documents, RTL |
| 768 × 1024 | Not executed | All representative routes and tablet navigation |
| 1280 × 720 | Not executed | All representative routes and narrow desktop navigation |
| 1440 × 900 | English homepage screenshot, analytics decline and width measurement | Other routes; focus order/rings; Resources open, link, close and Escape states |

Certificate legibility/enlargement, image crop quality across page families, Arabic visual reading order and unmirrored imagery, form layout/validation UI, scrolling to below-fold content, reduced-motion behavior, and browser runtime/network errors remain **unverified in a browser**. Static assertions below are not substitutes for these checks. No defect repair was made on unverified evidence.

## Local HTTP and regression results

Completed against the stable build, without concurrent rebuilding:

- `npm test` from `site`: **149 passed, 0 failed**, 7.13 seconds.
- `node --test scripts/download-media.test.mjs scripts/export-wordpress.test.mjs scripts/import-content.test.mjs scripts/seed-locale-data.test.mjs worker/inquiry.test.mjs`: **31 passed, 0 failed** (18 migration + 13 Worker), 1.12 seconds.
- Local HTTP probe: **48/48 representative pages returned 200**, covering the following 12 content families in English, French, Spanish and Arabic. Each response contained an H1, canonical, x-default hreflang, JSON-LD and the correct language; Arabic responses contained `dir="rtl"`.
- **33/33 distinct referenced image/CSS/JS assets returned 200**. This probe extracts `src`/`href` assets from these responses; it is not a browser network trace or exhaustive `srcset` test.
- `/robots.txt` and `/sitemap.xml`: **2/2 returned 200**, retaining the `https://corn-comp.com` source domain.
- The existing full site suite verifies all-language internal links/local images, canonical/hreflang/schema, sitemap, GA4 consent, localized media and certificate data, scope separation, and inquiry output. Its geometry/CSS and script behavior assertions do not establish rendered browser acceptance.

| Family | English route |
| --- | --- |
| Home | `/` |
| Products | `/products/` |
| Category | `/products/cups-bowls/paper-cups/` |
| Product | `/products/cups-bowls/paper-cups/single-wall-white-cardboard-paper-cup/` |
| Custom Packaging | `/custom-packaging/` |
| Applications | `/applications/` |
| Quality | `/quality/` |
| Resources | `/resources/` |
| Blog | `/blog/` |
| Article | `/us-state-plastic-packaging-laws-explained/` |
| About | `/about/` |
| Contact | `/contact/` |

For reproducible localization, the probe used `routeFor(language, contentKey)` from `site/src/lib/localization.mjs`, with the corresponding `architecture:` keys, `home`, `product:single-wall-white-cardboard-paper-cup`, and `post:us-state-plastic-packaging-laws-explained`. Blog routes were `/blog/`, `/fr/blog/`, `/es/blog/`, `/ar/blog/`. Examples of verified localized trust/contact paths:

- French: `/fr/certifications-corncomp/`, `/fr/contactez-nous/`.
- Spanish: `/es/certificaciones-de-corncomp/`, `/es/contactenos/`.
- Arabic: `/ar/شهادات-corncomp/`, `/ar/اتصل-بنا/` (requested using the canonical percent-encoded routes).

## Inquiry verification

An invalid local request `{name:"", email:"invalid"}` was passed directly to the actual Worker handler, with external fetch guarded to fail if invoked. Result: **400**, `{"ok":false,"error":"Please enter a valid name and email."}`, **zero external email calls**. This is an in-process Worker check, not an HTTP request to the Astro static server.

The existing Worker suite also passed mocked valid-send and browser-return tests. **No valid live test inquiry was sent.** The one authorized valid inquiry is still pending and may be sent at most once to the preview Worker after deployment, never production. Delivery to the existing recipient is therefore unverified; no secret or private recipient address is reproduced here. Public/sender address remains `inquiry@corn-comp.com`.

## Cloudflare and deployment

Read-only inspection of `wrangler.preview.jsonc` confirmed:

- Worker name `corncomp-edge-site-v2-preview`.
- Entry `worker/index.mjs`; compatibility date `2026-09-19`.
- `workers_dev: true`; assets `./site/dist`, binding `ASSETS`, `run_worker_first: true`.
- No production routes or custom-domain configuration in this preview file.

`$env:WRANGLER_SEND_METRICS='false'; npx wrangler whoami` failed before authentication could be confirmed: npm reported **EACCES** fetching `https://registry.npmjs.org/wrangler`, and could not write logs to its restricted default cache. A scoped network-permission request was interrupted/aborted by the user; no grant was recorded. No authentication dialog was automated and no credentials were inspected.

Because browser acceptance and authentication remain unconfirmed, **`npx wrangler deploy --config wrangler.preview.jsonc` was not run**. No new preview URL/version exists from this task. Live preview read-after-write, live inquiry and remote rollback-version checks remain pending. No 502/503/504/524 response was observed; if one occurs during the remaining work, stop rather than retry deployment actions.

## Recovery and approval gate

No deployment rollback is needed because no remote state changed. The application remains at baseline commit `870d3dd1515e96b3a041d733273ef05d83c4ae13`; the QA commit adds only this record. Existing `.tmp-npm-cache/`, `.wrangler-dry-run/` and other pre-existing temporary paths were left untouched.

Resume by restoring browser availability and completing the viewport matrix, prioritizing Quality desktop/mobile, Resources keyboard open/close/Escape/focus, Contact mobile, and Arabic RTL. Then confirm Cloudflare authentication, capture the existing preview version for rollback, deploy only using the explicit preview config, and perform preview read-after-write plus the single authorized valid inquiry. Present that evidence to the user for approval before merging or deploying to production.
