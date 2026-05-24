import { useEffect, useRef } from 'react';

/**
 * Binds ⌘S / Ctrl+S to the provided save handler.
 * Uses a ref so the handler is always up-to-date without re-registering the listener.
 */
export function useKeyboardSave(handleSave: () => Promise<void>) {
  const saveRef = useRef(handleSave);
  saveRef.current = handleSave;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveRef.current();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
}
