# Approved forest-green product backgrounds

Scope: 35 pale/white product main images on the preview Worker only. Production is unchanged.

Deployed preview version: `372d0e88-8f9c-40d3-aa8e-10075f2e127f`.

- The wire-handle white pail uses the exact user-approved deep-green sample, `exec-1c434483-092f-4734-8ec0-c12fa2e10e34.png`.
- The other 34 source photographs received reference-based background replacements using the image tool. Target background: muted forest green `#244936`. These are retouched visuals, not independent evidence of exact dimensions, certification or performance.
- All 35 final images were visually reviewed in `tmp/product-image-review/forest-final-01.jpg` through `03.jpg`: complete products retained, no added text or props, white/translucent products visibly separated from green.
- The earlier rejected SVG darkening filter was removed. The shared media component supplies a matching green letterbox background only for these 35 paths.
- Existing public asset paths and declared aspect ratios were retained; all other 60 product images remain unchanged. No product text, route, SKU or specification changed.
- Originals are recoverable from `tmp/product-image-review/before-forest-backgrounds/`. Generated source files are retained separately.
- Full source paths, final dimensions and SHA-256 digests are in the adjacent JSON manifest.

Verification: background selection regression test passed; complete frontend suite 178/178 passed; image normalization verified 35 unique assets with dark green corner pixels. Build succeeded with 889 pages. Browser confirmed the approved wire-handle pail loads with RGB(36,73,54) backdrop and no darkening filter. Remote verification checks all 95 assets against the current combined SHA-256 manifests.

Reapply with bundled Python: `scripts/apply-forest-product-images.py`. It uses `tmp/product-image-review/forest-backgrounds.json`; review outputs before deploying. Do not run older source restoration generators afterward without reapplying these approved replacements.
