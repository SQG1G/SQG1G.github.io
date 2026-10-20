# 结构与扩展

这个项目的目标不是做成一个「主题」，而是让内容和界面都能独立生长。下面按「数据从哪来 → 页面怎么生成 → 新东西加在哪」来说明。

## 1. 设计原则

1. **内容优先**：先定义内容模型，再写页面；新增内容不需要改路由。
2. **单一事实来源**：站点名称、导航、首页文案集中在 `src/config.ts`；视觉变量集中在 `src/styles/global.css`。
3. **静态优先**：没有数据库和运行时服务；搜索索引在构建时生成，字体随包发布。
4. **局部样式**：组件自己的样式写在对应的 `.astro` 文件底部，避免全局样式失控。
5. **可验证**：类型检查、内容 Schema、构建和站内链接检查都在一条 `npm run build` 里。

## 2. 目录职责

```text
.
├─ src/
│  ├─ components/
│  │  ├─ Header.astro          # Apple 风格导航、搜索入口、全屏移动菜单
│  │  ├─ Footer.astro          # 极简页脚
│  │  ├─ SearchDialog.astro    # ⌘K 全屏搜索层（原生 <dialog>）
│  │  ├─ PostCard.astro        # 产品式文章卡片
│  │  ├─ NoteCard.astro        # 笔记卡片（支持深色区块）
│  │  └─ PageHeader.astro      # 列表页大标题
│  ├─ content/
│  │  ├─ posts/                # 文章 Markdown
│  │  └─ notes/                # 笔记 Markdown
│  ├─ layouts/
│  │  ├─ BaseLayout.astro      # HTML 骨架、SEO、View Transitions、Header/Footer
│  │  └─ ArticleLayout.astro   # 文章/笔记详情：进度、目录、前后篇
│  ├─ lib/
│  │  └─ content.ts            # 内容查询、排序、slug、日期、阅读时间
│  ├─ pages/
│  │  ├─ index.astro           # 首页
│  │  ├─ posts/index.astro     # 文章列表
│  │  ├─ posts/[...slug].astro # 文章详情
│  │  ├─ notes/index.astro     # 笔记列表
│  │  ├─ notes/[...slug].astro # 笔记详情
│  │  ├─ tags/index.astro      # 标签总览
│  │  ├─ tags/[tag].astro      # 单标签归档
│  │  ├─ about.astro           # 关于页
│  │  ├─ 404.astro             # 自定义 404
│  │  ├─ rss.xml.ts            # RSS
│  │  └─ search.json.ts        # 搜索索引端点
│  ├─ styles/
│  │  └─ global.css            # token、reset、共享 UI、正文排版
│  ├─ config.ts                # 站点配置 / 导航 / 首页文案
│  └─ content.config.ts        # 内容集合与 Zod Schema
├─ public/                     # 原样复制：favicon、OG、robots、manifest
├─ scripts/
│  ├─ new-content.mjs          # 新建文章/笔记的 CLI
│  └─ check-links.mjs          # 构建后检查站内链接
├─ docs/                       # 写作、部署、结构文档
└─ .github/workflows/          # CI 与 Pages 部署
```

## 3. 数据流

```text
src/content/**/*.md
        │
        ▼
content.config.ts（Schema 校验）
        │
        ▼
lib/content.ts（过滤草稿、排序、派生字段）
        │
        ├──────────────┬──────────────┬──────────────┐
        ▼              ▼              ▼              ▼
   页面 / 卡片      标签页          RSS          搜索 JSON
        │
        ▼
   Astro build → dist/ → GitHub Actions → GitHub Pages
```

几个关键约定：

- **页面不直接读取 Markdown 文件**，而是通过 `getPosts()` / `getNotes()` / `getWriting()`。
- **草稿规则只写在一个地方**：`lib/content.ts` 的 `isPublished`。开发环境显示草稿，生产构建隐藏。
- **slug 来自文件名**：`entrySlug()` 负责去掉扩展名，并统一 `/posts/<slug>/` 的链接。
- **标签从内容派生**：`getTagSummaries()` 汇总；标签页用 `getStaticPaths` 自动生成。

## 4. 路由一览

| 路由             | 文件                          | 说明                                |
| ---------------- | ----------------------------- | ----------------------------------- |
| `/`              | `pages/index.astro`           | 首页：Hero、最新文章、笔记、关于    |
| `/posts/`        | `pages/posts/index.astro`     | 全部文章 + 标签快捷入口             |
| `/posts/<slug>/` | `pages/posts/[...slug].astro` | 文章详情                            |
| `/notes/`        | `pages/notes/index.astro`     | 全部笔记 + 状态图例                 |
| `/notes/<slug>/` | `pages/notes/[...slug].astro` | 笔记详情                            |
| `/tags/`         | `pages/tags/index.astro`      | 标签总览                            |
| `/tags/<tag>/`   | `pages/tags/[tag].astro`      | 某个标签下的全部内容                |
| `/about/`        | `pages/about.astro`           | 关于与站点说明                      |
| `/rss.xml`       | `pages/rss.xml.ts`            | 文章 RSS                            |
| `/search.json`   | `pages/search.json.ts`        | 构建时生成的搜索索引                |
| `/404.html`      | `pages/404.astro`             | 自定义 404（GitHub Pages 自动识别） |

## 5. 加一个新页面

例如加一个 `/uses/` 页面：

```astro
---
// src/pages/uses.astro
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="我在用什么" description="工具、软件和日常设备。">
  <section class="container">
    <h1>我在用什么</h1>
    <p>内容……</p>
  </section>
</BaseLayout>

<style>
  .container {
    padding-block: 4rem;
  }
</style>
```

然后把它加进导航：

```ts
// src/config.ts
nav: [
  { label: '文章', href: '/posts/' },
  { label: '笔记', href: '/notes/' },
  { label: '标签', href: '/tags/' },
  { label: '关于', href: '/about/' },
  { label: '在用', href: '/uses/' },
],
```

页面会自动被 sitemap 收录；Header 和 Footer 的导航都来自同一份配置。如果新页面有动态部分，再用 `.ts` 端点或组件实现。

## 6. 加一种内容类型

假设要加「项目」集合，步骤是固定的：

### 6.1 注册集合

```ts
// src/content.config.ts
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    year: z.number(),
    stack: z.array(z.string()).default([]),
    link: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, notes, projects };
```

在 `src/content/projects/` 下新建 Markdown，frontmatter 按上面的字段写。

### 6.2 加列表页和详情页

```astro
---
// src/pages/projects/index.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const projects = (await getCollection('projects'))
  .filter((project) => import.meta.env.DEV || !project.data.draft)
  .sort((a, b) => b.data.year - a.data.year);
---

<BaseLayout title="项目" description="做过的一些东西。">
  <section class="container">
    <h1>项目</h1>
    {projects.map((project) => (
      <a href={`/projects/${project.id.replace(/\.md$/, '')}/`}>{project.data.title}</a>
    ))}
  </section>
</BaseLayout>
```

```astro
---
// src/pages/projects/[...slug].astro
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({
    params: { slug: project.id.replace(/\.md$/, '') },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await render(project);
---

<BaseLayout title={project.data.title} description={project.data.summary}>
  <article class="container">
    <h1>{project.data.title}</h1>
    <Content />
  </article>
</BaseLayout>
```

### 6.3 决定是否接入公共能力

- **标签**：给 Schema 加 `tags`，再决定是否让标签汇总包含项目；
- **搜索**：在 `src/pages/search.json.ts` 里合并新集合；
- **RSS**：当前 RSS 只收文章；如果项目也适合订阅，再加进去；
- **首页**：在 `pages/index.astro` 里读集合、渲染新卡片。

不要一次性把新集合塞进所有入口。先让它有列表和详情，再按需要接入。

## 7. 加一个组件

组件放在 `src/components/`，用 Props 接收数据，样式写在文件内的 `<style>` 中。比如做一个「书单卡片」：

```astro
---
interface Props {
  title: string;
  author: string;
}
const { title, author } = Astro.props;
---

<article class="book">
  <h3>{title}</h3>
  <p>{author}</p>
</article>

<style>
  .book {
    padding: 1rem;
    border: 1px solid var(--line);
    border-radius: var(--radius-md);
  }
</style>
```

可直接使用 `var(--ink)`、`var(--bg-secondary)`、`var(--radius)` 等全局 token，保持视觉一致。

## 8. 改设计

### 颜色和圆角

`src/styles/global.css` 顶部是唯一的 token 入口。整体遵循 Apple 式的克制配色：黑、白、灰，加一个蓝色强调色。

| Token                                            | 作用                     |
| ------------------------------------------------ | ------------------------ |
| `--bg` / `--bg-secondary`                        | 页面背景与交替区块背景   |
| `--ink` / `--ink-secondary` / `--ink-tertiary`   | 三级文字颜色             |
| `--blue` / `--blue-hover` / `--blue-on-dark`     | 链接、按钮与深色区块强调 |
| `--dark` / `--dark-surface` / `--dark-text`      | 首页与笔记区块的深色层级 |
| `--line` / `--line-soft`                         | 分割线与轻边框           |
| `--radius` / `--radius-large`                    | 卡片圆角                 |
| `--glass-bg` / `--glass-border` / `--glass-blur` | 毛玻璃面板与卡片         |
| `--font-sans` / `--font-display` / `--font-mono` | 字体栈                   |

这个站点没有深色模式切换：深色是页面设计的一部分（首页 Hero、笔记区块），整体保持固定的浅色界面，与 apple.com 的阅读方式一致。改色时优先保持高对比度和克制的用色，不要同时引入第二个强调色。

## 字体

`src/layouts/BaseLayout.astro` 引入两个字体包：

```ts
import '@fontsource-variable/inter';
import '@fontsource-variable/noto-sans-sc';
```

字体栈在 `global.css` 中：

- Apple 设备：优先使用系统 **SF Pro Text / SF Pro Display** 和中文 **PingFang SC**；
- 其他平台：拉丁字符使用 **Inter Variable**，中文使用 **Noto Sans SC Variable**；
- 如果字体加载失败，Windows 回退到 Microsoft YaHei；代码使用 SF Mono / Cascadia Code / Consolas。

Apple 的 SF Pro 是系统字体，不应把字体文件复制进仓库或通过第三方 CDN 分发。换字体时改 `--font-sans` / `--font-display` 即可，中文回退字体已经写在字体栈里。

### 页面级样式

- 页面结构样式：对应 `src/pages/*.astro` 底部的 `<style>`；
- 组件样式：对应组件的 `<style>`；
- 正文排版：`global.css` 的 `.prose`；
- 不要为了一个页面改全局 `.prose`，除非你确实想影响所有文章。

### 动效与毛玻璃

页面切换使用 Astro 的 **ClientRouter**，入口在 `BaseLayout.astro`：

```astro
import {ClientRouter} from 'astro:transitions'; ...
<ClientRouter />
```

转场本身在 `global.css` 的 `::view-transition-old(root)` / `::view-transition-new(root)` 中定义：旧页面淡出并轻微放大、模糊，新页面从下方淡入。想调整转场时长或手感，改这两组 keyframes 即可；系统开启“减少动态效果”时，转场会自动被禁用。

毛玻璃 token 同样在 `global.css`：

- 顶栏、移动端菜单、全屏搜索层用 `--glass-*`；
- 首页文章卡片用 `--post-card-*`，可通过 `.latest` 的局部变量覆盖；
- 首页笔记卡片用 `--note-card-*`，在深色区块中覆写为半透明深玻璃。

因为 ClientRouter 会替换页面 DOM，带交互的组件脚本需要监听 `astro:page-load` 并在每次初始化时清理旧监听器；本项目中的 Header、SearchDialog、ArticleLayout 都采用这个模式。新增带 JS 的组件时，照这个方式写即可。

指向非 HTML 资源的链接（例如 RSS）要加 `data-astro-reload`，让浏览器执行一次正常跳转，而不是被客户端路由拦截。

## 9. SEO、RSS 和搜索

### SEO

`BaseLayout.astro` 负责：

- `<title>`、description、canonical；
- Open Graph / Twitter Card；
- 文章发布时间、修改时间、标签；
- JSON-LD（站点 + 文章类型）；
- RSS 自动发现。

默认分享图是 `public/og-default.png`（1200×630）。换图时保持同样的尺寸和路径，或改 `src/config.ts` 的 `ogImage`。

### RSS

`src/pages/rss.xml.ts` 只读取文章。每条包含标题、摘要、日期、链接和标签。RSS 是全文订阅之外的一种轻量入口；如果希望包含笔记，改数据源即可。

### 搜索

- 构建时由 `src/pages/search.json.ts` 生成索引；
- 字段：标题、摘要、标签、日期、类型、URL、正文前 600 字符；
- 前端在 `SearchDialog.astro` 里做打分：标题 > 标签 > 摘要 > 正文；
- 没有使用 Pagefind/Elasticsearch，索引完全静态。

如果内容量增长到几千条，可以考虑换成 Pagefind 或构建时切分索引；当前规模下，一个 JSON 足够快。

## 10. 可以继续接的东西

### 评论

推荐 giscus（基于 GitHub Discussions）或 utterances。做法：

1. 在仓库开启 Discussions，安装对应 GitHub App；
2. 新建 `Comments.astro`，放入 giscus 的 `<script>`；
3. 只在 `ArticleLayout` 的正文底部渲染。

评论组件是客户端脚本，不影响静态构建。注意：它会把页面访问发送给 GitHub，需要在站点里说明。

### 访问统计

推荐隐私友好的 Plausible / Umami，或者在 GitHub Actions 里做简单的构建统计。不要把密钥写进前端；统计脚本只暴露公开的站点 ID。

### 图片优化

当前图片从 `public/` 原样提供。如果要使用 Astro 的图片优化：

1. 在 Schema 中加 `image: image()`；
2. 图片放到 `src/assets/` 或内容目录；
3. 用 `<Image />` 渲染，生成多尺寸资源。

这会把图片处理纳入构建，适合配图较多的博客。

### 大改内容模型

如果文章开始有明显的「系列」「专栏」需求，可以增加 `series` 字段和聚合页，而不是把系列名塞进标签。标签是横向主题，系列是纵向顺序，两者不要混用。

## 11. 维护约定

- **文件名**：英文、小写、短横线；中文标题用 `--slug` 指定文件名。
- **日期**：frontmatter 用 `YYYY-MM-DD`；不要写相对日期。
- **摘要**：说明「这篇解决什么问题」，而不是重复标题。
- **标签**：同一概念只保留一个写法。
- **依赖**：Astro 固定为 6.x 的一个小版本，升级时单独提交，并跑 `npm run build`。
- **部署前**：至少跑一次 `npm run build`；它已经包含类型检查和链接检查。
- **秘密**：这个站点不需要任何构建密钥；不要把 token、邮箱密码或私有 API key 写进仓库。

## 12. 验证与 CI

`npm run build` 会按顺序执行：

1. `astro check`：类型、Schema、组件 Props；
2. `astro build`：静态构建；
3. `scripts/check-links.mjs`：遍历 `dist/**/*.html`，检查站内链接、静态资源和页面锚点。

CI 还会跑 `npm run format:check`。这三层已经覆盖了静态博客最常见的问题：内容格式、页面构建、站内 404。

如果以后加入交互较多的功能，建议再加 Playwright 做真实浏览器测试；对当前站点，构建 + 链接检查足够轻量。
