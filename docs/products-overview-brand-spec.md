# Product directory redesign

Approved in chat on 2026-10-17: compact hero, four category jumps, illustrated leaf-category directory, catalogue/custom/quote actions. Preview only.

Mode: Redesign - Preserve. Audience: wholesale foodservice buyers. Visual variance 4, motion 2, information density 6, asset dependence 9, brand fidelity 9. Stable catalogue grids help scanning; motion is hover feedback only. No new framework or dependencies.

Follow-up: user requested temporarily hiding the Compostable Waste Bags overview card to avoid an isolated fifth card. The overview now shows 23 leaf-category cards; category/product pages and the shared navigation remain unchanged in all languages.

Navigation logo trial: user approved removing the white rectangle while retaining both text lines, with muted warm-grey text instead of white. Generated edits were rejected for edge/identity quality and are not used. Header applies an SVG colour filter to the unchanged original bitmap: white becomes transparent, text uses #c9c6bc and green pixels are selected from SourceGraphic. A SourceAlpha bound prevents filter-region flood outside the bitmap. Footer asset and original file stay unchanged. Desktop/mobile image box dimensions remain as before. All 176 frontend tests pass after the change.

Preserve: shared fixed green header, logo, footer, all canonical routes, six languages including RTL, SEO titles/descriptions and alternates, inquiry form/Turnstile/analytics. H1 is shortened and WebPage schema name follows the visible heading. No new product claims or specifications. Rollback: restore the previous products branch in ArchitecturePage.astro.

Tokens: existing Corncomp Sans, deep green #123823, green #2f6543, paper #fffdf8, sage #dce6d8, line #dfe5df. 4px radius, 8px spacing rhythm, no new shadows. Light brand theme retained.

Assets: real logo site/public/media/corncomp-logo.png. User rejected reuse of homepage scenes and supplied 44877ea56375d540d9d9716b9863a3bb.jpg as a direct replacement. Product overview hero now uses only site/public/media/products-showroom-user-20261017.jpg, copied unchanged from that supplied file, in its full aspect ratio. Category images use existing actual product images from records.json and media.json, without generated replacements. Catalogue: site/public/media/wp/231-corncomp-catalogue.pdf.

Reference principles reviewed: BioPak (lifestyle plus product-category imagery), Vegware (direct access to specific ranges and catalogue), Huhtamaki (range grouping and functional explanations). References are not asset sources; no competitor images or claims copied.

Verification: failing built-output test before implementation, then all 24 unique leaf categories with existing image and localized destination in each of six languages; four jump destinations; PDF link. Complete frontend suite and manual layout review before preview delivery. Desktop uses four product columns, tablet three, mobile two. Mobile hero/support stack; Arabic uses logical borders and inherited RTL.

Verified: 175 frontend tests pass; 17 inquiry tests pass; 889 pages built. Manual desktop and 390px Chinese/Arabic checks show no horizontal overflow; anchor target top 124px clears header bottom 101px. Preview deployed as 05bed97d-3f3f-43b1-bba1-837b5800e05c. Live English preview shows 24 categories and both loaded hero images. Screenshot: C:/Users/Sam/Documents/Codex/corncomp-products-overview-20261017.png. Production unchanged. This page redesign does not close outstanding catalogue-specification audit items.
