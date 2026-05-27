import type { RouteHandler } from '@site/integrations/content-admin/router.ts';
import type { Context } from '@site/integrations/content-admin/types.ts';
import { respond } from '@site/integrations/content-admin/http.ts';
import { listEntries } from '@site/integrations/content-admin/collections.ts';

export function getEntries({ res, contentDir, c }: Context): RouteHandler {
  return async () => respond(res, await listEntries(contentDir, c));
}
