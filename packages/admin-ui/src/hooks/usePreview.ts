import { useState } from 'react';
import type { CollectionMeta } from '@admin/types';

type PreviewTarget = {
  collectionId: string;
  entryId: string;
  t: number;
} | null;

export type WritingPreviewData = {
  kind: 'writing';
  postSrc: string;
  listSrc: string;
};

export type GenericPreviewData = {
  kind: 'generic';
  src: string;
};

export type PreviewData = WritingPreviewData | GenericPreviewData;

function buildPreviewData(target: NonNullable<PreviewTarget>, col: CollectionMeta): PreviewData {
  const base = `${col.urlBase}${target.entryId}?_t=${target.t}`;
  if (target.collectionId === 'writing') {
    return { kind: 'writing', postSrc: base, listSrc: `${col.urlBase}?_t=${target.t}` };
  }
  return { kind: 'generic', src: base };
}

export function usePreview(getCollection: (id: string) => CollectionMeta | undefined) {
  const [preview, setPreview] = useState(false);
  const [target, setTarget] = useState<PreviewTarget>(null);

  const col = target ? getCollection(target.collectionId) : undefined;
  const previewData: PreviewData | null = col ? buildPreviewData(target!, col) : null;

  function refreshPreview(collectionId: string, entryId: string) {
    setTarget({ collectionId, entryId, t: Date.now() });
  }

  function togglePreview(activeCollection: string | null, activeId: string | null) {
    const next = !preview;
    setPreview(next);
    if (next && activeCollection && activeId) {
      setTarget({ collectionId: activeCollection, entryId: activeId, t: Date.now() });
    } else if (!next) {
      setTarget(null);
    }
  }

  return { preview, previewData, refreshPreview, togglePreview };
}
