import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export type SpinnerSize = 'sm' | 'md' | 'lg';
/** `current` herda a cor do texto ao redor (útil dentro de botões). */
export type SpinnerTone =
  'primary' | 'accent' | 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'current';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  /** Texto lido por leitores de tela. Padrão: "Carregando". */
  label?: string;
  /**
   * Esconde o spinner de tecnologias assistivas. Use quando outro elemento
   * já comunica o carregamento (por exemplo, um botão com `aria-busy`).
   */
  decorative?: boolean;
}

/** Indicador de carregamento circular. Com movimento reduzido, pulsa devagar em vez de girar. */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'md', tone = 'primary', label = 'Carregando', decorative = false, className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx('sk-spinner', className)}
      data-size={size}
      data-tone={tone}
      {...(decorative ? { 'aria-hidden': true } : { role: 'status' })}
      {...props}
    >
      <svg className="sk-spinner__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="sk-spinner__track" cx="12" cy="12" r="9.5" strokeWidth="3" />
        <circle className="sk-spinner__arc" cx="12" cy="12" r="9.5" strokeWidth="3" />
      </svg>
      {!decorative && <span className="sk-visually-hidden">{label}</span>}
    </span>
  );
});
