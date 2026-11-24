import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useControllableState } from '../../hooks/useControllableState';
import { useFloatingPosition } from '../../hooks/useFloatingPosition';
import { cx } from '../../utils/cx';
import { transitions } from '../../utils/motion';
import { Portal } from '../../utils/Portal';
import { mergeRefs } from '../../utils/refs';
import { FieldLabel, FieldMessages, getFieldIds } from '../Field/field';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Texto secundário mostrado abaixo do rótulo. */
  description?: string;
}

export interface SelectProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'value' | 'defaultValue' | 'onChange' | 'children'
> {
  options: SelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Texto quando nada está selecionado. Padrão: "Selecione uma opção". */
  placeholder?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Nome no formulário. Envia o valor por um input oculto. */
  name?: string;
  wrapperClassName?: string;
}

const TYPEAHEAD_RESET_MS = 500;

function scrollIntoViewIfPossible(element: Element | null) {
  if (element && typeof element.scrollIntoView === 'function') {
    element.scrollIntoView({ block: 'nearest' });
  }
}

/**
 * Seleção única com lista customizada, seguindo o padrão "select-only
 * combobox" do WAI-ARIA APG.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    id: idProp,
    options,
    value: valueProp,
    defaultValue = null,
    onValueChange,
    label,
    hint,
    error,
    placeholder = 'Selecione uma opção',
    required,
    disabled,
    size = 'md',
    name,
    className,
    wrapperClassName,
    'aria-describedby': ariaDescribedBy,
    onKeyDown,
    onClick,
    onBlur,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const listboxId = `${id}-listbox`;
  const optionId = (index: number) => `${id}-option-${index}`;
  const { hintId, errorId, describedBy } = getFieldIds(id, hint, error, ariaDescribedBy);

  const [value, setValue] = useControllableState<string | null>({
    value: valueProp,
    defaultValue,
    onChange: (next) => {
      if (next !== null) onValueChange?.(next);
    },
  });
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: '', timer: 0 as ReturnType<typeof setTimeout> | 0 });

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const invalid = Boolean(error);

  const enabledIndexes = options
    .map((option, index) => (option.disabled ? -1 : index))
    .filter((index) => index >= 0);
  const firstEnabled = enabledIndexes[0] ?? -1;
  const lastEnabled = enabledIndexes[enabledIndexes.length - 1] ?? -1;

  const openList = useCallback((index: number) => {
    setActiveIndex(index);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const commit = (index: number) => {
    const option = options[index];
    if (option && !option.disabled) setValue(option.value);
    close();
  };

  const move = (from: number, step: 1 | -1, count = 1) => {
    let target = from;
    let remaining = count;
    let cursor = from;
    while (remaining > 0) {
      cursor += step;
      if (cursor < 0 || cursor >= options.length) break;
      if (!options[cursor]!.disabled) {
        target = cursor;
        remaining -= 1;
      }
    }
    return target;
  };

  const findByTypeahead = (key: string, startIndex: number) => {
    clearTimeout(typeahead.current.timer);
    typeahead.current.text += key.toLowerCase();
    typeahead.current.timer = setTimeout(() => {
      typeahead.current.text = '';
    }, TYPEAHEAD_RESET_MS);

    const text = typeahead.current.text;
    // Repetir a mesma letra percorre as opções que começam com ela.
    const allSame = text.split('').every((char) => char === text[0]);
    const search = allSame ? text[0]! : text;
    const start = allSame ? startIndex + 1 : Math.max(startIndex, 0);
    const ordered = [...options.slice(start), ...options.slice(0, start)];
    const match = ordered.find(
      (option) => !option.disabled && option.label.toLowerCase().startsWith(search),
    );
    return match ? options.indexOf(match) : -1;
  };

  useEffect(() => () => clearTimeout(typeahead.current.timer), []);

  useEffect(() => {
    if (open && activeIndex >= 0) {
      scrollIntoViewIfPossible(document.getElementById(optionId(activeIndex)));
    }
    // optionId depende só do id estável
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex]);

  // A lista fica num portal, então "fora" é fora do campo e fora da lista.
  useClickOutside([rootRef, listRef], close, open);
  const { position } = useFloatingPosition(triggerRef, listRef, open, 'bottom-start', 4);

  const initialIndex =
    selectedIndex >= 0 && !options[selectedIndex]!.disabled ? selectedIndex : firstEnabled;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    const { key, altKey } = event;

    if (!open) {
      if (key === 'ArrowDown' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        openList(initialIndex);
      } else if (key === 'ArrowUp') {
        event.preventDefault();
        openList(initialIndex);
      } else if (key === 'Home') {
        event.preventDefault();
        openList(firstEnabled);
      } else if (key === 'End') {
        event.preventDefault();
        openList(lastEnabled);
      } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && key !== ' ') {
        event.preventDefault();
        const match = findByTypeahead(key, selectedIndex);
        openList(match >= 0 ? match : initialIndex);
      }
      return;
    }

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((index) => move(index, 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (altKey) commit(activeIndex);
        else setActiveIndex((index) => move(index, -1));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(firstEnabled);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(lastEnabled);
        break;
      case 'PageDown':
        event.preventDefault();
        setActiveIndex((index) => move(index, 1, 10));
        break;
      case 'PageUp':
        event.preventDefault();
        setActiveIndex((index) => move(index, -1, 10));
        break;
      case 'Enter':
      case ' ':
        if (key === ' ' && typeahead.current.text) {
          event.preventDefault();
          const match = findByTypeahead(' ', activeIndex);
          if (match >= 0) setActiveIndex(match);
          break;
        }
        event.preventDefault();
        commit(activeIndex);
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        commit(activeIndex);
        break;
      default:
        if (key.length === 1 && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          const match = findByTypeahead(key, activeIndex);
          if (match >= 0) setActiveIndex(match);
        }
    }
  };

  return (
    <div ref={rootRef} className={cx('sk-field', 'sk-select', wrapperClassName)}>
      {label && (
        <FieldLabel id={labelId} htmlFor={id} required={required} disabled={disabled}>
          {label}
        </FieldLabel>
      )}
      <button
        ref={mergeRefs(triggerRef, ref)}
        id={id}
        type="button"
        role="combobox"
        className={cx('sk-control', 'sk-select__trigger', className)}
        data-size={size}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        data-focused={open || undefined}
        data-placeholder={!selected || undefined}
        aria-labelledby={label ? `${labelId} ${valueId}` : undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (open) close();
          else openList(initialIndex);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          // Fecha quando o foco sai do componente (clique em opção não tira o foco).
          const next = event.relatedTarget as Node | null;
          if (open && !rootRef.current?.contains(next) && !listRef.current?.contains(next)) {
            close();
          }
        }}
        {...props}
      >
        <span id={valueId} className="sk-select__value">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="sk-select__chevron" aria-hidden="true" />
      </button>

      <Portal>
        <AnimatePresence>
          {open && (
            <motion.ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-labelledby={label ? labelId : undefined}
              aria-label={label ? undefined : (props['aria-label'] ?? placeholder)}
              tabIndex={-1}
              className="sk-select__listbox"
              data-side={position.side}
              style={{
                top: position.top,
                left: position.left,
                minWidth: position.referenceWidth || undefined,
              }}
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98, transition: transitions.fast }}
              transition={transitions.normal}
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  // Navegação por teclado fica no combobox (aria-activedescendant).
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                  <li
                    key={option.value}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    className="sk-select__option"
                    data-active={index === activeIndex || undefined}
                    onPointerDown={(event) => event.preventDefault()}
                    onPointerMove={() => {
                      if (!option.disabled && index !== activeIndex) setActiveIndex(index);
                    }}
                    onClick={() => {
                      if (option.disabled) return;
                      commit(index);
                      triggerRef.current?.focus();
                    }}
                  >
                    <span className="sk-select__option-text">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="sk-select__option-description">{option.description}</span>
                      )}
                    </span>
                    {isSelected && <Check className="sk-select__check" aria-hidden="true" />}
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </Portal>

      {name && <input type="hidden" name={name} value={value ?? ''} />}
      <FieldMessages hint={hint} error={error} hintId={hintId} errorId={errorId} />
    </div>
  );
});
