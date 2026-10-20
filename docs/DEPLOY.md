# 部署指南

站点是纯静态输出，最终发布到 **GitHub Pages 用户站点**：

- 地址：<https://sqg1g.github.io>
- 仓库：<https://github.com/SQG1G/SQG1G.github.io>
- 构建：GitHub Actions（`.github/workflows/deploy.yml`）
- 产物：`dist/`

## 1. 为什么仓库名必须是 SQG1G.github.io

GitHub Pages 有两种常见站点：

| 类型     | 仓库名                 | 地址                                   |
| -------- | ---------------------- | -------------------------------------- |
| 用户站点 | `<username>.github.io` | `https://<username>.github.io/`        |
| 项目站点 | 任意名称               | `https://<username>.github.io/<repo>/` |

这是用户站点，所以仓库名必须是 **`SQG1G.github.io`**，并且部署在域名根路径。也正因为如此，`astro.config.mjs` 中不需要设置 `base`。

如果以后把仓库改名，站点地址会变成项目站点，需要同时调整 `site` 和 `base`。

## 2. 首次发布

### 2.1 本地准备

```bash
npm install
npm run build
```

确认 `dist/` 能正常生成后，初始化 Git 并推送：

```bash
git init -b main
git add .
git commit -m "chore: initialize blog"
git remote add origin https://github.com/SQG1G/SQG1G.github.io.git
git push -u origin main
```

如果仓库还没创建，先在 GitHub 上创建一个公开仓库，名称为 `SQG1G.github.io`，**不要**勾选自动生成 README（避免和本地首次提交冲突）。

### 2.2 打开 Actions 部署

进入仓库：

**Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。

这一步只需要做一次。之后：

1. 推送到 `main`；
2. Actions 运行 `Deploy to GitHub Pages`；
3. `build` job 安装依赖、运行类型检查、构建、检查链接；
4. `deploy` job 把 `dist/` 发布到 Pages；
5. 在 Actions 运行记录或仓库的 Deployments 中查看地址。

### 2.3 验证

- Actions 页面显示绿色的 `Deploy to GitHub Pages`；
- 打开 <https://sqg1g.github.io> 能看到首页；
- 打开 `https://sqg1g.github.io/rss.xml` 和 `https://sqg1g.github.io/search.json`；
- 点进一篇文章，确认标签、目录、上一篇/下一篇都正常。

## 3. 自动部署流程

`.github/workflows/deploy.yml` 的关键点：

- 触发条件：推送到 `main`，或手动 `workflow_dispatch`；
- 权限：`pages: write`、`id-token: write`；
- Node 22 + npm 缓存；
- `npm ci` 使用 `package-lock.json` 安装确定版本；
- `npm run build` 内部依次执行：
  1. `astro check`：Astro / TypeScript / 内容 Schema；
  2. `astro build`：生成 `dist/`；
  3. `node scripts/check-links.mjs`：检查站内链接、资源路径和锚点；
- `actions/upload-pages-artifact` 上传 `dist/`；
- `actions/deploy-pages` 完成部署。

并发设置 `cancel-in-progress: false` 是为了避免两次部署互相打断。

### 手动重新部署

在 GitHub 仓库的 **Actions → Deploy to GitHub Pages → Run workflow**，选择 `main` 后运行即可。

### 只检查、不部署

`.github/workflows/ci.yml` 会在 Pull Request 和手动触发时运行：

- `npm run format:check`
- `npm run build`

它不会发布站点，适合在合并前验证。

## 4. 本地检查生产构建

```bash
npm run build
npm run preview
```

`preview` 启动本地静态服务器，用来确认 `dist/` 的真实效果。不要用 `npm run dev` 代替生产构建检查：草稿过滤、RSS、搜索索引和链接检查都只在构建时体现。

## 5. 自定义域名

假设绑定 `blog.example.com`：

1. 修改 `src/config.ts` 的 `url` 为 `https://blog.example.com`；
2. 修改 `astro.config.mjs` 的 `site`；
3. 修改 `public/robots.txt` 中的 Sitemap 地址；
4. 在 `public/CNAME` 写入一行域名：
   ```text
   blog.example.com
   ```
5. 在域名服务商添加 DNS 记录：
   - 子域名（如 `blog`）：`CNAME` 指向 `sqg1g.github.io`；
   - 根域名：按 GitHub 文档配置 `A` / `AAAA` 记录，或使用支持 CNAME flattening 的 DNS；
6. 回到 **Settings → Pages**，填入 Custom domain，等待 DNS 检查通过；
7. 勾选 **Enforce HTTPS**。

GitHub 的当前记录值以官方文档为准：<https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site>

绑定自定义域名后，`https://sqg1g.github.io` 通常会重定向到新域名。

## 6. 排错

### Actions 报 Pages 相关权限错误

确认 **Settings → Pages → Source** 已选择 **GitHub Actions**。如果刚创建仓库，Pages 入口可能稍晚出现。

### 构建成功但页面 404

- 确认仓库名是 `SQG1G.github.io`；
- 确认部署的是 `main`；
- 等 Pages 的 CDN 刷新，通常几十秒；
- 检查 Actions 的 `deploy` job 是否真的成功，而不只是 `build` 成功；
- 如果是从旧站点迁移，清理浏览器缓存或开无痕窗口。

### `npm ci` 失败

`package-lock.json` 与 `package.json` 不一致。本地运行：

```bash
npm install
git add package.json package-lock.json
git commit -m "chore: refresh lockfile"
```

### 链接检查失败

`npm run build` 会列出具体文件、链接和目标路径。常见原因：

- 站内链接少了末尾 `/`，或者写的 slug 和文件名不一致；
- 图片放进了 `src/` 而不是 `public/`；
- 删除了文章，但其他地方还链接着它；
- 标题锚点被修改，旧目录链接失效。

### Node 版本不对

项目要求 Node.js **22.12+**。用 `node -v` 检查；如果使用 nvm/fnm，项目里的 `.nvmrc` 已写好 `22`。

### 想回滚一次发布

- 重新部署上一个成功的 commit：在 Actions 里找到旧的运行记录，重新运行；
- 或本地 `git revert <commit>`，推送后触发新的部署。

不要直接编辑 Pages 上的文件：每次部署都会覆盖它们。

## 7. 不使用的方案

这个项目**没有**使用：

- `gh-pages` 分支；
- 手动把 `dist/` 提交到仓库；
- 第三方 CI 或部署平台；
- 需要在 GitHub 里配置的构建密钥。

这样仓库里只有源码和配置，部署记录、构建日志和产物都由 GitHub Actions 管理。
