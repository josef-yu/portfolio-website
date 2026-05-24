import { useState, useRef } from 'react';
import { api } from '../api';
import {
  parseFm,
  buildWritingFm,
  splitFrontmatter,
  DEFAULT_WRITING_META,
} from '../utils/frontmatter';
import { calcReadMin } from '../utils/text';
import { today } from '../utils/date';
import type { CollectionMeta, Pane, WritingMetaState } from '../types';

interface Options {
  getCollection: (id: string) => CollectionMeta | undefined;
  showToast: (msg: string, type?: 'ok' | 'err' | '') => void;
  refreshPreview: (collection: string, id: string) => void;
  refreshCollection: (id: string) => Promise<void>;
  isPreviewOpen: boolean;
}

/**
 * Manages the full lifecycle of the active editor entry:
 * loading, editing, creating, and saving content.
 */
export function useEntryEditor({
  getCollection,
  showToast,
  refreshPreview,
  refreshCollection,
  isPreviewOpen,
}: Options) {
  // ── Active entry ────────────────────────────────────────────────────────────
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // ── Raw editor content ──────────────────────────────────────────────────────
  const [fmContent, setFmContent] = useState('');
  const [bodyContent, setBodyContent] = useState('');
  const [dirty, setDirty] = useState(false);

  // ── UI pane ─────────────────────────────────────────────────────────────────
  const [pane, setPane] = useState<Pane>('empty');
  const [newFor, setNewFor] = useState<string | null>(null);

  // ── Writing-specific metadata ───────────────────────────────────────────────
  const [writingMeta, setWritingMeta] = useState<WritingMetaState>(DEFAULT_WRITING_META);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Keep dirty readable inside async callbacks without stale closure issues
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  // ── Entry loading ───────────────────────────────────────────────────────────

  async function loadEntry(collection: string, id: string) {
    if (dirtyRef.current && !confirm('Discard unsaved changes?')) return;

    const { content } = await api.getEntry(collection, id);
    const { fm, body } = splitFrontmatter(content);

    setActiveCollection(collection);
    setActiveId(id);
    setFmContent(fm);
    setBodyContent(body);
    setDirty(false);
    setPane('editor');

    if (collection === 'writing') {
      const parsed = parseFm(fm);
      // Hydrate read time from actual body word count when set to auto
      setWritingMeta({
        ...parsed,
        readMin: parsed.readMinAuto ? calcReadMin(body) : parsed.readMin,
      });
      api
        .getTags('writing')
        .then((tags) => setAvailableTags(Array.isArray(tags) ? tags : []))
        .catch(() => {});
    }

    if (isPreviewOpen) refreshPreview(collection, id);
  }

  // ── Pane transitions ────────────────────────────────────────────────────────

  function startNew(collection: string) {
    setNewFor(collection);
    setPane('new');
  }

  function clearActive() {
    if (dirtyRef.current && !confirm('Discard unsaved changes?')) return;
    setActiveCollection(null);
    setActiveId(null);
    setDirty(false);
    setNewFor(null);
    setPane('empty');
  }

  // ── Entry creation ──────────────────────────────────────────────────────────

  async function createEntry(id: string) {
    if (!newFor) return;
    const col = getCollection(newFor);
    if (!col) return;

    const res = await api.postEntry(newFor, id, col.template);
    if (res.error) {
      showToast(res.error, 'err');
      return;
    }

    showToast('Created', 'ok');
    await refreshCollection(newFor);
    await loadEntry(newFor, id);
  }

  // ── Saving ──────────────────────────────────────────────────────────────────

  async function save() {
    if (!activeCollection || !activeId) return;

    let fm = fmContent;

    if (activeCollection === 'writing') {
      let finalMeta = { ...writingMeta };
      // Auto-stamp publish date when the entry first goes live
      if (!finalMeta.draft && !finalMeta.pubDateOverride) {
        finalMeta = { ...finalMeta, pubDate: today() };
        setWritingMeta(finalMeta);
      }
      fm = buildWritingFm(finalMeta);
    }

    const content = `---\n${fm}\n---\n${bodyContent}`;
    const res = await api.putEntry(activeCollection, activeId, content);
    if (res.error) {
      showToast(`Save failed: ${res.error}`, 'err');
      return;
    }

    setDirty(false);
    showToast('Saved', 'ok');
    // Small delay lets Astro finish rebuilding the page before the iframe refreshes
    if (isPreviewOpen) setTimeout(() => refreshPreview(activeCollection, activeId!), 400);
  }

  // ── Dirty-marking setters ───────────────────────────────────────────────────

  function onFmChange(value: string) {
    setFmContent(value);
    setDirty(true);
  }
  function onBodyChange(value: string) {
    setBodyContent(value);
    setDirty(true);
  }
  function onWritingMetaChange(meta: WritingMetaState) {
    setWritingMeta(meta);
    setDirty(true);
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  return {
    // State
    activeCollection,
    activeId,
    fmContent,
    bodyContent,
    dirty,
    pane,
    newFor,
    writingMeta,
    availableTags,
    // Actions
    loadEntry,
    startNew,
    clearActive,
    createEntry,
    save,
    onFmChange,
    onBodyChange,
    onWritingMetaChange,
  };
}
