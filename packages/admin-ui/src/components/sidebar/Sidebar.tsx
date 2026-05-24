import type { CollectionMeta, Entry } from '../../types';
import CollectionItem from './CollectionItem';

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
            onSelectEntry={onSelectEntry}
            onNewEntry={onNewEntry}
          />
        ))}
      </div>
    </aside>
  );
}
