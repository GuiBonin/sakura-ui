import { useEffect, useRef, type RefObject } from 'react';

/** Chama `handler` em pointerdown fora de todos os elementos das refs. */
export function useClickOutside(
  refs: Array<RefObject<HTMLElement | null>>,
  handler: (event: PointerEvent) => void,
  active = true,
) {
  const handlerRef = useRef(handler);
  const refsRef = useRef(refs);
  useEffect(() => {
    handlerRef.current = handler;
    refsRef.current = refs;
  });

  useEffect(() => {
    if (!active) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      const inside = refsRef.current.some((ref) => ref.current?.contains(target));
      if (!inside) handlerRef.current(event);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [active]);
}
