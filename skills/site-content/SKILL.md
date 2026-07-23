---
name: site-content
description: Add or localize blog posts and product docs in the astro-content-hub Astro site. Use when creating/editing markdown content under src/content/, adding a new product's docs, or adding a new language. Covers the en-default + zh i18n pattern, slug contracts, fallback behavior, and build verification.
---

# Content authoring for astro-content-hub

This site is an Astro 7 static site (`output: 'static'`) deployed to GitHub
Pages and Cloudflare Pages from `main`. Content is markdown in `src/content/`,
routed by file-based pages under `src/pages/`, and localized with a
locale-prefix scheme: default `en` has no prefix, other locales live under
`/<locale>/...` (currently `zh`).

All artifacts written into the repo must be **English** in source comments and
code; locale-specific content (markdown body, UI strings) is the only exception.
See `AGENTS.md`.

## Before changing anything

1. Read `AGENTS.md` for repo conduct (no `git push`, no dep installs without
   authorization, small focused changes).
2. Read `src/lib/i18n.ts` (locales, `t`/`home` dictionaries, `products` array)
   and `src/content.config.ts` (collection generation) to see the current shape.
3. Run `npm run build` to confirm a clean baseline before you start.

## The i18n model (read this once)

- `src/lib/i18n.ts` is the single source of truth: `locales`, `defaultLocale`,
  `t` (small UI strings), `home` (landing copy), and `products` (the list of
  products that ship docs + a landing card).
- `src/content.config.ts` auto-generates collections by looping
  `products × locales` for docs and `locales` for posts. Adding a product or
  locale is a one-line change there.
- `src/lib/content.ts` owns path generation + fallback rendering for both docs
  and posts. Route files are thin and delegate to it.
- Product pages are **dynamic**: `src/pages/[product]/...` serves every product
  in the `products` array, and `src/pages/zh/[product]/...` serves the `zh`
  mirror. You do **not** create per-product route files.
- **Slug contract**: a doc/post's `id` is its path relative to the collection
  base. `en/getting-started.md` and `zh/getting-started.md` both have
  `id = "getting-started"`. Fallback matches on this id, so **keep filenames
  identical across locales** (only the body differs).
- **Fallback** is per-page, content-level (not a redirect): a missing `zh`
  page renders the `en` body inside a `zh` shell (nav/breadcrumb/`lang` stay
  `zh`), with a visible "此页暂无中文翻译" notice. The URL stays `/zh/...`.

## Task: add or edit a blog post

Posts live in `src/content/posts/<locale>/`. Nested dirs are supported and
become part of the slug (e.g. `posts/en/mytool/foo.md` -> `/posts/mytool/foo/`).

**Frontmatter schema** (`postSchema` in `content.config.ts`):

```yaml
---
title: "Post Title"          # required
date: 2025-07-21             # required, YYYY-MM-DD
description: "One-line summary."  # required
tags: ["announcement"]       # optional, defaults to []
author: "Your Name"          # optional
source: "https://github.com/owner/repo"  # optional, link to source
draft: false                 # optional, defaults to false; drafts are excluded
---
```

Steps:
1. Create `src/content/posts/en/<slug>.md` with the frontmatter + body.
2. For a Chinese version, create `src/content/posts/zh/<slug>.md` (same path
   under `zh/`). If you omit it, the `en` post still appears on `/zh/posts/`
   with an `EN` badge and renders the English body on `/zh/posts/<slug>/`.
3. Internal links inside a `zh` post should target `/zh/...` paths.
4. Run `npm run build`. No route file changes needed - routes already exist at
   `src/pages/posts/[...slug].astro` and `src/pages/zh/posts/[...slug].astro`.

## Task: add a doc page to an existing product

Docs live in `src/content/docs/<product>/<locale>/`. Products come from the
`products` array in `src/lib/i18n.ts` (samples: vite, astro, json-server).

**Frontmatter schema** (`docSchema`):

```yaml
---
title: "Page Title"          # required
description: "Short summary" # optional
order: 2                     # optional, defaults to 0; controls sidebar sort
---
```

- `index.md` is the product's docs landing page (served at `/<product>/docs/`,
  not `/<product>/docs/index/`). It is always sorted first in the sidebar
  regardless of `order`; `order` controls the rest.
- Other pages are sorted by `order`, then by `title`.

Steps:
1. Create `src/content/docs/<product>/en/<slug>.md`.
2. For Chinese, create `src/content/docs/<product>/zh/<slug>.md` (same slug).
   Missing `zh` pages fall back to `en` body + notice.
3. Internal links in a `zh` doc should target `/zh/<product>/docs/...`.
4. Run `npm run build`. No route changes - the dynamic catch-all
   (`src/pages/[product]/docs/[...slug].astro` and the `zh/` mirror) picks it
   up automatically.

## Task: add a new product's docs

This is the only task that touches config, not just content. Suppose the
product is `mytool`.

1. **Register the product** - edit the `products` array in `src/lib/i18n.ts`:
   ```ts
   export const products: Product[] = [
     { slug: 'vite', name: 'Vite', github: 'https://github.com/vitejs/vite', badges: ['Build Tool'] },
     { slug: 'astro', name: 'Astro', github: 'https://github.com/withastro/astro', badges: ['Web Framework'] },
     { slug: 'json-server', name: 'JSON Server', github: 'https://github.com/typicode/json-server', badges: ['Mock API'] },
     { slug: 'mytool', name: 'MyTool', github: 'https://github.com/owner/mytool', badges: ['Tool'] },
   ];
   ```
   This auto-generates `mytoolDocsEn` / `mytoolDocsZh` collections and a landing
   card on the home page + nav entry.

2. **Add content**:
   ```
   src/content/docs/mytool/en/index.md
   src/content/docs/mytool/en/getting-started.md
   src/content/docs/mytool/zh/index.md        # optional; falls back to en
   ```

3. **Routes are automatic.** Because product pages are dynamic
   (`src/pages/[product]/...`), no new route files are needed. The landing page
   (`/[product]/index.astro`) and docs (`/[product]/docs/...`) render every
   registered product.

4. Run `npm run build` and verify both `/mytool/docs/` and `/zh/mytool/docs/`
   render, and that a missing `zh` page falls back to `en` with a notice.

## Task: add a new language

Adding a locale touches i18n primitives, content dirs, and creates a mirror of
`src/pages/zh/` under `src/pages/<locale>/`. Suppose adding `ja`.

1. **`src/lib/i18n.ts`**: append `'ja'` to `locales`, and add `ja` blocks to
   `t` and `home` dictionaries. Update `localeLabel`.

2. **`src/content.config.ts`**: nothing to change - collections auto-generate
   for the new locale. Create the content dirs:
   ```
   src/content/posts/ja/
   src/content/docs/<product>/ja/
   ```

3. **Mirror the `zh/` route tree under `src/pages/ja/`**: copy every file from
   `src/pages/zh/` into `src/pages/ja/`, changing locale strings from `'zh'`
   to `'ja'`, UI text to the new language, and `'/zh/...'` base paths to
   `'/ja/...'`. The en routes under `src/pages/` need no change.

4. **Layout/Nav/Footer** already infer locale from the URL and look up `t`,
   so they work once `t.ja` exists. `LocaleSwitcher` lists every locale in
   `locales`, so it picks up `ja` automatically.

5. Run `npm run build`. Verify a `/ja/...` page renders and the switcher
   offers the new language.

## Verification (always run before declaring done)

```bash
npm run build
```

Must pass with **0 errors, 0 warnings, 0 hints** (the build runs `astro check`).
Then spot-check `dist/`:

```bash
# A localized page has the right lang and hreflang alternates
grep -o '<html lang="[^"]*"' dist/zh/vite/docs/getting-started/index.html
grep -c 'rel="alternate"' dist/zh/vite/docs/getting-started/index.html  # expect 3

# A fallback page shows the notice but keeps zh lang
grep -c '此页暂无中文翻译' dist/zh/posts/localized-sample/index.html
```

## Common pitfalls

- **Slug mismatch across locales**: `en/foo.md` and `zh/Foo.md` produce
  different ids and break fallback. Keep filenames byte-identical.
- **Linking to `/<product>/docs/...` from a `zh` page**: use
  `/zh/<product>/docs/...` so users stay in the localized shell. The home and
  product pages use `localizePath()` for this; inside markdown, write the
  localized prefix explicitly.
- **Forgetting `order`**: the sidebar sorts by `order` then title. New docs
  with default `order: 0` cluster together; set explicit values for a stable
  order.
- **The `index` slug is special**: never link to `/<product>/docs/index/`; it
  does not exist. `buildNav` maps the index doc to the base path
  (`/<product>/docs/`) automatically.

## Reference: where things live

```
src/lib/i18n.ts          locales, dictionaries (t/home), products, helpers
src/lib/content.ts       localized path + render helpers (docs + posts)
src/lib/docs.ts          buildNav (sidebar) - index -> base path, sort by order
src/content.config.ts    products[], collection generation (declarative)
src/components/          Layout (lang/hreflang), Nav/Footer (URL-inferred),
                         DocsLayout, PostCard, LocaleSwitcher
src/pages/               en routes (no prefix) + zh/ routes (/zh/ prefix)
                         [product]/... are dynamic, serving every product
src/content/docs/<prod>/<locale>/   docs markdown
src/content/posts/<locale>/          posts markdown (nested dirs ok)
```
