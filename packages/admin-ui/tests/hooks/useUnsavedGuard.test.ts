// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUnsavedGuard } from '@admin/hooks/useUnsavedGuard';

function fireBeforeUnload(): { defaultPrevented: boolean; returnValue: string } {
  const event = new Event('beforeunload', { cancelable: true }) as BeforeUnloadEvent;
  Object.defineProperty(event, 'returnValue', { writable: true, value: '' });
  window.dispatchEvent(event);
  return { defaultPrevented: event.defaultPrevented, returnValue: event.returnValue };
}

describe('useUnsavedGuard', () => {
  it('does not block navigation when dirty is false', () => {
    renderHook(() => useUnsavedGuard(false));
    const { defaultPrevented } = fireBeforeUnload();
    expect(defaultPrevented).toBe(false);
  });

  it('blocks navigation when dirty is true', () => {
    renderHook(() => useUnsavedGuard(true));
    const { returnValue } = fireBeforeUnload();
    expect(returnValue).toBe('');
  });

  it('reacts to dirty changing from false to true', () => {
    const { rerender } = renderHook(({ dirty }) => useUnsavedGuard(dirty), {
      initialProps: { dirty: false },
    });

    rerender({ dirty: true });
    const { returnValue } = fireBeforeUnload();
    expect(returnValue).toBe('');
  });

  it('reacts to dirty changing from true to false', () => {
    const { rerender } = renderHook(({ dirty }) => useUnsavedGuard(dirty), {
      initialProps: { dirty: true },
    });

    rerender({ dirty: false });
    const { defaultPrevented } = fireBeforeUnload();
    expect(defaultPrevented).toBe(false);
  });

  it('removes the listener on unmount', () => {
    const spy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useUnsavedGuard(true));
    unmount();
    expect(spy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    spy.mockRestore();
  });
});
