import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { locales, cap, products } from './lib/i18n';

// Products that ship a localized docs collection. Driven by the `products`
// array in lib/i18n.ts so the landing page and content collections stay in
// sync. Adding a product there auto-generates `<product>Docs<Locale>`
// collections for every locale. A product may set `base` to point its docs
// collection at a non-default directory (a path relative to the repo root,
// e.g. './docs' => ./docs/<locale>/, used by content synced in from an
// external repo); otherwise docs live under ./src/content/docs/<slug>/<locale>/.

const docSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  order: z.number().default(0),
});

function makeDocCollections(): Record<string, ReturnType<typeof defineCollection>> {
  const out: Record<string, ReturnType<typeof defineCollection>> = {};
  for (const product of products) {
    // Default docs location is src/content/docs/<slug>/<locale>; a product may
    // override it via `base` (a path relative to the repo root, e.g. './docs'
    // => ./docs/<locale>/, used by content synced in from an external repo).
    const baseDir = product.base ?? `./src/content/docs/${product.slug}`;
    for (const locale of locales) {
      out[`${product.slug}Docs${cap(locale)}`] = defineCollection({
        loader: glob({ pattern: '**/*.md', base: `${baseDir}/${locale}` }),
        schema: docSchema,
      });
    }
  }
  return out;
}

const postSchema = z.object({
  title: z.string(),
  date: z.date(),
  description: z.string(),
  tags: z.array(z.string()).default([]),
  author: z.string().optional(),
  source: z.string().optional(),
  draft: z.boolean().default(false),
});

// Posts are split per locale under src/content/posts/<locale>/.
// Adding a locale auto-generates a `posts<Locale>` collection.
function makePostCollections(): Record<string, ReturnType<typeof defineCollection>> {
  const out: Record<string, ReturnType<typeof defineCollection>> = {};
  for (const locale of locales) {
    out[`posts${cap(locale)}`] = defineCollection({
      loader: glob({ pattern: '**/*.{md,mdx,html}', base: `./src/content/posts/${locale}` }),
      schema: postSchema,
    });
  }
  return out;
}

export const collections = {
  ...makePostCollections(),
  ...makeDocCollections(),
};
