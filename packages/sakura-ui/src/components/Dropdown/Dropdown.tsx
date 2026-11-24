import { AnimatePresence, motion } from 'framer-motion';
import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  version,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useFloatingPosition } from '../../hooks/useFloatingPosition';
import { cx } from '../../utils/cx';
import { transitions } from '../../utils/motion';
import type { Placement } from '../../utils/position';
import { Portal } from '../../utils/Portal';
import { mergeRefs } from '../../utils/refs';

export interface DropdownActionItem {
  type?: 'item';
  label: string;
  onSelect?: () => void;
  icon?: ReactNode;
  /** Atalho exibido à direita, como "Ctrl+C". Só visual. */
  shortcut?: string;
  disabled?: boolean;
  /** Ação destrutiva, mostrada em vermelho. */
  danger?: boolean;
}

export interface DropdownSeparator {
  type: 'separator';
}

export interface DropdownLabel {
  type: 'label';
  label: string;
}

export type DropdownItem = DropdownActionItem | DropdownSeparator | DropdownLabel;

export interface DropdownProps {
  /** Elemento que abre o menu, geralmente um Button. */
  trigger: ReactElement;
  items: DropdownItem[];
  placement?: Placement;
  /** Nome acessível do menu. Padrão: o texto do gatilho. */
  'aria-label'?: string;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

type TriggerProps = {
  ref?: Ref<HTMLElement>;
  id?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
};

const isReact19 = Number.parseInt(version, 10) >= 19;
const TYPEAHEAD_RESET_MS = 500;

function isAction(item: DropdownItem): item is DropdownActionItem {
  return item.type === undefined || item.type === 'item';
}

/** Menu de ações (padrão "menu button" do WAI-ARIA APG). */
export function Dropdown({
  trigger,
  items,
  placement = 'bottom-start',
  'aria-label': ariaLabel,
  className,
  onOpenChange,
}: DropdownProps) {
  const id = useId();
  const triggerId = `${id}-trigger`;
  const menuId = `${id}-menu`;
  const [open, setOpenState] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const typeahead = useRef({
    text: '',
    timer: undefined as ReturnType<typeof setTimeout> | undefined,
  });
  const { position } = useFloatingPosition(triggerRef, menuRef, open, placement, 6);

  const enabled = items
    .map((item, index) => (isAction(item) && !item.disabled ? index : -1))
    .filter((index) => index >= 0);

  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };

  const openMenu = (index: number) => {
    setActiveIndex(index);
    setOpen(true);
  };

  const close = (returnFocus: boolean) => {
    setOpen(false);
    setActiveIndex(-1);
    if (returnFocus) triggerRef.current?.focus();
  };

  // Move o foco real para o item ativo (o menu usa foco itinerante).
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    menuRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.focus();
  }, [open, activeIndex]);

  useEffect(() => () => clearTimeout(typeahead.current.timer), []);

  useClickOutside([triggerRef, menuRef], () => close(false), open);

  const select = (index: number) => {
    const item = items[index];
    if (!item || !isAction(item) || item.disabled) return;
    close(true);
    item.onSelect?.();
  };

  const step = (direction: 1 | -1) => {
    if (enabled.length === 0) return;
    const position = enabled.indexOf(activeIndex);
    const next =
      position === -1
        ? direction === 1
          ? 0
          : enabled.length - 1
        : (position + direction + enabled.length) % enabled.length;
    setActiveIndex(enabled[next]!);
  };

  const findByTypeahead = (key: string) => {
    clearTimeout(typeahead.current.timer);
    typeahead.current.text += key.toLowerCase();
    typeahead.current.timer = setTimeout(() => {
      typeahead.current.text = '';
    }, TYPEAHEAD_RESET_MS);
    const text = typeahead.current.text;
    // Repetir a mesma letra percorre os itens que começam com ela.
    const allSame = text.split('').every((char) => char === text[0]);
    const search = allSame ? text[0]! : text;
    const current = enabled.indexOf(activeIndex);
    const startAt = allSame ? current + 1 : Math.max(current, 0);
    const ordered = [...enabled.slice(startAt), ...enabled.slice(0, startAt)];
    return ordered.find((index) =>
      (items[index] as DropdownActionItem).label.toLowerCase().startsWith(search),
    );
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        step(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        step(-1);
        break;
      case 'Home':
        event.preventDefault();
        if (enabled.length) setActiveIndex(enabled[0]!);
        break;
      case 'End':
        event.preventDefault();
        if (enabled.length) setActiveIndex(enabled[enabled.length - 1]!);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        select(activeIndex);
        break;
      case 'Escape':
        event.preventDefault();
        close(true);
        break;
      case 'Tab':
        close(false);
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const match = findByTypeahead(event.key);
          if (match !== undefined) setActiveIndex(match);
        }
    }
  };

  if (!isValidElement(trigger)) return null;
  const triggerProps = trigger.props as TriggerProps;
  const triggerElementRef = isReact19
    ? triggerProps.ref
    : (trigger as unknown as { ref?: Ref<HTMLElement> }).ref;
  const first = enabled[0] ?? -1;
  const last = enabled[enabled.length - 1] ?? -1;

  const triggerNode = cloneElement(trigger as ReactElement<Record<string, unknown>>, {
    ref: mergeRefs(triggerRef, triggerElementRef),
    id: triggerProps.id ?? triggerId,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
    onClick: (event: MouseEvent<HTMLElement>) => {
      triggerProps.onClick?.(event);
      if (event.defaultPrevented) return;
      if (open) close(false);
      else openMenu(first);
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      triggerProps.onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openMenu(first);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        openMenu(last);
      }
    },
  });

  return (
    <>
      {triggerNode}
      <Portal>
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label={ariaLabel}
              aria-labelledby={ariaLabel ? undefined : (triggerProps.id ?? triggerId)}
              aria-orientation="vertical"
              tabIndex={-1}
              className={cx('sk-dropdown', className)}
              data-side={position.side}
              style={{ top: position.top, left: position.left }}
              onKeyDown={handleMenuKeyDown}
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97, transition: transitions.fast }}
              transition={transitions.normal}
            >
              {items.map((item, index) => {
                if (item.type === 'separator') {
                  return <div key={index} role="separator" className="sk-dropdown__separator" />;
                }
                if (item.type === 'label') {
                  return (
                    <div key={index} role="presentation" className="sk-dropdown__label">
                      {item.label}
                    </div>
                  );
                }
                return (
                  // O teclado é tratado no menu (foco itinerante).
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                  <div
                    key={index}
                    role="menuitem"
                    tabIndex={-1}
                    data-index={index}
                    aria-disabled={item.disabled || undefined}
                    data-danger={item.danger || undefined}
                    data-active={index === activeIndex || undefined}
                    className="sk-dropdown__item"
                    onClick={() => select(index)}
                    onPointerMove={() => {
                      if (!item.disabled && index !== activeIndex) setActiveIndex(index);
                    }}
                  >
                    {item.icon && (
                      <span className="sk-dropdown__icon" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    <span className="sk-dropdown__text">{item.label}</span>
                    {item.shortcut && (
                      <kbd className="sk-dropdown__shortcut" aria-hidden="true">
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
