## 部署流程

仓库根目录托管在 GitHub Pages，新增 `.github/workflows/jekyll-gh-pages.yml` 工作流，push 到 `main` 自动构建并发布。

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/jekyll-build-pages@v1
      - uses: actions/deploy-pages@v4
```

## 多语言

使用 `jquery.i18n` 插件，把中英文文案放在 `assets/i18n` 下两份 JSON 中。页面元素加 `i18n` 属性，启动时按 `localStorage.lang` 切换。

> 这套方案对静态站非常友好，零后端零构建步骤就能跑起来。

## 后续

- [x] 把博客文章抽成 JSON 数据源
- [x] 接入 marked.js 渲染 Markdown
- [ ] 后续考虑加入 RSS 与文章目录（TOC）

写文章可以直接放进 `assets/data/posts/` 下的 `.md` 文件，再到 `blog.json` 里加一条记录、把 `contentFile` 指过去就行。
