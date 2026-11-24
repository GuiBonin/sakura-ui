import { useEffect, type RefObject } from 'react';
import { getFocusable } from '../utils/focus';

export interface UseFocusTrapOptions {
  /** Elemento que recebe foco ao ativar. Padrão: primeiro focável ou o próprio container. */
  initialFocus?: RefObject<HTMLElement | null> | undefined;
  /** Devolve o foco para quem tinha antes de ativar. Padrão: `true`. */
  restoreFocus?: boolean | undefined;
}

/** Mantém o foco do Tab dentro do container enquanto `active` for verdadeiro. */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  { initialFocus, restoreFocus = true }: UseFocusTrapOptions = {},
) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const target = initialFocus?.current ?? getFocusable(container)[0] ?? container;
    target.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = getFocusable(container);
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const current = document.activeElement;
      if (event.shiftKey && (current === first || !container.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !container.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (restoreFocus && previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [active, containerRef, initialFocus, restoreFocus]);
}
