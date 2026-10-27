# Homepage product catalogue

Approved scope: replace the homepage's three broad product cards with six visual ranges. Keep the hero, customer marquee, inner-page routes, inquiry behavior, analytics and SEO unchanged. Preview first; production requires separate approval.

## Visual direction

Product-led directory for wholesale foodservice buyers. Preserve Corncomp's established identity: variance 3, motion 2, density 5, asset dependence 9, brand fidelity 9. Desktop uses three columns and two rows; mobile uses two columns. Only hover/focus image feedback, with reduced-motion support.

Use the existing Corncomp Sans fonts and palette in `site/src/styles/global.css`: deep green `#123823`, green `#2f6543`, paper `#fffdf8`, cream `#f0eadb`, line `#dfe5df`. Compact section heading, generous product area, thin borders, no new shadows or decorative icons.

## Assets

Logo: `site/public/media/corncomp-logo.png`. Product photos remain unchanged in `site/public/media/wp/`:

- Cups: `261--2026-07-25-100620.png`, `267--2026-07-25-101435.png`
- Bowls and soup cups: `73--2026-07-14-084149.png`, `86--2026-07-14-092210.png`
- Ice cream: `258--2026-07-25-100144.png`
- Food boxes: `164--2026-07-14-133106.png`
- Straws: `107--2026-07-14-101008.png`
- Tableware: `304--2026-07-27-100604.webp`, `254--2026-07-25-094945.png`

These existing catalogue/export photos remain on product pages and served as product-shape references for the approved AI-generated lifestyle category images. The homepage uses six full-bleed 4:3 scenes in `site/public/media/generated/home-lifestyle-v1/` (cups, bowls, icecream, boxes, straws, tableware). Original generated PNGs and full prompts are retained in `output/imagegen/home-lifestyle-v1/`; web assets are 1200 × 900 WebP conversions. These are illustrative scenes, not photographs of real customers or specification evidence. Straw references also include the user's black/white, pineapple-print and striped bendable straw photos. Category copy adds no certification, performance or sales-ranking claims.

Reference: BioPak's category-image navigation at https://www.biopak.com/au/ (reviewed 2026-10-16). Use its image-first browsing principle, not its images, certification claims, retail checkout or visual identity.

Approved palette revision: bowls use a cool blue-gray office lunch scene, food boxes a terracotta urban takeaway scene, and tableware a blue-white seaside picnic. These three replacements are versioned in `home-lifestyle-v2`; cups, ice cream and straws retain their v1 assets. Original v1 images remain available for rollback. No layout, category destination or copy changes accompany this revision.

## Verification

Approved followup: a four-card sourcing section follows the catalogue and precedes the factory, with localized MOQ/customization, application, document-scope and delivery/packing questions plus a contact link in all six languages. No numerical MOQ, certification or delivery guarantees are added. Navigation stays visible: normal pages use sticky positioning; the homepage overlay is fixed, transparent at the top and deep green after scrolling 32px. Mobile menus remain scrollable and keyboard-dismissable. `home-sourcing.test.mjs` covers section placement and scroll-state initialization/reset.

Built-page test covers all six languages, six range cards, both bowl destinations, both tableware destinations, all-products/custom-packaging links and image existence. Run the complete frontend and inquiry suites. Check desktop and mobile compositions without horizontal overflow. Revert `HomePage.astro`'s catalogue component substitution to restore the previous section; no data migration is involved.
