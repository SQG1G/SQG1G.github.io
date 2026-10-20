import type { APIRoute } from 'astro';
import { entryHref, formatDate, getNotes, getPosts, stripMarkdown } from '../lib/content';

export const GET: APIRoute = async () => {
  const [posts, notes] = await Promise.all([getPosts(), getNotes()]);

  const items = [...posts, ...notes]
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      tags: [...entry.data.tags],
      date: formatDate(entry.data.date),
      type: entry.collection === 'posts' ? 'post' : 'note',
      url: entryHref(entry),
      content: stripMarkdown(entry.body),
    }));

  return new Response(JSON.stringify(items), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
