import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const [work, writing, projects] = await Promise.all([
    getCollection('work'),
    getCollection('writing', ({ data }) => !data.draft),
    getCollection('project'),
  ]);

  const pages = [
    { url: '/', label: 'Home', kind: 'Page' },
    { url: '/work/', label: 'Work', kind: 'Page' },
    { url: '/projects/', label: 'Projects', kind: 'Page' },
    { url: '/writing/', label: 'Writing', kind: 'Page' },
    { url: '/about/', label: 'About', kind: 'Page' },
  ];

  const roles = work
    .sort(
      (a, b) =>
        (b.data.endDate?.valueOf() ?? Date.now()) - (a.data.endDate?.valueOf() ?? Date.now()),
    )
    .map((w) => ({
      url: `/work/${w.id}`,
      label: `${w.data.role} · ${w.data.employer}`,
      kind: 'Role',
    }));

  const posts = writing
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf())
    .map((p) => ({
      url: `/writing/${p.id}`,
      label: p.data.title,
      kind: 'Post',
    }));

  const proj = projects.map((p) => ({
    url: `/projects/${p.id}`,
    label: p.data.title,
    kind: 'Project',
  }));

  const index = [...pages, ...roles, ...posts, ...proj];

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
};
