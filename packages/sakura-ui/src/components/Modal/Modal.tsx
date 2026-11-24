import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { useEscape } from '../../hooks/useEscape';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { cx } from '../../utils/cx';
import { transitions } from '../../utils/motion';
import { Portal } from '../../utils/Portal';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

export interface ModalProps {
  open: boolean;
  /** Chamado quando o usuário pede para fechar (Esc, fundo ou botão de fechar). */
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Área de ações no rodapé, geralmente botões. */
  footer?: ReactNode;
  size?: ModalSize;
  /** Fecha ao clicar no fundo. Padrão: `true`. */
  closeOnOverlayClick?: boolean;
  /** Fecha com Esc. Padrão: `true`. */
  closeOnEsc?: boolean;
  /** Elemento que recebe o foco ao abrir. Padrão: primeiro focável. */
  initialFocus?: RefObject<HTMLElement | null>;
  hideCloseButton?: boolean;
  /** Rótulo do botão de fechar. Padrão: "Fechar". */
  closeLabel?: string;
  className?: string;
  /** Use `alertdialog` para confirmações que exigem resposta. */
  role?: 'dialog' | 'alertdialog';
}

// Pilha de modais abertos: Esc e clique no fundo só afetam o do topo.
const stack: string[] = [];

/** Janela modal com foco preso, Esc, trava de rolagem e animação de entrada e saída. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  initialFocus,
  hideCloseButton = false,
  closeLabel = 'Fechar',
  className,
  role = 'dialog',
}: ModalProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    stack.push(id);
    return () => {
      const index = stack.lastIndexOf(id);
      if (index >= 0) stack.splice(index, 1);
    };
  }, [open, id]);

  const isTop = () => stack[stack.length - 1] === id;

  useFocusTrap(dialogRef, open, { initialFocus });
  useScrollLock(open);
  useEscape(() => {
    if (closeOnEsc && isTop()) onClose();
  }, open);

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="sk-modal">
            <motion.div
              className="sk-modal__overlay"
              aria-hidden="true"
              data-testid="sk-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transitions.normal}
              onClick={() => {
                if (closeOnOverlayClick && isTop()) onClose();
              }}
            />
            <motion.div
              ref={dialogRef}
              role={role}
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={description ? descriptionId : undefined}
              tabIndex={-1}
              className={cx('sk-modal__dialog', className)}
              data-size={size}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98, transition: transitions.fast }}
              transition={transitions.spring}
            >
              <header className="sk-modal__header">
                <div className="sk-modal__heading">
                  <h2 id={titleId} className="sk-modal__title">
                    {title}
                  </h2>
                  {description && (
                    <p id={descriptionId} className="sk-modal__description">
                      {description}
                    </p>
                  )}
                </div>
                {!hideCloseButton && (
                  <button
                    type="button"
                    className="sk-modal__close"
                    aria-label={closeLabel}
                    onClick={onClose}
                  >
                    <X aria-hidden="true" />
                  </button>
                )}
              </header>
              {children && <div className="sk-modal__body">{children}</div>}
              {footer && <footer className="sk-modal__footer">{footer}</footer>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
