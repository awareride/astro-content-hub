---
title: "编写内容"
description: "在中心仓库内直接撰写博客文章与文档:i18n 模型、slug 约定、回退机制,以及添加产品或语言。"
order: 2
---

本指南介绍如何在**中心仓库内**(位于 `src/content/` 之下)直接撰写博客文章与
文档。若要从*独立*仓库贡献内容,请参阅[内容同步](./content-sync.md)。

中心是一个 Astro 7 静态站点。内容以 Markdown 形式存放在 `src/content/` 中,
采用 locale 前缀的本地化方案:默认语言 `en` 没有 URL 前缀;其他语言位于
`/<locale>/...` 之下(当前为 `zh`)。

## i18n 模型

`src/lib/i18n.ts` 是 locale、UI 字符串(`t`)、落地页文案(`home`)以及 `products`
数组的唯一事实来源。`src/content.config.ts` 通过遍历 `products × locales`
(文档)和 `locales`(文章)自动生成集合。添加产品或语言只需改动一行。

### Slug 约定(关键)

一个文件的 **slug** 是其相对于 locale 目录、去掉 `.md` 后的路径。中心的回退
机制按 slug 匹配同一页面的 `en` 与 `zh` 版本,因此**各语言之间的文件名必须
逐字节一致。**

| 文件 | Slug |
|------|------|
| `posts/en/hello-world.md` | `hello-world` |
| `posts/zh/hello-world.md` | `hello-world` |
| `posts/en/mytool/foo.md` | `mytool/foo` |
| `docs/en/getting-started.md` | `getting-started` |

`en/getting-started.md` 与 `zh/Getting-Started.md` 会产生不同的 slug,从而破坏
回退。务必先写 `en` 版本。

### 回退

回退是逐页、内容级别的 —— 绝不是重定向。缺失的 `zh` 页面依然在 `/zh/.../` 解析,
并在 `zh` 外壳中渲染 `en` 正文,同时显示一条可见提示。URL 始终为 `/zh/...`。

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
2. 可选:以相同 slug 添加 `src/content/posts/zh/<slug>.md`。若省略,该 `en` 文章
   仍会出现在 `/zh/posts/`(带 `EN` 徽章),并在 `/zh/posts/<slug>/` 渲染英文正文。
3. `zh` 文章中的内部链接应指向 `/zh/...` 路径。
4. 运行 `npm run build`。无需改动路由。

## 为已有产品编写文档

文档位于 `src/content/docs/<product>/<locale>/`。产品来自 `products` 数组
(`src/lib/i18n.ts`;示例:vite、astro、json-server)。

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
- 中文版:以相同 slug 添加 `src/content/docs/<product>/zh/<slug>.md`。缺失的
  `zh` 页面会回退到 `en` 正文并显示提示。
- `zh` 文档中的内部链接应指向 `/zh/<product>/docs/...`。

## 添加一个新产品

唯一会触及配置的编写任务:

1. 在 `src/lib/i18n.ts` 中注册产品:

   ```ts
   export const products: Product[] = [
     // ...已有...
     { slug: 'mytool', name: 'MyTool', github: 'https://github.com/owner/mytool', badges: ['Tool'] },
   ];
   ```

   这会自动生成 `mytoolDocsEn` / `mytoolDocsZh` 集合,以及落地页卡片 + 导航项。

2. 添加内容:

   ```
   src/content/docs/mytool/en/index.md
   src/content/docs/mytool/en/getting-started.md
   src/content/docs/mytool/zh/index.md        # 可选;回退到 en
   ```

3. 路由是自动生成的(产品页面是动态的)。运行 `npm run build` 并验证
   `/mytool/docs/` 与 `/zh/mytool/docs/` 能正常渲染。

## 添加一门新语言

添加语言会涉及 `src/lib/i18n.ts`、创建内容目录,并需要在 `src/pages/<locale>/`
下镜像 `src/pages/zh/`。以添加 `ja` 为例:

1. 在 `i18n.ts` 的 `locales` 中追加 `'ja'`;为 `t` 与 `home` 添加 `ja` 块;更新
   `localeLabel`。
2. 创建 `src/content/posts/ja/` 与 `src/content/docs/<product>/ja/`。
3. 将 `src/pages/zh/` 下的每个文件复制到 `src/pages/ja/`,将 locale 字符串从
   `'zh'` 改为 `'ja'`,UI 文本改为日文,并将 `/zh/...` 基础路径改为
   `/ja/...`。`en` 路由无需改动。
4. `Layout`/`Nav`/`Footer`/`LocaleSwitcher` 会从 URL 推断 locale 并查找 `t`,
   因此一旦 `t.ja` 存在即可工作。

运行 `npm run build` 并验证 `/ja/...` 页面能渲染,且切换器提供了新语言。

## 常见陷阱

- **各语言 slug 不一致** —— 保持文件名逐字节一致。
- **从 `zh` 页面链接到 `/<product>/docs/...`** —— 应使用
  `/zh/<product>/docs/...`,让读者留在本地化外壳中。
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
grep -o '<html lang="[^"]*"' dist/zh/vite/docs/getting-started/index.html
grep -c 'rel="alternate"' dist/zh/vite/docs/getting-started/index.html   # 期望 = 语言数
grep -c '此页暂无中文翻译' dist/zh/posts/localized-sample/index.html       # 回退提示
```
