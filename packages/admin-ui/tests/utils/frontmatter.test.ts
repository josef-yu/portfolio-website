import { describe, it, expect, vi } from 'vitest';
import { splitFrontmatter, parseFm, buildWritingFm } from '@admin/utils/frontmatter';
import type { WritingMetaState } from '@admin/types';

// Pin `today()` so date-dependent assertions are stable
vi.mock('@admin/utils/date', () => ({ today: () => '2026-01-01' }));

// ── splitFrontmatter ──────────────────────────────────────────────────────────

describe('splitFrontmatter', () => {
  it('splits a file with frontmatter correctly', () => {
    const content = '---\ntitle: Hello\n---\nBody text';
    expect(splitFrontmatter(content)).toEqual({ fm: 'title: Hello', body: 'Body text' });
  });

  it('returns empty fm and full content when there is no frontmatter', () => {
    const content = 'Just a body';
    expect(splitFrontmatter(content)).toEqual({ fm: '', body: 'Just a body' });
  });

  it('handles a file with frontmatter but no body', () => {
    const content = '---\ntitle: Hello\n---\n';
    expect(splitFrontmatter(content)).toEqual({ fm: 'title: Hello', body: '' });
  });

  it('handles CRLF line endings', () => {
    const content = '---\r\ntitle: Hello\r\n---\r\nBody';
    expect(splitFrontmatter(content)).toEqual({ fm: 'title: Hello', body: 'Body' });
  });
});

// ── parseFm ───────────────────────────────────────────────────────────────────

describe('parseFm', () => {
  it('parses title and description', () => {
    const fm = "title: 'My Post'\ndescription: 'A description'";
    const result = parseFm(fm);
    expect(result.title).toBe('My Post');
    expect(result.description).toBe('A description');
  });

  it('parses block-sequence tags', () => {
    const fm = 'tags:\n  - TypeScript\n  - React\n';
    expect(parseFm(fm).tags).toEqual(['TypeScript', 'React']);
  });

  it('parses inline-array tags', () => {
    const fm = 'tags: [TypeScript, React]';
    expect(parseFm(fm).tags).toEqual(['TypeScript', 'React']);
  });

  it('returns empty tags when none are present', () => {
    expect(parseFm('title: Hi').tags).toEqual([]);
  });

  it('sets readMinAuto true when readMin is absent', () => {
    expect(parseFm('title: Hi').readMinAuto).toBe(true);
  });

  it('sets readMinAuto false and parses readMin when present', () => {
    const result = parseFm('readMin: 5');
    expect(result.readMinAuto).toBe(false);
    expect(result.readMin).toBe(5);
  });

  it('sets draft true when present', () => {
    expect(parseFm('draft: true').draft).toBe(true);
  });

  it('sets draft false when absent', () => {
    expect(parseFm('title: Hi').draft).toBe(false);
  });
});

// ── buildWritingFm ────────────────────────────────────────────────────────────

describe('buildWritingFm', () => {
  const base: WritingMetaState = {
    title: 'Hello',
    description: 'A post',
    draft: false,
    tags: [],
    readMinAuto: true,
    readMin: 3,
    pubDateOverride: false,
    pubDate: '2026-01-01',
  };

  it('includes title and description', () => {
    const fm = buildWritingFm(base);
    expect(fm).toContain("title: 'Hello'");
    expect(fm).toContain("description: 'A post'");
  });

  it('emits tags as a block sequence', () => {
    const fm = buildWritingFm({ ...base, tags: ['TypeScript', 'React'] });
    expect(fm).toContain('tags:\n  - TypeScript\n  - React');
  });

  it('emits tags: [] when the list is empty', () => {
    expect(buildWritingFm(base)).toContain('tags: []');
  });

  it('omits readMin when readMinAuto is true', () => {
    const fm = buildWritingFm({ ...base, readMinAuto: true, readMin: 5 });
    expect(fm).not.toMatch(/^readMin:/m);
  });

  it('includes readMin when readMinAuto is false', () => {
    const fm = buildWritingFm({ ...base, readMinAuto: false, readMin: 5 });
    expect(fm).toContain('readMin: 5');
  });

  it('omits draft when false', () => {
    expect(buildWritingFm(base)).not.toMatch(/^draft:/m);
  });

  it('includes draft: true when set', () => {
    expect(buildWritingFm({ ...base, draft: true })).toContain('draft: true');
  });

  it('escapes single quotes in title', () => {
    const fm = buildWritingFm({ ...base, title: "it's fine" });
    expect(fm).toContain("title: 'it''s fine'");
  });
});

// ── round-trip ────────────────────────────────────────────────────────────────

describe('parseFm / buildWritingFm round-trip', () => {
  it('preserves manual readMin through a round-trip', () => {
    const original: WritingMetaState = {
      title: 'Round-trip',
      description: 'Test',
      draft: false,
      tags: ['Node'],
      readMinAuto: false,
      readMin: 7,
      pubDateOverride: false,
      pubDate: '2026-01-01',
    };
    const restored = parseFm(buildWritingFm(original));
    expect(restored.readMinAuto).toBe(false);
    expect(restored.readMin).toBe(7);
    expect(restored.tags).toEqual(['Node']);
  });
});
