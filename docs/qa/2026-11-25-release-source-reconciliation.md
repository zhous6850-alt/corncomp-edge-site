# Release source reconciliation — 2026-11-25

Confirmed incident: the multilingual production deployment used local HEAD 1aec6f6 while origin/seo/site-architecture-v2 had advanced to a7167caa. The later upstream PR #3–#9 changes were therefore absent from that deployment. GitHub history is intact.

Recovery source:
- Preserve multilingual publication checkpoint: recovery/multilingual-20261125, commit 7099c5c.
- Integrate from latest upstream a7167caa in .worktrees/reconcile-20261125, branch fix/reconcile-grok-multilingual-20261125.
- The original .worktrees/seo-architecture-v2 directory is retained for recovery evidence. DO NOT deploy it as the latest source.

Preserve both sets of changes: upstream custom-cup sections and salad card, product FAQs, sharp-edge sourcing, metadata, compact navigation, styled 404 and retired-guide redirects; new shared-language custom/factory/FAQ templates and corrected article translations/images.

Before any subsequent release:
1. Fetch explicit origin/seo/site-architecture-v2. origin/HEAD points to an older migration branch and is not the release baseline.
2. Require git merge-base --is-ancestor origin/seo/site-architecture-v2 HEAD to succeed; stop if the remote advanced.
3. Reject unresolved merge markers/paths. Record the actual worktree, branch, HEAD and upstream hash with the build.
4. Finish the build AND image optimizer before testing. Run the full site and Worker suites, including both upstream regression tests and multilingual parity tests.
5. Deploy preview from the same built files; verify actual custom-cup tables, all four lid ordering answers, wrap logo/fit guidance, compare links, guide redirects and language identities.
6. Publish production only after user approval of the concrete preview. Verify production afterward. Do not silently substitute another checkout.

This reconciliation does not push to GitHub or change production automatically.

Verified recovery build and tests (resumed 2026-11-26):
- Final build completed 927 pages and image optimization.
- Site tests: 291 passed, 0 failed.
- Worker tests: 33 passed, 0 failed.
- Refetched explicit upstream: still a7167caa82769e5f4da5671d15675e6569f6e721.
- No unresolved merge paths remain.
