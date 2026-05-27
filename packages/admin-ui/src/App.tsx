import { useCollections } from './hooks/useCollections';
import { useSidebar } from './hooks/useSidebar';
import { useToast } from './hooks/useToast';
import { usePreview } from './hooks/usePreview';
import { useEntryEditor } from './hooks/useEntryEditor';
import { useUnsavedGuard } from './hooks/useUnsavedGuard';
import { useKeyboardSave } from './hooks/useKeyboardSave';

import Sidebar from './components/sidebar/Sidebar';
import Toolbar from './components/Toolbar';
import EditorPane from './components/editor/EditorPane';
import NewEntryForm from './components/ui/NewEntryForm';
import Toast from './components/ui/Toast';

export default function App() {
  const { collections, getCollection } = useCollections();
  const { expanded, cachedEntries, toggleCollection, refreshCollection } = useSidebar();
  const { toast, showToast } = useToast();
  const { preview, previewData, refreshPreview, togglePreview } = usePreview(getCollection);

  const editor = useEntryEditor({
    getCollection,
    showToast,
    refreshPreview,
    refreshCollection,
    isPreviewOpen: preview,
  });

  useUnsavedGuard(editor.dirty);
  useKeyboardSave(editor.save);

  // Human-readable labels derived from collection metadata
  const activeLabel = editor.activeCollection
    ? (getCollection(editor.activeCollection)?.label ?? editor.activeCollection)
    : '';
  const newForLabel = editor.newFor ? (getCollection(editor.newFor)?.label ?? editor.newFor) : '';

  return (
    <div className="app">
      <Sidebar
        collections={collections}
        expanded={expanded}
        cachedEntries={cachedEntries}
        activeCollection={editor.activeCollection}
        activeId={editor.activeId}
        onToggleCollection={toggleCollection}
        onSelectEntry={editor.loadEntry}
        onNewEntry={editor.startNew}
      />

      <div className="workspace">
        {editor.pane !== 'empty' && (
          <Toolbar
            pane={editor.pane}
            activeId={editor.activeId}
            activeLabel={activeLabel}
            newForLabel={newForLabel}
            dirty={editor.dirty}
            preview={preview}
            onTogglePreview={() => togglePreview(editor.activeCollection, editor.activeId)}
            onSave={editor.save}
          />
        )}

        {editor.pane === 'empty' && (
          <div className="empty-state">Select an entry or create a new one</div>
        )}

        {editor.pane === 'new' && editor.newFor && (
          <NewEntryForm
            label={newForLabel}
            onCancel={editor.clearActive}
            onCreate={editor.createEntry}
          />
        )}

        {editor.pane === 'editor' && (
          <EditorPane
            activeCollection={editor.activeCollection}
            activeId={editor.activeId}
            fmContent={editor.fmContent}
            bodyContent={editor.bodyContent}
            writingMeta={editor.writingMeta}
            availableTags={editor.availableTags}
            preview={preview}
            previewData={previewData}
            onFmChange={editor.onFmChange}
            onBodyChange={editor.onBodyChange}
            onWritingMetaChange={editor.onWritingMetaChange}
          />
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
