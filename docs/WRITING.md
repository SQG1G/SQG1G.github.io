# 写作指南

这个站点把内容当作数据管理：每篇文章、每则笔记都是一个带 frontmatter 的 Markdown 文件，经过 Schema 校验后自动生成页面、标签、RSS 和搜索索引。

## 1. 新建内容

### 用脚本（推荐）

```bash
# 文章
npm run new -- post "给中文标题一个英文地址" --tags "Astro,前端" --slug readable-url

# 笔记
npm run new -- note "一个还没想透的问题" --tags "思考" --slug open-question
```

可选参数：

| 参数                  | 说明                             |
| --------------------- | -------------------------------- |
| `--tags "Astro,前端"` | 逗号分隔的标签；不传则留空       |
| `--slug my-post`      | URL 文件名；中文标题建议手动提供 |
| `--publish`           | 创建时就是发布状态；默认是草稿   |
| `--help`              | 查看用法                         |

脚本会生成：

- `src/content/posts/<slug>.md` 或 `src/content/notes/<slug>.md`
- 一个可以直接构建的 frontmatter 骨架
- 一段正文起始模板

如果既没有 ASCII 标题也没有 `--slug`，脚本会退化成日期时间文件名（如 `20261020-1955.md`）。这能正常工作，但 URL 不好看，所以中文标题最好手动指定 slug。

### 手动新建

在 `src/content/posts/` 或 `src/content/notes/` 下创建 `.md` 文件即可。文件名（不含扩展名）就是 URL 的一部分：

```text
src/content/posts/readable-css.md
→ https://sqg1g.github.io/posts/readable-css/
```

## 2. Frontmatter

### 文章

```yaml
---
title: '标题：尽量具体'
description: '一两句话说明这篇文章解决什么问题、适合谁读。'
date: 2026-10-20
updated: 2026-10-22
tags:
  - Astro
  - 前端
draft: false
---
```

### 笔记

```yaml
---
title: '一个还在生长的想法'
description: '先把结论或问题写在这里。'
date: 2026-10-20
tags:
  - 思考
status: growing
draft: false
---
```

| 字段          | 必填      | 说明                                                              |
| ------------- | --------- | ----------------------------------------------------------------- |
| `title`       | 是        | 最多 120 字符；会用于页面标题、卡片、RSS、搜索。                  |
| `description` | 是        | 最多 260 字符；用于摘要、SEO 和卡片。不要简单重复标题。           |
| `date`        | 是        | 建议写成 `YYYY-MM-DD`；构建时统一转成日期。                       |
| `updated`     | 否        | 最近一次实质性修订；文章页会显示「更新于」。                      |
| `tags`        | 否        | 字符串数组。不需要提前注册，标签页和索引会自动生成。              |
| `draft`       | 否        | `true` 时开发环境可见、生产构建不发布；规范里默认 `false`。       |
| `status`      | 笔记必填* | `seedling` / `growing` / `evergreen`。Schema 有默认值 `growing`。 |

> 草稿在 `npm run dev` 里可见，`npm run build` 和线上不会包含。发布前记得改 `draft`。

### 笔记状态

| 值          | 页面显示 | 适合什么                           |
| ----------- | -------- | ---------------------------------- |
| `seedling`  | 种子     | 刚记下的问题、片段、待验证的猜测。 |
| `growing`   | 生长中   | 持续补充、可能会大改的内容。       |
| `evergreen` | 常青     | 相对稳定，可以放心引用。           |

修改状态只需要改 frontmatter，不需要动页面。

## 3. 标签

标签是内容的一部分，不是单独维护的分类表。给任意文章加上：

```yaml
tags: ['CSS', '设计']
```

构建时会自动：

- 在 `/tags/` 汇总所有标签和内容数量；
- 生成 `/tags/<标签>/` 页面；
- 在搜索索引里加入标签；
- 在文章页和卡片上显示标签。

几个约定：

- 一个标签尽量只表达一个主题；「前端」和「前端开发」不要混用。
- 标签数量不用追求多。3–6 个通常就够一篇文章。
- 标签可以是中文；URL 会自动做百分号编码。

## 4. 正文写作

正文使用 GitHub Flavored Markdown。支持：

- 标题 `##` / `###`（会生成文章目录和锚点）
- 列表、表格、引用、任务列表
- 行内代码与代码块（Astro 内置 Shiki 高亮）
- 链接、图片、脚注

约定：

- 页面标题由布局生成，**正文从二级标题 `##` 开始**，不要再写一个重复的 `# 标题`。
- 站内链接建议使用绝对路径并保留末尾斜杠：
  ```md
  [写作指南](/posts/content-collections/)
  [全部笔记](/notes/)
  ```
- 外部链接直接写完整 URL 即可；文章内的外部链接会在浏览器端自动加上 `target="_blank"` 和 `rel="noreferrer"`。
- 代码块标注语言，例如 ` ```ts `、` ```css `，高亮才有意义。

## 5. 图片和其他静态文件

把文件放进 `public/`，例如：

```text
public/images/reading-setup.png
```

正文中直接引用：

```md
![桌上的阅读角落](/images/reading-setup.png)
```

注意：

- `public/` 里的文件会原样复制到站点，不会经过 Astro 图片优化。
- 建议在上传前压缩图片；文章配图宽度控制在 1600px 以内通常足够。
- 图片替代文字（alt）要写，不要留空。
- 如果是需要响应式优化的图片，可以后续把 Schema 中的 `image()` 接进来；当前站点保持轻量，没有默认启用。

## 6. 发布前检查

```bash
npm run check      # 类型和内容 Schema
npm run build      # 构建 + 站内链接检查
npm run preview    # 本地预览构建结果
```

发布清单：

- [ ] 标题和摘要都说清楚了内容是什么
- [ ] `draft: false`
- [ ] 文件名（slug）是英文短横线格式
- [ ] 标签没有拼写变体
- [ ] 代码块标注了语言
- [ ] 图片有 alt，且路径以 `/` 开头
- [ ] 站内链接在构建后没有 404

提交并推送到 `main` 后，GitHub Actions 会自动完成类型检查、构建、链接检查和部署。

## 7. 常见问题

**构建报 `InvalidContentEntryDataError`**

某个字段不符合 Schema。检查报错指向的文件：通常是缺 `title` / `description`，或日期格式无法解析。

**文章没有出现在线上**

先看 `draft` 是否为 `false`。然后检查 GitHub Actions 是否成功运行，以及 Pages 是否已设置为 GitHub Actions。

**搜索不到新内容**

搜索索引在构建时生成。开发环境会通过 `/search.json` 实时读取；线上需要等新的部署完成。

**标签页 URL 很怪**

中文标签会被浏览器编码成 `%E5...`。这是正常现象，不影响使用。如果特别在意 URL 可读性，可以改用英文标签。

**RSS 里没有笔记**

RSS 默认只收录「文章」集合。这是刻意的：笔记的修订频率更高。想一起收录，修改 `src/pages/rss.xml.ts` 里的数据源即可。
