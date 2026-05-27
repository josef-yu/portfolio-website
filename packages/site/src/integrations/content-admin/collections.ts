import type { ViteDevServer } from 'vite';
import type { Dirent } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Entry = { id: string; title: string; description?: string };

export type CollectionMeta = {
  id: string;
  label: string;
  urlBase: string;
  template: string;
};

// ── Entry helpers ─────────────────────────────────────────────────────────────

function parseEntry(content: string): { title: string; description?: string } {
  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  const get = (key: string) =>
    fm
      .match(new RegExp(`^${key}:\\s*['"]?(.+?)['"]?\\s*$`, 'm'))?.[1]
      ?.trim()
      .replace(/^['"]|['"]$/g, '');

  const title = (() => {
    const t = get('title');
    if (t) return t;
    const role = get('role');
    const employer = get('employer');
    if (role || employer) return [role, employer].filter(Boolean).join(' · ');
    return 'Untitled';
  })();

  return { title, description: get('description') };
}

export async function listEntries(contentDir: string, collection: string): Promise<Entry[]> {
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
      return { id, ...parseEntry(content) };
    }),
  );
}

export async function listTags(contentDir: string, collection: string): Promise<string[]> {
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

      // Inline array:  tags: [Foo, Bar]
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

/**
 * Resolves and validates the .md file path for a collection entry.
 * Throws if collection or id contain characters outside [a-zA-Z0-9_-].
 */
export function guardPath(contentDir: string, collection: string, id: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(collection)) throw new Error('Invalid collection name');
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error('Invalid entry id');
  return path.join(contentDir, collection, `${id}.md`);
}

// ── Zod → YAML template helpers ───────────────────────────────────────────────

const TODAY = new Date().toISOString().split('T')[0];

function zodValueToYaml(schema: unknown): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      return TODAY;
    case 'ZodArray':
      return '[]';
    case 'ZodEnum':
      return String(def.values?.[0] ?? '');
    case 'ZodOptional':
    case 'ZodNullable':
      return null;
    case 'ZodDefault': {
      const dv = def.defaultValue();
      if (Array.isArray(dv)) return '[]';
      if (typeof dv === 'boolean') return String(dv);
      if (typeof dv === 'number') return String(dv);
      if (typeof dv === 'string') return dv === '' ? "''" : dv;
      return "''";
    }
    case 'ZodEffects':
      return zodValueToYaml(def.schema);
    case 'ZodPipeline':
      return zodValueToYaml(def.in);
    default:
      return "''";
  }
}

function schemaToFrontmatter(schema: unknown): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 * Finds the public URL base for a collection by scanning src/pages/ for a
 * matching directory with a `[...slug].astro` catch-all route.
 */
async function findUrlBase(pagesDir: string, collectionId: string): Promise<string> {
  let entries: Dirent[];
  try {
    entries = await fs.readdir(pagesDir, { withFileTypes: true });
  } catch {
    return `/${collectionId}/`;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dirName = entry.name;
    try {
      await fs.access(path.join(pagesDir, dirName, '[...slug].astro'));
    } catch {
      continue;
    }
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
 */
export async function buildCollectionMeta(
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
