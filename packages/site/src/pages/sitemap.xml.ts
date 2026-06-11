import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const FALLBACK_SITE = 'https://www.josefyu.com';

// Top-level pages without a content collection behind them.
const STATIC_PATHS = ['', 'about', 'work', 'projects', 'writing'];

interface SitemapURL {
  loc: string;
  lastmod?: Date;
}

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.href ?? `${FALLBACK_SITE}/`).replace(/\/$/, '');

  const work = await getCollection('work');
  const projects = await getCollection('project');
  const writing = await getCollection('writing', ({ data }) => !data.draft);

  const urls: SitemapURL[] = [
    ...STATIC_PATHS.map((path) => ({ loc: path ? `${base}/${path}/` : `${base}/` })),
    ...work.map((e) => ({
      loc: `${base}/work/${e.id}/`,
      lastmod: e.data.endDate ?? e.data.startDate,
    })),
    ...projects.map((e) => ({ loc: `${base}/projects/${e.id}/`, lastmod: e.data.date })),
    ...writing.map((e) => ({ loc: `${base}/writing/${e.id}/`, lastmod: e.data.publishDate })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(({ loc, lastmod }) => {
    const lastmodTag = lastmod
      ? `\n    <lastmod>${lastmod.toISOString().split('T')[0]}</lastmod>`
      : '';
    return `  <url>\n    <loc>${loc}</loc>${lastmodTag}\n  </url>`;
  })
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
