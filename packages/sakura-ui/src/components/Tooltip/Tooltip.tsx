import { AnimatePresence, motion } from 'framer-motion';
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  version,
  type FocusEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { useEscape } from '../../hooks/useEscape';
import { useFloatingPosition } from '../../hooks/useFloatingPosition';
import { cx } from '../../utils/cx';
import { transitions } from '../../utils/motion';
import type { Side } from '../../utils/position';
import { Portal } from '../../utils/Portal';
import { mergeRefs } from '../../utils/refs';

export interface TooltipProps {
  content: ReactNode;
  /** Um único elemento focável, como um botão. */
  children: ReactElement;
  placement?: Side;
  /** Atraso para abrir no hover, em ms. Padrão: 300. Foco abre na hora. */
  delay?: number;
  disabled?: boolean;
  className?: string;
}

type TriggerProps = {
  ref?: Ref<HTMLElement>;
  onPointerEnter?: (event: PointerEvent<HTMLElement>) => void;
  onPointerLeave?: (event: PointerEvent<HTMLElement>) => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  'aria-describedby'?: string;
};

const CLOSE_DELAY = 100;
const isReact19 = Number.parseInt(version, 10) >= 19;

function getElementRef(element: ReactElement): Ref<HTMLElement> | undefined {
  // No React 19 a ref é uma prop; no 18 fica no próprio elemento.
  return isReact19
    ? (element.props as TriggerProps).ref
    : (element as unknown as { ref?: Ref<HTMLElement> }).ref;
}

/**
 * Dica curta que aparece no hover e no foco. Fica aberta enquanto o ponteiro
 * estiver sobre ela e fecha com Esc (WCAG 1.4.13).
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 300,
  disabled = false,
  className,
}: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { position } = useFloatingPosition(triggerRef, tooltipRef, open, placement, 8);

  const clear = () => clearTimeout(timer.current);
  const show = useCallback((wait: number) => {
    clearTimeout(timer.current);
    if (wait <= 0) setOpen(true);
    else timer.current = setTimeout(() => setOpen(true), wait);
  }, []);
  const hide = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (disabled) {
      clearTimeout(timer.current);
      setOpen(false);
    }
  }, [disabled]);

  useEscape(() => {
    clear();
    setOpen(false);
  }, open);

  if (!isValidElement(children)) return children;
  const childProps = children.props as TriggerProps;
  const visible = open && !disabled;

  const trigger = cloneElement(children as ReactElement<TriggerProps>, {
    ref: mergeRefs(triggerRef, getElementRef(children)),
    'aria-describedby':
      [childProps['aria-describedby'], visible ? id : undefined].filter(Boolean).join(' ') ||
      undefined,
    onPointerEnter: (event) => {
      childProps.onPointerEnter?.(event);
      if (!disabled && event.pointerType !== 'touch') show(delay);
    },
    onPointerLeave: (event) => {
      childProps.onPointerLeave?.(event);
      hide();
    },
    onFocus: (event) => {
      childProps.onFocus?.(event);
      if (!disabled) show(0);
    },
    onBlur: (event) => {
      childProps.onBlur?.(event);
      clear();
      setOpen(false);
    },
  });

  return (
    <>
      {trigger}
      <Portal>
        <AnimatePresence>
          {visible && (
            <motion.div
              ref={tooltipRef}
              id={id}
              role="tooltip"
              className={cx('sk-tooltip', className)}
              data-side={position.side}
              style={{ top: position.top, left: position.left }}
              onPointerEnter={clear}
              onPointerLeave={hide}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: transitions.fast }}
              transition={transitions.fast}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
