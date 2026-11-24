import { useEffect, useRef } from 'react';

export interface UseEscapeOptions {
  /**
   * Ouve na fase de captura, antes dos outros ouvintes. Use em camadas que
   * devem fechar primeiro (como um tooltip dentro de um modal) e chame
   * `event.preventDefault()` no handler para consumir o Esc.
   */
  capture?: boolean;
}

/**
 * Chama `handler` quando Esc é pressionado, enquanto `active` for verdadeiro.
 * Ignora o Esc já consumido por outro componente (`event.defaultPrevented`),
 * então uma lista aberta dentro de um modal fecha sem fechar o modal junto.
 */
export function useEscape(
  handler: (event: KeyboardEvent) => void,
  active = true,
  { capture = false }: UseEscapeOptions = {},
) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) handlerRef.current(event);
    };
    document.addEventListener('keydown', onKeyDown, capture);
    return () => document.removeEventListener('keydown', onKeyDown, capture);
  }, [active, capture]);
}
