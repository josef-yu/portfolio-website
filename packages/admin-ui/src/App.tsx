import { useState, useEffect, useRef } from 'react';
import { api } from './api';
import {
  parseFm,
  buildWritingFm,
  splitFrontmatter,
  today,
  calcReadMin,
  DEFAULT_WRITING_META,
} from './utils';
import type { CollectionMeta, Entry, WritingMetaState, ToastState, Pane } from './types';
import Sidebar from './components/Sidebar';
import EditorPane from './components/EditorPane';
import NewEntryForm from './components/NewEntryForm';
import Toast from './components/Toast';

export default function App() {
  // ── Collections ───────────────────────────────────────────────────────────
  const [collections, setCollections] = useState<CollectionMeta[]>([]);

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [cachedEntries, setCachedEntries] = useState<Record<string, Entry[]>>({});

  // ── Active entry ──────────────────────────────────────────────────────────
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // ── Editor content ────────────────────────────────────────────────────────
  const [fmContent, setFmContent] = useState('');
  const [bodyContent, setBodyContent] = useState('');
  const [dirty, setDirty] = useState(false);

  // ── Writing-specific structured metadata ──────────────────────────────────
  const [writingMeta, setWritingMeta] = useState<WritingMetaState>(DEFAULT_WRITING_META);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [pane, setPane] = useState<Pane>('empty');
  const [newFor, setNewFor] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [previewSrc, setPreviewSrc] = useState('about:blank');
  const [toast, setToast] = useState<ToastState>(null);

  // ── Refs for handlers that capture latest state ───────────────────────────
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Save handler ref — lets the keydown effect always call the latest version
  // without being re-registered on every render.
  const handleSaveRef = useRef<() => Promise<void>>();

  // ── Load collections on mount ─────────────────────────────────────────────
  useEffect(() => {
    api.getCollections().then(setCollections).catch(console.error);
  }, []);

  // ── Keyboard: ⌘S / Ctrl+S ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveRef.current?.();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Unsaved-changes navigation guard ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function showToast(msg: string, type: 'ok' | 'err' | '' = '') {
    setToast({ msg, type });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2600);
  }

  function getCol(id: string) {
    return collections.find((c) => c.id === id);
  }

  function refreshPreview(collection: string, id: string) {
    const col = getCol(collection);
    if (col) setPreviewSrc(`${col.urlBase}${id}?_t=${Date.now()}`);
  }

  // ── Entry loading ─────────────────────────────────────────────────────────

  async function handleLoadEntry(collection: string, id: string) {
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
      // Hydrate read time from actual body word count if auto
      const readMin = parsed.readMinAuto ? calcReadMin(body) : parsed.readMin;
      setWritingMeta({ ...parsed, readMin });
      api
        .getTags('writing')
        .then((tags) => setAvailableTags(Array.isArray(tags) ? tags : []))
        .catch(() => {});
    }

    if (preview) refreshPreview(collection, id);
  }

  // ── Sidebar interactions ──────────────────────────────────────────────────

  async function handleToggleCollection(key: string) {
    const opening = !expanded[key];
    setExpanded((prev) => ({ ...prev, [key]: opening }));
    if (opening) {
      try {
        const entries = await api.getEntries(key);
        setCachedEntries((prev) => ({ ...prev, [key]: entries }));
      } catch (err) {
        console.error('[admin] Failed to load entries for', key, err);
      }
    }
  }

  function handleShowNewForm(collection: string) {
    setNewFor(collection);
    setPane('new');
  }

  function handleShowEmpty() {
    if (dirtyRef.current && !confirm('Discard unsaved changes?')) return;
    setActiveCollection(null);
    setActiveId(null);
    setDirty(false);
    setNewFor(null);
    setPane('empty');
  }

  // ── Entry creation ────────────────────────────────────────────────────────

  async function handleCreateEntry(id: string) {
    if (!newFor) return;
    const col = getCol(newFor);
    if (!col) return;

    const res = await api.postEntry(newFor, id, col.template);
    if (res.error) { showToast(res.error, 'err'); return; }

    showToast('Created', 'ok');

    // Refresh the sidebar list for this collection
    try {
      const entries = await api.getEntries(newFor);
      setCachedEntries((prev) => ({ ...prev, [newFor!]: entries }));
    } catch { /* not critical */ }

    await handleLoadEntry(newFor, id);
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!activeCollection || !activeId) return;

    let fm = fmContent;

    if (activeCollection === 'writing') {
      // Auto-set publishDate when the entry first goes live
      let finalMeta = { ...writingMeta };
      if (!finalMeta.draft && !finalMeta.pubDateOverride) {
        finalMeta = { ...finalMeta, pubDate: today() };
        setWritingMeta(finalMeta);
      }
      fm = buildWritingFm(finalMeta);
    }

    const content = `---\n${fm}\n---\n${bodyContent}`;
    const res = await api.putEntry(activeCollection, activeId, content);
    if (res.error) { showToast(`Save failed: ${res.error}`, 'err'); return; }

    setDirty(false);
    showToast('Saved', 'ok');
    if (preview) setTimeout(() => refreshPreview(activeCollection, activeId!), 400);
  }

  // Keep the ref current so the keydown handler always calls the latest save
  handleSaveRef.current = handleSave;

  // ── Preview ───────────────────────────────────────────────────────────────

  function handleTogglePreview() {
    const next = !preview;
    setPreview(next);
    if (next && activeCollection && activeId) {
      refreshPreview(activeCollection, activeId);
    } else if (!next) {
      setPreviewSrc('about:blank');
    }
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const activeLabel = activeCollection ? (getCol(activeCollection)?.label ?? activeCollection) : '';
  const newForLabel = newFor ? (getCol(newFor)?.label ?? newFor) : '';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="app">
      <Sidebar
        collections={collections}
        expanded={expanded}
        cachedEntries={cachedEntries}
        activeCollection={activeCollection}
        activeId={activeId}
        onToggleCollection={handleToggleCollection}
        onSelectEntry={handleLoadEntry}
        onNewEntry={handleShowNewForm}
      />

      <div className="workspace">
        {/* Toolbar — hidden on empty pane */}
        {pane !== 'empty' && (
          <div className="toolbar">
            <span className="toolbar-title">
              {pane === 'editor' && activeId && (
                <>
                  <span className="coll-badge">{activeLabel} /</span>
                  {activeId}.md
                </>
              )}
              {pane === 'new' && newFor && (
                <>
                  <span className="coll-badge">{newForLabel}</span>
                  New entry
                </>
              )}
            </span>
            <button className="btn" onClick={handleTogglePreview}>
              {preview ? 'Hide preview' : 'Preview'}
            </button>
            <button
              className={`btn btn-primary${dirty ? ' unsaved' : ''}`}
              onClick={handleSave}
              disabled={pane !== 'editor'}
            >
              Save
            </button>
          </div>
        )}

        {/* Empty state */}
        {pane === 'empty' && (
          <div className="empty-state">Select an entry or create a new one</div>
        )}

        {/* New entry form */}
        {pane === 'new' && newFor && (
          <NewEntryForm
            label={newForLabel}
            onCancel={handleShowEmpty}
            onCreate={handleCreateEntry}
          />
        )}

        {/* Editor */}
        {pane === 'editor' && (
          <EditorPane
            activeCollection={activeCollection}
            fmContent={fmContent}
            bodyContent={bodyContent}
            writingMeta={writingMeta}
            availableTags={availableTags}
            preview={preview}
            previewSrc={previewSrc}
            onFmChange={(v) => { setFmContent(v); setDirty(true); }}
            onBodyChange={(v) => { setBodyContent(v); setDirty(true); }}
            onWritingMetaChange={(m) => { setWritingMeta(m); setDirty(true); }}
          />
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
