import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

/** Absolute path to the admin-ui Vite build output. */
export const ADMIN_DIR = path.resolve(process.cwd(), 'src/integrations/admin-dist');

/** Buffers the full request body as a UTF-8 string. */
export function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

/** Sends a JSON response. */
export function respond(res: ServerResponse, data: unknown, status = 200): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/**
 * Serves a static file from ADMIN_DIR.
 * Path-traversal safe: rejects anything that resolves outside the directory.
 */
export async function serveFile(
  res: ServerResponse,
  relPath: string,
  contentType: string,
): Promise<void> {
  const fullPath = path.resolve(ADMIN_DIR, relPath);
  if (!fullPath.startsWith(ADMIN_DIR + path.sep) && fullPath !== ADMIN_DIR) {
    res.statusCode = 403;
    res.end();
    return;
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'no-store');
  res.end(await fs.readFile(fullPath, 'utf-8'));
}
