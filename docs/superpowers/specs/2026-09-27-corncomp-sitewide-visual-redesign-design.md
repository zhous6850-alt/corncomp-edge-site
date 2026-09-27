# Corncomp Sitewide Visual Redesign Design

**Date:** 2026-09-27  
**Status:** Approved conversational design, pending written-spec review  
**Production domain:** `https://corn-comp.com`  
**Selected direction:** A — evidence-led editorial

## 1. Purpose

Redesign the current Astro site so that major landing pages, product pages, buyer resources, blog content, and company-evidence pages no longer feel like long, text-only documents. The finished site must help overseas B2B buyers understand the product, manufacturing context, document scope, and next action without sacrificing the existing SEO architecture.

The redesign must preserve existing routes, substantive copy, inquiry behavior, GA4 tracking, structured data, canonical links, hreflang relationships, and sitemap coverage. It must not introduce shopping, payment, or account features.

## 2. Audience and success criteria

The primary audience is overseas foodservice distributors, restaurant groups, retail buyers, and private-label/OEM procurement teams.

The redesign succeeds when:

- every major page family uses relevant real imagery and a deliberate layout rather than a uniform text stack;
- users can reach guides and blog content through a visible `Resources` menu;
- product, factory, quality, and certification evidence is presented with accurate scope;
- English, French, Spanish, and Arabic pages share the same visual system while retaining localized copy and directionality;
- desktop and mobile layouts remain readable, fast, and conversion-oriented;
- the complete site still passes build, SEO, schema, navigation, image, and inquiry-flow checks;
- a reviewable preview is available before any production change.

## 3. Selected visual direction

Use an evidence-led editorial system:

- one strong, relevant real image per major information section;
- asymmetric desktop compositions where they improve hierarchy;
- clear transitions between product, manufacturing, application, and proof content;
- restrained Corncomp green, warm paper backgrounds, generous spacing, and limited decorative treatment;
- no generic template look, excessive card grids, arbitrary gradients, or decorative images that compete with sourcing information.

On mobile, asymmetric sections collapse into a clear single-column reading order. Images retain their natural subject position and Arabic layout becomes RTL without mirroring image content.

## 4. Navigation architecture

The primary English navigation retains the existing main categories and changes `Resources` into a dropdown containing:

- `Guides` → `/resources/`
- `Blog` → `/blog/`

The mobile navigation expands the same two entries after tapping `Resources`. French, Spanish, and Arabic use localized labels and localized archive routes. The footer keeps separate links for Resources and Blog to improve discovery and crawling.

Existing blog archive and article URLs remain unchanged. The current 19 posts remain in the sitemap and content inventory.

## 5. Page-family designs

### 5.1 Products and product categories

- Lead with a relevant product or application image beside the page title and sourcing summary.
- Convert category choices into image-led cards using real product photos.
- Add manufacturing, material, and evidence sections only where they support the category's actual content.
- Preserve catalogue specifications and existing internal links.

### 5.2 Product detail pages

- Use a clear product gallery or primary product image, specifications, applications, material choices, related evidence, and inquiry action.
- Keep tables readable on small screens.
- Distinguish company-level certificates, material documentation, and item-specific certification. Never imply that a company certificate automatically certifies every SKU.

### 5.3 Custom Packaging

- Lead with real custom-printed product imagery.
- Present the workflow as specification, artwork review, sample confirmation, production, and packing.
- Show file, print, packing, MOQ, and destination requirements next to relevant imagery.
- Keep direct links to product-specific custom-packaging pages and the inquiry form.

### 5.4 Applications

- Organize content around real buyer contexts such as cafes, restaurants, takeaway, fast food, and dessert service.
- Use application imagery and product recommendations instead of text-only link lists.
- Avoid lifestyle imagery that misrepresents product performance or use.

### 5.5 Quality and certifications

- Place the title and explanatory copy across the top of the page.
- Display current Corncomp company certificates in a two-column desktop gallery and one column on mobile.
- Each certificate card includes the original document image, holder, certificate number, standard or scope, and validity.
- Place factory quality-control evidence below the company certificate gallery.
- Put valid supplier or affiliated-manufacturer DIN documents in a separate `Supply-chain and material documents` section with the holder named in full.
- Exclude expired certificates from the current-certificate gallery.

### 5.6 Resources and guides

- Present one featured guide with a strong image and summary.
- Present remaining guides as image-led editorial cards.
- Add a latest-blog section with links into the blog archive.
- Preserve primary-source references and guide schema.

### 5.7 Blog archive and articles

- Blog archive: one featured article followed by a responsive image-card grid.
- Use existing featured images for the 19 migrated posts.
- Group or label articles by useful buyer topics such as certification, regulation, and materials when supported by the current content.
- Article pages use a cover image, comfortable reading width, optional table of contents for long articles, inline evidence images, official sources, and related articles.
- Articles without a suitable featured image receive a matching real Corncomp or documentary asset before any generated image is considered.

### 5.8 About and Factory

- Alternate company narrative with factory exterior, production line, workshop, and quality-inspection photographs.
- Present verified company and facility facts as compact evidence blocks.
- Do not invent employee portraits, machinery, capacity, or production claims.

### 5.9 Contact

- Keep the inquiry form simple and prominent.
- Pair it with one relevant factory or product image and clear contact details.
- Preserve the public and sender address `inquiry@corn-comp.com` and the existing Worker submission behavior.

## 6. Asset policy

Use assets in this order:

1. real images already present in the site media library;
2. real product and application images extracted from the supplied Corncomp catalogue;
3. the supplied original certificate images and PDFs;
4. generated decorative scene material only when no suitable real asset exists.

Product cutouts may be placed on restrained environmental green or paper-texture backgrounds, but the product's color, construction, proportions, and material must remain unchanged. Generated imagery must never be presented as a real product, factory, certificate, test, or customer deployment.

Create a central image manifest that records asset source, intended use, aspect ratio, focal treatment, localized alt text, and any evidence restrictions. Components consume this manifest instead of hard-coding repeated paths.

Required images produce a build or test failure when missing. Optional image regions render nothing when no valid asset is assigned; they never render a broken-image placeholder.

## 7. Certificate evidence rules

The main gallery includes current documents owned by Ningbo Corncomp Tech Co., Ltd.:

- ISO 9001:2015, certificate `01526Q60104R001`, valid until 27 April 2029;
- FSC Chain of Custody, certificate `RINA-COC-001953`, valid until 8 September 2027;
- BPI Product Certificate `10529571-1`, printed paper straws up to 352 g/m², valid until 30 September 2027;
- BRCGS Packaging Materials, certificate `CN24/00006923`, valid until 5 August 2027.

Supplier or affiliated-manufacturer DIN documents remain separate and name the actual holder. Expired DIN evidence is excluded from the current gallery. Any conflict between a supplied original document and migrated website copy must be resolved in favor of the original document before publication.

## 8. Components and data flow

Implement a small reusable component set:

- media-aware page hero;
- split image-and-copy section;
- product, guide, and blog card grid;
- certificate gallery and certificate card;
- Resources dropdown navigation;
- responsive image helper backed by the central image manifest.

Existing architecture records continue to define routes and localized content. Page templates select a composition based on page family, then resolve the appropriate media from the manifest. Shared components own layout and responsive behavior; page data owns titles, copy, links, media assignments, and evidence metadata.

No new CMS, runtime database, client-side framework, or image service is required.

## 9. Image delivery and accessibility

- Generate suitable WebP or AVIF derivatives and responsive dimensions from source assets.
- Prioritize the first meaningful image and lazy-load below-the-fold images.
- Reserve image dimensions to avoid layout shift.
- Keep certificate originals readable through enlarged previews or links where appropriate.
- Write accurate, natural alt text in each language without keyword stuffing.
- Decorative backgrounds receive empty alt text.
- Preserve keyboard access and visible focus states for navigation, cards, menus, and document links.

## 10. Multilingual behavior

English, French, Spanish, and Arabic share page templates and media assignments. Localized data supplies headings, captions, controls, alt text, and links. Arabic uses RTL layout while preserving logical reading order and unmirrored imagery.

If localized text is missing, the build must expose the gap through existing localization validation rather than silently publishing mixed-language primary content. Routes, canonical URLs, hreflang entries, and language archive links remain stable.

## 11. Validation and release

Before preview deployment:

- build the entire static site;
- run existing site and Worker tests;
- test the Resources dropdown on desktop and mobile;
- verify representative pages for every page family in all four languages;
- verify all assigned asset paths, dimensions, alt behavior, and absence of broken images;
- verify responsive layouts at desktop and mobile widths;
- verify canonical, hreflang, sitemap, robots, structured data, and GA4 output;
- submit invalid and valid inquiry test payloads and confirm expected behavior;
- visually inspect certificate holder, scope, number, and validity against the source documents.

Deploy only to a reviewable preview first. Record the preview URL, commit, test totals, and the fact that production remains untouched. Production deployment requires explicit user approval after preview review, followed by live read-after-write checks and a recorded rollback version.

## 12. Out of scope

- cart, checkout, pricing engine, customer accounts, or order management;
- replacing verified product or certificate evidence with generated content;
- changing established URLs solely for visual reasons;
- rewriting all SEO copy when layout and media changes are sufficient;
- unrelated refactoring outside the affected templates, components, navigation, media data, and tests.
