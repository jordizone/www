import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const feed = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/feed' }),
  schema: z.object({
    type: z.enum(['post']).default('post'), // room for 'book' | 'film' | 'component' later
    text: z.string(),
    date: z.coerce.date(),
    url: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

const travels = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/travels' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    lat: z.number(),
    lng: z.number(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, feed, travels };
