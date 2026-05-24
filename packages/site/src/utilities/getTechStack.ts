import { getCollection } from 'astro:content';

import { type PillEntries } from '../content.config';
import { getTimeDiff } from './getTimeDiff';

export type TechStack = PillEntries[0] & {
  duration: string;
  elapsed: number;
  years: number;
};

type TechMeta = {
  // Ordered, deduplicated set of note fragments (e.g. ["ECS", "RDS", "EKS"])
  noteFragments: string[];
  dates: [Date, Date][];
};

type EntryData = {
  startDate: Date;
  endDate?: Date;
  tech_stack: PillEntries;
};

// Index for date range start
const START_DATE = 0;
// Index for date range end
const END_DATE = 1;

export async function getTechStack(collectionName: 'work' | 'project'): Promise<TechStack[]> {
  const entries = await getCollection(collectionName);

  // Key by name only so the same tech aggregates across entries regardless of note/icon variation
  const stack = new Map<string, TechMeta>();

  for (const entry of entries) {
    const data = entry.data as EntryData;
    const entryStart = data.startDate;
    const entryEnd = data.endDate ?? new Date();

    for (const tech of data.tech_stack) {
      if (tech.showInHome === false) continue;
      const key = tech.name;
      const newRange: [Date, Date] = [entryStart, entryEnd];
      const current = stack.get(key);

      if (!current) {
        stack.set(key, {
          noteFragments: tech.note ? [...tech.note] : [],
          dates: [newRange],
        });
        continue;
      }

      // Merge note fragments — append any new items not already present
      if (tech.note) {
        for (const fragment of tech.note) {
          if (!current.noteFragments.includes(fragment)) {
            current.noteFragments.push(fragment);
          }
        }
      }

      // Deduplicate / trim overlapping date ranges
      let pushDate = true;
      for (const [startDate, endDate] of current.dates) {
        if (startDate === entryStart && endDate === entryEnd) {
          pushDate = false;
          break;
        }
        if (startDate === newRange[START_DATE] && endDate === newRange[END_DATE]) {
          pushDate = false;
          break;
        }
        if (startDate < entryStart && entryStart < endDate) {
          newRange[START_DATE] = endDate;
        }
        if (startDate < entryEnd && entryStart < startDate) {
          newRange[END_DATE] = startDate;
        }
      }

      if (pushDate) current.dates.push(newRange);
    }
  }

  const sortedStack = Array.from(stack.entries())
    .map(([name, meta]) => {
      let elapsed = 0;
      for (const [start, end] of meta.dates) {
        elapsed += end.valueOf() - start.valueOf();
      }
      const years = Math.round((elapsed / 31556952000 + Number.EPSILON) * 10) / 10;
      return {
        name,
        note: meta.noteFragments.length > 0 ? meta.noteFragments : undefined,
        elapsed,
        years,
        duration: getTimeDiff(elapsed),
      } as TechStack;
    })
    .sort((a, b) => b.elapsed - a.elapsed);

  return sortedStack;
}
