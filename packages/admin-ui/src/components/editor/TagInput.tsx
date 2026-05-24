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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setFocusIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Suggestions: prefix-match against available tags, excluding already-selected
  const suggestions = useMemo(
    () =>
      availableTags
        .filter(
          (t) => !tags.includes(t) && (!query || t.toLowerCase().startsWith(query.toLowerCase())),
        )
        .slice(0, 8),
    [availableTags, tags, query],
  );

  const trimmed = query.trim();
  const showCreate =
    trimmed.length > 0 &&
    !suggestions.some((t) => t.toLowerCase() === trimmed.toLowerCase()) &&
    !tags.includes(trimmed);

  const dropdownItems: string[] = [...suggestions, ...(showCreate ? [trimmed] : [])];

  function addTag(tag: string) {
    const clean = tag.trim();
    if (!clean || tags.includes(clean)) return;
    onChange([...tags, clean]);
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
        setFocusIdx((i) => Math.min(i + 1, dropdownItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusIdx((i) => Math.max(i - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusIdx >= 0 && dropdownItems[focusIdx]) {
          addTag(dropdownItems[focusIdx]);
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
      {/* Chip strip + text input */}
      <div className="tag-input-box" onClick={() => inputRef.current?.focus()}>
        {tags.map((t) => (
          <span key={t} className="tag-chip">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => removeTag(t)}>
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
      {open && dropdownItems.length > 0 && (
        <div className="tag-dropdown">
          {suggestions.map((t, i) => (
            <button
              key={t}
              className={focusIdx === i ? 'focused' : undefined}
              // mousedown fires before blur — prevents input losing focus before click registers
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(t);
              }}
            >
              {t}
            </button>
          ))}
          {showCreate && (
            <button
              className={`tag-new${focusIdx === suggestions.length ? ' focused' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(trimmed);
              }}
            >
              Create "<strong>{trimmed}</strong>"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
