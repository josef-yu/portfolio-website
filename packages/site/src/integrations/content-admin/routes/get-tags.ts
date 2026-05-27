import type { RouteHandler } from '@site/integrations/content-admin/router.ts';
import type { Context } from '@site/integrations/content-admin/types.ts';
import { respond } from '@site/integrations/content-admin/http.ts';
import { listTags } from '@site/integrations/content-admin/collections.ts';

export function getTags({ res, contentDir, c }: Context): RouteHandler {
  return async () => respond(res, await listTags(contentDir, c));
}
