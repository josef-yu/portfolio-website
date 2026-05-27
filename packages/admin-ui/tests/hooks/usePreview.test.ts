// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePreview } from '@admin/hooks/usePreview';
import type { CollectionMeta } from '@admin/types';

const FIXED_TIME = 1_000_000;

const collections: Record<string, CollectionMeta> = {
  writing: { id: 'writing', label: 'Writing', urlBase: '/writing/', template: '' },
  projects: { id: 'projects', label: 'Projects', urlBase: '/projects/', template: '' },
};

const getCollection = (id: string) => collections[id];

beforeEach(() => vi.setSystemTime(FIXED_TIME));
afterEach(() => vi.useRealTimers());

describe('usePreview — initial state', () => {
  it('starts with preview hidden and no data', () => {
    const { result } = renderHook(() => usePreview(getCollection));
    expect(result.current.preview).toBe(false);
    expect(result.current.previewData).toBeNull();
  });
});

describe('usePreview — togglePreview', () => {
  it('opens preview and builds writing PreviewData', () => {
    const { result } = renderHook(() => usePreview(getCollection));

    act(() => result.current.togglePreview('writing', 'my-post'));

    expect(result.current.preview).toBe(true);
    expect(result.current.previewData).toEqual({
      kind: 'writing',
      postSrc: `/writing/my-post?_t=${FIXED_TIME}`,
      listSrc: `/writing/?_t=${FIXED_TIME}`,
    });
  });

  it('opens preview and builds generic PreviewData for non-writing collections', () => {
    const { result } = renderHook(() => usePreview(getCollection));

    act(() => result.current.togglePreview('projects', 'my-project'));

    expect(result.current.preview).toBe(true);
    expect(result.current.previewData).toEqual({
      kind: 'generic',
      src: `/projects/my-project?_t=${FIXED_TIME}`,
    });
  });

  it('closes preview and clears data on second toggle', () => {
    const { result } = renderHook(() => usePreview(getCollection));

    act(() => result.current.togglePreview('writing', 'my-post'));
    act(() => result.current.togglePreview('writing', 'my-post'));

    expect(result.current.preview).toBe(false);
    expect(result.current.previewData).toBeNull();
  });

  it('does not open when collection is unknown', () => {
    const { result } = renderHook(() => usePreview(getCollection));

    act(() => result.current.togglePreview('unknown', 'some-id'));

    expect(result.current.preview).toBe(true); // preview flag flips…
    expect(result.current.previewData).toBeNull(); // …but data stays null
  });

  it('does not produce data when collection or id is null', () => {
    const { result } = renderHook(() => usePreview(getCollection));

    act(() => result.current.togglePreview(null, null));

    expect(result.current.previewData).toBeNull();
  });
});

describe('usePreview — refreshPreview', () => {
  it('updates previewData with a new timestamp', () => {
    const { result } = renderHook(() => usePreview(getCollection));
    act(() => result.current.togglePreview('writing', 'my-post'));

    vi.setSystemTime(FIXED_TIME + 500);
    act(() => result.current.refreshPreview('writing', 'my-post'));

    expect(result.current.previewData).toMatchObject({
      postSrc: `/writing/my-post?_t=${FIXED_TIME + 500}`,
    });
  });

  it('can switch to a different entry', () => {
    const { result } = renderHook(() => usePreview(getCollection));
    act(() => result.current.togglePreview('writing', 'post-one'));

    act(() => result.current.refreshPreview('writing', 'post-two'));

    expect(result.current.previewData).toMatchObject({
      postSrc: `/writing/post-two?_t=${FIXED_TIME}`,
    });
  });
});
