---
title: "Deployment"
description: "Point the astro-content-hub template at GitHub Pages and/or Cloudflare Pages."
order: 4
---

The hub is a static Astro 7 site that deploys for free to **GitHub Pages** and
**Cloudflare Pages**. This page covers how to point the template at your own
infrastructure.

## Before you deploy

1. **Set your domain.** In `astro.config.mjs`, change `site` from
   `https://example.com` to your real domain. This value is used to build
   absolute URLs and `hreflang` alternates.
2. **Set the site name.** In `src/lib/i18n.ts`, change `siteName` from
   `SiteName` to your project's name. It appears in `<title>`, nav, and footer.
3. **Set the CNAME.** Replace `example.com` in `public/CNAME` with your domain
   (only needed for GitHub Pages custom domains).
4. **Replace sample content.** Delete the sample posts and docs under
   `src/content/` and add your own (see
   [Authoring](./authoring.md)).

## The deploy workflow

`.github/workflows/deploy.yml` is committed as **template config only** — it is
not wired to any live target. It is triggered **manually** via the Actions tab
(`workflow_dispatch`); it does **not** run automatically on push to `main`.

The workflow has three jobs:

1. **build** — checks out, runs `npm ci`, builds with `npm run build`, and
   uploads `dist/` as a Pages artifact.
2. **deploy-gh-pages** — deploys the artifact to GitHub Pages (requires Pages
   enabled on the repo).
3. **deploy-cf-pages** — deploys `dist/` to Cloudflare Pages via `wrangler`.

## Enable GitHub Pages

- In the repo **Settings → Pages**, set the source to "GitHub Actions".
- Run the workflow from the Actions tab ("Run workflow").
- The live URL is `https://<owner>.github.io/<repo>/` unless you've set a
  custom domain via `public/CNAME`.

## Enable Cloudflare Pages

1. Create the API token + account ID secrets in the repo
   (**Settings → Secrets and variables → Actions**):
   `CLOUDFLARE_API_TOKEN` (with Pages deploy permission) and
   `CLOUDFLARE_ACCOUNT_ID`.
2. In `deploy.yml`, replace `<CF_PROJECT>` with your Cloudflare Pages project
   name (in both the `project create` and `pages deploy` steps).
3. Run the workflow. The `wrangler pages project create` step is idempotent
   (`|| true`), so re-runs are safe.

## Node version

The workflow uses **Node 22** (`setup-node@v4`, `node-version: 22`), matching
the project's supported runtime. Use `npm`, not `pnpm`/`yarn`.

## Verification

```bash
npm run build   # must pass with 0 errors (astro check + build)
```

After a manual run, spot-check the deployed `dist/`:

```bash
ls dist/
ls dist/vite/docs/   # sample product docs
ls dist/zh/          # localized mirror
```
