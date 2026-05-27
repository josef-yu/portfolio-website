import type { ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

/** Per-request context passed to every middleware and route factory. */
export type Context = {
  req: IncomingMessage;
  res: ServerResponse;
  pathname: string;
  c: string;
  id: string;
  contentDir: string;
  pagesDir: string;
  publicDir: string;
  server: ViteDevServer;
};
