import type { WritingMetaState } from '@admin/types';
import { today } from './date';

// ── Raw content splitting ──────────────────────────────────────────────────────

/** Splits raw entry content into the YAML frontmatter body and the Markdown body. */
export function splitFrontmatter(content: string): { fm: string; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)/);
  return match ? { fm: match[1], body: match[2] } : { fm: '', body: content };
}

// ── Writing schema parse / build ───────────────────────────────────────────────

/**
 * Parses a YAML frontmatter string (writing schema only) into a structured
 * WritingMetaState object. Handles block sequences and inline arrays for tags.
 */
export function parseFm(yaml: string): WritingMetaState {
  const getScalar = (key: string): string | null => {
    const m = yaml.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm'));
    if (!m) return null;
    return m[1].trim().replace(/^['"]|['"]$/g, '');
  };

  // Block sequence  tags:\n  - Foo  preferred over inline  tags: [Foo]
  let tags: string[] = [];
  const blockMatch = yaml.match(/^tags:\s*\n((?:[ \t]+-[ \t]*.+\n?)*)/m);
  if (blockMatch) {
    tags = blockMatch[1]
      .split('\n')
      .map((l) => l.replace(/^[ \t]+-[ \t]*/, '').trim())
      .filter(Boolean);
  } else {
    const inlineMatch = yaml.match(/^tags:\s*\[([^\]]*)\]/m);
    if (inlineMatch && inlineMatch[1].trim()) {
      tags = inlineMatch[1]
        .split(',')
        .map((t) => t.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    }
  }

  const readMinVal = getScalar('readMin');
  const draftVal = getScalar('draft');
  const pubDateVal = getScalar('publishDate');

  return {
    title: getScalar('title') ?? '',
    description: getScalar('description') ?? '',
    draft: draftVal === 'true',
    tags,
    readMinAuto: readMinVal === null,
    readMin: readMinVal !== null ? parseInt(readMinVal, 10) || 1 : 1,
    pubDateOverride: false,
    pubDate: pubDateVal ?? today(),
  };
}

/**
 * Rebuilds a YAML frontmatter string from structured writing metadata.
 * Field order mirrors content.config.ts. Optional fields (readMin, draft) are
 * omitted when they hold their default values.
 */
export function buildWritingFm(meta: WritingMetaState): string {
  const esc = (v: string) => `'${String(v).replace(/'/g, "''")}'`;
  const lines: string[] = [];

  lines.push(`title: ${esc(meta.title)}`);
  lines.push(`description: ${esc(meta.description)}`);
  lines.push(`publishDate: ${meta.pubDate || today()}`);

  if (meta.tags.length > 0) {
    lines.push('tags:');
    meta.tags.forEach((t) => lines.push(`  - ${t}`));
  } else {
    lines.push('tags: []');
  }

  if (!meta.readMinAuto && meta.readMin > 0) lines.push(`readMin: ${meta.readMin}`);
  if (meta.draft) lines.push('draft: true');

  return lines.join('\n') + '\n';
}

// ── Default state ──────────────────────────────────────────────────────────────

export const DEFAULT_WRITING_META: WritingMetaState = {
  title: '',
  description: '',
  draft: false,
  tags: [],
  readMinAuto: true,
  readMin: 1,
  pubDateOverride: false,
  pubDate: today(),
};
