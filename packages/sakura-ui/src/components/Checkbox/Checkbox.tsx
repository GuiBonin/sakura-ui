import { Check, Minus } from 'lucide-react';
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { mergeRefs } from '../../utils/refs';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  /** Rótulo clicável ao lado da caixa. */
  label?: ReactNode;
  /** Texto auxiliar abaixo do rótulo. */
  description?: ReactNode;
  /** Estado misto, usado em "selecionar todos" parcialmente marcado. */
  indeterminate?: boolean;
  /** Atalho para receber só o booleano. */
  onCheckedChange?: (checked: boolean) => void;
  size?: 'sm' | 'md';
}

/** Checkbox nativo estilizado, com suporte a estado indeterminado. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    id: idProp,
    label,
    description,
    indeterminate = false,
    onChange,
    onCheckedChange,
    size = 'md',
    disabled,
    className,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const describedBy = [ariaDescribedBy, descriptionId].filter(Boolean).join(' ') || undefined;
  const innerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onCheckedChange?.(event.target.checked);
  };

  return (
    <div
      className={cx('sk-checkbox', className)}
      data-size={size}
      data-disabled={disabled || undefined}
    >
      <span className="sk-checkbox__control">
        <input
          ref={mergeRefs(innerRef, ref)}
          id={id}
          type="checkbox"
          className="sk-checkbox__input"
          disabled={disabled}
          aria-describedby={describedBy}
          onChange={handleChange}
          {...props}
        />
        <span className="sk-checkbox__box" aria-hidden="true">
          <Check className="sk-checkbox__check" strokeWidth={3} />
          <Minus className="sk-checkbox__dash" strokeWidth={3} />
        </span>
      </span>
      {(label || description) && (
        <span className="sk-checkbox__text">
          {label && (
            <label htmlFor={id} className="sk-checkbox__label">
              {label}
            </label>
          )}
          {description && (
            <span id={descriptionId} className="sk-checkbox__description">
              {description}
            </span>
          )}
        </span>
      )}
    </div>
  );
});
