# Footer redesign preview

Reference: user-supplied Safewell footer screenshot. Borrow the four-column information hierarchy, restrained type, clear contact labels and separated copyright row. Do not copy its identity, industrial claims, certifications, legal links or service promises.

Scope: shared Footer.astro across all six languages, preview only. Preserve every existing destination, company contact, social account, analytics settings control and floating inquiry action.

Design read: B2B manufacturer directory, redesign-preserve; variance 3, motion 1, density 4, asset dependence 2, brand fidelity 9. Existing Corncomp Sans, deep green #123823, white headings, muted green-white text, no cards, shadows or new decoration.

Four groups: authentic Corncomp logo plus brief source-supported company introduction; quick links; products and services; contact details with email first, address, phone and WhatsApp. Desktop four columns, tablet two, phone brand/contact full width with two compact navigation columns.

Real logo: site/public/media/corncomp-logo.png. Product imagery is unchanged elsewhere on each page. No new image generation required for this text/navigation section.

No invented privacy/terms URLs. No copied capability slogans or fabricated service levels. The existing analytics preference button and copyright remain unchanged.

Approved addition: three compact support topics between navigation and copyright: Custom printing; Products & specifications; Ordering support. Fine horizontal/vertical dividers, no cards or icons, desktop three columns and phone stacked. All six languages use concrete product, print and ordering information rather than copied industrial claims.

Approved addition: BRCGS, FSC, ISO 9001 and BPI as plain text links beneath the company introduction. All link to the localized Quality documents section. Descriptive accessible labels and hover titles reuse the verified certificate scope, including BPI's printed-paper-straw limitation. No fabricated marks, universal certification claims or original PDF downloads.

Approved social icon preview: replace the four text labels with genuine Font Awesome Free 6.7.2 brand SVGs, locally stored under site/public/media/icons/. Source: https://github.com/FortAwesome/Font-Awesome/tree/6.x/svgs/brands. Icon license CC BY 4.0; original attribution/license comments retained inside each SVG. Four 44px circular fine-border targets, 20px light symbols, platform name in aria-label and native hover title, original account URLs unchanged. No new dependencies or external image requests.

Approved recipient correction: footer display and mailto use zhous6850@gmail.com, the RECIPIENT configured in worker/index.mjs. The separate inquiry@corn-comp.com SENDER is not a receiving mailbox. No changes to the inquiry backend or its sender address; preview only.

Synchronize the shared Contact panel and Organization structured-data email with the real receiving address as well, so public contact information does not conflict. Backend routing tests still confirm the distinct original sender and recipient without dispatching a live email.

Checks: footer navigation/contact semantics on homepage and contact page in six languages; full build/test suite; visual preview. Separate approval required for production.
