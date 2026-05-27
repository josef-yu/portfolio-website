import type { WritingMetaState } from '@admin/types';
import WritingMeta from './WritingMeta';

interface MetaProps {
  activeCollection: string | null;
  fmContent: string;
  bodyContent: string;
  writingMeta: WritingMetaState;
  availableTags: string[];
  onFmChange: (value: string) => void;
  onWritingMetaChange: (meta: WritingMetaState) => void;
}

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

export default function Meta({
  activeCollection,
  fmContent,
  bodyContent,
  writingMeta,
  availableTags,
  onFmChange,
  onWritingMetaChange,
}: MetaProps) {
  if (activeCollection === 'writing') {
    return (
      <WritingMeta
        meta={writingMeta}
        bodyContent={bodyContent}
        availableTags={availableTags}
        onMetaChange={onWritingMetaChange}
      />
    );
  }

  return (
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
  );
}
