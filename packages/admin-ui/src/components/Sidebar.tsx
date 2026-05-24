import type { CollectionMeta, Entry } from '../types';

interface SidebarProps {
  collections: CollectionMeta[];
  expanded: Record<string, boolean>;
  cachedEntries: Record<string, Entry[]>;
  activeCollection: string | null;
  activeId: string | null;
  onToggleCollection: (key: string) => void;
  onSelectEntry: (collection: string, id: string) => void;
  onNewEntry: (collection: string) => void;
}

interface CollectionItemProps {
  col: CollectionMeta;
  isExpanded: boolean;
  entries: Entry[] | undefined;
  activeCollection: string | null;
  activeId: string | null;
  onToggle: () => void;
  onSelect: (collection: string, id: string) => void;
  onNew: (collection: string) => void;
}

function CollectionItem({
  col,
  isExpanded,
  entries,
  activeCollection,
  activeId,
  onToggle,
  onSelect,
  onNew,
}: CollectionItemProps) {
  return (
    <div>
      <div
        className={`coll-header${isExpanded ? ' open' : ''}`}
        onClick={onToggle}
      >
        <span>{col.label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="new-entry-btn"
            onClick={(e) => { e.stopPropagation(); onNew(col.id); }}
          >
            + New
          </button>
          <span className="chevron">▶</span>
        </span>
      </div>

      {isExpanded && (
        <div className="coll-entries">
          {!entries && (
            <div className="entry-placeholder">Loading…</div>
          )}
          {entries && entries.length === 0 && (
            <div className="entry-placeholder">No entries</div>
          )}
          {entries && entries.map((e) => (
            <button
              key={e.id}
              className={`entry-item${
                activeCollection === col.id && activeId === e.id ? ' active' : ''
              }`}
              title={e.id}
              onClick={() => onSelect(col.id, e.id)}
            >
              {e.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  collections,
  expanded,
  cachedEntries,
  activeCollection,
  activeId,
  onToggleCollection,
  onSelectEntry,
  onNewEntry,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <span className="brand">◆ Content</span>
      </div>
      <div className="coll-list">
        {collections.map((col) => (
          <CollectionItem
            key={col.id}
            col={col}
            isExpanded={expanded[col.id] ?? false}
            entries={cachedEntries[col.id]}
            activeCollection={activeCollection}
            activeId={activeId}
            onToggle={() => onToggleCollection(col.id)}
            onSelect={onSelectEntry}
            onNew={onNewEntry}
          />
        ))}
      </div>
    </aside>
  );
}
