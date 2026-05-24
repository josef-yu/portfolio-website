import type { WritingMetaState } from '../../types';
import WritingMeta from './WritingMeta';

interface EditorPaneProps {
  activeCollection: string | null;
  fmContent: string;
  bodyContent: string;
  writingMeta: WritingMetaState;
  availableTags: string[];
  preview: boolean;
  previewSrc: string;
  onFmChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onWritingMetaChange: (meta: WritingMetaState) => void;
}

/**
 * Inserts two spaces at the cursor when Tab is pressed.
 * Uses requestAnimationFrame to restore the cursor position after React re-renders.
 */
function handleTabKey(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  onChange: (value: string) => void,
) {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  const el = e.currentTarget;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  onChange(el.value.slice(0, start) + '  ' + el.value.slice(end));
  requestAnimationFrame(() => {
    el.selectionStart = el.selectionEnd = start + 2;
  });
}

export default function EditorPane({
  activeCollection,
  fmContent,
  bodyContent,
  writingMeta,
  availableTags,
  preview,
  previewSrc,
  onFmChange,
  onBodyChange,
  onWritingMetaChange,
}: EditorPaneProps) {
  return (
    <div className="editor-body">
      <div className="editor-main">
        {/* Writing collection: structured metadata panel */}
        {activeCollection === 'writing' ? (
          <WritingMeta
            meta={writingMeta}
            bodyContent={bodyContent}
            availableTags={availableTags}
            onMetaChange={onWritingMetaChange}
          />
        ) : (
          /* All other collections: raw YAML frontmatter textarea */
          <div className="field-group">
            <span className="field-label">Frontmatter</span>
            <textarea
              className="code-area"
              value={fmContent}
              spellCheck={false}
              onChange={(e) => onFmChange(e.target.value)}
              onKeyDown={(e) => handleTabKey(e, onFmChange)}
            />
          </div>
        )}

        <div className="field-group">
          <span className="field-label">Body</span>
          <textarea
            className="text-area"
            value={bodyContent}
            spellCheck={false}
            onChange={(e) => onBodyChange(e.target.value)}
            onKeyDown={(e) => handleTabKey(e, onBodyChange)}
          />
        </div>
      </div>

      {preview && (
        <div className="preview-panel">
          <div className="preview-label">Preview</div>
          <iframe src={previewSrc} title="Entry preview" />
        </div>
      )}
    </div>
  );
}
