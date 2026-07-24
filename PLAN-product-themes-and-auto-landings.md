# Plan: Per-Product Themes & Auto-Generated Default Landings

> Status: Approved. Captured before execution so the approach is reviewable.
> Two independent features that compose cleanly. Implementation proceeds in
> three reviewable commits (Feature 1, Feature 2 hub-side, Feature 2 sync-side).

## Goals

1. **Per-product themes.** A product may ship its own color theme (e.g. a
   "green music" product uses green). The theme applies consistently to the
   product landing page, the global header, the global footer, and every
   `/<product>/docs/...` subpage.
2. **Auto-generated default landings.** A product without a hand-written
   landing override can still get a rich landing page generated from a small,
   validated, structured Markdown file (a curated "README-like" source) instead
   of the current minimal hero+CTA.

Both features are additive and backward-compatible: products that opt out look
exactly as they do today.

---

## Feature 1 - Per-product themes

### Mechanism

The site already themes via CSS custom properties on `:root` (light) and
`:root[data-theme='dark']` (dark), loaded from `src/styles/theme.css` into the
single global stylesheet. `Nav`, `Footer`, `DocsLayout`, prose, and every
component already consume `var(--color-*)`, so re-branding tokens cascades
everywhere automatically.

We add a second, orthogonal axis: `data-product="<slug>"` on `<html>`, emitted
server-side by `Layout.astro` (no FOUC - the no-FOUC inline script only touches
`data-theme`). A per-product CSS file overrides the **same token names** under
`html[data-product="<slug>"]`, so the override cascades into the header, footer,
and docs automatically because they are all descendants of `<html>`.

### Specificity (why `html[...]`, not `:root[...]`)

| Selector | Specificity | Beats |
|---|---|---|
| `:root` (site light) | (0,1,0) | - |
| `:root[data-theme='dark']` (site dark) | (0,2,0) | site light |
| `html[data-product="x"]` (product light) | (0,1,1) | site light |
| `html[data-product="x"][data-theme='dark']` (product dark) | (0,2,1) | site dark + product light |

Using `html[...]` (not `:root[...]`) gives the product rules a +1 specificity
edge over the site rules in **both** light and dark mode, so product tokens win
without relying on source order. All four theme×product combinations resolve
correctly.

### Opt-in (file-based, per the approved decision)

Product pages always emit `data-product="<slug>"` (a stray attribute on a
product without a theme is harmless). A product opts into a theme by adding
`src/styles/product-themes/<slug>.css`. That file is registered by adding one
`@import` line to the barrel `src/styles/product-themes/index.css`, which is
imported once from `global.css`. Everything stays in the single global
stylesheet (per AGENTS.md's styling policy); no per-page inline styles.

> Adding a product theme = create `product-themes/<slug>.css` + add one
> `@import './<slug>.css';` line to `product-themes/index.css`. (Pure CSS
> cannot auto-glob, so the barrel line is the one manual step; it keeps all
> tokens in the global stylesheet.)

### Two supported depths (same mechanism)

- **Lightweight:** override only `--color-accent*`.
- **Full:** override surfaces, text, and accent for a distinct identity
  (mirrors the existing `src/styles/themes/openai.css` sample structure).

### Files touched

| File | Change |
|---|---|
| `src/components/Layout.astro` | Add `productSlug?: string` prop -> conditional `data-product` on `<html>` |
| `src/components/DocsLayout.astro` | Add `productSlug?` prop -> forward to `<Layout>` |
| `src/pages/[product]/index.astro` | `<Layout … productSlug={product.slug}>` |
| `src/pages/[locale]/[product]/index.astro` | same |
| `src/pages/[product]/docs/index.astro` | `<DocsLayout … productSlug={product}>` |
| `src/pages/[product]/docs/[...slug].astro` | same |
| `src/pages/[locale]/[product]/docs/index.astro` | same |
| `src/pages/[locale]/[product]/docs/[...slug].astro` | same |
| `src/styles/product-themes/index.css` | **new** - barrel of `@import`s |
| `src/styles/product-themes/vite.css` | **new** - green-accent demo (see below) |
| `src/styles/global.css` | Add `@import './product-themes/index.css';` after the `theme.css` import |
| `THEMING.md` | New "Per-product themes" section |
| `AGENTS.md` | One paragraph documenting the `data-product` axis |

`Nav.astro` and `Footer.astro` need **no changes** - that is the payoff of the
token architecture.

### Demo theme

`src/styles/product-themes/vite.css` - a full green theme (green-tinted
surfaces + green accent), clearly commented as a removable demo. `vite` is
chosen because it has both a landing override and docs content, so the demo
exercises the full cascade in one place (Nav + Footer + override + docs
subpages) and shows a theme composing with a `product-landing/` override. It is
a demo only (not Vite's real brand); delete the file + its barrel line to
remove it, or rename it to target another product.

### Deferred (v1 does not include)

- Per-product `<meta name="theme-color">`. Currently the no-FOUC inline script
  sets two site-level values. Per-product values would need to be known to that
  script pre-paint, which is awkward. Keep site-level `theme-color` for v1;
  revisit later.

---

## Feature 2 - Auto-generated default landings

### Approach: a structured `product-info` collection (not raw README parsing)

Raw `README.md` parsing is rejected: READMEs vary wildly (headings, HTML
badges, images, structure), so parsing is fragile and produces unpredictable
landings - it fights this project's "validated, typed content" philosophy
(zod schemas, content collections).

Instead: a **`product-info` content collection** - one structured Markdown file
per product whose frontmatter holds structured fields and whose body is an
optional curated overview. This is "generated from a README-like file" without
the fragility, and it composes with the existing sync-skill PR workflow.

### File layout (mirrors the docs i18n convention)

```
src/content/product-info/
  <slug>/
    en.md          # default-locale source of truth
    zh-Hans.md     # optional; falls back to en if absent (reuse existing fallback pattern)
```

For **synced** external repos, the external repo carries `landing/<locale>.md`,
and the sync action copies it to `src/content/product-info/<slug>/<locale>.md` -
exactly parallel to how `docs/` is synced today.

### Proposed schema (zod, in `content.config.ts`)

```yaml
---
tagline: "Next generation frontend tooling."     # required - hero subtitle
description: "Vite is a build tool that…"        # required - <meta> + card summary
features:                                         # optional - feature grid
  - title: "Native ESM dev server"
    body: "No bundling during dev. Starts in milliseconds."
install: |                                        # optional - code snippet block
  npm create vite@latest
highlights:                                       # optional - stat/label row
  - label: "License"
    value: "MIT"
links:                                            # optional - extra action buttons
  - label: "Website"
    href: "https://vite.dev"
---
<!-- optional body: curated overview, rendered as .prose -->
```

Collection wiring mirrors the existing `makeDocCollections()`:
`productInfo<Locale>` collections, base `./src/content/product-info/<locale>`,
glob `**/*.md`. Plus one helper `getLocalizedProductInfo(slug, locale)` in
`lib/content.ts` reusing the same fallback pattern as `getLocalizedDocIndex`.

### Rendered default landing (precedence)

```
1. override exists (src/components/product-landing/<slug>.astro)  -> use it (fully custom)
2. else product-info data exists                                   -> auto-generated landing
3. else                                                            -> current minimal ProductLandingDefault
```

The auto-generated landing renders: hero (badge + name + tagline + View Source /
Docs) -> highlights row -> install snippet -> feature grid -> optional `.prose`
overview body -> CTA box. Fully backward-compatible; products with no
`product-info` file look exactly as today.

### Files touched

| File | Change |
|---|---|
| `src/content.config.ts` | `makeProductInfoCollections()` + zod schema |
| `src/lib/content.ts` | `getLocalizedProductInfo(slug, locale)` helper |
| `src/components/ProductLandingDefault.astro` | Consume product-info when present (fallback to current minimal) |
| `examples/*/skills/site-content-sync/SKILL.md` | Document optional `landing/<locale>.md` |
| `examples/*/skills/site-content-sync/templates/sync-docs.yml` | Copy `landing/` -> `product-info/<slug>/` |
| `examples/<one>/landing/en.md` | **new** - worked example |
| `THEMING.md` / `README.md` | Document the collection |

### Decisions (confirmed)

1. **i18n scope:** per-locale files (`<slug>/<locale>.md` with fallback) for
   consistency with docs/posts. (Lighter single-file alternative rejected.)
2. **Sync integration:** ship the hub side first (collection + default landing
   + one worked example); sync-skill + external-repo `landing/` additions ship
   as a follow-up commit.
3. **README->starter helper:** deferred. A one-off PR-time generator could
   later produce a *starter* `landing/en.md` from a README for an author to
   curate, but it is not parsed at runtime. Not in v1.

---

## How the two features compose

They are orthogonal and stack cleanly:

- A product can have **a theme only** (green accent, default minimal landing).
- A product can have **an auto-generated landing only** (site theme, rich
  landing from `product-info`).
- A product can have **both** (green theme + auto-generated landing - the
  landing inherits green tokens because it reads `var(--color-*)`).
- A product can have a **full override** (`product-landing/<slug>.astro`) + a
  theme - the override also inherits themed tokens for free.

The `product-info`-driven default and the hand-written override share the
existing prop contract, so Feature 1's theming applies to all three landing
tiers uniformly.

---

## Implementation order

Each step is its own local commit (no push, per AGENTS.md):

1. **Feature 1 (themes)** - `Layout`/`DocsLayout` prop + 6 routes +
   `product-themes/` dir + one demo theme + THEMING/AGENTS docs. Verify with
   `npm run build` and a themed product page.
2. **Feature 2 hub side** - `product-info` collection + helper +
   `ProductLandingDefault` rewrite + one worked example. Verify build +
   rendered landing.
3. **Feature 2 sync side** (follow-up) - sync-skill + workflow template
   updates.

---

## Verification checklist

- `npm run build` passes with no errors after each commit.
- Visit `/<themed-product>/` and confirm header, footer, hero, and CTA reflect
  the product theme in light **and** dark mode.
- Visit `/<themed-product>/docs/` and a deep docs page; confirm the sidebar,
  prose, code blocks, and prev/next also reflect the theme.
- Visit a non-product page (`/`, `/posts`) and confirm the site theme is
  unchanged (the `data-product` attribute is absent, so product rules do not
  apply).
- For Feature 2: visit a product with `product-info` and confirm the
  auto-generated landing renders tagline/features/install/highlights/body.
- For Feature 2: visit a product without `product-info` and confirm the landing
  is unchanged from today.
