import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pillEntries = z
  .array(
    z.object({
      name: z.string(),
      // Subcategory items shown on home tech cards, e.g. ["ECS", "RDS", "S3", "Lambda"]
      note: z.array(z.string()).optional(),
      // Toolbelt category for grouping on the about page, e.g. "Backend"
      category: z.string().optional(),
      // Set false to exclude from the home page tech ranking (keeps toolbelt unaffected)
      showInHome: z.boolean().optional(),
    }),
  )
  .default([]);

export type PillEntries = z.infer<typeof pillEntries>;

export const collections = {
  writing: defineCollection({
    loader: glob({ base: './src/content/writing', pattern: '**/*.md' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      publishDate: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      readMin: z.number().optional(),
      draft: z.boolean().default(false),
    }),
  }),

  project: defineCollection({
    loader: glob({ base: './src/content/project', pattern: '**/*.md' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      nda: z.boolean().default(false),
      featured: z.boolean().default(false),
      // Only required for personal projects with no linked work entries
      date: z.coerce.date().optional(),
      tech_stack: pillEntries,
      tags: z.array(z.string()).default([]),
    }),
  }),

  work: defineCollection({
    loader: glob({ base: './src/content/work', pattern: '**/*.md' }),
    schema: z.object({
      role: z.string(),
      employer: z.string(),
      org: z.string().optional(),
      location: z.string(),
      type: z.enum(['full-time', 'contract', 'freelance']).default('full-time'),

      // endDate omitted = present
      startDate: z.coerce.date(),
      endDate: z.coerce.date().optional(),

      summary: z.string().optional(),
      achievements: z
        .array(
          z.object({
            title: z.string(),
            metric: z.string().optional(),
            context: z.string().optional(),
            approach: z.string().optional(),
            result: z.string().optional(),
          }),
        )
        .default([]),

      showInTimeline: z.boolean().default(true),
      projects: z.array(reference('project')).default([]),

      tech_stack: pillEntries,
      tags: z.array(z.string()).default([]),
    }),
  }),
};

export type CollectionEntry = keyof typeof collections;
