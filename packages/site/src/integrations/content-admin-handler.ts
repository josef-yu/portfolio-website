/**
 * content-admin-handler — entry point loaded via server.ssrLoadModule().
 *
 * Vite tracks this file in its module graph and invalidates the cached module
 * whenever it (or any of its imports) changes, so edits are picked up on the
 * next request without restarting the dev server.
 */

import type { ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { Router } from './content-admin/router.ts';
import { staticAssets, shellFallback } from './content-admin/middlewares.ts';
import { getCollections } from './content-admin/routes/get-collections.ts';
import { getEntries } from './content-admin/routes/get-entries.ts';
import { getTags } from './content-admin/routes/get-tags.ts';
import { getEntry } from './content-admin/routes/get-entry.ts';
import { putEntry } from './content-admin/routes/put-entry.ts';
import { postEntry } from './content-admin/routes/post-entry.ts';
import { postUpload } from './content-admin/routes/post-upload.ts';

export { serveContentAsset } from './content-admin/media.ts';

// ── Main request handler ──────────────────────────────────────────────────────

/** Handles all /_admin/* requests. */
export async function handle(
  req: IncomingMessage,
  res: ServerResponse,
  contentDir: string,
  pagesDir: string,
  publicDir: string,
  server: ViteDevServer,
): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const pathname = url.pathname.replace(/^\/_admin/, '') || '/';
  const method = req.method ?? 'GET';
  const c = url.searchParams.get('c') ?? '';
  const id = url.searchParams.get('id') ?? '';
  const route = pathname.startsWith('/api') ? pathname.slice(4) : pathname;

  const ctx = { req, res, pathname, c, id, contentDir, pagesDir, publicDir, server };
  const router = new Router();

  router.use(staticAssets(ctx));
  router.use(shellFallback(ctx));

  router
    .get('/collections', getCollections(ctx))
    .get('/entries', getEntries(ctx))
    .get('/tags', getTags(ctx))
    .get('/entry', getEntry(ctx))
    .put('/entry', putEntry(ctx))
    .post('/entry', postEntry(ctx))
    .post('/upload', postUpload(ctx));

  await router.dispatch(method, route);

  if (!res.writableEnded) {
    res.statusCode = 404;
    res.end();
  }
}
