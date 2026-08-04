---
tagline: "One hub for docs and posts from many repositories — localized, auto-deployed."
description: "A content-hub template: aggregate documentation and blog posts from many open-source repositories into one fast, localized static site."
highlights:
  - label: "License"
    value: "MIT"
  - label: "Stack"
    value: "Astro 7"
features:
  - title: "Aggregate by design"
    body: "External repos sync docs and posts via pull requests; a human reviews before anything lands."
  - title: "Localized by default"
    body: "Every page has an English default and a localized shell, with graceful per-page fallback."
  - title: "Free to deploy"
    body: "Static output deploys to GitHub Pages and Cloudflare Pages at no cost."
links:
  - label: "Website"
    href: "https://awareride.github.io/astro-content-hub"
# Section system demo (Phase 4): rich landing for the hub's own template
# product so every product page in the hub is consistent.
sections:
  - type: hero
  - type: highlights
  - type: install
  - type: features
  - type: stats
    data:
      - { label: "Template", value: "v1.0" }
      - { label: "Products", value: "4" }
      - { label: "Locales", value: "2" }
  - type: docs-preview
  - type: cta
    data:
      primary: { label: "Read the Docs", href: "/astro-content-hub/docs" }
      secondary: { label: "View Source", href: "https://github.com/awareride/astro-content-hub" }
---

`astro-content-hub` is a content-hub template: it aggregates documentation
and blog posts from many open-source repositories into one **localized,
auto-deployed static site**. Content ships through pull requests, so nothing
lands on main without review.
