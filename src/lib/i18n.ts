// i18n primitives — single source of truth for locales and UI strings.
// Adding a language: append to `locales` and `t`. Collection/route code
// is generic over these, so no per-language files are needed.

export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/** Site name — set this to your project's name. Used in <title>, nav, footer. */
export const siteName = 'SiteName';

/** Products that ship a localized docs collection and a landing card.
 *  `slug` is the URL segment (/<slug>/docs); `github` is the repo URL;
 *  `badges` are shown on the landing card. Adding an entry here auto-wires
 *  the docs collections (content.config.ts) and the landing Projects grid. */
export interface Product {
  slug: string;
  name: string;
  github: string;
  badges: string[];
}

export const products: Product[] = [
  { slug: 'vite', name: 'Vite', github: 'https://github.com/vitejs/vite', badges: ['Build Tool', 'JavaScript'] },
  { slug: 'astro', name: 'Astro', github: 'https://github.com/withastro/astro', badges: ['Web Framework', 'JavaScript'] },
  { slug: 'json-server', name: 'JSON Server', github: 'https://github.com/typicode/json-server', badges: ['Mock API', 'Node'] },
];

export function isLocale(x: string): x is Locale {
  return (locales as readonly string[]).includes(x);
}

/** Capitalize the first letter — used to build collection names (e.g. `viteDocsZh`). */
export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Prefix a path with the locale segment, unless it is the default locale. */
export function localizePath(path: string, locale: Locale): string {
  if (locale === defaultLocale) return path;
  return `/${locale}${path}`;
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

/** Infer the current locale from a URL pathname (default locale if no prefix matches). */
export function localeFromPath(pathname: string): Locale {
  const m = pathname.match(/^\/([a-z]{2})(?:\/|$)/i);
  if (m && isLocale(m[1])) return m[1];
  return defaultLocale;
}

/** Map a non-default locale back to its canonical code for display. */
export function localeLabel(locale: Locale): string {
  return locale === 'zh' ? '中文' : 'English';
}

/** BCP-47 locale code per locale, for `toLocaleDateString` and friends.
 *  Centralized so adding a locale doesn't require hunting down date calls. */
export const localeCode: Record<Locale, string> = {
  en: 'en-US',
  zh: 'zh-CN',
};

/** UI strings per locale. `fallbackNotice` is shown when a page renders the default
 *  language content because no localized version exists. */
export const t = {
  en: {
    home: 'Home',
    posts: 'Posts',
    docs: 'Docs',
    breadcrumbDocs: 'Docs',
    projects: 'Projects',
    links: 'Links',
    connect: 'Connect',
    toggleMenu: 'Toggle menu',
    builtWith: 'Built with awareness.',
    footerTagline: 'A content hub for open-source projects, written in the open.',
    noTranslation: 'No translation available',
    noPages: 'No pages yet.',
    fallbackNotice: '',
  },
  zh: {
    home: '首页',
    posts: '博客',
    docs: '文档',
    breadcrumbDocs: '文档',
    projects: '项目',
    links: '链接',
    connect: '联系',
    toggleMenu: '切换菜单',
    builtWith: '用心构建。',
    footerTagline: '为开源项目打造的内容中心,以开放方式撰写。',
    noTranslation: '暂无中文翻译',
    noPages: '暂无页面。',
    fallbackNotice: '此页暂无中文翻译,以下显示英文原文。',
  },
} as const;

/** Landing page copy, per locale. Kept separate from `t` (small UI strings)
 *  because the landing page has a lot of long-form marketing text.
 *  This is original sample copy — replace it with your own. */
export const home = {
  en: {
    title: 'SiteName',
    description: 'A content hub that aggregates documentation and posts from many open-source projects, with per-page localization and free auto-deploy.',
    eyebrow: 'Open Source Content Hub',
    heroTitleA: 'One hub for your',
    heroTitleB: 'docs and posts.',
    heroLead: 'Publish documentation and blog posts from many repositories into a single, fast, localized static site. Content ships through pull requests, so nothing lands on main without review.',
    ctaGithub: 'View on GitHub',
    ctaProjects: 'View Projects',
    latestEyebrow: 'Latest',
    latestTitle: 'From the blog',
    allPosts: 'All Posts →',
    focusEyebrow: 'Why this starter',
    focusTitle: 'Built for content, not config',
    focusLead: 'The hard parts — i18n with per-page fallback, content collections, and free deployment — are already solved. You write Markdown; the hub builds and deploys.',
    card1Title: 'Content collections',
    card1Body: 'Posts and docs are typed Markdown loaded from the filesystem. Frontmatter is validated before content ever reaches the site.',
    card2Title: 'Localized by design',
    card2Body: 'Every page has an English default and a Chinese shell. Missing translations fall back gracefully instead of 404-ing.',
    card3Title: 'Zero-config styling',
    card3Body: 'A single global stylesheet with design tokens. Components stay small; Markdown reuses shared prose typography.',
    projectsEyebrow: 'Projects',
    projectsTitle: 'Projects in this hub',
    learnMore: 'Learn More',
    principlesEyebrow: 'Principles',
    principlesTitle: 'How we build',
    principle1Title: 'Open by default',
    principle1Body: 'Source code, decisions, and content are shared with the community.',
    principle2Title: 'Reviewed before ship',
    principle2Body: 'External content arrives as a pull request, so a human reviews it before it publishes.',
    principle3Title: 'Localized',
    principle3Body: 'A missing translation never breaks a link — it shows the default language with a notice.',
    principle4Title: 'Free to deploy',
    principle4Body: 'Static output deploys to GitHub Pages and Cloudflare Pages at no cost.',
    ctaTitle: 'Start your hub',
    ctaBody: 'Fork the template, point it at your domain, and copy an example repo to begin contributing content.',
    ctaGithubOrg: 'View the template on GitHub',
  },
  zh: {
    title: 'SiteName',
    description: '聚合多个开源项目的文档与文章的内容中心,支持逐页本地化,并可免费自动部署。',
    eyebrow: '开源内容中心',
    heroTitleA: '一个汇聚你所有',
    heroTitleB: '文档与文章的中心。',
    heroLead: '将多个仓库中的文档与博客文章发布到同一个快速、本地化的静态站点。内容通过拉取请求进入,任何内容在上线前都经过人工审阅。',
    ctaGithub: '在 GitHub 上查看',
    ctaProjects: '查看项目',
    latestEyebrow: '最新',
    latestTitle: '来自博客',
    allPosts: '全部文章 →',
    focusEyebrow: '为何选择此模板',
    focusTitle: '为内容而生,而非配置',
    focusLead: '棘手的部分 —— 带逐页回退的 i18n、内容集合、免费部署 —— 已经为你解决。你只需写 Markdown,中心负责构建与部署。',
    card1Title: '内容集合',
    card1Body: '文章与文档是从文件系统加载的带类型 Markdown。内容到达站点之前,Frontmatter 即经过校验。',
    card2Title: '原生本地化',
    card2Body: '每个页面都有英文默认版与中文外壳。缺失的翻译会优雅回退,而非返回 404。',
    card3Title: '零配置样式',
    card3Body: '单一全局样式表配合设计变量。组件保持精简,Markdown 复用统一的排版样式。',
    projectsEyebrow: '项目',
    projectsTitle: '本中心收录的项目',
    learnMore: '了解更多',
    principlesEyebrow: '原则',
    principlesTitle: '我们如何构建',
    principle1Title: '默认开放',
    principle1Body: '源代码、决策与内容都与社区共享。',
    principle2Title: '上线前审阅',
    principle2Body: '外部内容以拉取请求形式进入,因此在发布前会经过人工审阅。',
    principle3Title: '本地化',
    principle3Body: '缺失的翻译不会破坏链接 —— 它会以提示方式展示默认语言版本。',
    principle4Title: '免费部署',
    principle4Body: '静态输出可零成本部署到 GitHub Pages 与 Cloudflare Pages。',
    ctaTitle: '开始你的中心',
    ctaBody: '复刻模板,指向你的域名,并复制一个示例仓库即可开始贡献内容。',
    ctaGithubOrg: '在 GitHub 上查看模板',
  },
} as const;

/** Generic copy for a product detail page. Product-specific fields (name,
 *  github, badges) come from the `products` array; this supplies the
 *  surrounding labels, which are identical across products. */
export const productCopy = {
  en: {
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
  },
  zh: {
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
} as const;
