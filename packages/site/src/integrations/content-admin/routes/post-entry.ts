import fs from 'node:fs/promises';

import type { RouteHandler } from '@site/integrations/content-admin/router.ts';
import type { Context } from '@site/integrations/content-admin/types.ts';
import { readBody, respond } from '@site/integrations/content-admin/http.ts';
import { guardPath } from '@site/integrations/content-admin/collections.ts';

export function postEntry({ req, res, contentDir, c, id }: Context): RouteHandler {
  return async () => {
    const fp = guardPath(contentDir, c, id);
    const { content } = JSON.parse(await readBody(req));
    try {
      await fs.access(fp);
      return respond(res, { error: 'Entry already exists' }, 409);
    } catch {
      /* file does not exist — safe to create */
    }
    await fs.writeFile(fp, content, 'utf-8');
    respond(res, { ok: true });
  };
}
