import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type BadgeTone = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';
export type BadgeAppearance = 'soft' | 'solid' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  appearance?: BadgeAppearance;
  size?: BadgeSize;
  /** Mostra um ponto colorido antes do texto. */
  dot?: boolean;
  icon?: ReactNode;
}

/** Rótulo curto para status, categorias ou contagens. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    tone = 'neutral',
    appearance = 'soft',
    size = 'md',
    dot = false,
    icon,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx('sk-badge', className)}
      data-tone={tone}
      data-appearance={appearance}
      data-size={size}
      {...props}
    >
      {dot && <span className="sk-badge__dot" aria-hidden="true" />}
      {icon && (
        <span className="sk-badge__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
});
