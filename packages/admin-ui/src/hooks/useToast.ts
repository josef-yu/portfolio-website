import { useState, useRef } from 'react';
import type { ToastState } from '@admin/types';

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  function showToast(msg: string, type: 'ok' | 'err' | '' = '') {
    setToast({ msg, type });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 2600);
  }

  return { toast, showToast };
}
