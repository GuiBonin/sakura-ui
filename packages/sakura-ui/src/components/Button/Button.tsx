import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Spinner } from '../Spinner/Spinner';

export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Mostra um spinner e bloqueia cliques, mantendo o botão focável. */
  loading?: boolean;
  /** Texto lido durante o carregamento. Padrão: o próprio conteúdo do botão. */
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Botão só com ícone. Exige `aria-label`. */
  iconOnly?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'solid',
    size = 'md',
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    iconOnly = false,
    fullWidth = false,
    type = 'button',
    disabled,
    className,
    children,
    onClick,
    ...props
  },
  ref,
) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      type={type}
      className={cx('sk-button', className)}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      data-icon-only={iconOnly || undefined}
      data-full-width={fullWidth || undefined}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" decorative className="sk-button__spinner" />
      ) : (
        leftIcon && (
          <span className="sk-button__icon" aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}
      {iconOnly && loading ? null : (
        // Com loadingText, o rótulo visível sai da árvore de acessibilidade e o
        // texto de carregamento vira o nome do botão.
        <span className="sk-button__label" aria-hidden={(loading && !!loadingText) || undefined}>
          {children}
        </span>
      )}
      {loading && loadingText && <span className="sk-visually-hidden">{loadingText}</span>}
      {!loading && rightIcon && (
        <span className="sk-button__icon" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});
