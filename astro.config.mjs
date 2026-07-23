import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
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
});
