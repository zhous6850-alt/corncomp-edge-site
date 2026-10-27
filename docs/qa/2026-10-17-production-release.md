# Production release 2026-10-17

User explicitly authorized production publication after reviewing the product directory, showroom photo, hidden waste-bag card, navigation logo and footer repair.

- Worker: corncomp-edge-site; config: wrangler.jsonc.
- Previous production version: 8cd3cdd9-ad0d-41e0-b881-7f213948dd8a (recorded via deployments list before publication).
- Published version: 1ff7a87b-73c1-4f17-a58a-953dc1e85a79.
- Routes: corn-comp.com/* and www.corn-comp.com/*.
- Build: 889 pages; frontend 177/177; inquiry unit tests 17/17.
- Pre-release correction: CC01TRAY6 top dimension 224 x 146 corrected to 224 x 140 from PDF physical page 10 / printed page 16; regression verified RED then GREEN, all new locale rows regenerated.
- Live HTTP 200: Chinese home, English/Chinese products, kraft-paper-tray product. Both directory pages show 23 cards. Live tray page includes corrected dimension.
- Live browser: showroom photo loaded; 23 category cards; header and footer use the same original-logo transparency/warm-grey filter. Screenshot: C:/Users/Sam/Documents/Codex/corncomp-production-release-20261017.png.
- No real inquiry was sent during this release verification. Existing authentication/secrets were not changed.
- Outstanding catalogue uncertainties remain listed in catalogue-unresolved.md; release testing does not certify every legacy numerical or certification claim.

Rollback target is the previous production version above; do not execute a rollback without an actual release failure or user direction.
