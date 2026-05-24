import type { Pane } from '../types';

interface ToolbarProps {
  pane: Pane;
  activeId: string | null;
  activeLabel: string;
  newForLabel: string;
  dirty: boolean;
  preview: boolean;
  onTogglePreview: () => void;
  onSave: () => Promise<void>;
}

export default function Toolbar({
  pane,
  activeId,
  activeLabel,
  newForLabel,
  dirty,
  preview,
  onTogglePreview,
  onSave,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <span className="toolbar-title">
        {pane === 'editor' && activeId && (
          <>
            <span className="coll-badge">{activeLabel} /</span>
            {activeId}.md
          </>
        )}
        {pane === 'new' && newForLabel && (
          <>
            <span className="coll-badge">{newForLabel}</span>
            New entry
          </>
        )}
      </span>

      <button className="btn" onClick={onTogglePreview}>
        {preview ? 'Hide preview' : 'Preview'}
      </button>

      <button
        className={`btn btn-primary${dirty ? ' unsaved' : ''}`}
        onClick={onSave}
        disabled={pane !== 'editor'}
      >
        Save
      </button>
    </div>
  );
}
