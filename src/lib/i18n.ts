// i18n primitives - single source of truth for locales and UI strings.
// Adding a language: append to `locales` and fill in every `Record<Locale, …>`
// table below (`localeLabel`, `localeCode`, `t`, `home`, `productCopy`).
// Collection/route code is generic over `locales`, so no per-language files
// are needed. Because every table is typed `Record<Locale, …>`, forgetting a
// locale (or letting its keys drift from the `en` seed) is a compile error.

export const locales = ['en', 'zh-Hans'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/** Site name - set this to your project's name. Used in <title>, nav, footer. */
export const siteName = 'Astro Content Hub';

export function isLocale(x: string): x is Locale {
  return (locales as readonly string[]).includes(x);
}

/** Build the PascalCase suffix for a content collection name from a locale
 *  code: `en` -> `En`, `zh` -> `Zh`, `zh-Hans` -> `ZhHans`. Splitting on `-`
 *  and capitalizing each part keeps subtagged locales (script/region) free of
 *  hyphens, which would otherwise leak into collection names (`postsZh-Hans`).
 *  Used by content.config.ts and content.ts to name the per-locale collections. */
export function collectionSuffix(locale: Locale): string {
  return locale
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/** Prefix a path with the locale segment, unless it is the default locale. */
export function localizePath(path: string, locale: Locale): string {
  if (locale === defaultLocale) return path;
  return `/${locale}${path}`;
}

/** Prefix a root-absolute path with the deploy base path. The base comes from
 *  `import.meta.env.BASE_URL` (Vite, derived from `base` in astro.config.mjs),
 *  so it stays in sync with the build automatically. Relative and absolute-URL
 *  paths are returned unchanged. Use for every internal <a href>, <img src>,
 *  <link href>, and Astro.redirect() target so they resolve under a sub-path
 *  deploy (e.g. base: '/<repo>/'). */
export function withBase(path: string): string {
  if (!path.startsWith('/')) return path;
  // BASE_URL always ends with '/' (Vite convention); strip it to avoid '//'.
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;
}

/** Inverse of withBase: strip the deploy base prefix from a path. */
export function stripBase(path: string): string {
  const prefix = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (prefix && path.startsWith(prefix)) return path.slice(prefix.length) || '/';
  return path;
}

/** Build the alternates map for a page given its default-locale path.
 *  Every locale gets an entry (localized pages always exist, even as fallbacks). */
export function buildAlternates(defaultLocalePath: string): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {};
  for (const l of locales) {
    out[l] = localizePath(defaultLocalePath, l);
  }
  return out;
}

/** Infer the current locale from a URL pathname (default locale if no prefix matches).
 *  Strips the deploy base prefix first so locale detection works under a sub-path
 *  deploy (e.g. /astro-content-hub/zh-Hans/ -> zh-Hans). The optional `-Script`
 *  subtag lets prefixed locales like `zh-Hans` match, while plain 2-letter prefixes
 *  (`en`, `ja`) still work. */
export function localeFromPath(pathname: string): Locale {
  const m = stripBase(pathname).match(/^\/([a-z]{2}(?:-[A-Z][a-z]+)?)(?:\/|$)/i);
  if (m && isLocale(m[1])) return m[1];
  return defaultLocale;
}

/** Human-readable label per locale, shown in the locale switcher.
 *  Data-driven (like `localeCode`) so adding a locale forces adding its label. */
export const localeLabel: Record<Locale, string> = {
  en: 'English',
  'zh-Hans': '中文',
};

/** BCP-47 locale code per locale, for `toLocaleDateString` and friends.
 *  Centralized so adding a locale doesn't require hunting down date calls. */
export const localeCode: Record<Locale, string> = {
  en: 'en-US',
  'zh-Hans': 'zh-Hans',
};

/** UI strings per locale. `t.en` is the canonical shape; every other locale must
 *  match it exactly. `fallbackNotice` is shown when a page renders the default
 *  language content because no localized version exists. */
const tEn = {
  home: 'Home',
  posts: 'Posts',
  docs: 'Docs',
  breadcrumbDocs: 'Docs',
  projects: 'Samples',
  links: 'Links',
  connect: 'Connect',
  toggleMenu: 'Toggle menu',
  builtWith: 'Built with awareness.',
  footerTagline: 'A content hub for open-source projects, written in the open.',
  noTranslation: 'No translation available',
  noPages: 'No pages yet.',
  fallbackNotice: '',
  postsListEyebrow: 'Blog',
  postsListTitle: 'Posts',
  postsListLead:
    'Thoughts on developer tooling, bundle analysis, perception, and building with awareness.',
  postsDescription:
    'Technical articles from the content hub — guides, notes, and announcements.',
  noPosts: 'No posts yet. Check back soon.',
  allPostsBack: '← All Posts',
  relatedPosts: 'Related posts',
  byAuthor: 'by {author}',
  viewSource: 'View source →',
  tagEyebrow: 'Tag',
  tagLead: '{n} post{s}',
  tagDescription: 'Posts tagged {label}',
  previous: '← Previous',
  next: 'Next →',
};
export type UIStrings = typeof tEn;
export const t: Record<Locale, UIStrings> = {
  en: tEn,
  'zh-Hans': {
    home: '首页',
    posts: '博客',
    docs: '文档',
    breadcrumbDocs: '文档',
    projects: '示例',
    links: '链接',
    connect: '联系',
    toggleMenu: '切换菜单',
    builtWith: '用心构建。',
    footerTagline: '为开源项目打造的内容中心,以开放方式撰写。',
    noTranslation: '暂无中文翻译',
    noPages: '暂无页面。',
    fallbackNotice: '此页暂无中文翻译,以下显示英文原文。',
    postsListEyebrow: '博客',
    postsListTitle: '文章',
    postsListLead:
      '关于开发工具、bundle 分析、感知,以及以觉察之心构建的思考。',
    postsDescription: '内容中心的技术文章 —— 指南、笔记与公告。',
    noPosts: '暂无文章,敬请期待。',
    allPostsBack: '← 全部文章',
    relatedPosts: '相关文章',
    byAuthor: '作者:{author}',
    viewSource: '查看源码 →',
    tagEyebrow: '标签',
    tagLead: '共 {n} 篇文章',
    tagDescription: '标签为 {label} 的文章',
    previous: '← 上一篇',
    next: '下一篇 →',
  },
};

/** Landing page copy, per locale. Kept separate from `t` (small UI strings)
 *  because the landing page has a lot of long-form marketing text.
 *  This is original sample copy - replace it with your own. */
const homeEn = {
  title: 'Astro Content Hub',
  description: 'A content hub that aggregates documentation and posts from many open-source projects, with per-page localization and free auto-deploy.',
  eyebrow: 'Open Source Content Hub',
  heroTitleA: 'One hub for your',
  heroTitleB: 'docs and posts.',
  heroLead: 'Publish documentation and blog posts from many repositories into a single, fast, localized static site. Content ships through pull requests, so nothing lands on main without review.',
  ctaGithub: 'View on GitHub',
  ctaProjects: 'Documentation',
  latestEyebrow: 'Latest',
  latestTitle: 'From the blog',
  allPosts: 'All Posts ->',
  focusEyebrow: 'Why this starter',
  focusTitle: 'Built for content, not config',
  focusLead: 'The hard parts - i18n with per-page fallback, content collections, and free deployment - are already solved. You write Markdown; the hub builds and deploys.',
  card1Title: 'Content collections',
  card1Body: 'Posts and docs are typed Markdown loaded from the filesystem. Frontmatter is validated before content ever reaches the site.',
  card2Title: 'Localized by design',
  card2Body: 'Every page has an English default and a Chinese shell. Missing translations fall back gracefully instead of 404-ing.',
  card3Title: 'Zero-config styling',
  card3Body: 'A single global stylesheet with design tokens. Components stay small; Markdown reuses shared prose typography.',
  projectsEyebrow: 'Samples',
  projectsTitle: 'Samples in this hub',
  learnMore: 'Learn More',
  principlesEyebrow: 'Principles',
  principlesTitle: 'How we build',
  principle1Title: 'Open by default',
  principle1Body: 'Source code, decisions, and content are shared with the community.',
  principle2Title: 'Reviewed before ship',
  principle2Body: 'External content arrives as a pull request, so a human reviews it before it publishes.',
  principle3Title: 'Localized',
  principle3Body: 'A missing translation never breaks a link - it shows the default language with a notice.',
  principle4Title: 'Free to deploy',
  principle4Body: 'Static output deploys to GitHub Pages and Cloudflare Pages at no cost.',
  ctaTitle: 'Start your hub',
  ctaBody: 'Fork the template, point it at your domain, and copy an example repo to begin contributing content.',
  ctaGithubOrg: 'View the template on GitHub',
};
export type HomeCopy = typeof homeEn;
export const home: Record<Locale, HomeCopy> = {
  en: homeEn,
  'zh-Hans': {
    title: 'Astro Content Hub',
    description: '聚合多个开源项目的文档与文章的内容中心,支持逐页本地化,并可免费自动部署。',
    eyebrow: '开源内容中心',
    heroTitleA: '一个汇聚你所有',
    heroTitleB: '文档与文章的中心。',
    heroLead: '将多个仓库中的文档与博客文章发布到同一个快速、本地化的静态站点。内容通过拉取请求进入,任何内容在上线前都经过人工审阅。',
    ctaGithub: '在 GitHub 上查看',
    ctaProjects: '文档',
    latestEyebrow: '最新',
    latestTitle: '来自博客',
    allPosts: '全部文章 ->',
    focusEyebrow: '为何选择此模板',
    focusTitle: '为内容而生,而非配置',
    focusLead: '棘手的部分 -- 带逐页回退的 i18n、内容集合、免费部署 -- 已经为你解决。你只需写 Markdown,中心负责构建与部署。',
    card1Title: '内容集合',
    card1Body: '文章与文档是从文件系统加载的带类型 Markdown。内容到达站点之前,Frontmatter 即经过校验。',
    card2Title: '原生本地化',
    card2Body: '每个页面都有英文默认版与中文外壳。缺失的翻译会优雅回退,而非返回 404。',
    card3Title: '零配置样式',
    card3Body: '单一全局样式表配合设计变量。组件保持精简,Markdown 复用统一的排版样式。',
    projectsEyebrow: '示例',
    projectsTitle: '本中心收录的示例项目',
    learnMore: '了解更多',
    principlesEyebrow: '原则',
    principlesTitle: '我们如何构建',
    principle1Title: '默认开放',
    principle1Body: '源代码、决策与内容都与社区共享。',
    principle2Title: '上线前审阅',
    principle2Body: '外部内容以拉取请求形式进入,因此在发布前会经过人工审阅。',
    principle3Title: '本地化',
    principle3Body: '缺失的翻译不会破坏链接 -- 它会以提示方式展示默认语言版本。',
    principle4Title: '免费部署',
    principle4Body: '静态输出可零成本部署到 GitHub Pages 与 Cloudflare Pages。',
    ctaTitle: '开始你的中心',
    ctaBody: '复刻模板,指向你的域名,并复制一个示例仓库即可开始贡献内容。',
    ctaGithubOrg: '在 GitHub 上查看模板',
  },
};

/** Generic copy for a product detail page. Product-specific fields (name,
 *  github, badges) come from the `products` array in `src/config/products.ts`;
 *  this supplies the surrounding labels, which are identical across products. */
const productCopyEn = {
  metaDescription: '{name} — open-source project documentation and posts.',
  heroBadge: 'Open Source',
  documentation: 'Documentation',
  viewSource: 'View Source',
  learnMore: 'Learn More',
  docsEyebrow: 'Documentation',
  docsTitle: 'Docs',
  readDocs: 'Read the Docs',
  ctaTitle: 'Explore the project',
  ctaBody: 'Read the documentation or browse the source on GitHub.',
  ctaPrimary: 'View on GitHub',
  ctaSecondary: 'Read the Docs',
};
export type ProductCopy = typeof productCopyEn;
export const productCopy: Record<Locale, ProductCopy> = {
  en: productCopyEn,
  'zh-Hans': {
    metaDescription: '{name} —— 开源项目文档与文章。',
    heroBadge: '开源',
    documentation: '文档',
    viewSource: '查看源码',
    learnMore: '了解更多',
    docsEyebrow: '文档',
    docsTitle: '文档',
    readDocs: '阅读文档',
    ctaTitle: '深入了解项目',
    ctaBody: '阅读文档,或在 GitHub 上浏览源码。',
    ctaPrimary: '在 GitHub 上查看',
    ctaSecondary: '阅读文档',
  },
};
