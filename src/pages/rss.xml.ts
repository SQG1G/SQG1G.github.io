import type { APIContext } from 'astro';
import rss from '@astrojs/rss';
import { SITE } from '../config';
import { entryHref, getPosts } from '../lib/content';

export async function GET(context: APIContext) {
  const posts = await getPosts();

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? new URL(SITE.url),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: new URL(entryHref(post), context.site ?? SITE.url).href,
      categories: [...post.data.tags],
    })),
    customData: `<language>${SITE.locale}</language>`,
  });
}
