import type { WritingMetaState } from './types';

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function calcReadMin(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Split raw entry content into frontmatter YAML and body markdown. */
export function splitFrontmatter(content: string): { fm: string; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)/);
  return match ? { fm: match[1], body: match[2] } : { fm: '', body: content };
}

/**
 * Parses a YAML frontmatter string (writing schema only) into structured meta.
 * Handles block sequences and inline arrays for tags; treats all other fields
 * as simple scalar values.
 */
export function parseFm(yaml: string): WritingMetaState {
  const getVal = (key: string): string | null => {
    const m = yaml.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm'));
    if (!m) return null;
    return m[1].trim().replace(/^['"]|['"]$/g, '');
  };

  // Tags — block sequence preferred, inline array as fallback
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

  const readMinVal = getVal('readMin');
  const draftVal = getVal('draft');
  const pubDateVal = getVal('publishDate');

  return {
    title:           getVal('title')       ?? '',
    description:     getVal('description') ?? '',
    draft:           draftVal === 'true',
    tags,
    readMinAuto:     readMinVal === null,
    readMin:         readMinVal !== null ? (parseInt(readMinVal, 10) || 1) : 1,
    pubDateOverride: false,
    pubDate:         pubDateVal ?? today(),
  };
}

/**
 * Rebuilds a YAML frontmatter string from the structured writing meta.
 * Field order matches the content.config.ts schema definition.
 * Optional fields (readMin, draft) are omitted when at their default values.
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

  if (!meta.readMinAuto && meta.readMin > 0) {
    lines.push(`readMin: ${meta.readMin}`);
  }

  if (meta.draft) {
    lines.push('draft: true');
  }

  return lines.join('\n') + '\n';
}

export const DEFAULT_WRITING_META: WritingMetaState = {
  title:           '',
  description:     '',
  draft:           false,
  tags:            [],
  readMinAuto:     true,
  readMin:         1,
  pubDateOverride: false,
  pubDate:         today(),
};
