import { useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children: ReactNode;
  /** Elemento que recebe o conteúdo. Padrão: `document.body`. */
  container?: Element | null;
}

const noopSubscribe = () => () => {};

/** Renderiza fora da árvore atual. No servidor não renderiza nada, então é seguro em SSR. */
export function Portal({ children, container }: PortalProps) {
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!isClient) return null;
  return createPortal(children, container ?? document.body);
}
