// Shared, locale-aware helpers for localized docs collections.
// All product × locale collections follow the naming `<product>Docs<Locale>`
// (e.g. `viteDocsZh`), generated in content.config.ts. Route files stay
// thin by delegating path generation and fallback rendering to these helpers.

import { getCollection, render } from 'astro:content';
import { defaultLocale, collectionSuffix, type Locale } from './i18n';
import { buildNav, type NavItem } from './docs';

/** Minimal entry shape consumed by helpers and route files. We use this instead of
 *  `CollectionEntry<string>` (which collapses `data` to `never`) because the
 *  collection names are built dynamically and cannot be typed as literals. */
export interface DocEntryLike {
  id: string;
  data: { title: string; description?: string; order: number };
  render(): Promise<{ Content: any; headings: MarkdownHeading[] }>;
}

/** Minimal shape of a heading returned by Astro's render(). */
export interface MarkdownHeading {
  depth: number;
  slug: string;
  text: string;
}
export interface PostEntryLike {
  id: string;
  data: {
    title: string; date: Date; description: string; tags: string[];
    author?: string; source?: string; draft?: boolean;
  };
}

export interface LocalizedPathProps {
  slug: string;
  locale: Locale;
  isFallback: boolean;
  basePath: string;
  productName: string;
}

export interface RenderedPage {
  entry: DocEntryLike;
  Content: any;
  locale: Locale;
  isFallback: boolean;
  title: string;
  description?: string;
  navItems: NavItem[];
  headings: MarkdownHeading[];
}

function collectionName(productName: string, locale: Locale): string {
  return `${productName}Docs${collectionSuffix(locale)}`;
}

/**
 * Build static paths for a product's docs in one locale.
 *
 * - Default locale: every primary doc becomes a path.
 * - Non-default locale: every primary doc becomes a path, PLUS any default-locale
 *   doc that has no localized counterpart (rendered with `isFallback: true`).
 *
 *   The `index` doc is excluded — it is served by the dedicated `index.astro`
 *   route at the collection base, not by this catch-all, to avoid a duplicate
 *   `/.../docs/index/` URL alongside `/.../docs/`.
 *
 * This is the single place that owns fallback path generation.
 */
export async function getLocalizedPaths(
  productName: string,
  basePath: string,
  locale: Locale,
): Promise<{ params: { slug: string }; props: LocalizedPathProps }[]> {
  const primary: DocEntryLike[] = await getCollection(collectionName(productName, locale) as any);
  const primarySlugs = new Set(primary.map((d) => d.id));

  let source: { doc: DocEntryLike; isFallback: boolean }[];
  if (locale === defaultLocale) {
    source = primary.map((doc) => ({ doc, isFallback: false }));
  } else {
    const fallback: DocEntryLike[] = await getCollection(collectionName(productName, defaultLocale) as any);
    source = [
      ...primary.map((doc) => ({ doc, isFallback: false })),
      ...fallback
        .filter((d) => !primarySlugs.has(d.id))
        .map((doc) => ({ doc, isFallback: true })),
    ];
  }

  // Exclude the index doc — served by the dedicated index route.
  source = source.filter(({ doc }) => doc.id !== 'index');


  return source.map(({ doc, isFallback }) => ({
    params: { slug: doc.id },
    props: { slug: doc.id, locale, isFallback, basePath, productName },
  }));
}

/**
 * Render a single localized doc page. Looks up the primary (locale) collection
 * first; if missing and the locale is not the default, falls back to the
 * default-locale collection. Returns null when no matching doc exists.
 *
 * Sidebar nav is built from the primary collection for the page's language,
 * or from the default-locale collection when the page itself is a fallback
 * (so the nav matches the language of the surrounding shell, not the body).
 */
export async function renderLocalizedPage(
  productName: string,
  locale: Locale,
  slug: string,
  basePath: string,
): Promise<RenderedPage | null> {
  const primary: DocEntryLike[] = await getCollection(collectionName(productName, locale) as any);
  let entry = primary.find((d) => d.id === slug);
  let isFallback = false;

  if (!entry && locale !== defaultLocale) {
    const fallback: DocEntryLike[] = await getCollection(collectionName(productName, defaultLocale) as any);
    entry = fallback.find((d) => d.id === slug);
    isFallback = true;
  }
  if (!entry) return null;

  // Nav matches the rendered body's source language.
  const navSource: DocEntryLike[] = isFallback
    ? await getCollection(collectionName(productName, defaultLocale) as any)
    : primary;
  const navItems = buildNav(navSource, basePath);

  const { Content, headings } = await render(entry as any);
  return {
    entry,
    Content,
    headings,
    locale,
    isFallback,
    title: entry.data.title,
    description: entry.data.description,
    navItems,
  };
}

/**
 * Resolve the `index` doc for a product + locale, with default-locale fallback.
 * Returns the entry, its rendered Content, and the sidebar nav for the page's
 * source language. Used by the dedicated docs index routes.
 */
export async function getLocalizedDocIndex(
  productName: string,
  locale: Locale,
  basePath: string,
): Promise<RenderedPage | null> {
  const primary: DocEntryLike[] = await getCollection(collectionName(productName, locale) as any);
  let entry = primary.find((d) => d.id === 'index');
  let isFallback = false;

  if (!entry && locale !== defaultLocale) {
    const fallback: DocEntryLike[] = await getCollection(collectionName(productName, defaultLocale) as any);
    entry = fallback.find((d) => d.id === 'index');
    isFallback = true;
  }
  if (!entry) return null;

  const navSource: DocEntryLike[] = isFallback
    ? await getCollection(collectionName(productName, defaultLocale) as any)
    : primary;
  const navItems = buildNav(navSource, basePath);

  const { Content, headings } = await render(entry as any);
  return {
    entry,
    Content,
    headings,
    locale,
    isFallback,
    title: entry.data.title,
    description: entry.data.description,
    navItems,
  };
}

// ---------------------------------------------------------------------------
// Product landing info - structured per-product Markdown that drives the
// auto-generated landing page. One file per product + locale at
// src/content/product-info/<locale>/<slug>.md; falls back to the default
// locale like docs/posts. Returns frontmatter fields + the rendered body.
// ---------------------------------------------------------------------------

function productInfoCollectionName(locale: Locale): string {
  return `productInfo${collectionSuffix(locale)}`;
}

export interface ProductInfoEntryLike {
  id: string;
  body?: string;
  data: {
    tagline: string;
    description: string;
    features: { title: string; body: string }[];
    install?: string;
    highlights: { label: string; value: string }[];
    links: { label: string; href: string }[];
  };
  render(): Promise<{ Content: any; headings: MarkdownHeading[] }>;
}

export interface ProductInfo {
  tagline: string;
  description: string;
  features: { title: string; body: string }[];
  install?: string;
  highlights: { label: string; value: string }[];
  links: { label: string; href: string }[];
  Content: any;
  hasBody: boolean;
  locale: Locale;
  isFallback: boolean;
}

/** Resolve a product's landing info for a locale, with default-locale fallback.
 *  Returns null when no file exists for the product in either locale. */
export async function getLocalizedProductInfo(
  slug: string,
  locale: Locale,
): Promise<ProductInfo | null> {
  const primary: ProductInfoEntryLike[] = await getCollection(productInfoCollectionName(locale) as any);
  let entry = primary.find((d) => d.id === slug);
  let isFallback = false;
  if (!entry && locale !== defaultLocale) {
    const fallback: ProductInfoEntryLike[] = await getCollection(productInfoCollectionName(defaultLocale) as any);
    entry = fallback.find((d) => d.id === slug);
    isFallback = true;
  }
  if (!entry) return null;
  const { Content } = await render(entry as any);
  return {
    tagline: entry.data.tagline,
    description: entry.data.description,
    features: entry.data.features,
    install: entry.data.install,
    highlights: entry.data.highlights,
    links: entry.data.links,
    Content,
    hasBody: Boolean(entry.body && entry.body.trim()),
    locale,
    isFallback,
  };
}

// ---------------------------------------------------------------------------
// Posts - same fallback pattern as docs, but collections are named
// `posts<Locale>` (no product prefix) and drafts are filtered out.
// ---------------------------------------------------------------------------

function postsCollectionName(locale: Locale): string {
  return `posts${collectionSuffix(locale)}`;
}

export interface LocalizedPostPathProps {
  slug: string;
  locale: Locale;
  isFallback: boolean;
}

export interface RenderedPost {
  entry: PostEntryLike;
  Content: any;
  locale: Locale;
  isFallback: boolean;
  data: PostEntryLike['data'];
}

/** Non-draft filter, applied to every locale's post collection. */
function isPublished(entry: { data: { draft?: boolean } }): boolean {
  return !entry.data.draft;
}

/**
 * Build static paths for posts in one locale, with default-locale fallback
 * for posts that have no localized version. Drafts are excluded.
 */
export async function getPostLocalizedPaths(
  locale: Locale,
): Promise<{ params: { slug: string }; props: LocalizedPostPathProps }[]> {
  const primary = (await getCollection(postsCollectionName(locale) as any) as PostEntryLike[]).filter(isPublished);
  const primarySlugs = new Set(primary.map((d) => d.id));

  let source: { doc: PostEntryLike; isFallback: boolean }[];
  if (locale === defaultLocale) {
    source = primary.map((doc) => ({ doc, isFallback: false }));
  } else {
    const fallback = (await getCollection(postsCollectionName(defaultLocale) as any) as PostEntryLike[]).filter(isPublished);
    source = [
      ...primary.map((doc) => ({ doc, isFallback: false })),
      ...fallback
        .filter((d) => !primarySlugs.has(d.id))
        .map((doc) => ({ doc, isFallback: true })),
    ];
  }

  return source.map(({ doc, isFallback }) => ({
    params: { slug: doc.id },
    props: { slug: doc.id, locale, isFallback },
  }));
}

/** All published posts for a locale, with fallback entries from the default locale. */
export async function getLocalizedPosts(locale: Locale): Promise<{ entry: PostEntryLike; isFallback: boolean }[]> {
  const primary = (await getCollection(postsCollectionName(locale) as any) as PostEntryLike[]).filter(isPublished);
  if (locale === defaultLocale) {
    return primary.map((entry) => ({ entry, isFallback: false }));
  }
  const fallback = (await getCollection(postsCollectionName(defaultLocale) as any) as PostEntryLike[]).filter(isPublished);
  const primarySlugs = new Set(primary.map((d) => d.id));
  return [
    ...primary.map((entry) => ({ entry, isFallback: false })),
    ...fallback.filter((d) => !primarySlugs.has(d.id)).map((entry) => ({ entry, isFallback: true })),
  ];
}

/** Render a single localized post, falling back to the default locale. */
export async function renderLocalizedPost(
  locale: Locale,
  slug: string,
): Promise<RenderedPost | null> {
  const primary = (await getCollection(postsCollectionName(locale) as any) as PostEntryLike[]).filter(isPublished);
  let entry = primary.find((d) => d.id === slug);
  let isFallback = false;

  if (!entry && locale !== defaultLocale) {
    const fallback = (await getCollection(postsCollectionName(defaultLocale) as any) as PostEntryLike[]).filter(isPublished);
    entry = fallback.find((d) => d.id === slug);
    isFallback = true;
  }
  if (!entry) return null;

  const { Content } = await render(entry as any);
  return { entry, Content, locale, isFallback, data: entry.data };
}

// ---------------------------------------------------------------------------
// Tags - aggregate over the localized-posts set (incl. fallback), so a tag
// page lists every post a reader would see on /posts, regardless of whether a
// localized version exists. Tag slugs are normalized (lowercase, kebab-case,
// ASCII) so `i18n` / `meta-architecture` are stable, display-friendly URLs.
// ---------------------------------------------------------------------------

/** Normalize a tag into a URL-safe slug (lowercase, kebab-case, ASCII-only).
 *  Mirrors the slug a reader can type, and keeps tags that share text on the
 *  same page across locales (ASCII tags collapse onto one page). */
export function tagSlug(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface TagInfo {
  /** URL slug for the tag page. */
  slug: string;
  /** Original (display) tag text, from the first post that used it. */
  label: string;
  /** Number of posts with this tag (in this locale, incl. fallback). */
  count: number;
}

/** Every tag across the localized-posts set (incl. fallback), with counts.
 *  The label shown is from the first post encountered that uses the tag, so it
 *  reflects the locale's own wording when present. */
export async function getAllTags(locale: Locale): Promise<TagInfo[]> {
  const posts = await getLocalizedPosts(locale);
  const map = new Map<string, TagInfo>();
  for (const { entry } of posts) {
    for (const tag of entry.data.tags) {
      const slug = tagSlug(tag);
      const existing = map.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(slug, { slug, label: tag, count: 1 });
      }
    }
  }
  // Most-used first, then alphabetical by label for a stable order.
  return [...map.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );
}

/** Posts that carry a given tag (by slug), in the given locale (with fallback).
 *  Newest first. Used by the tag page route. */
export async function getPostsByTag(
  locale: Locale,
  tag: string,
): Promise<{ entry: PostEntryLike; isFallback: boolean }[]> {
  const slug = tagSlug(tag);
  const posts = await getLocalizedPosts(locale);
  return posts
    .filter(({ entry }) => entry.data.tags.some((t) => tagSlug(t) === slug))
    .sort((a, b) => b.entry.data.date.getTime() - a.entry.data.date.getTime());
}

/** Up to `limit` posts sharing the most tags with `slug`, excluding itself.
 *  Used for the "related posts" section on an article page. Falls back to the
 *  newest other posts when no tags overlap. */
export async function getRelatedPosts(
  locale: Locale,
  slug: string,
  limit = 3,
): Promise<{ entry: PostEntryLike; isFallback: boolean }[]> {
  const posts = await getLocalizedPosts(locale);
  const current = posts.find((p) => p.entry.id === slug);
  const currentTags = current
    ? new Set(current.entry.data.tags.map(tagSlug))
    : new Set<string>();
  const others = posts.filter((p) => p.entry.id !== slug);
  return others
    .map((p) => ({
      p,
      score: p.entry.data.tags.filter((t) => currentTags.has(tagSlug(t))).length,
    }))
    .sort((a, b) => b.score - a.score || b.p.entry.data.date.getTime() - a.p.entry.data.date.getTime())
    .slice(0, limit)
    .map(({ p }) => p);
}
