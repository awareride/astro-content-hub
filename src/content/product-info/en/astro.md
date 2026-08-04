---
tagline: "The web framework for content-driven websites — zero JavaScript by default."
description: "Astro builds fast, content-driven sites like blogs, marketing pages, and documentation with islands of interactivity."
highlights:
  - label: "License"
    value: "MIT"
  - label: "Runtime"
    value: "Node"
features:
  - title: "Zero JS by default"
    body: "Pages ship as pure HTML with no JavaScript by default — islands add interactivity only where needed."
  - title: "Content collections"
    body: "Typed Markdown with schema validation, for docs, blogs, and more, out of the box."
  - title: "Framework agnostic"
    body: "Bring your own UI framework — React, Vue, Svelte, and more — per component."
links:
  - label: "Website"
    href: "https://astro.build"
# Section system demo (Phase 4): rich landing for the astro product so every
# product page in the hub has a consistent, content-driven landing.
sections:
  - type: hero
  - type: highlights
  - type: install
  - type: features
  - type: stats
    data:
      - { label: "GitHub Stars", value: "48k" }
      - { label: "npm weekly downloads", value: "900k" }
      - { label: "License", value: "MIT" }
  - type: docs-preview
  - type: faq
    data:
      - q: "Does Astro ship JavaScript by default?"
        a: "No — pages are pure HTML by default; interactive islands opt in."
      - q: "Can I use my favorite framework?"
        a: "Yes — React, Vue, Svelte, Preact, and more are supported per component."
  - type: cta
    data:
      primary: { label: "Get Started", href: "/astro/docs/getting-started" }
      secondary: { label: "View Source", href: "https://github.com/withastro/astro" }
---

Astro is the web framework for content-driven websites: blogs, marketing
sites, and documentation. It ships **zero JavaScript by default**, so pages
are fast by construction, and adds interactive islands only where you need
them.
