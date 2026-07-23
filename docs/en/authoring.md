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
prefix; other locales live under `/<locale>/...` (currently `zh`).

## The i18n model

`src/lib/i18n.ts` is the single source of truth for locales, UI strings
(`t`), landing copy (`home`), and the `products` array. `src/content.config.ts`
auto-generates collections by looping `products × locales` (docs) and
`locales` (posts). Adding a product or a locale is a one-line change.

### Slug contract (critical)

A file's **slug** is its path relative to the locale dir, without `.md`. The
hub's fallback matches `en` and `zh` versions of a page by slug, so
**filenames must be byte-identical across locales.**

| File | Slug |
|------|------|
| `posts/en/hello-world.md` | `hello-world` |
| `posts/zh/hello-world.md` | `hello-world` |
| `posts/en/mytool/foo.md` | `mytool/foo` |
| `docs/en/getting-started.md` | `getting-started` |

`en/getting-started.md` and `zh/Getting-Started.md` produce different slugs and
break fallback. Always write the `en` version first.

### Fallback

Fallback is per-page and content-level — never a redirect. A missing `zh` page
still resolves at `/zh/.../` and renders the `en` body inside a `zh` shell,
with a visible notice. The URL stays `/zh/...`.

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
2. Optionally add `src/content/posts/zh/<slug>.md` with the same slug. If you
   omit it, the `en` post still appears on `/zh/posts/` (with an `EN` badge)
   and renders the English body on `/zh/posts/<slug>/`.
3. Internal links in a `zh` post should target `/zh/...` paths.
4. Run `npm run build`. No route changes needed.

## Docs for an existing product

Docs live in `src/content/docs/<product>/<locale>/`. Products come from the
`products` array (`src/lib/i18n.ts`; samples: vite, astro, json-server).

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
- For Chinese, add `src/content/docs/<product>/zh/<slug>.md` with the same
  slug. Missing `zh` pages fall back to the `en` body + notice.
- Internal links in a `zh` doc should target `/zh/<product>/docs/...`.

## Add a new product

The only authoring task that touches config:

1. Register the product in `src/lib/i18n.ts`:

   ```ts
   export const products: Product[] = [
     // ...existing...
     { slug: 'mytool', name: 'MyTool', github: 'https://github.com/owner/mytool', badges: ['Tool'] },
   ];
   ```

   This auto-generates `mytoolDocsEn` / `mytoolDocsZh` collections and a
   landing card + nav entry.

2. Add content:

   ```
   src/content/docs/mytool/en/index.md
   src/content/docs/mytool/en/getting-started.md
   src/content/docs/mytool/zh/index.md        # optional; falls back to en
   ```

3. Routes are automatic (product pages are dynamic). Run `npm run build` and
   verify `/mytool/docs/` and `/zh/mytool/docs/` render.

## Add a new language

Adding a locale touches `src/lib/i18n.ts`, creates content dirs, and requires a
mirror of `src/pages/zh/` under `src/pages/<locale>/`. Suppose adding `ja`:

1. Append `'ja'` to `locales` in `i18n.ts`; add `ja` blocks to `t` and `home`;
   update `localeLabel`.
2. Create `src/content/posts/ja/` and `src/content/docs/<product>/ja/`.
3. Copy every file from `src/pages/zh/` into `src/pages/ja/`, changing locale
   strings from `'zh'` to `'ja'`, UI text to Japanese, and `/zh/...` base paths
   to `/ja/...`. The `en` routes need no change.
4. `Layout`/`Nav`/`Footer`/`LocaleSwitcher` infer locale from the URL and look
   up `t`, so they work once `t.ja` exists.

Run `npm run build` and verify a `/ja/...` page renders and the switcher
offers the new language.

## Common pitfalls

- **Slug mismatch across locales** — keep filenames byte-identical.
- **Linking to `/<product>/docs/...` from a `zh` page** — use
  `/zh/<product>/docs/...` so users stay in the localized shell.
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
grep -o '<html lang="[^"]*"' dist/zh/vite/docs/getting-started/index.html
grep -c 'rel="alternate"' dist/zh/vite/docs/getting-started/index.html   # expect = locales count
grep -c '此页暂无中文翻译' dist/zh/posts/localized-sample/index.html       # fallback notice
```
