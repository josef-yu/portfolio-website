/** Words-per-minute assumption used for read-time estimation. */
export const WORDS_PER_MINUTE = 200;

/** Estimates reading time in minutes. */
export function calcReadMin(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Converts a freeform string to a URL-safe slug. */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-');
}
