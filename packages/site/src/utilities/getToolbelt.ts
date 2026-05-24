import { getCollection } from 'astro:content';
import { type PillEntries } from '../content.config';

// Ordered list of categories — controls display order on the about page
const CATEGORY_ORDER = [
  'Languages',
  'Backend',
  'Frontend',
  'Cloud · Infra',
  'Data',
  'DevOps & Tooling',
  'AI / LLM',
];

/**
 * Aggregates tech_stack entries from a collection, groups them by `category`,
 * and deduplicates by name. Returns an ordered map of category -> skill names.
 * Only techs with a `category` field are included.
 */
export async function getToolbelt(
  collectionName: 'work' | 'project',
): Promise<Record<string, string[]>> {
  const entries = await getCollection(collectionName);

  const seen = new Map<string, string>(); // name -> category

  for (const entry of entries) {
    const { tech_stack } = entry.data as { tech_stack: PillEntries };
    for (const tech of tech_stack) {
      if (!tech.category) continue;
      if (!seen.has(tech.name)) {
        seen.set(tech.name, tech.category);
      }
    }
  }

  // Group names by category, preserving CATEGORY_ORDER
  const grouped: Record<string, string[]> = {};

  for (const cat of CATEGORY_ORDER) {
    grouped[cat] = [];
  }

  for (const [name, cat] of seen) {
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(name);
  }

  // Drop empty categories
  return Object.fromEntries(Object.entries(grouped).filter(([, items]) => items.length > 0));
}
