---
title: 'Git 里我反复用到的几个小动作'
description: '不是命令大全，只是一些几乎每天都会用到的、能让工作区安静下来的操作。'
date: 2026-10-05
tags:
  - Git
  - 工具
status: growing
draft: false
---

我记不住复杂的 Git 命令，但有几个小动作几乎每天都会用到。它们解决的不是「高级问题」，而是那些会打断节奏的小混乱。

## 提交前先看一眼差异

```bash
git diff --stat
git diff
git diff --staged
```

三个命令分别回答：改了哪些文件、具体改了什么、已经暂存了什么。提交前扫一眼 `--stat`，能避免把临时文件或无关改动带进去。

## 用 `switch` 而不是 `checkout`

较新的 Git 区分了「切分支」和「恢复文件」两件事：

```bash
git switch main
git switch -c feature/new-post
git restore src/content/posts/hello-world.md
```

心智负担更小，也不用担心 `checkout` 在不同参数下做完全不同的事。

## 暂存一部分改动

```bash
git add -p
```

当一次改动里混了两件事，`git add -p` 可以逐块选择要提交的部分。它让「一次提交只做一件事」变得容易很多，尤其是在写完文章又顺手改了样式的时候。

## 临时收起工作区

```bash
git stash push -m "wip: about page"
git stash list
git stash pop
```

需要切分支处理别的事，但当前改动还没到提交的程度时，`stash` 比仓促提交干净。记得加 `-m`，否则一周后你会对着一串 `WIP on main` 发呆。

## 找到这行代码是谁写的

```bash
git blame -L 40,60 src/pages/index.astro
git log -S "someFunction" --oneline
```

`blame` 不只是「追责」，更重要的是找到改动背后的提交说明和上下文。`log -S` 则适合搜「某个字符串是什么时候出现/消失的」。

## 最后：让 `status` 成为习惯

```bash
git status -sb
```

短格式状态会显示当前分支、领先/落后远端多少、以及未跟踪文件。写代码的间隙按一下，能避免很多「怎么突然多了一个文件」的意外。

这些命令都不算高级。真正的效率大概不是记住更多技巧，而是让工作区始终处在一个自己能看懂的状态。
