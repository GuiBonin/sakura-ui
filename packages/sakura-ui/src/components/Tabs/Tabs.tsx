import { motion } from 'framer-motion';
import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState';
import { cx } from '../../utils/cx';
import { transitions } from '../../utils/motion';

type Orientation = 'horizontal' | 'vertical';

interface TabsContextValue {
  baseId: string;
  value: string;
  select: (value: string) => void;
  activation: 'automatic' | 'manual';
  orientation: Orientation;
  variant: 'underline' | 'pills';
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(part: string) {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`Tabs.${part} precisa estar dentro de <Tabs>.`);
  return context;
}

const tabId = (base: string, value: string) => `${base}-tab-${value}`;
const panelId = (base: string, value: string) => `${base}-panel-${value}`;

export interface TabsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** `automatic` troca ao mover o foco; `manual` exige Enter ou Espaço. Padrão: automatic. */
  activation?: 'automatic' | 'manual';
  orientation?: Orientation;
  variant?: 'underline' | 'pills';
}

const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    value: valueProp,
    defaultValue = '',
    onValueChange,
    activation = 'automatic',
    orientation = 'horizontal',
    variant = 'underline',
    className,
    ...props
  },
  ref,
) {
  const baseId = useId();
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });

  return (
    <TabsContext.Provider
      value={{ baseId, value, select: setValue, activation, orientation, variant }}
    >
      <div
        ref={ref}
        className={cx('sk-tabs', className)}
        data-orientation={orientation}
        data-variant={variant}
        {...props}
      />
    </TabsContext.Provider>
  );
});

export const TabsList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function TabsList({ className, onKeyDown, ...props }, ref) {
    const { orientation, activation, select } = useTabsContext('List');

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      const tabs = Array.from(
        event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'),
      );
      const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
      if (index === -1) return;
      const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
      const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
      let next: HTMLButtonElement | undefined;
      if (event.key === nextKey) next = tabs[(index + 1) % tabs.length];
      else if (event.key === prevKey) next = tabs[(index - 1 + tabs.length) % tabs.length];
      else if (event.key === 'Home') next = tabs[0];
      else if (event.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      event.preventDefault();
      next.focus();
      if (activation === 'automatic' && next.dataset.value) select(next.dataset.value);
    };

    return (
      // O foco fica nas abas (roving tabindex), não na lista.
      // eslint-disable-next-line jsx-a11y/interactive-supports-focus
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        className={cx('sk-tabs__list', className)}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  },
);

export interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { value, className, children, onClick, ...props },
  ref,
) {
  const { baseId, value: selectedValue, select, variant } = useTabsContext('Tab');
  const selected = value === selectedValue;

  return (
    <button
      ref={ref}
      id={tabId(baseId, value)}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={panelId(baseId, value)}
      tabIndex={selected ? 0 : -1}
      data-value={value}
      data-state={selected ? 'active' : 'inactive'}
      className={cx('sk-tabs__tab', className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) select(value);
      }}
      {...props}
    >
      {selected && (
        <motion.span
          layoutId={`${baseId}-indicator`}
          className="sk-tabs__indicator"
          data-variant={variant}
          aria-hidden="true"
          transition={transitions.spring}
        />
      )}
      <span className="sk-tabs__label">{children}</span>
    </button>
  );
});

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel(
  { value, className, ...props },
  ref,
) {
  const { baseId, value: selectedValue } = useTabsContext('Panel');
  const selected = value === selectedValue;
  return (
    <div
      ref={ref}
      id={panelId(baseId, value)}
      role="tabpanel"
      aria-labelledby={tabId(baseId, value)}
      tabIndex={0}
      hidden={!selected}
      className={cx('sk-tabs__panel', className)}
      {...props}
    />
  );
});

/** Abas (padrão Tabs do WAI-ARIA APG). Componha com `Tabs.List`, `Tabs.Tab` e `Tabs.Panel`. */
export const Tabs = Object.assign(TabsRoot, { List: TabsList, Tab, Panel: TabPanel });
