import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { transitions } from '../../utils/motion';
import { Portal } from '../../utils/Portal';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';
export type ToastPosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  /** Tempo na tela em ms. `Infinity` mantém até fechar. Padrão: 5000. */
  duration?: number;
  action?: { label: string; onClick: () => void };
  /** Id próprio, útil para atualizar ou evitar duplicadas. */
  id?: string;
}

interface ToastRecord extends Required<Pick<ToastOptions, 'tone' | 'duration'>> {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ToastOptions['action'];
}

export interface ToastContextValue {
  /** Mostra uma notificação e devolve o id. */
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  /** Máximo de notificações ao mesmo tempo. As mais antigas saem. Padrão: 5. */
  limit?: number;
  /** Duração padrão em ms. Padrão: 5000. */
  duration?: number;
  /** Rótulo da região de notificações. Padrão: "Notificações". */
  label?: string;
  /** Rótulo do botão de fechar. Padrão: "Fechar notificação". */
  closeLabel?: string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
} satisfies Record<ToastTone, unknown>;

let counter = 0;

/** Fornece `useToast` e renderiza as notificações. */
export function ToastProvider({
  children,
  position = 'bottom-right',
  limit = 5,
  duration = 5000,
  label = 'Notificações',
  closeLabel = 'Fechar notificação',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  const toast = useCallback(
    (options: ToastOptions) => {
      counter += 1;
      const id = options.id ?? `sk-toast-${counter}`;
      const record: ToastRecord = {
        id,
        title: options.title,
        description: options.description,
        action: options.action,
        tone: options.tone ?? 'info',
        duration: options.duration ?? duration,
      };
      setToasts((current) => {
        const withoutSame = current.filter((item) => item.id !== id);
        return [...withoutSame, record].slice(-limit);
      });
      return id;
    },
    [duration, limit],
  );

  const value = useMemo(() => ({ toast, dismiss, dismissAll }), [toast, dismiss, dismissAll]);
  const isTop = position.startsWith('top');
  const ordered = isTop ? [...toasts].reverse() : toasts;

  const renderRegion = (urgent: boolean) => (
    // Regiões vivas permanentes: o conteúdo inserido nelas é anunciado.
    <div
      className="sk-toast-region"
      aria-live={urgent ? 'assertive' : 'polite'}
      aria-relevant="additions"
    >
      <AnimatePresence initial={false}>
        {ordered
          .filter((item) => (item.tone === 'danger') === urgent)
          .map((item) => (
            <ToastItem
              key={item.id}
              toast={item}
              fromTop={isTop}
              closeLabel={closeLabel}
              onDismiss={dismiss}
            />
          ))}
      </AnimatePresence>
    </div>
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Portal>
        <section className="sk-toast-viewport" data-position={position} aria-label={label}>
          {renderRegion(true)}
          {renderRegion(false)}
        </section>
      </Portal>
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  toast: ToastRecord;
  fromTop: boolean;
  closeLabel: string;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, fromTop, closeLabel, onDismiss }: ToastItemProps) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(toast.duration);
  const startedAt = useRef(0);
  const Icon = icons[toast.tone];

  // Conta o tempo só enquanto não está pausado (hover ou foco dentro).
  useEffect(() => {
    if (paused || !Number.isFinite(toast.duration)) return;
    startedAt.current = Date.now();
    const timer = setTimeout(() => onDismiss(toast.id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused, toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      layout
      className="sk-toast"
      data-tone={toast.tone}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
      initial={{ opacity: 0, y: fromTop ? -16 : 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, transition: transitions.fast }}
      transition={transitions.spring}
    >
      <Icon className="sk-toast__icon" aria-hidden="true" />
      <div className="sk-toast__content">
        <div className="sk-toast__title">{toast.title}</div>
        {toast.description && <div className="sk-toast__description">{toast.description}</div>}
        {toast.action && (
          <button
            type="button"
            className="sk-toast__action"
            onClick={() => {
              toast.action!.onClick();
              onDismiss(toast.id);
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        className="sk-toast__close"
        aria-label={closeLabel}
        onClick={() => onDismiss(toast.id)}
      >
        <X aria-hidden="true" />
      </button>
    </motion.div>
  );
}

/** Mostra notificações. Precisa estar dentro de `SakuraProvider` ou `ToastProvider`. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast precisa ser usado dentro de <SakuraProvider> ou <ToastProvider>.');
  }
  return context;
}
