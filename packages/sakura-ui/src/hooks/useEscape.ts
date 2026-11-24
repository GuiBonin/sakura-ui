import { useEffect, useRef } from 'react';

/** Chama `handler` quando Esc é pressionado, enquanto `active` for verdadeiro. */
export function useEscape(handler: (event: KeyboardEvent) => void, active = true) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handlerRef.current(event);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active]);
}
