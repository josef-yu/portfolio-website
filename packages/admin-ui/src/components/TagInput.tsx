import { useState, useRef, useEffect, useMemo } from 'react';

interface TagInputProps {
  tags: string[];
  availableTags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, availableTags, onChange }: TagInputProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocusIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filtered suggestions: existing tags that match the query, minus already-selected
  const suggestions = useMemo(
    () =>
      availableTags
        .filter(
          (t) =>
            !tags.includes(t) &&
            (!query || t.toLowerCase().startsWith(query.toLowerCase())),
        )
        .slice(0, 8),
    [availableTags, tags, query],
  );

  const trimmed = query.trim();
  const showCreate =
    trimmed.length > 0 &&
    !suggestions.some((t) => t.toLowerCase() === trimmed.toLowerCase()) &&
    !tags.includes(trimmed);

  // All items in the dropdown (suggestions + optional "Create" entry)
  const items: string[] = [...suggestions, ...(showCreate ? [trimmed] : [])];

  function addTag(tag: string) {
    tag = tag.trim();
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setQuery('');
    setFocusIdx(-1);
    setOpen(false);
    inputRef.current?.focus();
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusIdx((i) => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusIdx((i) => Math.max(i - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusIdx >= 0 && items[focusIdx]) {
          addTag(items[focusIdx]);
        } else if (trimmed) {
          addTag(trimmed);
        }
        break;
      case 'Backspace':
        if (!query && tags.length) removeTag(tags[tags.length - 1]);
        break;
      case 'Escape':
        setOpen(false);
        setFocusIdx(-1);
        break;
    }
  }

  return (
    <div ref={containerRef}>
      {/* Tag chips + text input */}
      <div className="tag-input-box" onClick={() => inputRef.current?.focus()}>
        {tags.map((t) => (
          <span key={t} className="tag-chip">
            {t}
            <button
              type="button"
              aria-label={`Remove ${t}`}
              onClick={() => removeTag(t)}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={tags.length === 0 ? 'Add tag…' : ''}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            setQuery(e.target.value);
            setFocusIdx(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Suggestions dropdown */}
      {open && items.length > 0 && (
        <div className="tag-dropdown">
          {suggestions.map((t, i) => (
            <button
              key={t}
              className={focusIdx === i ? 'focused' : undefined}
              // mousedown fires before blur, so we don't lose focus before addTag
              onMouseDown={(e) => { e.preventDefault(); addTag(t); }}
            >
              {t}
            </button>
          ))}
          {showCreate && (
            <button
              className={`tag-new${focusIdx === suggestions.length ? ' focused' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); addTag(trimmed); }}
            >
              Create "<strong>{trimmed}</strong>"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
