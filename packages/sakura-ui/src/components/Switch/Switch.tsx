import {
  forwardRef,
  useId,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { cx } from '../../utils/cx';

export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'value' | 'defaultValue'
> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  size?: 'sm' | 'md';
  /** Nome no formulário. Quando ligado, envia `value` (padrão "on"). */
  name?: string;
  value?: string;
}

/** Interruptor liga/desliga com `role="switch"`. */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    id: idProp,
    checked: checkedProp,
    defaultChecked = false,
    onCheckedChange,
    label,
    description,
    size = 'md',
    name,
    value = 'on',
    disabled,
    className,
    onClick,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const describedBy = [ariaDescribedBy, descriptionId].filter(Boolean).join(' ') || undefined;
  const [checked, setChecked] = useControllableState({
    value: checkedProp,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) setChecked(!checked);
  };

  return (
    <div
      className={cx('sk-switch', className)}
      data-size={size}
      data-disabled={disabled || undefined}
    >
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={describedBy}
        className="sk-switch__track"
        data-state={checked ? 'on' : 'off'}
        disabled={disabled}
        onClick={handleClick}
        {...props}
      >
        <span className="sk-switch__thumb" aria-hidden="true" />
      </button>
      {name && checked && <input type="hidden" name={name} value={value} />}
      {(label || description) && (
        <span className="sk-switch__text">
          {label && (
            <label htmlFor={id} className="sk-switch__label">
              {label}
            </label>
          )}
          {description && (
            <span id={descriptionId} className="sk-switch__description">
              {description}
            </span>
          )}
        </span>
      )}
    </div>
  );
});
