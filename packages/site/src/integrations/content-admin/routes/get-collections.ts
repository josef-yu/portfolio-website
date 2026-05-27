import type { RouteHandler } from '@site/integrations/content-admin/router.ts';
import type { Context } from '@site/integrations/content-admin/types.ts';
import { respond } from '@site/integrations/content-admin/http.ts';
import { buildCollectionMeta } from '@site/integrations/content-admin/collections.ts';

export function getCollections({ res, server, contentDir, pagesDir }: Context): RouteHandler {
  return async () => respond(res, await buildCollectionMeta(server, contentDir, pagesDir));
}
