# Corncomp SEO Architecture V2

## Goal

Rebuild the English Corncomp information architecture around products, custom packaging, applications, resources, trust, and one contextual RFQ flow while preserving the existing non-English routes.

## Tasks

1. Add a tested English content manifest that classifies every English-labelled product record as canonical or duplicate, assigns canonical products to a nested product route, and exposes the new group/category/application/resource routes.
2. Generate the new pages, navigation, breadcrumbs, metadata, structured data, sitemap entries, and responsive templates from that manifest.
3. Add complete one-hop Worker redirects from retired English URLs and duplicate French-root product aliases while preserving query strings.
4. Extend the inquiry form and Resend payload with source path, category, product name, and SKU context.
5. Build, test, visually inspect representative desktop/mobile pages, and deploy only to the workers.dev preview for user acceptance.

## Constraints

- Production domain is corn-comp.com.
- English only in this phase; French, Spanish, and Arabic routes remain unchanged.
- Preserve the Corncomp logo, green palette, real product imagery, verified specifications, and certification boundaries.
- Do not publish unsupported Paper Bags, Compostable Paper Cups, Compostable Waste Bags, or Soup Bowls pages.
- No shopping cart, payment, accounts, or order tracking.
- Use natural topic coverage; no exact-match keyword stuffing or hidden text.
- Production cutover is outside this implementation until preview acceptance.
