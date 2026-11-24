import { ChevronDown } from 'lucide-react';
import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { cx } from '../../utils/cx';
import { inertProps } from '../../utils/inert';

interface AccordionContextValue {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
  headingLevel: 2 | 3 | 4 | 5 | 6;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

interface AccordionBaseProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Nível dos títulos dos itens. Padrão: 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export interface AccordionSingleProps extends AccordionBaseProps {
  type?: 'single';
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Permite fechar o item aberto. Padrão: `true`. */
  collapsible?: boolean;
}

export interface AccordionMultipleProps extends AccordionBaseProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

const AccordionRoot = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(props, ref) {
  const {
    type = 'single',
    value,
    defaultValue,
    onValueChange,
    headingLevel = 3,
    className,
    children,
    onKeyDown,
    ...rest
  } = props;
  const collapsible = props.type === 'multiple' ? true : (props.collapsible ?? true);
  // `collapsible` não é atributo de DOM.
  delete (rest as { collapsible?: boolean }).collapsible;

  const toArray = (input: string | string[] | null | undefined) =>
    input == null ? undefined : Array.isArray(input) ? input : [input];

  const [open, setOpen] = useControllableState<string[]>({
    value: toArray(value),
    defaultValue: toArray(defaultValue) ?? [],
    onChange: (next) => {
      if (type === 'multiple') (onValueChange as ((v: string[]) => void) | undefined)?.(next);
      else (onValueChange as ((v: string | null) => void) | undefined)?.(next[0] ?? null);
    },
  });

  const context: AccordionContextValue = {
    headingLevel,
    isOpen: (item) => open.includes(item),
    toggle: (item) => {
      const isOpen = open.includes(item);
      if (type === 'multiple') {
        setOpen(isOpen ? open.filter((v) => v !== item) : [...open, item]);
      } else if (isOpen) {
        if (collapsible) setOpen([]);
      } else {
        setOpen([item]);
      }
    },
  };

  // Setas, Home e End movem o foco entre os cabeçalhos (APG).
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const target = event.target as HTMLElement;
    if (!target.matches('.sk-accordion__trigger')) return;
    const triggers = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '.sk-accordion__trigger:not(:disabled)',
      ),
    ).filter((trigger) => trigger.closest('.sk-accordion') === event.currentTarget);
    const index = triggers.indexOf(target as HTMLButtonElement);
    let next: HTMLButtonElement | undefined;
    if (event.key === 'ArrowDown') next = triggers[(index + 1) % triggers.length];
    else if (event.key === 'ArrowUp')
      next = triggers[(index - 1 + triggers.length) % triggers.length];
    else if (event.key === 'Home') next = triggers[0];
    else if (event.key === 'End') next = triggers[triggers.length - 1];
    if (next) {
      event.preventDefault();
      next.focus();
    }
  };

  return (
    <AccordionContext.Provider value={context}>
      {/* O keydown só repassa o foco entre botões que já são focáveis. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div ref={ref} className={cx('sk-accordion', className)} onKeyDown={handleKeyDown} {...rest}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
});

export interface AccordionItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  value: string;
  title: ReactNode;
  disabled?: boolean;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { value, title, disabled = false, className, children, ...props },
  ref,
) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('Accordion.Item precisa estar dentro de <Accordion>.');
  const id = useId();
  const triggerId = `${id}-trigger`;
  const panelId = `${id}-panel`;
  const open = context.isOpen(value);
  const Heading = `h${context.headingLevel}` as const;

  return (
    <div
      ref={ref}
      className={cx('sk-accordion__item', className)}
      data-state={open ? 'open' : 'closed'}
      data-disabled={disabled || undefined}
      {...props}
    >
      <Heading className="sk-accordion__heading">
        <button
          id={triggerId}
          type="button"
          className="sk-accordion__trigger"
          aria-expanded={open}
          aria-controls={panelId}
          disabled={disabled}
          onClick={() => context.toggle(value)}
        >
          <span>{title}</span>
          <ChevronDown className="sk-accordion__chevron" aria-hidden="true" />
        </button>
      </Heading>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className="sk-accordion__panel"
        data-state={open ? 'open' : 'closed'}
        {...inertProps(!open)}
      >
        <div className="sk-accordion__panel-inner">
          <div className="sk-accordion__content">{children}</div>
        </div>
      </div>
    </div>
  );
});

/** Seções expansíveis. Componha com `Accordion.Item`. */
export const Accordion = Object.assign(AccordionRoot, { Item: AccordionItem });
