import { useState, useEffect } from 'react';
import { api } from '../api';
import type { CollectionMeta } from '../types';

export function useCollections() {
  const [collections, setCollections] = useState<CollectionMeta[]>([]);

  useEffect(() => {
    api.getCollections().then(setCollections).catch(console.error);
  }, []);

  /** Returns the metadata for a collection by id, or undefined if not found. */
  const getCollection = (id: string) => collections.find((c) => c.id === id);

  return { collections, getCollection };
}
