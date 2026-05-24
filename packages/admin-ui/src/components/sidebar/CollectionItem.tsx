import type { CollectionMeta, Entry } from '../../types';

interface CollectionItemProps {
  col: CollectionMeta;
  isExpanded: boolean;
  entries: Entry[] | undefined;
  activeCollection: string | null;
  activeId: string | null;
  onToggle: () => void;
  onSelectEntry: (collection: string, id: string) => void;
  onNewEntry: (collection: string) => void;
}

export default function CollectionItem({
  col,
  isExpanded,
  entries,
  activeCollection,
  activeId,
  onToggle,
  onSelectEntry,
  onNewEntry,
}: CollectionItemProps) {
  return (
    <div>
      <div className={`coll-header${isExpanded ? ' open' : ''}`} onClick={onToggle}>
        <span>{col.label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="new-entry-btn"
            onClick={(e) => {
              e.stopPropagation();
              onNewEntry(col.id);
            }}
          >
            + New
          </button>
          <span className="chevron">▶</span>
        </span>
      </div>

      {isExpanded && (
        <div className="coll-entries">
          {!entries && <div className="entry-placeholder">Loading…</div>}
          {entries?.length === 0 && <div className="entry-placeholder">No entries</div>}
          {entries?.map((entry) => (
            <button
              key={entry.id}
              className={`entry-item${
                activeCollection === col.id && activeId === entry.id ? ' active' : ''
              }`}
              title={entry.id}
              onClick={() => onSelectEntry(col.id, entry.id)}
            >
              {entry.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
