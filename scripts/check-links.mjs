#!/usr/bin/env node

import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const distDir = join(projectRoot, 'dist');
const siteOrigin = 'https://site.local';

if (!existsSync(distDir)) {
  console.error('✖ 找不到 dist/，请先运行 npm run build。');
  process.exit(1);
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function decodeEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&#x2F;', '/')
    .replaceAll('&#47;', '/');
}

function extractAttributes(html, tagPattern, attribute) {
  const values = [];
  const tagRegex = new RegExp(`<${tagPattern}\\b[^>]*>`, 'gi');

  for (const match of html.matchAll(tagRegex)) {
    const tag = match[0];
    const attrRegex = new RegExp(`\\b${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i');
    const attrMatch = tag.match(attrRegex);
    const value = attrMatch?.[1] ?? attrMatch?.[2];
    if (value !== undefined) values.push(decodeEntities(value.trim()));
  }

  return values;
}

function isSkippable(raw) {
  return (
    !raw ||
    raw === '#' ||
    raw.startsWith('mailto:') ||
    raw.startsWith('tel:') ||
    raw.startsWith('data:') ||
    raw.startsWith('javascript:') ||
    raw.startsWith('//')
  );
}

const files = await walk(distDir);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const htmlCache = new Map();
const broken = [];
const checked = new Set();

async function getHtml(file) {
  if (!htmlCache.has(file)) {
    htmlCache.set(file, await readFile(file, 'utf8'));
  }
  return htmlCache.get(file);
}

function targetCandidates(pathname) {
  const cleanPath = pathname.replace(/^\/+/, '');
  const base = resolve(distDir, cleanPath);
  const candidates = [];

  if (pathname.endsWith('/')) {
    candidates.push(join(base, 'index.html'));
  } else {
    candidates.push(base);
    if (!pathname.split('/').pop()?.includes('.')) {
      candidates.push(`${base}.html`, join(base, 'index.html'));
    }
  }

  return { base, candidates };
}

function hasHtmlAnchor(html, fragment) {
  const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const idPattern = new RegExp(`\\s(?:id|name)\\s*=\\s*(?:"${escaped}"|'${escaped}')`, 'i');
  return idPattern.test(html);
}

for (const sourceFile of htmlFiles) {
  const html = await getHtml(sourceFile);
  const sourceRelative = relative(distDir, sourceFile).replaceAll('\\', '/');
  const links = [
    ...extractAttributes(html, 'a', 'href'),
    ...extractAttributes(html, 'link', 'href'),
    ...extractAttributes(html, 'img|script|source|video|audio', 'src'),
  ];

  for (const raw of links) {
    if (isSkippable(raw)) continue;

    const key = `${sourceRelative} -> ${raw}`;
    if (checked.has(key)) continue;
    checked.add(key);

    let url;
    try {
      url = new URL(raw, `${siteOrigin}/${sourceRelative}`);
    } catch {
      broken.push({ source: sourceRelative, raw, reason: '不是合法的 URL' });
      continue;
    }

    if (url.origin !== siteOrigin) continue;

    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      pathname = url.pathname;
    }

    const { base, candidates } = targetCandidates(pathname);
    if (!base.startsWith(resolve(distDir) + sep) && base !== resolve(distDir)) {
      broken.push({ source: sourceRelative, raw, reason: '链接指向站点目录之外' });
      continue;
    }

    const target = candidates.find((candidate) => existsSync(candidate));
    if (!target) {
      broken.push({
        source: sourceRelative,
        raw,
        reason: `目标不存在（尝试过：${candidates.map((item) => relative(distDir, item)).join(', ')}）`,
      });
      continue;
    }

    const stats = await stat(target);
    if (!stats.isFile()) {
      broken.push({ source: sourceRelative, raw, reason: '目标不是文件' });
      continue;
    }

    if (url.hash && target.endsWith('.html')) {
      const fragment = decodeURIComponent(url.hash.slice(1));
      if (fragment && !hasHtmlAnchor(await getHtml(target), fragment)) {
        broken.push({ source: sourceRelative, raw, reason: `页面内找不到锚点 #${fragment}` });
      }
    }
  }
}

const summary = `检查了 ${htmlFiles.length} 个 HTML 文件，共 ${checked.size} 个站内链接/资源。`;

if (broken.length > 0) {
  console.error(`\n✖ ${summary} 发现 ${broken.length} 个问题：\n`);
  for (const item of broken) {
    console.error(`  ${item.source}\n    ${item.raw}\n    ${item.reason}\n`);
  }
  process.exit(1);
}

console.log(`✓ ${summary} 全部通过。`);
