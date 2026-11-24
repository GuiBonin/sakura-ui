import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

/** Ids e aria-describedby compartilhados pelos campos de formulário. */
export function getFieldIds(id: string, hint: ReactNode, error: ReactNode, describedBy?: string) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const ids = [describedBy, hintId, errorId].filter(Boolean).join(' ');
  return { hintId, errorId, describedBy: ids || undefined };
}

interface FieldLabelProps {
  id?: string;
  htmlFor?: string;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  children: ReactNode;
}

export function FieldLabel({ id, htmlFor, required, disabled, children }: FieldLabelProps) {
  return (
    <label
      id={id}
      htmlFor={htmlFor}
      className="sk-field__label"
      data-disabled={disabled || undefined}
    >
      {children}
      {required && (
        <span className="sk-field__required" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

interface FieldMessagesProps {
  hint?: ReactNode;
  error?: ReactNode;
  hintId?: string | undefined;
  errorId?: string | undefined;
}

export function FieldMessages({ hint, error, hintId, errorId }: FieldMessagesProps) {
  return (
    <>
      {hint && (
        <p id={hintId} className="sk-field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={cx('sk-field__error')}>
          {error}
        </p>
      )}
    </>
  );
}
