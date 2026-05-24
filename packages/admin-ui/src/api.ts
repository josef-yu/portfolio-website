import type { CollectionMeta, Entry } from './types';

async function apiFetch<T>(method: string, route: string, body?: unknown): Promise<T> {
  const res = await fetch('/_admin/api' + route, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json() as Promise<T>;
}

export const api = {
  getCollections: () =>
    apiFetch<CollectionMeta[]>('GET', '/collections'),

  getEntries: (c: string) =>
    apiFetch<Entry[]>('GET', `/entries?c=${c}`),

  getEntry: (c: string, id: string) =>
    apiFetch<{ content: string }>('GET', `/entry?c=${c}&id=${id}`),

  putEntry: (c: string, id: string, content: string) =>
    apiFetch<{ ok?: boolean; error?: string }>('PUT', `/entry?c=${c}&id=${id}`, { content }),

  postEntry: (c: string, id: string, content: string) =>
    apiFetch<{ ok?: boolean; error?: string }>('POST', `/entry?c=${c}&id=${id}`, { content }),

  getTags: (c: string) =>
    apiFetch<string[]>('GET', `/tags?c=${c}`),
};
