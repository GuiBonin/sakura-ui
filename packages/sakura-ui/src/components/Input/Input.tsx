import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { FieldLabel, FieldMessages, getFieldIds } from '../Field/field';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  /** Texto de ajuda abaixo do campo. */
  hint?: ReactNode;
  /** Mensagem de erro. Quando presente, marca o campo como inválido. */
  error?: ReactNode;
  size?: InputSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Classe do wrapper externo. `className` vai no `<input>`. */
  wrapperClassName?: string;
}

/** Campo de texto com rótulo, ajuda e erro ligados por aria-describedby. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id: idProp,
    label,
    hint,
    error,
    size = 'md',
    leftIcon,
    rightIcon,
    required,
    disabled,
    className,
    wrapperClassName,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const { hintId, errorId, describedBy } = getFieldIds(id, hint, error, ariaDescribedBy);
  const invalid = Boolean(error) || ariaInvalid === true || ariaInvalid === 'true';

  return (
    <div className={cx('sk-field', wrapperClassName)}>
      {label && (
        <FieldLabel htmlFor={id} required={required} disabled={disabled}>
          {label}
        </FieldLabel>
      )}
      <div
        className="sk-control"
        data-size={size}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
      >
        {leftIcon && (
          <span className="sk-control__icon" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={cx('sk-input', className)}
          required={required}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {rightIcon && (
          <span className="sk-control__icon" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </div>
      <FieldMessages hint={hint} error={error} hintId={hintId} errorId={errorId} />
    </div>
  );
});
