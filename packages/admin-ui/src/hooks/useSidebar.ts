import { useState } from 'react';
import { api } from '../api';
import type { Entry } from '../types';

export function useSidebar() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [cachedEntries, setCachedEntries] = useState<Record<string, Entry[]>>({});

  /** Toggles a collection open/closed, fetching entries on first open. */
  async function toggleCollection(id: string) {
    const opening = !expanded[id];
    setExpanded((prev) => ({ ...prev, [id]: opening }));

    if (opening) {
      try {
        const entries = await api.getEntries(id);
        setCachedEntries((prev) => ({ ...prev, [id]: entries }));
      } catch (err) {
        console.error('[admin] Failed to load entries for', id, err);
      }
    }
  }

  /** Re-fetches entries for a collection (e.g. after creating a new entry). */
  async function refreshCollection(id: string) {
    try {
      const entries = await api.getEntries(id);
      setCachedEntries((prev) => ({ ...prev, [id]: entries }));
    } catch {
      // Not critical — the sidebar list will just be slightly stale
    }
  }

  return { expanded, cachedEntries, toggleCollection, refreshCollection };
}
