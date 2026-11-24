import { vi } from 'vitest';

/**
 * Timers falsos só para setTimeout/setInterval/Date. requestAnimationFrame e
 * performance ficam reais: o Framer Motion agenda os frames com eles, e um
 * frame preso num timer falso deixa o AnimatePresence travado para o resto do arquivo.
 */
export function useComponentFakeTimers(options: { shouldAdvanceTime?: boolean } = {}) {
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
    ...options,
  });
}
