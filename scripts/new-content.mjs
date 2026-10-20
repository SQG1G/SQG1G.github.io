#!/usr/bin/env node

import { constants } from 'node:fs';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const kinds = {
  post: { folder: 'posts', label: '文章' },
  note: { folder: 'notes', label: '笔记' },
};

const usage = `
用法：
  npm run new -- post "标题" [--tags "Astro,前端"] [--slug my-post] [--publish]
  npm run new -- note "标题" [--tags "工具,笔记"] [--slug my-note] [--publish]

参数：
  --tags     逗号分隔的标签，例如 "Astro,前端"
  --slug     手动指定 URL 文件名（推荐给中文标题）
  --publish  直接标记为已发布；默认是草稿
  --help     显示这份说明
`.trim();

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const [kind, ...rest] = argv;

  if (!kind || kind === '--help' || kind === '-h') {
    console.log(usage);
    process.exit(kind ? 0 : 1);
  }

  if (!kinds[kind]) {
    fail(`内容类型必须是 "post" 或 "note"，收到的是 "${kind}"。\n\n${usage}`);
  }

  const options = {
    kind,
    titleParts: [],
    tags: [],
    slug: '',
    draft: true,
  };

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];

    if (arg === '--help' || arg === '-h') {
      console.log(usage);
      process.exit(0);
    }

    if (arg === '--publish') {
      options.draft = false;
      continue;
    }

    if (arg === '--tags' || arg === '--tag') {
      const value = rest[index + 1];
      if (!value || value.startsWith('--')) fail('--tags 后面需要一个逗号分隔的标签列表。');
      options.tags.push(
        ...value
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      );
      index += 1;
      continue;
    }

    if (arg === '--slug') {
      const value = rest[index + 1];
      if (!value || value.startsWith('--')) fail('--slug 后面需要一个文件名。');
      options.slug = value;
      index += 1;
      continue;
    }

    if (arg.startsWith('--')) {
      fail(`未知参数：${arg}\n\n${usage}`);
    }

    options.titleParts.push(arg);
  }

  options.title = options.titleParts.join(' ').trim();
  options.tags = [...new Set(options.tags)];
  return options;
}

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

function today() {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai',
  }).format(new Date());
}

function timeSuffix() {
  const now = new Date();
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai',
  })
    .format(now)
    .replace(':', '');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options.title) {
    if (!input.isTTY) fail('请提供标题，例如：npm run new -- post "我的标题"');

    const readline = createInterface({ input, output });
    try {
      options.title = (await readline.question('标题：')).trim();
    } finally {
      readline.close();
    }

    if (!options.title) fail('标题不能为空。');
  }

  const kind = kinds[options.kind];
  const fallbackSlug = `${today().replaceAll('-', '')}-${timeSuffix()}`;
  const requestedSlug = options.slug || slugify(options.title) || fallbackSlug;
  const slug = slugify(requestedSlug) || fallbackSlug;

  if (!slug) fail('无法生成合法的文件名，请用 --slug 手动指定。');

  const file = join(projectRoot, 'src', 'content', kind.folder, `${slug}.md`);
  await mkdir(dirname(file), { recursive: true });

  try {
    await access(file, constants.F_OK);
    fail(`文件已存在：${file}`);
  } catch {
    // The file does not exist yet, which is what we want.
  }

  const tagsLine = options.tags.length ? JSON.stringify(options.tags) : '[]';
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(options.title)}`,
    'description: "用一句话说清楚这篇内容。"',
    `date: ${today()}`,
    `tags: ${tagsLine}`,
    `draft: ${options.draft}`,
  ];

  if (options.kind === 'note') {
    frontmatter.push('status: seedling');
  }

  frontmatter.push('---');

  const body = [
    '',
    '在这里开始写。',
    '',
    '可以先写下一个核心句子，再慢慢展开。',
    '',
    '## 第一节',
    '',
    '正文……',
    '',
  ].join('\n');

  await writeFile(file, `${frontmatter.join('\n')}\n${body}`, { encoding: 'utf8', flag: 'wx' });

  const relativeFile = file.slice(projectRoot.length + 1).replaceAll('\\', '/');

  console.log(`\n✓ 已创建${kind.label}：${relativeFile}`);
  console.log(`\n下一步：`);
  console.log(`  1. 打开文件，补全 description、tags 和正文；`);
  console.log(`  2. 运行 npm run dev 预览；`);
  console.log(
    options.draft
      ? `  3. 把 frontmatter 里的 draft 改为 false（或下次加 --publish）后发布。`
      : `  3. 这篇文章已经是发布状态，提交并推送后会自动部署。`,
  );
}

main().catch((error) => {
  console.error(`\n✖ 创建失败：${error.message}\n`);
  process.exit(1);
});
