---
tagline: "聚合多个仓库的文档与文章 —— 本地化、自动部署。"
description: "内容中心模板:将多个开源仓库的文档与博客文章聚合到一个快速、本地化的静态站点。"
highlights:
  - label: "许可证"
    value: "MIT"
  - label: "技术栈"
    value: "Astro 7"
features:
  - title: "聚合而生"
    body: "外部仓库通过拉取请求同步文档与文章;任何内容上线前都经过人工审阅。"
  - title: "默认本地化"
    body: "每个页面都有英文默认版与本地化外壳,并带优雅的逐页回退。"
  - title: "免费部署"
    body: "静态输出可零成本部署到 GitHub Pages 与 Cloudflare Pages。"
links:
  - label: "官网"
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
      - { label: "模板版本", value: "v1.0" }
      - { label: "产品数", value: "4" }
      - { label: "语言数", value: "2" }
  - type: docs-preview
  - type: cta
    data:
      primary: { label: "阅读文档", href: "/astro-content-hub/docs" }
      secondary: { label: "查看源码", href: "https://github.com/awareride/astro-content-hub" }
---

`astro-content-hub` 是一个内容中心模板:它将多个开源仓库的文档与博客文章
聚合到一个**本地化、自动部署**的静态站点。内容通过拉取请求进入,任何内容
在上线前都经过人工审阅。
