import fs from 'node:fs/promises';

import type { RouteHandler } from '@site/integrations/content-admin/router.ts';
import type { Context } from '@site/integrations/content-admin/types.ts';
import { respond } from '@site/integrations/content-admin/http.ts';
import { guardPath } from '@site/integrations/content-admin/collections.ts';

export function getEntry({ res, contentDir, c, id }: Context): RouteHandler {
  return async () => {
    const fp = guardPath(contentDir, c, id);
    respond(res, { content: await fs.readFile(fp, 'utf-8') });
  };
}
