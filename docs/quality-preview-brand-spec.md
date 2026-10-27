# Quality page preview

Approved scope: a preview only, preserving the formal quality route and all certificate records.

Design read: restrained, evidence-led B2B quality page; redesign-preserve.
Variance 5, motion 2, density 5, asset dependence 8, brand fidelity 10.
Keep existing forest green #1c3927, sage #718466, ivory site background, inherited sans-serif typography, 8px spacing rhythm and 3px buttons.
Keep the shared real Corncomp header/footer logo unchanged.

Assets: four original certificate images from site/src/data/certificates.mjs; two original supply-chain PDFs from that same file. The hero replaces the facility photograph with four complete certificate images on a sage background, staggered in two columns.
No image generation, new claims, certificate cropping, or invented quality-control photographs. Hero images intentionally repeat in the detailed certificate section.
The four Corncomp-held certificate thumbnails link to original full-resolution images, enhanced with a native dialog, zoom and keyboard dismissal.
Supplier documents show clear 2000px first-page certificate images in a zoomable dialog, without original-file links. The two original supplier PDFs stay in local source files but are excluded from asset publication via public/.assetsignore. Production remains unchanged until a production deployment is approved; future promotion must remove old PDF links from localized quality pages too.
Document dates describe the displayed records, not independently verified live status.
BPI remains explicitly product-scoped. Other companies' material certificates retain their actual holders.

References researched before approval:
- https://www.huhtamaki.com/en-gb/fiber-packaging/sustainability/certificates-and-awards/ (separate certification, compostability and food-safety topics)
- https://www.biopak.com/uk/sustainability-report-jan-dec-24/responsible-supply-chain (explain the role of each certification)

Protected contracts: /quality/ canonical, existing navigation and logo, certificate numbers/scopes/dates, source PDFs, contact parameters, organization identity and breadcrumb schema.
Preview route: /design-preview/quality/.
Verification: generated output test, full site suite, preview deployment, rendered page and certificate dialog check. Do not deploy production without explicit approval.
