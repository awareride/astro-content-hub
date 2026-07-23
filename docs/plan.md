# Plan: Abstract `awareride.github.io` into the `astro-content-hub` template

> Status: **Discussion / planning.** This file is the agreed plan. No source files
> in this repo have been edited yet. Implementation happens in small, reviewable
> steps after the open questions below are answered.

## Why this template exists

The original `awareride.github.io` is not just a site — it is a **content-hub
system**:

- A **hub** (Astro 7 static site) aggregates content from **many external repos**.
- External repos author `posts/` and `docs/` in a locale layout; a GitHub Action
  validates and syncs them into the hub via a **pull request** (human review
  before content ships).
- i18n (en default + zh) with **per-page fallback** so a missing translation
  never 404s.
- The hub builds and **auto-deploys for free** to GitHub Pages + Cloudflare Pages.

The template's headline value = **create a hub + content-sync system fast and
easily, with cheap/free auto-deploy.** i18n is a supporting feature, not the
headline.

## Target layout (this repo becomes the template)

```
astro-content-hub/                 <- the template repo (this directory)
├── README.md                      <- template overview + quick start
├── astro.config.mjs               <- the hub (Astro 7) at ROOT, deploys to GH Pages
├── package.json                   <- neutral metadata (site still runnable)
├── src/                           <- the aggregation site (Astro 7)
│   ├── components/                <- Layout/Nav/Footer/DocsLayout/PostCard/LocaleSwitcher
│   ├── lib/                       <- i18n.ts, content.ts, docs.ts, remark-rewrite-links.mjs
│   ├── pages/                     <- landing (+zh), posts (+zh), <product>/docs (+zh)
│   ├── content.config.ts          <- products = ['vite','astro','json-server']
│   └── styles/global.css
├── src/content/                   <- sample posts + docs (en/zh) for the 3 products
├── public/                        <- generic favicon, CNAME=example.com
├── .github/workflows/deploy.yml   <- NEUTRALIZED (GH Pages + CF Pages, placeholders)
├── examples/                      <- SAMPLE external repos that sync INTO the hub
│   ├── my-posts/                  <- one posts example repo (en/zh)
│   │   ├── README.md              <- "author here → Action opens a PR into the hub"
│   │   ├── posts/<locale>/*.md    <- 1 posts example (en/zh)
│   │   ├── sync-delete.list       <- opt-in deletion manifest (example)
│   │   ├── .github/workflows/     <- sync-posts.yml (placeholder)
│   │   └── skills/site-content-sync/
│   │       ├── SKILL.md           <- generalized from awareride-content-sync
│   │       ├── scripts/validate.mjs
│   │       ├── scripts/apply-delete-list.mjs
│   │       └── templates/sync-{posts,docs}.yml
│   ├── vite-docs/                 <- vite docs example repo (en/zh)
│   │   ├── docs/<locale>/*.md     <- vite docs (index, getting-started, +1)
│   │   ├── .github/workflows/     <- sync-docs.yml (PRODUCT=vite)
│   │   └── skills/site-content-sync/  (same skill as above)
│   ├── astro-docs/                <- astro docs example repo (en/zh)
│   │   ├── docs/<locale>/*.md     <- astro docs (index, getting-started, +1)
│   │   └── .github/workflows/     <- sync-docs.yml (PRODUCT=astro)
│   └── json-server-docs/          <- json-server docs example repo (en/zh)
│       ├── docs/<locale>/*.md     <- json-server docs (index, getting-started, +1)
│       └── .github/workflows/     <- sync-docs.yml (PRODUCT=json-server)
├── skills/site-content/            <- per-hub authoring skill (generalized)
└── .agents/plan/plan.md           <- this file
```

> **Decision (owner review):** The hub site stays **at the repo root and must
> keep building + self-deploying to GitHub Pages directly** — it is a working
> site, not just a folder. The external-repo example moves to `examples/` (not
> `content-source/` at root). This means:
>
> - The Astro site remains at the current flat root (`astro.config.mjs`,
>   `src/`, `public/`, `.github/workflows/deploy.yml`). Relative imports and the
>   remark plugin's `ROOT` resolution (`resolve(__dirname, '..', '..')` from
>   `src/lib/`) keep working unchanged.
> - `examples/` holds **several sample external repos**, each demonstrating how a
>   third party would author content and sync it into the hub. Illustrative only
>   — never built by the hub, never deployed:
>   - `examples/my-posts/` — a posts-only repo (1 posts example, en/zh).
>   - `examples/vite-docs/`, `examples/astro-docs/`, `examples/json-server-docs/` —
>     one docs repo per sample product (each sets `PRODUCT` in its sync workflow).
>
> The `examples/` folder mirrors the real deploy model (separate source repos
> vs. the hub repo) but lives inside the template so adopters can copy any one
> as a starting point for their own content repo.

## Scope of changes

### 1. Brand neutralization (hub stays runnable)
- `astro.config.mjs`: `site` → `https://example.com` with a comment to set your domain.
  Keep `output: 'static'` and the Sätteri/remark pipeline so the site still
  builds and deploys to GitHub Pages directly.
- `src/lib/i18n.ts`: add `export const siteName = 'SiteName'`; replace hardcoded
  `'AwareRide'` in `Layout.astro`, `Nav.astro`, `Footer.astro` with `siteName`.
  Neutralize `footerTagline`. Add a `products` array
  (`[{slug,name,github,badges}]` for vite/astro/json-server) used by the landing page.
- `package.json`: name/description/homepage/repository/author/keywords → neutral.
  Keep `scripts` (`dev`/`build`/`preview`) so the site runs locally and builds.
- `public/CNAME` → `example.com` (commented). Keep a generic `favicon.ico`.

### 2. Landing page (original, desensitized sample copy)
- Write **original** landing copy (no third-party text copied) in `home.en` /
  `home.zh` — reads like a real product site, bilingual. Covers hero, "why this
  starter", content-collections / localized / styling cards, a Projects section
  rendered from the `products` config, principles, and CTA.
- `src/pages/index.astro` + `zh/index.astro`: Projects section iterates `products`
  (cards with badges, "Learn More" → `/<slug>`, GitHub link) instead of the
  hardcoded packscope card.

### 3. Sample products (real, popular GitHub OSS — accurate descriptions)
- `vite` (`vitejs/vite`), `astro` (`withastro/astro`), `json-server`
  (`typicode/json-server`).
- Each gets `src/pages/<slug>/index.astro` + `<slug>/docs/index.astro` +
  `<slug>/docs/[...slug].astro` (+ `zh/` mirrors). Driven by `content.config.ts`
  `products` array; docs content uses **real, accurate** facts from each project's
  official description (not invented).
- Remove the old `packscope` pages + `packscopeDocs` content.

### 4. Content collections & i18n machinery (mostly copy + generalize)
- `hub/src/content.config.ts`: `products = ['vite','astro','json-server']`; keep
  posts-per-locale.
- `hub/src/lib/content.ts`, `docs.ts`, `remark-rewrite-links.mjs`: already
  product-agnostic; copy as-is. The remark plugin maps `docs/<product>/<locale>/`
  → `/<product>/docs` which works once `products` is set.

### 5. Mock content (so it looks complete)
- `hub/src/content/posts/{en,zh}/`: 3–4 neutral posts (welcome, "why Astro",
  "writing content", a localized sample) with dates/tags/descriptions.
- `hub/src/content/docs/<slug>/{en,zh}/`: `index.md`, `getting-started.md`, +1
  topic each. `zh` may be a fallback demo to showcase i18n.

### 6. `examples/` — sample external repos that sync INTO the hub (important)

> **Decision (owner review):** the external-repo examples live in `examples/`,
> **split into one repo per concern**: `examples/my-posts/` (posts) and
> `examples/vite-docs/`, `examples/astro-docs/`, `examples/json-server-docs/`
> (docs, one per sample product). This mirrors how real source repos are
> organized (a repo contributes either posts or one product's docs), and makes
> each example a self-contained copy-and-go starter.

- Generalize `awareride-content-sync/` → `examples/my-posts/skills/site-content-sync/`
  (the canonical skill copy; `vite-docs`/`astro-docs`/`json-server-docs` reuse the
  same skill layout under their own `skills/`): → `examples/.agents/skills/site-content-sync/`:
  - `SKILL.md`: replace "AwareRide" / repo names / `DOCS_CENTRAL_HUB_TOKEN` with
    placeholders (`<HUB_REPO>`, `<HUB_TOKEN_SECRET>`); keep the layout, frontmatter
    schemas, slug contract, fallback rules, delete-list rules.
  - `scripts/validate.mjs`, `apply-delete-list.mjs`: copy verbatim (pure stdlib,
    no brand strings to change).
  - `templates/sync-posts.yml`, `sync-docs.yml`: placeholder hub repo + token secret;
    keep PR-based sync + validation + opt-in deletion. The docs template sets
    `PRODUCT` per repo (vite / astro / json-server).
- `examples/my-posts/posts/<locale>/`: **1 posts example** (en/zh) demonstrating
  the post authoring layout and slug contract. Includes `sync-delete.list` and a
  `README.md` describing the author → PR → build → deploy flow.
- `examples/vite-docs/docs/<locale>/`, `examples/astro-docs/docs/<locale>/`,
  `examples/json-server-docs/docs/<locale>/`: docs for **vite**, **astro**, and
  **json-server** respectively (each: `index.md`, `getting-started.md`, +1 topic,
  en/zh). These mirror the hub's `src/content/docs/<product>/<locale>/` layout
  exactly (the product segment is added by sync from `PRODUCT`, so the example
  keeps `docs/<locale>/`). Each repo's `sync-docs.yml` sets its `PRODUCT`.
- `examples/my-posts/sync-delete.list`: opt-in deletion manifest example.
- `examples/my-posts/README.md`: "author here → push to main → Action opens a PR into the
  hub → merged content builds & deploys free."

> The `awareride-content-sync` skill is a **first-class deliverable** of this
> template — it is what makes the content-hub model reusable. It must remain
> correct and well-documented (validation, slug contract, fallback, delete-list).

### 7. Docs / agent files
- Root `README.md`: what the template is, the hub + `examples/` source-repo model,
  quick start (deploy hub, copy an `examples/*` repo, set one secret), how to add
  a product, how to add a locale, free-deploy notes, and a note that sample content
  is replaceable.
- `AGENTS.md`: keep architecture + git/deploy-safety rules; neutralize product
  names/URLs. (Covers both the hub at root and `examples/`.)
- `skills/awareride-content/` → generalize to `skills/site-content` (documents
  authoring content inside the hub itself).

### 8. Deploy config (free auto-deploy feature)
- Neutralized `.github/workflows/deploy.yml` (at root): GitHub Pages + Cloudflare Pages
  jobs with **placeholder** project name and secret names. Committed as **template
  config only** — not wired to any live target. No push to `main`, no secret edits.

## Build / verification
1. `npm install` (at repo root — the hub is at root; requires your OK,
   dependency install is an authorized action).
2. `npm run build` (astro check + build) — must pass with zero errors; the site
   must still be deployable to GitHub Pages as-is.
3. `node examples/my-posts/skills/site-content-sync/scripts/validate.mjs` —
   must pass (proves the sync validation works, no deps needed).
4. Spot-check `dist/` for `/`, `/posts`, `/vite/docs`, `/astro/docs`,
   `/json-server/docs`, and zh mirrors; confirm `.md` links rewrite correctly.

## Decisions (owner review — resolved)
1. **Hub stays at repo root and must run + self-deploy to GitHub Pages directly.**
   No `hub/` subfolder; keep the site a working, deployable Astro project.
2. **External-repo examples live in `examples/`** as separate repos:
   `my-posts/` (posts) and `vite-docs/` / `astro-docs/` / `json-server-docs/`
   (one docs repo per sample product).
3. **Example content uses vite/astro/json-server** — docs for all 3 products (as
   separate `*-docs` repos) + 1 posts example (in `my-posts/`).
4. **The `awareride-content-sync` → `site-content-sync` skill is important** and
   a first-class deliverable; keep it accurate and well-documented.

## Open questions (remaining)
1. `npm install` during verification — OK? (authorized dependency action)
2. Neutralized `deploy.yml` committed as template config — OK (no live-target changes)?
3. Anything else to **keep** product-specific (e.g. keep packscope as one more
   sample, or keep the `awareride-content-sync` name)? Default: generalize/remove.
4. Should `examples/` be excluded from the hub's own build/deploy (e.g. a
   `.gitignore`/path guard), or is it fine that it simply isn't imported? Default:
   it is never imported by Astro, so no guard needed — confirm.

## Out of scope (no changes without separate authorization)
- Editing any live deploy target, secrets, or `main` branch of any repo.
- Pushing to remote.
- Adding/removing npm dependencies beyond what the template already uses.
