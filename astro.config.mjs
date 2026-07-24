import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import { rewriteRelativeMdLinks } from './src/lib/remark-rewrite-links.mjs';

// Sub-path the site is served under. '/' for a root deploy (custom domain,
// Cloudflare Pages root); '/astro-content-hub/' for a GitHub Pages project
// path (https://<owner>.github.io/<repo>/). Built assets are prefixed with it,
// and `withBase()` in lib/i18n.ts reads it back via `import.meta.env.BASE_URL`
// to prefix every internal link/asset/redirect.
const base = '/astro-content-hub/';

export default defineConfig({
  // Full deployed URL (origin + sub-path, no trailing slash) for canonical,
  // Open Graph, and hreflang absolute URLs. For a project-path deploy the
  // sub-path here must match `base` below.
  site: 'https://awareride.github.io/astro-content-hub',
  base,
  output: 'static',

  markdown: {
    // Astro 7 uses Sätteri as its Markdown processor. We pass a Sätteri mdast
    // plugin that rewrites relative `.md` links in markdown bodies to hub
    // routes at build time, so source files can keep GitHub-friendly relative
    // links. `base` is passed in because the plugin is a plain .mjs loaded at
    // config time and cannot read `import.meta.env.BASE_URL`.
    processor: satteri({ mdastPlugins: [rewriteRelativeMdLinks(base)] }),
    shikiConfig: {
      theme: 'css-variables',
    },
  },

  integrations: [
    // Generates /sitemap-index.xml from the build. Uses `site` for absolute
    // URLs and respects `base`. Automatically embeds hreflang alternates for
    // each page (Layout.astro already emits <link rel="alternate" hreflang>).
    // The 404 page is excluded so it is never advertised to crawlers.
    sitemap({
      filter: (page) => !page.includes('/404'),
      // Group en/zh versions of each page into <xhtml:link rel="alternate">
      // hreflang entries. `en` is the default (no URL prefix); `zh` lives under
      // /zh/. The HTML head already emits hreflang too; this adds the sitemap-
      // level grouping so crawlers see the locale relations in one place.
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', zh: 'zh' },
      },
    }),
  ],
});
