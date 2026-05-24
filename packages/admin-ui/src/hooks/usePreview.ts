import { useState } from 'react';
import type { CollectionMeta } from '../types';

export function usePreview(getCollection: (id: string) => CollectionMeta | undefined) {
  const [preview, setPreview] = useState(false);
  const [previewSrc, setPreviewSrc] = useState('about:blank');

  function refreshPreview(collection: string, id: string) {
    const col = getCollection(collection);
    if (col) setPreviewSrc(`${col.urlBase}${id}?_t=${Date.now()}`);
  }

  function togglePreview(activeCollection: string | null, activeId: string | null) {
    const next = !preview;
    setPreview(next);
    if (next && activeCollection && activeId) {
      refreshPreview(activeCollection, activeId);
    } else if (!next) {
      setPreviewSrc('about:blank');
    }
  }

  return { preview, previewSrc, refreshPreview, togglePreview };
}
