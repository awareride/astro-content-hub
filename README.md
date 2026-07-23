# astro-content-hub

A content hub template: aggregate documentation and blog posts from many
open-source repositories into one **localized, auto-deployed static site**.

Built with [Astro 7](https://astro.build/) (static output). Content ships
through **pull requests**, so nothing lands on `main` without review. The site
deploys for free to GitHub Pages and Cloudflare Pages.

## Why this template

- **Hub + content-sync model.** The hub site lives in this repo. External
  projects author `posts/` and `docs/` and sync them in via a GitHub Action
  that opens a PR. One hub, many source repos.
- **i18n with per-page fallback.** Default locale `en` (no URL prefix); `zh`
  lives under `/zh/...`. A missing translation renders the default-language
  body inside the localized shell — never a 404.
- **Free auto-deploy.** Static output publishes to GitHub Pages and
  Cloudflare Pages at no cost.

## Layout

```
astro-content-hub/        <- this repo (the hub, at the root)
├── astro.config.mjs      <- set `site` to your domain
├── src/                  <- the Astro site (components, lib, pages, content)
├── public/               <- favicon, CNAME
├── .github/workflows/    <- deploy.yml (GitHub Pages + Cloudflare Pages)
├── examples/             <- sample external repos that sync INTO the hub
│   ├── my-posts/         <- a posts example (1 post, en/zh)
│   ├── vite-docs/        <- vite docs example (PRODUCT=vite)
│   ├── astro-docs/       <- astro docs example (PRODUCT=astro)
│   └── json-server-docs/ <- json-server docs example (PRODUCT=json-server)
├── skills/site-content/  <- per-hub authoring skill
└── docs/                  <- this template's documentation (plan, architecture,
                          authoring, content-sync, deployment)
```

## Documentation

This repo's documentation renders **on this site** at
`/astro-content-hub/docs/...` (and `/zh/astro-content-hub/docs/...` for Chinese).
It lives in [`src/content/docs/astro-content-hub/<locale>/`](./src/content/docs/astro-content-hub)
and is registered as a product in `src/lib/i18n.ts`, so the routes and sidebar
are generated automatically (see [`skills/site-content`](./skills/site-content)).

The same content is also mirrored under [`docs/<locale>/`](./docs) and **synced
into the external content hub** (via `.github/workflows/sync-docs.yml`, using the
`awareride-content-sync` skill) as the `astro-content-hub` product. Pages:

- **Architecture** — the Astro site layout, routing, content collections, and
  key modules.
- **Authoring content** — write posts and docs directly in the hub (i18n, slug
  contract, fallback, adding a product/locale).
- **Content sync** — contribute content from a separate repository via the
  PR-based sync Action.
- **Deployment** — point the template at GitHub Pages and/or Cloudflare Pages.

The design plan is internal agent documentation, kept under
[`.agents/plan/plan.md`](./.agents/plan/plan.md) (not user-facing). Agent-facing
guidance for coding assistants lives in [`AGENTS.md`](./AGENTS.md) and the
`skills/` directory.

## Quick start

1. **Deploy the hub.** Fork/clone this repo, set `site` in `astro.config.mjs`
   to your domain, and enable the deploy workflow (`.github/workflows/deploy.yml`)
   to publish to GitHub Pages and Cloudflare Pages.
2. **Add a product (optional).** Edit `src/lib/i18n.ts` — add an entry to the
   `products` array. Routes and docs collections are generated automatically.
3. **Contribute content from an external repo.** Copy `examples/my-posts/`
   (posts) or `examples/vite-docs/` (docs) into your own repository, set the
   `<HUB_REPO>` / `<HUB_TOKEN_SECRET>` placeholders in its workflow, and push.
   A PR opens against the hub; when merged, the content builds and deploys.

## Sample content is replaceable

The posts and docs shipped here are **samples** (vite, astro, json-server) to
make the site look complete. Replace them with your own — delete the sample
files under `src/content/` and add yours.

## Adding a locale

Append to `locales` in `src/lib/i18n.ts` and translate the `t` / `home` strings.
Collection and route code is generic over the locale list, so no per-language
files are needed.

## License

Content and design are released under the MIT License unless otherwise noted.
