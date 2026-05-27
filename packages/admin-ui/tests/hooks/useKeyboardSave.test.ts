// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardSave } from '@admin/hooks/useKeyboardSave';

function fireKeydown(key: string, modifiers: { metaKey?: boolean; ctrlKey?: boolean } = {}) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...modifiers }));
}

describe('useKeyboardSave', () => {
  it('calls the handler on ⌘S', () => {
    const save = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useKeyboardSave(save));

    fireKeydown('s', { metaKey: true });

    expect(save).toHaveBeenCalledOnce();
  });

  it('calls the handler on Ctrl+S', () => {
    const save = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useKeyboardSave(save));

    fireKeydown('s', { ctrlKey: true });

    expect(save).toHaveBeenCalledOnce();
  });

  it('does not call the handler for other keys', () => {
    const save = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useKeyboardSave(save));

    fireKeydown('a', { metaKey: true });
    fireKeydown('s');

    expect(save).not.toHaveBeenCalled();
  });

  it('always calls the latest handler reference', () => {
    const first = vi.fn().mockResolvedValue(undefined);
    const second = vi.fn().mockResolvedValue(undefined);

    const { rerender } = renderHook(({ fn }) => useKeyboardSave(fn), {
      initialProps: { fn: first },
    });

    rerender({ fn: second });
    fireKeydown('s', { metaKey: true });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it('removes the listener on unmount', () => {
    const spy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useKeyboardSave(vi.fn().mockResolvedValue(undefined)));
    unmount();
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function));
    spy.mockRestore();
  });
});
