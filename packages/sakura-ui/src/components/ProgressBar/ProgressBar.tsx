import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type ProgressTone =
  'primary' | 'accent' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Valor atual. Sem valor, a barra fica indeterminada. */
  value?: number;
  max?: number;
  /** Rótulo visível. Sem ele, passe `aria-label`. */
  label?: ReactNode;
  /** Mostra a porcentagem ao lado do rótulo. */
  showValue?: boolean;
  /** Texto lido pelo leitor de tela, como "3 de 10 arquivos". */
  valueText?: string;
  tone?: ProgressTone;
  size?: 'sm' | 'md' | 'lg';
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Barra de progresso determinada ou indeterminada. */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar(
  {
    value,
    max = 100,
    label,
    showValue = false,
    valueText,
    tone = 'primary',
    size = 'md',
    className,
    ...props
  },
  ref,
) {
  const labelId = useId();
  const indeterminate = value === undefined || Number.isNaN(value);
  const safeMax = max > 0 ? max : 100;
  const current = indeterminate ? 0 : clamp(value, 0, safeMax);
  const percent = Math.round((current / safeMax) * 100);

  return (
    <div className={cx('sk-progress', className)} data-tone={tone} data-size={size}>
      {(label || (showValue && !indeterminate)) && (
        <div className="sk-progress__header">
          {label && (
            <span id={labelId} className="sk-progress__label">
              {label}
            </span>
          )}
          {showValue && !indeterminate && (
            <span className="sk-progress__value" aria-hidden="true">
              {percent}%
            </span>
          )}
        </div>
      )}
      <div
        ref={ref}
        className="sk-progress__track"
        role="progressbar"
        aria-labelledby={label ? labelId : undefined}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={indeterminate ? undefined : current}
        aria-valuetext={indeterminate ? undefined : valueText}
        aria-busy={indeterminate || undefined}
        data-indeterminate={indeterminate || undefined}
        {...props}
      >
        <div
          className="sk-progress__fill"
          style={indeterminate ? undefined : { transform: `scaleX(${percent / 100})` }}
        />
      </div>
    </div>
  );
});
