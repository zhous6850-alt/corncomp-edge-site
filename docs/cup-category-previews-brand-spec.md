# Three cup-category previews

User requested Soup Cups, Ice Cream Cups and Paper Cups previews on 2026-10-17. Extension of the approved salad-bowl design, preview deployment only. Existing product/group routes and production templates remain untouched.

Design: shared Corncomp logo, fixed navigation and footer; existing brand font; forest #1c3927, muted #617065, paper inherited, sage #edf1e7, hairline #dce3da. Square surfaces, 8px rhythm, no new dependencies or motion. Variance 4, motion 1, density 6, asset dependence 9, brand fidelity 9. No hero image; real product assets appear once per page. Preserve approved forest backgrounds with ResponsiveMedia and contain fit.

Soup cups: three cup series then three lid series. Ice cream: two cup series then one lid series; single accessory uses a horizontal composition rather than an isolated tiny card. Paper cups: single/double/ripple wall sections followed by lids and sleeves. All products from current inventory and canonical URLs; no changes to images, specifications or product claims. Counts computed from the displayed lists, described as series rather than SKUs/sizes. Existing document and fit confirmation caveats retained in expandable ordering guide.

One dynamic Astro preview route supplies three pages. Cups & Bowls preview entry cards link all four preview category pages. Product detail links remain current pages. Existing salad-bowl preview unchanged. Revert only the new preview route/data and the three preview card hrefs to roll back.

Verification: category grouping regression asserts every current product appears exactly once and accessories follow the cup sections. Full site build, suite and live preview verification before handoff.
