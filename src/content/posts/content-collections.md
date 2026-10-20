---
title: '用一个内容模型，管住一座博客'
description: '把文章当作数据来设计：Content Collections、Schema 和路由如何让博客越写越不乱。'
date: 2026-10-08
tags:
  - Astro
  - 前端
  - 工程实践
draft: false
---

博客最容易出问题的时候，往往不是文章太多，而是**内容开始长得不一样**：有的文章有摘要，有的没有；有的日期写在文件名里，有的写在正文顶部；有的标签叫「前端」，有的叫「前端开发」。

当站点只有三篇文章时，这些都不算问题。到第三十篇，它们就会变成一堆需要手动记住的例外。

这次搭站，我想先解决这件事：把「一篇文章」定义清楚。

## 文件夹不是系统

最简单的做法，是建一个 `posts/` 文件夹，把 Markdown 丢进去，再用脚本扫描文件名生成页面。这能跑，但所有的约束都活在脑子里：

- 日期格式靠自觉；
- 标签拼写靠自觉；
- 摘要写不写靠自觉；
- 草稿会不会被发布，也靠自觉。

一套系统如果只在作者记得的时候才成立，它就不算系统。

Astro 的 **Content Collections** 提供了另一条路：先用 Schema 定义内容长什么样，再让构建过程帮你检查。

## 把约定写成代码

这个站点的文章和笔记共用一组基础字段，笔记额外多一个 `status`：

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writingSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(260),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string().min(1)).default([]),
  draft: z.boolean().default(false),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: writingSchema,
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: writingSchema.extend({
    status: z.enum(['seedling', 'growing', 'evergreen']).default('growing'),
  }),
});
```

这里真正重要的不是语法，而是几个决定：

1. **标题和摘要必填**。它们同时服务于卡片、SEO 和 RSS，不能等到发布前再想。
2. **日期交给解析器**。写 `2026-10-08` 就好，后面统一变成 `Date` 对象。
3. **标签是字符串数组**。页面会自动汇总、去重、生成标签页，不需要维护一份手写索引。
4. **草稿有明确状态**。`draft: true` 的内容在开发环境可见，构建时不会进入公开页面。
5. **允许 `updated`**。有些笔记会长期修订，读者应该知道它最近变过。

Schema 不是给框架看的，是给未来的自己看的。它把「我记得要写摘要」变成了「不写摘要就构建失败」。

## 路由应该从内容里长出来

内容准备好之后，页面不需要一篇篇手动登记。动态路由会读取集合，为每个条目生成路径：

```ts
export async function getStaticPaths() {
  const posts = await getPosts();

  return posts.map((post, index) => ({
    params: { slug: entrySlug(post) },
    props: {
      post,
      previous: posts[index - 1],
      next: posts[index + 1],
    },
  }));
}
```

这段代码同时解决了几件小事：文章页、上一篇/下一篇、以及排序。新增一篇 Markdown 后，只要 frontmatter 合法，页面、RSS、搜索索引和标签页都会自动更新。

这就是「结构」带来的轻松感：**新增内容时，只需要想内容本身。**

## 再加一种内容，也不慌

如果以后想加「项目」「书摘」或「周报」，路径大致是：

1. 在 `src/content/` 下新建一个文件夹；
2. 在 `src/content.config.ts` 注册集合和 Schema；
3. 新建对应的列表页与动态路由；
4. 复用已有的布局、卡片和标签工具。

不会动到文章本身，也不需要重写导航。内容模型是地基，页面只是长在上面的房间。

## 最后

工具链的价值，不是让人一开始就搭出一个完美的系统，而是让系统在内容变多时仍然可理解。

我会在接下来的笔记里继续记录这套站点的细节，比如搜索索引怎么在构建时生成、GitHub Actions 怎么部署。它们不一定是最优解，但至少是**我下次回来还能看懂的解法**。

如果你想看这套模型的实际配置，可以直接打开站点源码里的 `src/content.config.ts`。它比这篇文章短得多。
