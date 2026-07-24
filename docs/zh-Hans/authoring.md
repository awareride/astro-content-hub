---
title: "编写内容"
description: "在中心仓库内直接撰写博客文章与文档:i18n 模型、slug 约定、回退机制,以及添加产品或语言。"
order: 2
---

本指南介绍如何在**中心仓库内**(位于 `src/content/` 之下)直接撰写博客文章与
文档。若要从*独立*仓库贡献内容,请参阅[内容同步](./content-sync.md)。

中心是一个 Astro 7 静态站点。内容以 Markdown 形式存放在 `src/content/` 中,
采用 locale 前缀的本地化方案:默认语言 `en` 没有 URL 前缀;其他语言位于
`/<locale>/...` 之下(当前为 `zh-Hans`)。

## i18n 模型

`src/lib/i18n.ts` 是 locale、UI 字符串(`t`)、落地页文案(`home`)及产品页文案
(`productCopy`)的唯一事实来源。`products` 数组位于 `src/config/products.ts`。
`src/content.config.ts` 通过遍历 `products × locales`(文档)和 `locales`(文章)
自动生成集合。集合名通过 `collectionSuffix()` 使用 PascalCase 语言后缀
(例如 `zh-Hans` -> `postsZhHans`、`viteDocsZhHans`)。添加产品或语言只需改动一行。

### Slug 约定(关键)

一个文件的 **slug** 是其相对于 locale 目录、去掉 `.md` 后的路径。中心的回退
机制按 slug 匹配同一页面的 `en` 与 `zh-Hans` 版本,因此**各语言之间的文件名必须
逐字节一致。**

| 文件 | Slug |
|------|------|
| `posts/en/hello-world.md` | `hello-world` |
| `posts/zh-Hans/hello-world.md` | `hello-world` |
| `posts/en/mytool/foo.md` | `mytool/foo` |
| `docs/en/getting-started.md` | `getting-started` |

`en/getting-started.md` 与 `zh-Hans/Getting-Started.md` 会产生不同的 slug,从而破坏
回退。务必先写 `en` 版本。

### 回退

回退是逐页、内容级别的 —— 绝不是重定向。缺失的 `zh-Hans` 页面依然在 `/zh-Hans/.../` 解析,
并在 `zh-Hans` 外壳中渲染 `en` 正文,同时显示一条可见提示。URL 始终为 `/zh-Hans/...`。

## 博客文章

文章位于 `src/content/posts/<locale>/`。嵌套目录会成为路径片段
(`posts/en/mytool/foo.md` → `/posts/mytool/foo/`)。

**Frontmatter**(`postSchema`):

```yaml
---
title: "Post Title"                          # 必填
date: 2025-07-21                             # 必填,YYYY-MM-DD
description: "One-line summary."             # 必填
tags: ["announcement"]                       # 可选,默认为 []
author: "Your Name"                          # 可选
source: "https://github.com/owner/repo"      # 可选
draft: false                                 # 可选;草稿会被排除
---
```

步骤:

1. 创建 `src/content/posts/en/<slug>.md`。
2. 可选:以相同 slug 添加 `src/content/posts/zh-Hans/<slug>.md`。若省略,该 `en` 文章
   仍会出现在 `/zh-Hans/posts/`(带 `EN` 徽章),并在 `/zh-Hans/posts/<slug>/` 渲染英文正文。
3. `zh-Hans` 文章中的内部链接应指向 `/zh-Hans/...` 路径。
4. 运行 `npm run build`。无需改动路由 —— 默认路由(`src/pages/posts/...`)
   与通用非默认路由(`src/pages/[locale]/posts/...`)已服务所有语言。

## 为已有产品编写文档

文档位于 `src/content/docs/<product>/<locale>/`。产品来自 `products` 数组
(`src/config/products.ts`;示例:vite、astro、json-server)。

**Frontmatter**(`docSchema`):

```yaml
---
title: "Page Title"          # 必填
description: "Short summary" # 可选
order: 2                     # 可选,控制侧边栏排序(默认 0)
---
```

- `index.md` 是文档落地页(服务于 `/<product>/docs/`,而不是
  `/<product>/docs/index/`)。无论 `order` 为何,它始终排在最前;其余页面按
  `order` 排序,再按标题排序。
- 中文版:以相同 slug 添加 `src/content/docs/<product>/zh-Hans/<slug>.md`。缺失的
  `zh-Hans` 页面会回退到 `en` 正文并显示提示。
- `zh-Hans` 文档中的内部链接应指向 `/zh-Hans/<product>/docs/...`。

## 添加一个新产品

唯一会触及配置的编写任务:

1. 在 `src/config/products.ts` 中注册产品:

   ```ts
   export const products: Product[] = [
     // ...已有...
     { slug: 'mytool', name: 'MyTool', github: 'https://github.com/owner/mytool', badges: ['Tool'] },
   ];
   ```

   这会自动生成 `mytoolDocsEn` / `mytoolDocsZhHans` 集合,以及落地页卡片
   (`nav: true` 时含导航项)。

2. 添加内容:

   ```
   src/content/docs/mytool/en/index.md
   src/content/docs/mytool/en/getting-started.md
   src/content/docs/mytool/zh-Hans/index.md   # 可选;回退到 en
   ```

3. 路由是自动生成的(产品页面是动态的)。运行 `npm run build` 并验证
   `/mytool/docs/` 与 `/zh-Hans/mytool/docs/` 能正常渲染。

## 自定义产品落地页

默认情况下,每个产品落地页(`/<product>/`)都渲染 `src/components/ProductLandingDefault.astro` 中的共享通用 hero + CTA。要为某个产品提供自定义落地页,只需添加一个以产品 **slug** 命名的组件:

```
src/components/product-landing/<slug>.astro     # 例如 src/components/product-landing/vite.astro
```

`src/lib/product-landing.ts` 在构建时预先 glob 该目录,因此该文件会被自动发现 -- 无需配置,无需改动路由。两个落地路由(默认 `/<product>/` 路由及其 `/<locale>/<product>/` 双生路由)都会自动采用该覆盖;没有匹配文件的产品则继续使用通用落地页。文档子路由(`/<product>/docs...`)不受影响,仍为数据驱动。

覆盖只渲染 **`<main>` 区块**(hero、自定义区块、CTA)。路由仍负责 `Layout` + `Nav` + `Footer` 与 `<head>`,因此不存在第二份文档外壳。它接收与回退相同的 props:

| Prop | 含义 |
|------|------|
| `product` | 来自 `src/config/products.ts` 的完整 `Product` 条目。 |
| `locale` | 当前 locale(默认路由传入 `'en'`,双生路由传入循环变量)。 |
| `c` | 已按 locale 解析的 UI 字符串(`ProductCopy`)-- 复用 `c.viewSource`、`c.documentation`、`c.ctaTitle` 等。 |
| `docsHref` | 已感知 base、带 locale 前缀的文档链接,由路由预先计算。 |

要本地化覆盖专属文案,可在组件内部按 `locale` 分支;v1 为每个产品提供一份覆盖,跨所有 locale 使用(按语言拆分的覆盖文件如 `vite.zh-Hans.astro` 是未来的扩展)。示例 `src/components/product-landing/vite.astro` 展示了这一约定 -- 复用共享 CSS 类(`.product-hero`、`.section`、`.btn`、`.feature-grid` 等),仅当全局类不适用时才添加 scoped `<style>`。

## 添加一门新语言

添加语言是**纯数据变更** —— 无需创建或镜像路由文件,因为非默认路由是通用的
(`src/pages/[locale]/...` 遍历 `locales`)。以添加 `ja` 为例:

1. 在 `src/lib/i18n.ts` 的 `locales` 中追加 `'ja'`;为每个 `Record<Locale, …>`
   表添加 `ja` 块:`localeLabel`、`localeCode`、`t`、`home` 与 `productCopy`。
   由于每个表都类型化为 `Record<Locale, …>`,遗漏任一(或其键偏离 `en` 种子)
   都是编译错误 —— 在 `ja` 补全前 `astro check` 不会通过。
2. 创建 `src/content/posts/ja/` 与 `src/content/docs/<product>/ja/`
   (集合从 `locales` 自动生成)。
3. **无需改动路由。** `src/pages/[locale]/...` 已遍历 `locales`,因此 `ja`
   页面自动服务于 `/ja/...`。`Layout`/`Nav`/`Footer`/`LocaleSwitcher`
   通过 `localeFromPath` 从 URL 推断 locale 并查找 `t[locale]`;`localeFromPath`
   的正则同时匹配双字母前缀(`/ja/...`)与带子标签的前缀(`/zh-Hans/...`)。

运行 `npm run build` 并验证 `/ja/...` 页面能渲染,且切换器提供了新语言。
(在没有 `ja` 内容时,每个 `/ja/...` 页面都会在 `ja` 外壳中回退到 `en` ——
这是在翻译前确认路由可用的有效方式。)

## 常见陷阱

- **各语言 slug 不一致** —— 保持文件名逐字节一致。
- **从 `zh-Hans` 页面链接到 `/<product>/docs/...`** —— 应使用
  `/zh-Hans/<product>/docs/...`,让读者留在本地化外壳中。
- **忘记 `order`** —— 默认 `order: 0` 的新文档会聚集在一起;为稳定排序请设置
  明确的值。
- **`index` slug 是特殊的** —— 切勿链接到 `/<product>/docs/index/`;它不存在。
  `buildNav` 会将 index 文档映射到基础路径。

## 验证

```bash
npm run build   # 必须 0 错误/0 警告/0 提示(运行 astro check)
```

然后在 `dist/` 中抽查:

```bash
grep -o '<html lang="[^"]*"' dist/zh-Hans/vite/docs/getting-started/index.html
grep -c 'rel="alternate"' dist/zh-Hans/vite/docs/getting-started/index.html   # 期望 = 语言数
grep -c '此页暂无中文翻译' dist/zh-Hans/posts/localized-sample/index.html       # 回退提示
```
