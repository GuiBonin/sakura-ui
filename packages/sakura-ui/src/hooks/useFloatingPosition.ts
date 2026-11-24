import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';
import {
  computePosition,
  parsePlacement,
  type Placement,
  type PositionResult,
} from '../utils/position';

/**
 * Posiciona um elemento flutuante (`position: fixed`) junto ao gatilho e
 * recalcula em scroll e resize enquanto estiver aberto.
 */
export function useFloatingPosition(
  triggerRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  open: boolean,
  placement: Placement,
  offset = 8,
) {
  const [side, align] = parsePlacement(placement);
  const [position, setPosition] = useState<PositionResult>({ top: 0, left: 0, side, align });

  const update = useCallback(() => {
    const trigger = triggerRef.current;
    const floating = floatingRef.current;
    if (!trigger || !floating) return;
    const t = trigger.getBoundingClientRect();
    const f = floating.getBoundingClientRect();
    setPosition(
      computePosition(
        { top: t.top, left: t.left, width: t.width, height: t.height },
        { top: 0, left: 0, width: f.width, height: f.height },
        { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight },
        { placement, offset },
      ),
    );
  }, [triggerRef, floatingRef, placement, offset]);

  useLayoutEffect(() => {
    if (!open) return;
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, update]);

  return { position, update };
}
