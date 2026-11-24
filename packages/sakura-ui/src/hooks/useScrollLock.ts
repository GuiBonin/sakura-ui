import { useEffect } from 'react';

let locks = 0;
let previousOverflow = '';
let previousPadding = '';

/** Trava a rolagem do body enquanto ativo. Suporta vários overlays abertos ao mesmo tempo. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const body = document.body;
    if (locks === 0) {
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      previousOverflow = body.style.overflow;
      previousPadding = body.style.paddingRight;
      body.style.overflow = 'hidden';
      if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    }
    locks += 1;
    return () => {
      locks -= 1;
      if (locks === 0) {
        body.style.overflow = previousOverflow;
        body.style.paddingRight = previousPadding;
      }
    };
  }, [active]);
}
