import { useCallback, useRef, useState } from 'react';

export interface UseControllableStateOptions<T> {
  value?: T | undefined;
  defaultValue: T;
  onChange?: ((value: T) => void) | undefined;
}

/**
 * Estado que funciona controlado (`value` + `onChange`) ou não controlado
 * (`defaultValue`). `onChange` só dispara quando o valor muda de fato.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  // Atualizados no render para que setValue sempre leia o valor e o callback mais novos.
  const currentRef = useRef(current);
  currentRef.current = current;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      const resolved =
        typeof next === 'function' ? (next as (previous: T) => T)(currentRef.current) : next;
      if (Object.is(resolved, currentRef.current)) return;
      if (!isControlled) setInternal(resolved);
      currentRef.current = resolved;
      onChangeRef.current?.(resolved);
    },
    [isControlled],
  );

  return [current, setValue] as const;
}
