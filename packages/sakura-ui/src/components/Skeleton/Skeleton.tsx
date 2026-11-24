import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export type SkeletonVariant = 'text' | 'rect' | 'circle';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: SkeletonVariant;
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  /** Quantidade de linhas no modo `text`. A última fica mais curta. */
  lines?: number;
  /** Desliga o brilho animado. */
  animated?: boolean;
}

/**
 * Espaço reservado enquanto o conteúdo carrega. Fica oculto para leitores de
 * tela; marque o container que está carregando com `aria-busy="true"`.
 */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { variant = 'text', width, height, lines = 1, animated = true, className, style, ...props },
  ref,
) {
  const shared = {
    'data-variant': variant,
    'data-animated': animated || undefined,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <span
        ref={ref}
        className={cx('sk-skeleton-group', className)}
        style={{ width, ...style }}
        aria-hidden="true"
        {...props}
      >
        {Array.from({ length: lines }, (_, index) => (
          <span
            key={index}
            className="sk-skeleton"
            {...shared}
            style={{ height, width: index === lines - 1 ? '60%' : undefined }}
          />
        ))}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={cx('sk-skeleton', className)}
      {...shared}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
});
