/**
 * content-admin — dev-only Vite middleware
 * Serves a CMS interface at /_admin/ during `astro dev`.
 * Nothing is emitted to the production build.
 *
 * The UI is a React app built by Vite (admin-ui/) into admin-dist/.
 * Run `npm run admin:dev` in a second terminal to watch for changes.
 */

import type { AstroIntegration } from 'astro';
import type { ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

// Points to the Vite build output of admin-ui/.
// Vite stamps content-hash filenames, so no manual cache-busting is needed.
const ADMIN_DIR = path.resolve(process.cwd(), 'src/integrations/admin-dist');

// ── Types ─────────────────────────────────────────────────────────────────────

type Entry = { id: string; title: string };
type CollectionMeta = {
  id: string;
  label: string;
  urlBase: string;
  template: string;
};

// ── Content helpers ───────────────────────────────────────────────────────────

function extractTitle(content: string): string {
  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  const get = (key: string) =>
    fm
      .match(new RegExp(`^${key}:\\s*['"]?(.+?)['"]?\\s*$`, 'm'))?.[1]
      ?.trim()
      .replace(/^['"]|['"]$/g, '');

  const title = get('title');
  if (title) return title;

  // Fallback for entries that use role+employer instead of title (e.g. work)
  const role = get('role');
  const employer = get('employer');
  if (role || employer) return [role, employer].filter(Boolean).join(' · ');

  return 'Untitled';
}

async function listEntries(contentDir: string, collection: string): Promise<Entry[]> {
  const dir = path.join(contentDir, collection);
  let files: string[];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
  return Promise.all(
    files.map(async (file) => {
      const id = file.slice(0, -3);
      const content = await fs.readFile(path.join(dir, file), 'utf-8');
      return { id, title: extractTitle(content) };
    }),
  );
}

async function listTags(contentDir: string, collection: string): Promise<string[]> {
  const dir = path.join(contentDir, collection);
  let files: string[];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }

  const tagArrays = await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(path.join(dir, file), 'utf-8');
      const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';

      // Block sequence:  tags:\n  - Foo\n  - Bar
      const block = fm.match(/^tags:\s*\n((?:[ \t]+-[ \t]*.+\n?)*)/m);
      if (block) {
        return block[1]
          .split('\n')
          .map((l) => l.replace(/^[ \t]+-[ \t]*/, '').trim())
          .filter(Boolean);
      }

      // Inline array:  tags: [Foo, Bar]  or  tags: []
      const inline = fm.match(/^tags:\s*\[([^\]]*)\]/m);
      if (inline && inline[1].trim()) {
        return inline[1]
          .split(',')
          .map((t) => t.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean);
      }

      return [];
    }),
  );

  return [...new Set(tagArrays.flat())].sort();
}

function guardPath(contentDir: string, collection: string, id: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(collection)) throw new Error('Invalid collection name');
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error('Invalid entry id');
  return path.join(contentDir, collection, `${id}.md`);
}

// ── Zod → YAML template helpers ───────────────────────────────────────────────

const TODAY = new Date().toISOString().split('T')[0];

/**
 * Maps a Zod field schema to its YAML representation for a blank template.
 * Returns null to omit the field (used for optional/nullable fields).
 */
function zodValueToYaml(schema: unknown): string | null {
  const def = (schema as any)?._def;
  if (!def) return "''";

  switch (def.typeName) {
    case 'ZodString':
      return "''";
    case 'ZodNumber':
      return '0';
    case 'ZodBoolean':
      return 'false';
    case 'ZodDate':
      return TODAY; // handles z.date() and z.coerce.date()
    case 'ZodArray':
      return '[]';
    case 'ZodEnum':
      return String(def.values?.[0] ?? '');

    case 'ZodOptional':
    case 'ZodNullable':
      return null; // omit optional fields from the blank template

    case 'ZodDefault': {
      const dv = def.defaultValue();
      if (Array.isArray(dv)) return '[]';
      if (typeof dv === 'boolean') return String(dv);
      if (typeof dv === 'number') return String(dv);
      if (typeof dv === 'string') return dv === '' ? "''" : dv;
      return "''";
    }

    // z.preprocess / z.transform / legacy z.coerce — unwrap inner schema
    case 'ZodEffects':
      return zodValueToYaml(def.schema);
    case 'ZodPipeline':
      return zodValueToYaml(def.in);

    default:
      return "''";
  }
}

/**
 * Generates a YAML frontmatter string from a ZodObject schema.
 * Optional fields are omitted so the template stays minimal.
 */
function schemaToFrontmatter(schema: unknown): string {
  const def = (schema as any)?._def;
  if (def?.typeName !== 'ZodObject') return "title: ''\n";

  const shape: Record<string, unknown> = def.shape();
  const lines: string[] = [];

  for (const [key, fieldSchema] of Object.entries(shape)) {
    const value = zodValueToYaml(fieldSchema);
    if (value !== null) lines.push(`${key}: ${value}`);
  }

  return lines.join('\n') + '\n';
}

// ── URL discovery ─────────────────────────────────────────────────────────────

/**
 * Scans src/pages/ for a subdirectory that:
 *   1. Contains a [...slug].astro file (i.e. it's a collection detail route), and
 *   2. Matches the collection id exactly, or with a simple 's' suffix.
 *
 * Falls back to `/{collectionId}/` if no match is found.
 */
async function findUrlBase(pagesDir: string, collectionId: string): Promise<string> {
  let entries: import('node:fs').Dirent[];
  try {
    entries = await fs.readdir(pagesDir, { withFileTypes: true });
  } catch {
    return `/${collectionId}/`;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dirName = entry.name;

    // Must have a dynamic slug page
    try {
      await fs.access(path.join(pagesDir, dirName, '[...slug].astro'));
    } catch {
      continue;
    }

    // Match: exact, pluralised, or singularised
    if (
      dirName === collectionId ||
      dirName === collectionId + 's' ||
      dirName + 's' === collectionId
    ) {
      return `/${dirName}/`;
    }
  }

  return `/${collectionId}/`;
}

// ── Collection metadata ───────────────────────────────────────────────────────

/**
 * Loads Astro's content.config.ts via Vite's SSR module loader and derives
 * full collection metadata (label, URL base, blank template) from it.
 * Falls back gracefully if the config cannot be loaded.
 */
async function buildCollectionMeta(
  server: ViteDevServer,
  contentDir: string,
  pagesDir: string,
): Promise<CollectionMeta[]> {
  let collectionDefs: Record<string, { schema?: unknown }> = {};

  try {
    const mod = await server.ssrLoadModule('/src/content.config.ts');
    collectionDefs = (mod.collections as Record<string, { schema?: unknown }>) ?? {};
  } catch (err) {
    console.warn('[content-admin] Could not load content.config.ts:', err);
  }

  // Use the filesystem as the source of truth for which collections exist
  const dirs = await fs.readdir(contentDir, { withFileTypes: true });
  const ids = dirs.filter((d) => d.isDirectory()).map((d) => d.name);

  return Promise.all(
    ids.map(async (id) => {
      const schema = collectionDefs[id]?.schema;
      const label = id[0].toUpperCase() + id.slice(1);
      const urlBase = await findUrlBase(pagesDir, id);
      const template = `---\n${schemaToFrontmatter(schema)}---\n`;
      return { id, label, urlBase, template };
    }),
  );
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

function respond(res: ServerResponse, data: unknown, status = 200): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

async function serveFile(res: ServerResponse, relPath: string, contentType: string): Promise<void> {
  // Safety: ensure the resolved path stays within ADMIN_DIR
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

// ── Request handler ───────────────────────────────────────────────────────────

async function handle(
  req: IncomingMessage,
  res: ServerResponse,
  contentDir: string,
  pagesDir: string,
  server: ViteDevServer,
) {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const pathname = url.pathname.replace(/^\/_admin/, '') || '/';
  const method = req.method ?? 'GET';
  const c = url.searchParams.get('c') ?? '';
  const id = url.searchParams.get('id') ?? '';

  // Static assets — serve by extension; preserve subdirectory path (e.g. assets/)
  // Vite content-hashes asset filenames so browser caching is safe.
  const CONTENT_TYPES: Record<string, string> = {
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
  };
  const ext = path.extname(pathname);
  if (ext in CONTENT_TYPES) {
    // pathname starts with "/" — strip it to get a relative path like "assets/index-abc.js"
    return serveFile(res, pathname.slice(1), CONTENT_TYPES[ext]);
  }

  // UI shell — serve the React app's index.html for any non-API route
  if (!pathname.startsWith('/api')) {
    const html = await fs.readFile(path.join(ADMIN_DIR, 'index.html'), 'utf-8');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(html);
    return;
  }

  // API routes
  const route = pathname.slice(4); // strip leading /api

  if (route === '/collections' && method === 'GET') {
    return respond(res, await buildCollectionMeta(server, contentDir, pagesDir));
  }

  if (route === '/entries' && method === 'GET') {
    return respond(res, await listEntries(contentDir, c));
  }

  if (route === '/tags' && method === 'GET') {
    return respond(res, await listTags(contentDir, c));
  }

  if (route === '/entry' && method === 'GET') {
    const fp = guardPath(contentDir, c, id);
    return respond(res, { content: await fs.readFile(fp, 'utf-8') });
  }

  if (route === '/entry' && method === 'PUT') {
    const fp = guardPath(contentDir, c, id);
    const { content } = JSON.parse(await readBody(req));
    await fs.writeFile(fp, content, 'utf-8');
    return respond(res, { ok: true });
  }

  if (route === '/entry' && method === 'POST') {
    const fp = guardPath(contentDir, c, id);
    const { content } = JSON.parse(await readBody(req));
    try {
      await fs.access(fp);
      return respond(res, { error: 'Entry already exists' }, 409);
    } catch {
      /* file does not exist — safe to create */
    }
    await fs.writeFile(fp, content, 'utf-8');
    return respond(res, { ok: true });
  }

  res.statusCode = 404;
  res.end();
}

// ── Integration ───────────────────────────────────────────────────────────────

export function contentAdmin(): AstroIntegration {
  return {
    name: 'content-admin',
    hooks: {
      'astro:server:setup': ({ server }) => {
        const contentDir = path.resolve(process.cwd(), 'src/content');
        const pagesDir = path.resolve(process.cwd(), 'src/pages');

        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/_admin')) return next();
          try {
            await handle(
              req as IncomingMessage,
              res as unknown as ServerResponse,
              contentDir,
              pagesDir,
              server,
            );
          } catch (err) {
            console.error('[content-admin]', err);
            respond(res as unknown as ServerResponse, { error: String(err) }, 500);
          }
        });
      },

      'astro:server:start': ({ address, logger }) => {
        const host =
          address.address === '0.0.0.0' || address.address === '::' ? 'localhost' : address.address;
        logger.info(`Content admin → http://${host}:${address.port}/_admin/`);
      },
    },
  };
}
