---
title: "Architecture"
description: "How the astro-content-hub Astro site is structured: layout, routing, content collections, and key modules."
order: 1
---

This page explains how the `astro-content-hub` site is put together. It is a
reference for contributors working inside a hub repo. Authoring content (rather
than changing the site) is covered in
[Authoring](./authoring.md); syncing content from external
repos is covered in [Content sync](./content-sync.md).

## Tech stack

- **Astro 7** with `output: 'static'`. The whole site is prerendered to `dist/`.
- **TypeScript** in `strict` mode. No `any` without reason.
- **No UI framework.** Components are `.astro` files.
- **Styling:** one global stylesheet (`src/styles/global.css`) built on CSS
  custom properties, plus small scoped `<style>` blocks where needed. No
  Tailwind, no CSS-in-JS.
- **Markdown:** Shiki with the `css-variables` theme.
- **Node 22** (matches the deploy workflow). Use `npm`.

## Directory layout

```
astro-content-hub/            <- the hub (Astro site) at the repo root
├── astro.config.mjs          <- set `site` to your domain
├── src/
│   ├── components/           <- Layout, Nav, Footer, DocsLayout, PostCard, LocaleSwitcher
│   ├── content/              <- markdown collections (posts + docs)
│   ├── content.config.ts     <- collection schemas + glob loaders
│   ├── lib/                  <- i18n.ts, content.ts, docs.ts, remark-rewrite-links.mjs
│   ├── pages/                <- file-based routes (+ zh/ mirror)
│   └── styles/global.css
├── public/                   <- favicon, CNAME
├── .github/workflows/        <- deploy.yml (GitHub Pages + Cloudflare Pages)
├── examples/                 <- sample external repos that sync INTO the hub
└── docs/                     <- this documentation (synced to the hub)
```

## Routing

Routes are file-based under `src/pages/`:

- `/` — landing page (`index.astro`).
- `/posts`, `/posts/[...slug]` — blog listing + catch-all article route.
- `/<product>` — product landing page, served **dynamically** from the
  `products` array in `src/lib/i18n.ts`.
- `/<product>/docs`, `/<product>/docs/[...slug]` — docs index + catch-all.
- The `zh` mirror lives under `src/pages/zh/`.

Because product pages are data-driven, **you do not create per-product route
files.** Add an entry to `products` and the routes + docs collections are
generated automatically.

## Layout composition

- `Layout.astro` owns the document shell (`<html>/<head>/<body>`, fonts, meta,
  OpenGraph). Every page composes it — never hand-write a second document
  shell.
- `Nav.astro` (sticky header) and `Footer.astro` are composed inside `Layout`.
- `DocsLayout.astro` is a content-region layout: it composes `Layout` + `Nav` +
  `Footer` and adds a sidebar + `.prose` content area.

## Content collections

Defined in `src/content.config.ts` with [zod](https://zod.dev/) schemas:

- `posts<Locale>` — `src/content/posts/<locale>/**/*.{md,mdx,html}`. Schema:
  `title`, `date`, `description`, `tags`, `author?`, `source?`, `draft?`.
  Nested dirs are part of the slug.
- `<product>Docs<Locale>` — `src/content/docs/<product>/<locale>/**/*.md`,
  auto-generated per product in the `products` array. Schema: `title`,
  `description?`, `order` (controls sidebar sort; `index` is always first).

Markdown is rendered via `render(entry)` from `astro:content`; pages pass
`<Content />` into a `.prose` container so shared typography applies.

## Key modules in `src/lib/`

| File | Responsibility |
|------|----------------|
| `i18n.ts` | Single source of truth: `locales`, `defaultLocale`, `t` (UI strings), `home` (landing copy), `products`, and path/locale helpers. |
| `content.ts` | Localized path generation + fallback render helpers (docs + posts). |
| `docs.ts` | `buildNav` — sidebar construction (index → base path, sort by `order`). |
| `remark-rewrite-links.mjs` | Rewrites doc links so `docs/<product>/<locale>/` resolves to `/<product>/docs`. |

## Build & deploy

- `npm run dev` — local dev server.
- `npm run build` — runs `astro check` (type check) then builds to `dist/`.
- `.github/workflows/deploy.yml` is triggered **manually** (`workflow_dispatch`):
  it builds, then deploys `dist/` to GitHub Pages and Cloudflare Pages. It does
  not run automatically on push to `main`. See
  [Deployment](./deployment.md).

## Conventions

- Keep components small and composable; prefer props over globals.
- Use CSS custom properties from `global.css` instead of hard-coded values.
- Prefer relative imports for app code; `@/*` maps to `src/*`.
- Keep `<head>` concerns in `Layout.astro`; pages must not duplicate meta tags.
- All committed artifacts are in **English** (source comments, code, docs),
  except locale-specific content.
