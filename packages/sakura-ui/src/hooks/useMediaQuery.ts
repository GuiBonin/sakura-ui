import { useCallback, useSyncExternalStore } from 'react';

function canMatch() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

/** Acompanha uma media query. No servidor devolve `false`. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!canMatch()) return () => {};
      const list = window.matchMedia(query);
      list.addEventListener('change', notify);
      return () => list.removeEventListener('change', notify);
    },
    [query],
  );
  const getSnapshot = () => (canMatch() ? window.matchMedia(query).matches : false);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** `true` quando o sistema pede menos movimento. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
