import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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

export const collections = { posts, notes };
