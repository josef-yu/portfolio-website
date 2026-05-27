// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '@admin/hooks/useToast';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useToast', () => {
  it('starts with no toast', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toast).toBeNull();
  });

  it('shows a toast with the correct message and default type', () => {
    const { result } = renderHook(() => useToast());

    act(() => result.current.showToast('Saved'));

    expect(result.current.toast).toEqual({ msg: 'Saved', type: '' });
  });

  it('shows a toast with an explicit type', () => {
    const { result } = renderHook(() => useToast());

    act(() => result.current.showToast('Save failed', 'err'));

    expect(result.current.toast).toEqual({ msg: 'Save failed', type: 'err' });
  });

  it('clears the toast after 2600 ms', () => {
    const { result } = renderHook(() => useToast());

    act(() => result.current.showToast('Hello'));
    act(() => vi.advanceTimersByTime(2600));

    expect(result.current.toast).toBeNull();
  });

  it('does not clear before 2600 ms', () => {
    const { result } = renderHook(() => useToast());

    act(() => result.current.showToast('Hello'));
    act(() => vi.advanceTimersByTime(2599));

    expect(result.current.toast).not.toBeNull();
  });

  it('resets the timer when showToast is called again', () => {
    const { result } = renderHook(() => useToast());

    act(() => result.current.showToast('First'));
    act(() => vi.advanceTimersByTime(2000));
    act(() => result.current.showToast('Second')); // resets timer
    act(() => vi.advanceTimersByTime(2000)); // only 2000ms since reset

    expect(result.current.toast).toEqual({ msg: 'Second', type: '' });

    act(() => vi.advanceTimersByTime(600)); // now 2600ms since reset
    expect(result.current.toast).toBeNull();
  });
});
