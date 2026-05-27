import type { ServerResponse } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

// ── Filename validation ───────────────────────────────────────────────────────

/**
 * Sanitizes an uploaded filename:
 * - Strips path separators and hidden-file dots
 * - Allows letters, digits, hyphens, underscores, dots
 * - Rejects empty results or filenames with no extension
 */
export function sanitizeFilename(raw: string): string | null {
  const name = path.basename(raw).replace(/[^a-zA-Z0-9._-]/g, '-');
  if (!name || name.startsWith('.') || !name.includes('.')) return null;
  return name;
}

// ── Static asset serving ──────────────────────────────────────────────────────

const IMAGE_CONTENT_TYPES: Record<string, string> = {
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.avif': 'image/avif',
};

/**
 * Serves a file from public/content-assets/ as binary.
 * Intercepted before Vite's publicDir middleware so newly-uploaded images
 * load in the editor immediately without a server restart.
 */
export async function serveContentAsset(
  res: ServerResponse,
  publicDir: string,
  reqUrl: string,
): Promise<void> {
  const cleanUrl = reqUrl.split('?')[0];
  const rel = cleanUrl.slice('/content-assets/'.length);
  const parts = rel.split('/');

  // Expect exactly: collection / id / filename
  if (parts.length !== 3) { res.statusCode = 400; res.end(); return; }

  const [c, id, filename] = parts;
  if (!/^[a-zA-Z0-9_-]+$/.test(c) || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    res.statusCode = 400; res.end(); return;
  }

  const safeFilename = sanitizeFilename(filename);
  if (!safeFilename) { res.statusCode = 400; res.end(); return; }

  const filePath = path.join(publicDir, 'content-assets', c, id, safeFilename);
  let data: Buffer;
  try {
    data = await fs.readFile(filePath);
  } catch {
    res.statusCode = 404; res.end(); return;
  }

  const ext = path.extname(safeFilename).toLowerCase();
  const contentType = IMAGE_CONTENT_TYPES[ext] ?? 'application/octet-stream';
  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'no-store');
  res.end(data);
}

// ── Orphan cleanup ────────────────────────────────────────────────────────────

/**
 * Deletes image files from public/content-assets/{c}/{id}/ that are no longer
 * referenced anywhere in the saved entry content (frontmatter + body).
 * Called after every PUT /entry save.
 */
export async function cleanOrphanedMedia(
  publicDir: string,
  c: string,
  id: string,
  content: string,
): Promise<void> {
  const assetsDir = path.join(publicDir, 'content-assets', c, id);

  let files: string[];
  try {
    files = (await fs.readdir(assetsDir)).filter((f) => !f.startsWith('.'));
  } catch {
    return; // Directory doesn't exist — nothing to clean.
  }

  // Collect every filename still referenced in the saved content.
  const referencedFiles = new Set<string>();
  const refRegex = new RegExp(`/content-assets/${c}/${id}/([^)\\s"']+)`, 'g');
  let match: RegExpExecArray | null;
  while ((match = refRegex.exec(content)) !== null) {
    referencedFiles.add(match[1]);
  }

  await Promise.all(
    files
      .filter((f) => !referencedFiles.has(f))
      .map((f) =>
        fs.unlink(path.join(assetsDir, f)).catch((err: unknown) => {
          console.warn(`[content-admin] could not delete orphaned media ${f}:`, err);
        }),
      ),
  );
}
