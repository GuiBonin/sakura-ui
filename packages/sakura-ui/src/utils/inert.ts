import { version } from 'react';

const isReact19 = Number.parseInt(version, 10) >= 19;

/**
 * Props para o atributo `inert`. O React 19 aceita booleano; o 18 só repassa
 * o atributo quando recebe string (vazia = ativo).
 */
export function inertProps(active: boolean): { inert?: boolean } {
  if (!active) return {};
  return isReact19 ? { inert: true } : ({ inert: '' } as unknown as { inert: boolean });
}
