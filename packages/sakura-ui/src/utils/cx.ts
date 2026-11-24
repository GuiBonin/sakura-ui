export type ClassValue = string | number | false | null | undefined;

/** Junta classes ignorando valores falsos. */
export function cx(...values: ClassValue[]): string {
  // Descarta qualquer valor falso, inclusive 0 vindo de `contagem && 'classe'`.
  return values.filter(Boolean).join(' ');
}
