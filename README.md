# SQG1G.github.io

SQG1G 的个人博客与技术笔记。一个用 **Astro** 构建的静态站点：内容写在 Markdown 里，推送代码后由 GitHub Actions 自动构建并发布到 GitHub Pages。

- **线上站点**：<https://sqg1g.github.io>
- **仓库**：<https://github.com/SQG1G/SQG1G.github.io>
- **部署状态**：[![Deploy to GitHub Pages](https://github.com/SQG1G/SQG1G.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/SQG1G/SQG1G.github.io/actions/workflows/deploy.yml)

## 这个站点有什么

- **文章 / 笔记两种内容类型**：长文放在「文章」，更短、仍在生长的内容放在「知识花园」。
- **Apple 风格的极简排版**：黑白分区、超大字号、克制留白；Apple 设备优先使用 SF Pro / PingFang，其他平台使用 Inter / Noto Sans SC。
- **内容集合 + Schema**：标题、摘要、日期、标签和草稿状态都有校验，不怕越写越乱。
- **自动路由**：新增 Markdown 后，文章页、标签页、RSS、搜索索引自动更新。
- **站内搜索**：构建时生成 JSON 索引，支持 `Ctrl / ⌘ + K` 和 `/` 快捷键。
- **舒服的阅读体验**：响应式布局、文章目录、代码复制、阅读进度。
- **完整工作流**：本地开发 → 格式检查 → 类型检查 → 构建 → 链接检查 → GitHub Actions → Pages。
- **清晰的扩展点**：站点信息、导航、设计 token、内容集合和页面结构都有明确的修改位置。

## 快速开始

需要 Node.js **22.12 或更高版本**（推荐 22 LTS）。

```bash
npm install
npm run dev
```

打开 <http://localhost:4321>。

常用命令：

| 命令                                                            | 用途                           |
| --------------------------------------------------------------- | ------------------------------ |
| `npm run dev`                                                   | 启动本地开发服务器             |
| `npm run new -- post "标题" --tags "Astro,前端" --slug my-post` | 新建文章                       |
| `npm run new -- note "标题" --tags "工具" --slug my-note`       | 新建笔记                       |
| `npm run check`                                                 | Astro / TypeScript 类型检查    |
| `npm run build`                                                 | 类型检查 + 构建 + 站内链接检查 |
| `npm run preview`                                               | 预览构建结果                   |
| `npm run format`                                                | 用 Prettier 格式化源码         |
| `npm run format:check`                                          | 检查格式（CI 会运行）          |

## 内容工作流

```text
npm run new ──▶ 写 Markdown ──▶ npm run dev 预览
                                      │
                                      ▼
                              git commit & push
                                      │
                                      ▼
                    GitHub Actions: check + build
                                      │
                                      ▼
                          https://sqg1g.github.io
```

新建内容默认是草稿；把 frontmatter 里的 `draft` 改成 `false`，或创建时加 `--publish`，下次构建才会公开。

详细说明：

- [写作指南](docs/WRITING.md)：frontmatter、草稿、标签、图片和写作检查清单。
- [部署指南](docs/DEPLOY.md)：GitHub Pages、首次发布、自定义域名和排错。
- [结构与扩展](docs/STRUCTURE.md)：目录职责、加页面、加内容类型、改设计和接第三方服务。

## 目录速览

```text
.
├─ src/
│  ├─ components/        # 可复用 UI：Header、Footer、卡片、搜索框
│  ├─ content/
│  │  ├─ posts/          # 文章 Markdown
│  │  └─ notes/          # 笔记 Markdown
│  ├─ layouts/           # BaseLayout、ArticleLayout
│  ├─ lib/               # 内容查询、格式化、阅读时间
│  ├─ pages/             # 路由（首页、列表、详情、标签、RSS、搜索索引）
│  ├─ styles/            # 设计 token、基础样式、正文排版
│  ├─ config.ts          # 站名、导航、社交链接、首页文案
│  └─ content.config.ts  # 内容集合与 Schema
├─ public/               # favicon、OG 图、robots、manifest
├─ scripts/              # 新建内容、链接检查
├─ docs/                 # 写作 / 部署 / 结构文档
├─ .github/workflows/    # CI 与自动部署
├─ astro.config.mjs
└─ package.json
```

## 自定义

1. 改 `src/config.ts`：站名、简介、导航、社交链接、首页文案、关于页内容。
2. 改 `src/styles/global.css` 顶部的 CSS 变量：颜色、字体、圆角、间距。
3. 换 `public/favicon.svg`、`public/og-default.png` 和 `public/apple-touch-icon.png`。
4. 替换示例文章和笔记，改成自己的内容。

站点的设计说明和组件级样式分别放在对应 `.astro` 文件底部，便于局部修改，不牵一发动全身。

## 部署

仓库名必须是 **`SQG1G.github.io`**，这样站点才会发布在用户站点的根路径 `https://sqg1g.github.io`。

在 GitHub 仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。之后每次推送到 `main`，[deploy.yml](.github/workflows/deploy.yml) 会自动构建并发布。

首次发布和自定义域名的完整步骤见 [部署指南](docs/DEPLOY.md)。

## 说明

示例文章、笔记和关于页文案都是为了展示结构而写的，发布前请按自己的经历修改。站点不包含追踪脚本、评论或外部运行时服务；需要时可以按 [结构与扩展](docs/STRUCTURE.md) 的说明自行接入。
