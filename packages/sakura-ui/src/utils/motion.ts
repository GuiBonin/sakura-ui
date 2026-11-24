import type { Transition } from 'framer-motion';

/** Curva padrão de saída usada pelos componentes animados. */
export const easeOut = [0.22, 1, 0.36, 1] as const;

/** Durações compartilhadas. O Framer Motion respeita reduced-motion via MotionConfig. */
export const transitions = {
  fast: { duration: 0.12, ease: easeOut },
  normal: { duration: 0.2, ease: easeOut },
  slow: { duration: 0.32, ease: easeOut },
  spring: { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 },
} satisfies Record<string, Transition>;
