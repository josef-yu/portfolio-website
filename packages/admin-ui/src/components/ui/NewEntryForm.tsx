import { useState, useRef, useEffect } from 'react';
import { slugify } from '@admin/utils/text';

interface NewEntryFormProps {
  label: string;
  onCancel: () => void;
  onCreate: (id: string) => Promise<void>;
}

export default function NewEntryForm({ label, onCancel, onCreate }: NewEntryFormProps) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const slug = slugify(value);

  async function handleCreate() {
    if (!slug) return;
    setLoading(true);
    try {
      await onCreate(slug);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="new-form-wrap">
      <div className="new-form">
        <h2>New {label.toLowerCase()} entry</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="new-id-input" className="new-form-label">
            Filename (slug)
          </label>
          <input
            id="new-id-input"
            ref={inputRef}
            type="text"
            placeholder="my-entry-slug"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />
          <span className="hint">Lowercase, hyphens only. Becomes the URL slug.</span>
        </div>

        <div className="new-form-actions">
          <button className="btn btn-primary" onClick={handleCreate} disabled={!slug || loading}>
            {loading ? 'Creating…' : 'Create'}
          </button>
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
