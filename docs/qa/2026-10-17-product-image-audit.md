# Product image cleanup — preview only

Preview version: `5baba785-dd18-43c1-847a-e8b3d89db557`.

All 95 canonical product-series primary images were reviewed in seven labelled contact sheets. Final asset provenance and SHA-256 values are recorded in the adjacent JSON manifest.

- 77 images restored from original embedded catalogue objects, not printed-page screenshots. Original alpha was retained while selecting complete objects and compositing onto white.
- 15 reference-based AI restorations: nine straw images, three low-resolution soup lids, two folding food boxes, and one kraft open wrap cup. Generated restoration is not independent evidence of dimensions, material performance, certification or exact microscopic texture.
- Three existing originals retained: round/oval paper plates and the waste-bag application photograph. Retaining these does not imply native high-resolution photography; source resolution remains a limitation.
- All 95 final image contents have distinct SHA-256 values. No SKU, specification, routing, category, or page text changed.

The three user-reported examples use complete original catalogue objects:

| Product | Original embedded source | Result |
| --- | --- | --- |
| White cardboard bowl | physical PDF page 4, image 4 | specifications and certificate marks excluded |
| Hot dog tray | physical PDF page 10, image 0 | both ends retained |
| Cardboard cutlery | physical PDF page 13, image 1 | complete spoon and fork retained |

## Verification

- Frontend tests: 177 passed, 0 failed.
- Inquiry tests: 17 passed, 0 failed; no test email sent.
- Build: 889 pages, successful.
- Asset audit: 95 decodable files, 95 distinct contents, documented provenance.
- Remote verification: all 95 preview assets HTTP 200 and identical to reviewed local SHA-256 values.
- Browser: the reported bowl, tray and cutlery pages displayed complete images with `object-fit: contain` at the current mobile-sized viewport.
- Production was not deployed during this cleanup.

## Reproduction order

1. `node scripts/audit-product-images.mjs`
2. Run `scripts/export-product-image-sources.py` with bundled Python.
3. Run `scripts/restore-product-images.py`.
4. Run `scripts/apply-reviewed-straw-images.py`, then the same script with argument `tmp/product-image-review/extra-retouching.json`.
5. Run `scripts/product-image-contact-sheets.py` and visually review every output.
6. Run `scripts/verify-product-image-restoration.py`.

The temporary retouching manifests identify the locally retained generated source files. Do not run the older printed-page crop generator after restoration without reapplying this sequence: it recreates the original faulty crops. The scripts retain original retouched-input backups in `tmp/product-image-review/straw-original-backups`.
