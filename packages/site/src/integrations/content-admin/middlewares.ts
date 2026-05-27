import fs from 'node:fs/promises';
import path from 'node:path';

import type { Middleware } from './router.ts';
import type { Context } from './types.ts';
import { ADMIN_DIR, serveFile } from './http.ts';

// ── Static asset MIME types (admin UI only) ───────────────────────────────────

const STATIC_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

// ── Middlewares ───────────────────────────────────────────────────────────────

/** Serves JS/CSS/map bundles from the admin-ui build output by file extension. */
export function staticAssets({ res, pathname }: Context): Middleware {
  return async (next) => {
    const ext = path.extname(pathname);
    if (ext in STATIC_TYPES) {
      await serveFile(res, pathname.slice(1), STATIC_TYPES[ext]);
    } else {
      await next();
    }
  };
}

/** Serves index.html for every non-API path (SPA shell fallback). */
export function shellFallback({ res, pathname }: Context): Middleware {
  return async (next) => {
    if (pathname.startsWith('/api')) return next();
    const html = await fs.readFile(path.join(ADMIN_DIR, 'index.html'), 'utf-8');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(html);
  };
}
