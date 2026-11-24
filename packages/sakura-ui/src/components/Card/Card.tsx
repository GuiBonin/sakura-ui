import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Eleva o card no hover. Use quando o card inteiro é clicável. */
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const CardRoot = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'elevated', interactive = false, padding = 'md', className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx('sk-card', className)}
      data-variant={variant}
      data-padding={padding}
      data-interactive={interactive || undefined}
      {...props}
    />
  );
});

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  /** Ação no canto, como um botão de menu. */
  action?: ReactNode;
  /** Nível do título. Padrão: 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { title, description, action, headingLevel = 3, className, children, ...props },
  ref,
) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div ref={ref} className={cx('sk-card__header', className)} {...props}>
      <div className="sk-card__heading">
        {title && <Heading className="sk-card__title">{title}</Heading>}
        {description && <p className="sk-card__description">{description}</p>}
        {children}
      </div>
      {action && <div className="sk-card__action">{action}</div>}
    </div>
  );
});

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardBody({ className, ...props }, ref) {
    return <div ref={ref} className={cx('sk-card__body', className)} {...props} />;
  },
);

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    return <div ref={ref} className={cx('sk-card__footer', className)} {...props} />;
  },
);

/** Container de conteúdo. Componha com `Card.Header`, `Card.Body` e `Card.Footer`. */
export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
