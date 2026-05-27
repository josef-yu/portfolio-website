import { describe, it, expect } from 'vitest';
import { calcReadMin, slugify, WORDS_PER_MINUTE } from '@admin/utils/text';

const wpm = WORDS_PER_MINUTE;
const words = (n: number) => Array(n).fill('word').join(' ');

describe('calcReadMin', () => {
  it('returns 1 for an empty string', () => {
    expect(calcReadMin('')).toBe(1);
  });

  it('returns 1 for fewer than wpm words', () => {
    expect(calcReadMin(words(Math.floor(wpm / 2)))).toBe(1);
  });

  it('returns 1 for exactly wpm words', () => {
    expect(calcReadMin(words(wpm))).toBe(1);
  });

  it('returns the correct minute for 1.5× wpm words', () => {
    const count = Math.round(wpm * 1.5);
    expect(calcReadMin(words(count))).toBe(Math.round(count / wpm));
  });

  it('returns 2 for exactly 2× wpm words', () => {
    expect(calcReadMin(words(wpm * 2))).toBe(2);
  });

  it('returns 3 for exactly 3× wpm words', () => {
    expect(calcReadMin(words(wpm * 3))).toBe(3);
  });

  it('ignores extra whitespace between words', () => {
    expect(calcReadMin('one   two\tthree\nfour')).toBe(1);
  });
});

describe('slugify', () => {
  it('lowercases the input', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('foo bar baz')).toBe('foo-bar-baz');
  });

  it('replaces non-alphanumeric characters with hyphens', () => {
    expect(slugify('hello, world!')).toBe('hello--world-');
  });

  it('trims leading and trailing whitespace', () => {
    expect(slugify('  hello  ')).toBe('hello');
  });

  it('leaves an already-valid slug unchanged', () => {
    expect(slugify('my-post-slug')).toBe('my-post-slug');
  });

  it('handles numbers', () => {
    expect(slugify('post 42')).toBe('post-42');
  });
});
