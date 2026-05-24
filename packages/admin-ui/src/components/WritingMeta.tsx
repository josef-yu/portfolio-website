import { useEffect } from 'react';
import { calcReadMin, today } from '../utils';
import type { WritingMetaState } from '../types';
import TagInput from './TagInput';

interface WritingMetaProps {
  meta: WritingMetaState;
  bodyContent: string;
  availableTags: string[];
  onMetaChange: (meta: WritingMetaState) => void;
}

export default function WritingMeta({
  meta,
  bodyContent,
  availableTags,
  onMetaChange,
}: WritingMetaProps) {
  const set = (patch: Partial<WritingMetaState>) =>
    onMetaChange({ ...meta, ...patch });

  // Keep the auto read time in sync with body word count
  useEffect(() => {
    if (meta.readMinAuto) {
      set({ readMin: calcReadMin(bodyContent) });
    }
    // Only re-run when bodyContent changes or readMinAuto toggles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyContent, meta.readMinAuto]);

  // ── Publish date hint ──────────────────────────────────────────────────────

  const pubDateHint = meta.draft
    ? 'Set to today on first publish'
    : 'Will be set to today on save';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Title */}
      <div className="field-group">
        <span className="field-label">Title</span>
        <input
          type="text"
          className="meta-input"
          value={meta.title}
          onChange={(e) => set({ title: e.target.value })}
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      {/* Description */}
      <div className="field-group">
        <span className="field-label">Description</span>
        <textarea
          className="meta-textarea"
          value={meta.description}
          onChange={(e) => set({ description: e.target.value })}
          spellCheck={false}
          rows={2}
        />
      </div>

      {/* Draft toggle */}
      <div className="field-group">
        <span className="field-label">Status</span>
        <label className="draft-label">
          <input
            type="checkbox"
            checked={meta.draft}
            onChange={(e) => set({ draft: e.target.checked })}
          />
          <span>Draft</span>
        </label>
      </div>

      {/* Tags */}
      <div className="field-group">
        <span className="field-label">Tags</span>
        <TagInput
          tags={meta.tags}
          availableTags={availableTags}
          onChange={(tags) => set({ tags })}
        />
      </div>

      {/* Read time */}
      <div className="field-group">
        <span className="field-label">
          Read time
          {meta.readMinAuto && <span className="auto-badge">auto</span>}
        </span>
        <div className="readmin-row">
          <input
            type="number"
            className="meta-num"
            min={1}
            value={meta.readMin}
            onChange={(e) => {
              const readMin = Math.max(1, parseInt(e.target.value, 10) || 1);
              set({ readMinAuto: false, readMin });
            }}
          />
          <span className="hint">min</span>
          {!meta.readMinAuto && (
            <button
              className="link-btn"
              onClick={() => set({ readMinAuto: true, readMin: calcReadMin(bodyContent) })}
            >
              Reset to auto
            </button>
          )}
        </div>
      </div>

      {/* Publish date */}
      <div className="field-group">
        <span className="field-label">
          Publish date
          {!meta.pubDateOverride && (
            <button
              className="link-btn"
              onClick={() =>
                set({
                  pubDateOverride: true,
                  pubDate: meta.pubDate || today(),
                })
              }
            >
              Override
            </button>
          )}
        </span>

        {meta.pubDateOverride ? (
          <div className="pubdate-row">
            <input
              type="date"
              className="meta-input meta-date"
              value={meta.pubDate}
              onChange={(e) => set({ pubDate: e.target.value })}
            />
            <button
              className="link-btn"
              onClick={() => set({ pubDateOverride: false })}
            >
              Remove override
            </button>
          </div>
        ) : (
          <span className="hint">{pubDateHint}</span>
        )}
      </div>

      <div className="meta-divider" />
    </>
  );
}
