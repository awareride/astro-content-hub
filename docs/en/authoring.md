---
title: "Authoring content"
description: "Write blog posts and docs directly in the hub repo: i18n model, slug contract, fallback, and adding a product or locale."
order: 2
---

This guide covers writing blog posts and docs **directly in the hub repo**
(under `src/content/`). To contribute content from a *separate* repository,
see [Content sync](./content-sync.md).

The hub is an Astro 7 static site. Content is Markdown in `src/content/`,
localized with a locale-prefix scheme: the default locale `en` has no URL
prefix; other locales live under `/<locale>/...` (currently `zh-Hans`).

## The i18n model

`src/lib/i18n.ts` is the single source of truth for locales, UI strings
(`t`), landing copy (`home`), and product page copy (`productCopy`). The
`products` array lives in `src/config/products.ts`. `src/content.config.ts`
auto-generates collections by looping `products × locales` (docs) and
`locales` (posts). Adding a product or a locale is a one-line change.
Collection names use a PascalCase locale suffix via `collectionSuffix()`
(e.g. `zh-Hans` -> `postsZhHans`, `viteDocsZhHans`).

### Slug contract (critical)

A file's **slug** is its path relative to the locale dir, without `.md`. The
hub's fallback matches `en` and `zh-Hans` versions of a page by slug, so
**filenames must be byte-identical across locales.**

| File | Slug |
|------|------|
| `posts/en/hello-world.md` | `hello-world` |
| `posts/zh-Hans/hello-world.md` | `hello-world` |
| `posts/en/mytool/foo.md` | `mytool/foo` |
| `docs/en/getting-started.md` | `getting-started` |

`en/getting-started.md` and `zh-Hans/Getting-Started.md` produce different slugs and
break fallback. Always write the `en` version first.

### Fallback

Fallback is per-page and content-level — never a redirect. A missing `zh-Hans` page
still resolves at `/zh-Hans/.../` and renders the `en` body inside a `zh-Hans` shell,
with a visible notice. The URL stays `/zh-Hans/...`.

## Blog posts

Posts live in `src/content/posts/<locale>/`. Nested dirs become path segments
(`posts/en/mytool/foo.md` → `/posts/mytool/foo/`).

**Frontmatter** (`postSchema`):

```yaml
---
title: "Post Title"                          # required
date: 2025-07-21                             # required, YYYY-MM-DD
description: "One-line summary."             # required
tags: ["announcement"]                       # optional, defaults to []
author: "Your Name"                          # optional
source: "https://github.com/owner/repo"      # optional
draft: false                                 # optional; drafts excluded
---
```

Steps:

1. Create `src/content/posts/en/<slug>.md`.
2. Optionally add `src/content/posts/zh-Hans/<slug>.md` with the same slug. If you
   omit it, the `en` post still appears on `/zh-Hans/posts/` (with an `EN` badge)
   and renders the English body on `/zh-Hans/posts/<slug>/`.
3. Internal links in a `zh-Hans` post should target `/zh-Hans/...` paths.
4. Run `npm run build`. No route changes needed - the default routes
   (`src/pages/posts/...`) and universal non-default routes
   (`src/pages/[locale]/posts/...`) already serve every locale.

Tags on a post automatically become browseable: each tag links to a
tag page at `/posts/tags/<tag>/` (and `/zh-Hans/posts/tags/<tag>/` for `zh-Hans`),
which lists every post carrying that tag. Tag slugs are ASCII-normalized
(kebab-case), so an `en` tag and a `zh-Hans` tag that share text land on the same
page. Heading anchors (`id` attributes on h1-h4) are generated automatically,
so you can deep-link to any section.

## Docs for an existing product

Docs live in `src/content/docs/<product>/<locale>/`. Products come from the
`products` array (`src/config/products.ts`; samples: vite, astro, json-server).

**Frontmatter** (`docSchema`):

```yaml
---
title: "Page Title"          # required
description: "Short summary" # optional
order: 2                     # optional, controls sidebar sort (default 0)
---
```

- `index.md` is the docs landing page (served at `/<product>/docs/`, never
  `/<product>/docs/index/`). It always sorts first regardless of `order`;
  other pages sort by `order`, then title.
- For Chinese, add `src/content/docs/<product>/zh-Hans/<slug>.md` with the same
  slug. Missing `zh-Hans` pages fall back to the `en` body + notice.
- Internal links in a `zh-Hans` doc should target `/zh-Hans/<product>/docs/...`.

## Add a new product

The only authoring task that touches config:

1. Register the product in `src/config/products.ts`:

   ```ts
   export const products: Product[] = [
     // ...existing...
     { slug: 'mytool', name: 'MyTool', github: 'https://github.com/owner/mytool', badges: ['Tool'] },
   ];
   ```

   This auto-generates `mytoolDocsEn` / `mytoolDocsZhHans` collections and a
   landing card (+ nav entry when `nav: true`).

2. Add content:

   ```
   src/content/docs/mytool/en/index.md
   src/content/docs/mytool/en/getting-started.md
   src/content/docs/mytool/zh-Hans/index.md   # optional; falls back to en
   ```

3. Routes are automatic (product pages are dynamic). Run `npm run build` and
   verify `/mytool/docs/` and `/zh-Hans/mytool/docs/` render.

## Customize a product landing

By default every product landing (`/<product>/`) renders the shared generic
hero + CTA in `src/components/ProductLandingDefault.astro`. To ship a custom
landing for one product, add a single component keyed by the product **slug**:

```
src/components/product-landing/<slug>.astro     # e.g. src/components/product-landing/vite.astro
```

`src/lib/product-landing.ts` eagerly globs that directory at build time, so the
file is auto-discovered - no config, no route changes. Both landing routes
(the default `/<product>/` route and its `/<locale>/<product>/` twin) pick up
the override automatically; products without a matching file keep the generic
landing. Docs subroutes (`/<product>/docs...`) are unaffected and stay
data-driven.

The override renders **only the `<main>` sections** (hero, custom sections,
CTA). The route still owns `Layout` + `Nav` + `Footer` and the `<head>`, so
there is no second document shell. It receives the same props as the fallback:

| Prop | What it is |
|------|------------|
| `product` | The full `Product` entry from `src/config/products.ts`. |
| `locale` | Current locale (`'en'` from the default route, the loop value from the twin). |
| `c` | Locale-resolved UI strings (`ProductCopy`) - reuse `c.viewSource`, `c.documentation`, `c.ctaTitle`, ... |
| `docsHref` | Base-aware, locale-prefixed docs link, pre-computed by the route. |

To localize override-only copy, branch on `locale` inside the component; v1
ships one override per product used across all locales (per-locale override
files like `vite.zh-Hans.astro` are a future extension). The worked example
`src/components/product-landing/vite.astro` shows the contract - reuse shared
CSS classes (`.product-hero`, `.section`, `.btn`, `.feature-grid`, ...) and add
a scoped `<style>` only when the global classes do not fit.

## Add a new language

Adding a locale is a **data-only change** — no route files are created or
mirrored, because non-default routes are universal (`src/pages/[locale]/...`
loops `locales`). Suppose adding `ja`:

1. Append `'ja'` to `locales` in `src/lib/i18n.ts`; add `ja` blocks to every
   `Record<Locale, ...>` table: `localeLabel`, `localeCode`, `t`, `home`, and
   `productCopy`. Because every table is typed `Record<Locale, ...`, forgetting
   one (or letting its keys drift from the `en` seed) is a compile error -
   `astro check` will not pass until `ja` is filled in everywhere.
2. Create `src/content/posts/ja/` and `src/content/docs/<product>/ja/`
   (collections auto-generate from `locales`).
3. **No route changes.** `src/pages/[locale]/...` already loops `locales`, so
   `ja` pages are served at `/ja/...` automatically. `Layout`/`Nav`/`Footer`/
   `LocaleSwitcher` infer locale from the URL via `localeFromPath` and look up
   `t[locale]`; `localeFromPath`'s regex matches both 2-letter prefixes
   (`/ja/...`) and subtagged ones (`/zh-Hans/...`).

Run `npm run build` and verify a `/ja/...` page renders and the switcher
offers the new language. (With no `ja` content, every `/ja/...` page is a
fallback to `en` inside a `ja` shell — a valid way to confirm routing works
before translating.)

## Common pitfalls

- **Slug mismatch across locales** — keep filenames byte-identical.
- **Linking to `/<product>/docs/...` from a `zh-Hans` page** — use
  `/zh-Hans/<product>/docs/...` so users stay in the localized shell.
- **Forgetting `order`** — new docs with default `order: 0` cluster together;
  set explicit values for a stable order.
- **The `index` slug is special** — never link to `/<product>/docs/index/`;
  it does not exist. `buildNav` maps the index doc to the base path.

## Verification

```bash
npm run build   # must pass with 0 errors/warnings/hints (runs astro check)
```

Then spot-check `dist/`:

```bash
grep -o '<html lang="[^"]*"' dist/zh-Hans/vite/docs/getting-started/index.html
grep -c 'rel="alternate"' dist/zh-Hans/vite/docs/getting-started/index.html   # expect = locales count
grep -c '此页暂无中文翻译' dist/zh-Hans/posts/localized-sample/index.html       # fallback notice
```
