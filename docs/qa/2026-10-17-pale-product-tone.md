# Pale product image display adjustment

Preview only: `1032d188-d566-4caa-9f19-938248075cd3`.

35 explicitly selected white or translucent product photographs now receive a mild, monotonic sRGB tone curve through the shared ResponsiveMedia component. The SVG filter is defined once per page. Black maps to black, pure white maps to pure white, and light-gray folds and shadows become slightly darker. No source pixels, geometry, file paths, dimensions or product data were changed. Kraft/dark products, lifestyle photography and logos are not selected.

Selection and curve: `site/src/data/product-image-tone.mjs`.

Verification:

- Regression test first failed for the missing tone mapping, then passed.
- Complete frontend suite: 178 passed, 0 failed.
- Production build: 889 pages, successful.
- Browser verified the reported wire-handle white food box, image loaded with `url("#corncomp-product-tone")` and the expected curve.
- Screenshot: `C:/Users/Sam/Documents/Codex/corncomp-pale-product-tone-20261017.png`.
- Production was not deployed.
