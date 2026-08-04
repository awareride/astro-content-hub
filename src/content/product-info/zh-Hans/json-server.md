---
tagline: "不到 30 秒,零代码即可获得一个完整的仿 REST API。"
description: "由简单 JSON 文件驱动的仿 REST API。非常适合原型设计、Mock 与教学。"
highlights:
  - label: "许可证"
    value: "MIT"
  - label: "运行时"
    value: "Node"
install: |
  npm install -g json-server
features:
  - title: "零配置 API"
    body: "将 json-server 指向一个 JSON 文件,即可即时获得带路由、分页与过滤的完整 REST API。"
  - title: "标准 REST"
    body: "GET、POST、PUT、PATCH、DELETE 开箱即用,对 ID 与关联关系有合理的默认处理。"
  - title: "自定义路由"
    body: "可定义自定义路由与中间件,为原型或演示塑造 API 行为。"
links:
  - label: "官网"
    href: "https://json-server.typicode.com"
# Section system demo (Phase 1): explicitly declares the same sections the
# legacy fixed order renders, so this product is the worked example for
# "MD declares data, code registry maps components". Entries without `data`
# are filled from the matching field above (tagline/features/highlights/install).
sections:
  - type: hero
  - type: highlights
  - type: install
  - type: features
  - type: stats
    data:
      - { label: "GitHub Stars", value: "58k" }
      - { label: "npm 周下载量", value: "1.2M" }
      - { label: "许可证", value: "MIT" }
  - type: testimonials
    data:
      - quote: "json-server 让我们一个下午就把原型跑起来了。"
        author: "陈晓雅"
        role: "前端工程师,Nimbus"
      - quote: "为教程和演示 mock 后端的最快方式。"
        author: "李宇飞"
        role: "技术写作"
  - type: docs-preview
  - type: faq
    data:
      - q: "json-server 可以用于生产环境吗?"
        a: "它面向原型与演示;生产环境请搭配真实后端。"
      - q: "支持过滤与分页吗?"
        a: "支持 —— 开箱即用,通过查询参数即可。"
  - type: cta
    data:
      primary: { label: "开始上手", href: "/json-server/docs/getting-started" }
      secondary: { label: "查看源码", href: "https://github.com/typicode/json-server" }
---

`json-server` 监视一个 JSON 文件并将其暴露为 REST API。它是快速原型、
教学以及需要逼真后端的前端开发的热门选择。

## 工作原理

提供一个 `db.json` 文件描述你的资源:

```json
{
  "posts": [{ "id": 1, "title": "Hello" }],
  "comments": [{ "id": 1, "body": "Nice", "postId": 1 }]
}
```

然后运行 `json-server db.json`,即可从 `http://localhost:3000/posts` 获取数据。
