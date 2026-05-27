import fs from 'node:fs/promises';
import path from 'node:path';

import type { RouteHandler } from '@site/integrations/content-admin/router.ts';
import type { Context } from '@site/integrations/content-admin/types.ts';
import { readBody, respond } from '@site/integrations/content-admin/http.ts';
import { sanitizeFilename } from '@site/integrations/content-admin/media.ts';

export function postUpload({ req, res, publicDir, c, id }: Context): RouteHandler {
  return async () => {
    if (!/^[a-zA-Z0-9_-]+$/.test(c) || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return respond(res, { error: 'Invalid collection or id' }, 400);
    }
    const body = JSON.parse(await readBody(req)) as { filename?: string; data?: string };
    const safeFilename = sanitizeFilename(body.filename ?? '');
    if (!safeFilename || !body.data) {
      return respond(res, { error: 'Invalid filename or missing data' }, 400);
    }
    const assetsDir = path.join(publicDir, 'content-assets', c, id);
    await fs.mkdir(assetsDir, { recursive: true });
    const buffer = Buffer.from(body.data, 'base64');
    await fs.writeFile(path.join(assetsDir, safeFilename), buffer);
    respond(res, { url: `/content-assets/${c}/${id}/${safeFilename}` });
  };
}
