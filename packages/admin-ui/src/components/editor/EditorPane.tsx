import type { WritingMetaState } from '@admin/types';
import type { PreviewData } from '@admin/hooks/usePreview';
import Meta from './Meta';
import MarkdownEditor from './MarkdownEditor';
import Preview from './Preview';

interface EditorPaneProps {
  activeCollection: string | null;
  activeId: string | null;
  fmContent: string;
  bodyContent: string;
  writingMeta: WritingMetaState;
  availableTags: string[];
  preview: boolean;
  previewData: PreviewData | null;
  onFmChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onWritingMetaChange: (meta: WritingMetaState) => void;
}

export default function EditorPane({
  activeCollection,
  activeId,
  fmContent,
  bodyContent,
  writingMeta,
  availableTags,
  preview,
  previewData,
  onFmChange,
  onBodyChange,
  onWritingMetaChange,
}: EditorPaneProps) {
  return (
    <div className="editor-body">
      <div className="editor-main">
        <Meta
          activeCollection={activeCollection}
          fmContent={fmContent}
          bodyContent={bodyContent}
          writingMeta={writingMeta}
          availableTags={availableTags}
          onFmChange={onFmChange}
          onWritingMetaChange={onWritingMetaChange}
        />

        <div className="field-group field-body">
          <span className="field-label">Body</span>
          {/*
           * key={activeId} forces a full remount when switching entries,
           * which resets TipTap's internal state cleanly without imperative setContent calls.
           */}
          <MarkdownEditor
            key={activeId ?? '__new__'}
            value={bodyContent}
            onChange={onBodyChange}
            placeholder="Start writing…"
            collection={activeCollection ?? ''}
            entryId={activeId ?? ''}
          />
        </div>
      </div>

      {preview && <Preview previewData={previewData} activeId={activeId} />}
    </div>
  );
}
