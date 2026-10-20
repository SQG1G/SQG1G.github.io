import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

export type PostEntry = CollectionEntry<'posts'>;
export type NoteEntry = CollectionEntry<'notes'>;
export type WritingEntry = PostEntry | NoteEntry;
export type WritingKind = 'post' | 'note';

export const NOTE_STATUS = {
  seedling: { label: '种子', description: '刚种下，还在发芽' },
  growing: { label: '生长中', description: '持续补充和修订' },
  evergreen: { label: '常青', description: '相对稳定，可以放心参考' },
} as const;

const isPublished = (entry: { data: { draft?: boolean } }) =>
  import.meta.env.DEV || !entry.data.draft;

export function entrySlug(entry: { id: string }) {
  return entry.id.replace(/\.(md|mdx)$/i, '').replace(/\/index$/, '');
}

export function postHref(entry: PostEntry) {
  return `/posts/${entrySlug(entry)}/`;
}

export function noteHref(entry: NoteEntry) {
  return `/notes/${entrySlug(entry)}/`;
}

export function entryHref(entry: WritingEntry) {
  return entry.collection === 'posts' ? postHref(entry) : noteHref(entry);
}

export function tagHref(tag: string) {
  return `/tags/${encodeURIComponent(tag)}/`;
}

export async function getPosts() {
  const posts = await getCollection('posts', isPublished);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getNotes() {
  const notes = await getCollection('notes', isPublished);
  return notes.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getWriting() {
  const [posts, notes] = await Promise.all([getPosts(), getNotes()]);
  return [...posts, ...notes].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getTagSummaries() {
  const entries = await getWriting();
  const counts = new Map<string, number>();

  for (const entry of entries) {
    for (const tag of entry.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count, href: tagHref(name) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  }).format(date);
}

export function formatCompactDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai',
  }).format(date);
}

export function getReadingTime(body: string | undefined) {
  if (!body) return 1;

  const cjkCharacters = body.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const latinWords =
    body.replace(/[\u3400-\u9fff]/g, ' ').match(/[A-Za-z0-9][A-Za-z0-9'-]*/g)?.length ?? 0;

  return Math.max(1, Math.round(cjkCharacters / 400 + latinWords / 220));
}

export function stripMarkdown(body: string | undefined, maxLength = 600) {
  if (!body) return '';

  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[>*_~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function getAdjacent<T extends WritingEntry>(entries: T[], index: number) {
  return {
    previous: index > 0 ? entries[index - 1] : undefined,
    next: index < entries.length - 1 ? entries[index + 1] : undefined,
  };
}
