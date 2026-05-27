import { useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { api } from '@admin/api';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Props {
  /** Initial markdown content (only read on mount; use key= to reset). */
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  /** Collection and entry id — required to compute the upload destination folder. */
  collection: string;
  entryId: string;
}

// Infer the editor instance type from the hook to avoid @tiptap/core imports.
type EditorInstance = NonNullable<ReturnType<typeof useEditor>>;

// ── Upload helper ──────────────────────────────────────────────────────────────

/** Reads a File as a base64 string (no data-URI prefix). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip "data:<mime>;base64," prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Uploads an image file and returns its public URL, or null on failure. */
async function uploadImage(
  file: File,
  collection: string,
  entryId: string,
): Promise<string | null> {
  if (!file.type.startsWith('image/')) return null;
  try {
    const data = await fileToBase64(file);
    const result = await api.uploadMedia(collection, entryId, file.name, data);
    return result.url ?? null;
  } catch {
    return null;
  }
}

/** Inserts an uploaded image into the editor at the current cursor position. */
async function insertUploadedImage(
  file: File,
  editor: EditorInstance,
  collection: string,
  entryId: string,
) {
  const url = await uploadImage(file, collection, entryId);
  if (url) {
    editor
      .chain()
      .focus()
      .setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, '') })
      .run();
  }
}

// ── Toolbar definition ─────────────────────────────────────────────────────────

type Sep = { kind: 'sep' };
type Btn = {
  kind: 'btn';
  label: string;
  title: string;
  action: (e: EditorInstance) => void;
  isActive?: (e: EditorInstance) => boolean;
};
type Item = Sep | Btn;

function buildToolbar(): Item[] {
  return [
    // Block type
    {
      kind: 'btn',
      label: 'P',
      title: 'Paragraph',
      action: (e) => e.chain().focus().setParagraph().run(),
      isActive: (e) => e.isActive('paragraph'),
    },
    {
      kind: 'btn',
      label: 'H1',
      title: 'Heading 1',
      action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: (e) => e.isActive('heading', { level: 1 }),
    },
    {
      kind: 'btn',
      label: 'H2',
      title: 'Heading 2',
      action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: (e) => e.isActive('heading', { level: 2 }),
    },
    {
      kind: 'btn',
      label: 'H3',
      title: 'Heading 3',
      action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: (e) => e.isActive('heading', { level: 3 }),
    },
    { kind: 'sep' },
    // Inline marks
    {
      kind: 'btn',
      label: 'B',
      title: 'Bold',
      action: (e) => e.chain().focus().toggleBold().run(),
      isActive: (e) => e.isActive('bold'),
    },
    {
      kind: 'btn',
      label: 'I',
      title: 'Italic',
      action: (e) => e.chain().focus().toggleItalic().run(),
      isActive: (e) => e.isActive('italic'),
    },
    {
      kind: 'btn',
      label: 'S̶',
      title: 'Strikethrough',
      action: (e) => e.chain().focus().toggleStrike().run(),
      isActive: (e) => e.isActive('strike'),
    },
    {
      kind: 'btn',
      label: '`',
      title: 'Inline code',
      action: (e) => e.chain().focus().toggleCode().run(),
      isActive: (e) => e.isActive('code'),
    },
    { kind: 'sep' },
    // Lists
    {
      kind: 'btn',
      label: '• list',
      title: 'Bullet list',
      action: (e) => e.chain().focus().toggleBulletList().run(),
      isActive: (e) => e.isActive('bulletList'),
    },
    {
      kind: 'btn',
      label: '1. list',
      title: 'Ordered list',
      action: (e) => e.chain().focus().toggleOrderedList().run(),
      isActive: (e) => e.isActive('orderedList'),
    },
    { kind: 'sep' },
    // Block elements
    {
      kind: 'btn',
      label: '❝',
      title: 'Blockquote',
      action: (e) => e.chain().focus().toggleBlockquote().run(),
      isActive: (e) => e.isActive('blockquote'),
    },
    {
      kind: 'btn',
      label: '</>',
      title: 'Code block',
      action: (e) => e.chain().focus().toggleCodeBlock().run(),
      isActive: (e) => e.isActive('codeBlock'),
    },
    { kind: 'sep' },
    {
      kind: 'btn',
      label: '——',
      title: 'Horizontal rule',
      action: (e) => e.chain().focus().setHorizontalRule().run(),
    },
    {
      kind: 'btn',
      label: 'Link',
      title: 'Add / remove link',
      action: (e) => {
        if (e.isActive('link')) {
          e.chain().focus().unsetLink().run();
        } else {
          const url = window.prompt('URL');
          if (url) e.chain().focus().setLink({ href: url }).run();
        }
      },
      isActive: (e) => e.isActive('link'),
    },
  ];
}

const TOOLBAR = buildToolbar();

// ── Fixed toolbar component ────────────────────────────────────────────────────

interface ToolbarProps {
  editor: EditorInstance;
  onImageUploadClick: () => void;
}

function EditorToolbar({ editor, onImageUploadClick }: ToolbarProps) {
  return (
    <div className="md-toolbar">
      {TOOLBAR.map((item, i) => {
        if (item.kind === 'sep') return <span key={i} className="md-sep" aria-hidden />;
        const active = item.isActive?.(editor) ?? false;
        return (
          <button
            key={i}
            className={`md-btn${active ? ' active' : ''}`}
            title={item.title}
            onMouseDown={(e) => {
              e.preventDefault();
              item.action(editor);
            }}
          >
            {item.label}
          </button>
        );
      })}

      {/* Image upload — separated from the regular TOOLBAR array so it can
          trigger the hidden file input directly */}
      <span className="md-sep" aria-hidden />
      <button
        className="md-btn"
        title="Insert image"
        onMouseDown={(e) => {
          e.preventDefault();
          onImageUploadClick();
        }}
      >
        Image
      </button>
    </div>
  );
}

// ── Bubble menu contents ───────────────────────────────────────────────────────

function BubbleMenuContents({ editor }: { editor: EditorInstance }) {
  const toggleLink = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
    } else {
      const url = window.prompt('URL');
      if (url) editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const buttons = [
    {
      label: 'B',
      title: 'Bold',
      toggle: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive('bold'),
    },
    {
      label: 'I',
      title: 'Italic',
      toggle: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive('italic'),
    },
    {
      label: 'S̶',
      title: 'Strike',
      toggle: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive('strike'),
    },
    {
      label: '`',
      title: 'Code',
      toggle: () => editor.chain().focus().toggleCode().run(),
      active: editor.isActive('code'),
    },
  ];

  return (
    <div className="md-bubble">
      {buttons.map(({ label, title, toggle, active }) => (
        <button
          key={label}
          className={`md-btn${active ? ' active' : ''}`}
          title={title}
          onMouseDown={(e) => {
            e.preventDefault();
            toggle();
          }}
        >
          {label}
        </button>
      ))}
      <span className="md-sep" aria-hidden />
      <button
        className={`md-btn${editor.isActive('link') ? ' active' : ''}`}
        title="Link"
        onMouseDown={(e) => {
          e.preventDefault();
          toggleLink();
        }}
      >
        Link
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write something…',
  collection,
  entryId,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // @tiptap/markdown may fire onUpdate during content initialisation before the
  // user has touched the editor. We suppress those early firings via a ref that
  // is only set to true by a useEffect — which React guarantees runs after all
  // of the editor's own setup effects, so any init transactions are already done.
  const isReadyRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Markdown.configure(),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      Image.configure({ allowBase64: false }),
    ],
    // Tell @tiptap/markdown to parse `content` as markdown, not HTML/JSON.
    contentType: 'markdown',
    content: value,
    onUpdate({ editor }) {
      if (!isReadyRef.current) return;
      onChange(editor.getMarkdown());
    },
    editorProps: {
      // Intercept image paste events and upload them instead of embedding inline.
      handlePaste(_, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file && editor) {
              insertUploadedImage(file, editor, collection, entryId);
              return true; // swallow default paste
            }
          }
        }
        return false;
      },
      // Intercept image drop events.
      handleDrop(_, event, __, moved) {
        if (moved) return false;
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        for (const file of Array.from(files)) {
          if (file.type.startsWith('image/') && editor) {
            insertUploadedImage(file, editor, collection, entryId);
            return true;
          }
        }
        return false;
      },
    },
  });

  // Arm the guard once the editor instance is available.
  // useEffect is guaranteed to run after useEditor's own setup effects, so any
  // init-time onUpdate calls have already been suppressed by isReadyRef = false.
  useEffect(() => {
    if (!editor) return;
    isReadyRef.current = true;
  }, [editor]);

  if (!editor) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so the same file can be re-selected after a failed upload
    e.target.value = '';
    if (!file) return;
    await insertUploadedImage(file, editor, collection, entryId);
  };

  return (
    <div className="md-editor">
      {/* Hidden file picker — opened by the toolbar "Image" button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <EditorToolbar editor={editor} onImageUploadClick={() => fileInputRef.current?.click()} />

      <BubbleMenu editor={editor}>
        <BubbleMenuContents editor={editor} />
      </BubbleMenu>

      <EditorContent editor={editor} className="md-content" />
    </div>
  );
}
