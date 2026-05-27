/**
 * content-admin — dev-only Vite middleware
 * Serves a CMS interface at /_admin/ during `astro dev`.
 * Nothing is emitted to the production build.
 *
 * All route/file-serving logic lives in content-admin-handler.ts. That file is
 * loaded via server.ssrLoadModule() so Vite tracks it in its module graph.
 * When the handler file is edited and saved, Vite invalidates the cached module
 * and the next request automatically picks up the changes — no server restart.
 *
 * Only changes to THIS file (the integration boilerplate) still require a
 * restart, which is rare in practice.
 */

import type { AstroIntegration } from 'astro';
import type { ServerResponse } from 'node:http';
import path from 'node:path';

const HANDLER = '/src/integrations/content-admin-handler.ts';

export function contentAdmin(): AstroIntegration {
  return {
    name: 'content-admin',
    hooks: {
      'astro:server:setup': ({ server }) => {
        const contentDir = path.resolve(process.cwd(), 'src/content');
        const pagesDir = path.resolve(process.cwd(), 'src/pages');
        const publicDir = path.resolve(process.cwd(), 'public');

        server.middlewares.use(async (req, res, next) => {
          const reqUrl = req.url ?? '';

          // Only intercept paths this middleware owns; pass everything else through.
          if (!reqUrl.startsWith('/content-assets/') && !reqUrl.startsWith('/_admin')) {
            return next();
          }

          try {
            // ssrLoadModule returns a cached module; Vite invalidates the cache
            // whenever content-admin-handler.ts changes on disk.
            const mod = await server.ssrLoadModule(HANDLER);

            if (reqUrl.startsWith('/content-assets/')) {
              return await mod.serveContentAsset(res, publicDir, reqUrl);
            }

            await mod.handle(req, res, contentDir, pagesDir, publicDir, server);
          } catch (err) {
            console.error('[content-admin]', err);
            const r = res as unknown as ServerResponse;
            if (!r.headersSent) {
              r.statusCode = 500;
              r.setHeader('Content-Type', 'application/json');
              r.end(JSON.stringify({ error: String(err) }));
            }
          }
        });
      },

      'astro:server:start': ({ address, logger }) => {
        const host =
          address.address === '0.0.0.0' || address.address === '::' ? 'localhost' : address.address;
        logger.info(`Content admin → http://${host}:${address.port}/_admin/`);
      },
    },
  };
}
