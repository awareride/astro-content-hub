import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { rewriteRelativeMdLinks } from './src/lib/remark-rewrite-links.mjs';

export default defineConfig({
  // Set this to your deployed domain (e.g. https://your-domain.com).
  // Used for absolute URLs in meta tags and sitemaps.
  site: 'https://example.com',
  output: 'static',

  markdown: {
    // Astro 7 uses Sätteri as its Markdown processor. We pass a Sätteri mdast
    // plugin that rewrites relative `.md` links in markdown bodies to hub
    // routes at build time, so source files can keep GitHub-friendly relative
    // links.
    processor: satteri({ mdastPlugins: [rewriteRelativeMdLinks] }),
    shikiConfig: {
      theme: 'css-variables',
    },
  },
});
