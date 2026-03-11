---
name: github-pages-maintenance
description: 'Replace a GitHub Pages homepage with a maintenance page while keeping custom domain routing intact. Use for temporary site shutdowns, maintenance mode rollouts, rollback planning, and verification for www.qilitrading.com or similar static sites.'
argument-hint: 'Describe the domain, repo branch, and whether you want a minimal or branded maintenance page.'
user-invocable: true
---

# GitHub Pages Maintenance

## What This Skill Does

Switches a GitHub Pages site into maintenance mode by replacing the published homepage instead of disabling Pages. This keeps the custom domain and DNS mapping live, avoids GitHub 404 pages, and makes rollback straightforward through git history.

## When To Use

- The site should stay reachable, but the main content should be hidden temporarily.
- The repository is deployed with GitHub Pages from a branch or repository root.
- You want a reversible change that can be restored by pushing the real homepage back.

## Procedure

1. Confirm the Pages source branch and whether a `CNAME` file is already present.
2. Search for domain-specific settings such as custom-domain references, canonical URLs, or SEO tags.
3. Replace the published homepage entry point, usually `index.html`, with a standalone maintenance page.
4. Preserve `CNAME` and avoid deleting Pages configuration.
5. Add `meta name="robots" content="noindex, nofollow, noarchive"` to reduce indexing impact while the maintenance page is live.
6. Keep the maintenance page self-contained so it does not depend on the disabled site scripts or shared components.
7. Review the git diff to ensure only the intended homepage and support files changed.
8. Push the change to the deployment branch.
9. Verify the live domain loads the maintenance message after Pages finishes redeploying.

## Decision Points

- If the site uses a custom domain, keep the existing `CNAME` file unchanged.
- If the maintenance page must preserve brand tone, use a simple branded layout with inline CSS.
- If SEO preservation is critical, keep the page temporary, add `noindex`, and restore the original homepage as soon as maintenance ends.
- If the site deploys from a non-default branch, push there instead of `main`.

## Completion Checks

- The live homepage returns a maintenance message instead of the original content.
- The custom domain still resolves to the GitHub Pages site.
- No GitHub 404 page appears.
- Rollback only requires restoring the original homepage content and pushing again.

## Notes

- GitHub Pages cannot return an HTTP 503 from a static repository-only deployment, so the maintenance mode is content-based rather than status-code-based.
- Keep the change narrowly scoped to the published homepage unless other entry points must also be hidden.