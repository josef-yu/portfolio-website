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
  getCollections: () => apiFetch<CollectionMeta[]>('GET', '/collections'),

  getEntries: (c: string) => apiFetch<Entry[]>('GET', `/entries?c=${c}`),

  getEntry: (c: string, id: string) =>
    apiFetch<{ content: string }>('GET', `/entry?c=${c}&id=${id}`),

  putEntry: (c: string, id: string, content: string) =>
    apiFetch<{ ok?: boolean; error?: string }>('PUT', `/entry?c=${c}&id=${id}`, { content }),

  postEntry: (c: string, id: string, content: string) =>
    apiFetch<{ ok?: boolean; error?: string }>('POST', `/entry?c=${c}&id=${id}`, { content }),

  getTags: (c: string) => apiFetch<string[]>('GET', `/tags?c=${c}`),

  /**
   * Uploads a media file for a specific entry.
   * The file is stored at public/content-assets/{c}/{id}/{filename}
   * and served publicly at /content-assets/{c}/{id}/{filename}.
   *
   * @param data - Base64-encoded file contents (no data-URI prefix)
   */
  uploadMedia: (c: string, id: string, filename: string, data: string) =>
    apiFetch<{ url?: string; error?: string }>('POST', `/upload?c=${c}&id=${id}`, {
      filename,
      data,
    }),
};
