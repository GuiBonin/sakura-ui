import { usePrefersReducedMotion } from '@guibonin/sakura-ui';
import { motion } from 'framer-motion';

interface Petal {
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
  color: string;
}

const colors = ['#e8b4c8', '#d88ca5', '#f3cfdc', '#c9a6e6'];

// Valores fixos (sem Math.random) para a prévia ser estável entre renders e testes.
export const petals: Petal[] = Array.from({ length: 14 }, (_, index) => ({
  left: (index * 37) % 100,
  size: 10 + ((index * 7) % 14),
  delay: (index * 0.9) % 8,
  duration: 9 + ((index * 5) % 7),
  drift: ((index % 2 === 0 ? 1 : -1) * (40 + ((index * 13) % 60))) as number,
  rotate: 180 + ((index * 47) % 360),
  color: colors[index % colors.length]!,
}));

function PetalShape({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 1C4 6 3 13 10 19C17 13 16 6 10 1Z" fill={color} opacity="0.85" />
    </svg>
  );
}

/**
 * Pétalas caindo no fundo do hero. Puramente decorativo: oculto para leitores
 * de tela e parado quando o sistema pede movimento reduzido.
 */
export function Petals() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="docs-petals" aria-hidden="true" data-reduced={reduced || undefined}>
      {petals.map((petal, index) =>
        reduced ? (
          <span
            key={index}
            className="docs-petal"
            style={{
              left: `${petal.left}%`,
              top: `${(index * 23) % 90}%`,
              rotate: `${petal.rotate}deg`,
            }}
          >
            <PetalShape size={petal.size} color={petal.color} />
          </span>
        ) : (
          <motion.span
            key={index}
            className="docs-petal"
            style={{ left: `${petal.left}%`, top: '-5%' }}
            animate={{ y: ['0vh', '110vh'], x: [0, petal.drift], rotate: [0, petal.rotate] }}
            transition={{
              duration: petal.duration,
              delay: petal.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <PetalShape size={petal.size} color={petal.color} />
          </motion.span>
        ),
      )}
    </div>
  );
}
