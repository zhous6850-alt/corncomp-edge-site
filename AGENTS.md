# Shared website source and releases

- Corncomp is edited by multiple tools, including Grok. Preserve their changes.
- Before editing and again before release, fetch explicit origin/seo/site-architecture-v2 and inspect new commits. Do not use origin/HEAD as the release baseline.
- Merge the latest shared changes before applying new work. Never replace a newer checkout with an older local tree or force-push over another editor.
- Both Wrangler configurations run scripts/release-preflight.mjs: remote changes must be ancestors of HEAD and the reviewed source must be committed and clean. Do not bypass this check.
- Build and finish image optimization, run appropriate site and Worker tests, verify the preview, then publish the approved built assets. Stop if a new remote commit appears.
- Push the integrated source back to the shared branch when the user authorizes pushing, using an ordinary fast-forward push.
- The stale seo-architecture-v2 worktree was retained for recovery; the reconciled source is on fix/reconcile-grok-multilingual-20261125. Use the latest shared branch rather than assuming any worktree is current.
