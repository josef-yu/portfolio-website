import fs from 'node:fs/promises';

import type { RouteHandler } from '@site/integrations/content-admin/router.ts';
import type { Context } from '@site/integrations/content-admin/types.ts';
import { readBody, respond } from '@site/integrations/content-admin/http.ts';
import { guardPath } from '@site/integrations/content-admin/collections.ts';
import { cleanOrphanedMedia } from '@site/integrations/content-admin/media.ts';

export function putEntry({ req, res, contentDir, publicDir, c, id }: Context): RouteHandler {
  return async () => {
    const fp = guardPath(contentDir, c, id);
    const { content } = JSON.parse(await readBody(req));
    await fs.writeFile(fp, content, 'utf-8');
    await cleanOrphanedMedia(publicDir, c, id, content);
    respond(res, { ok: true });
  };
}
