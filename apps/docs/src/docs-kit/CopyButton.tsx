import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { copyToClipboard } from './clipboard';

export interface CopyButtonProps {
  text: string;
  /** Rótulo acessível antes de copiar. Padrão: "Copiar código". */
  label?: string;
  className?: string;
}

type Status = 'idle' | 'copied' | 'error';

const FEEDBACK_MS = 2000;

/** Botão de copiar com retorno visual e anúncio para leitores de tela. */
export function CopyButton({ text, label = 'Copiar código', className }: CopyButtonProps) {
  const [status, setStatus] = useState<Status>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = async () => {
    const ok = await copyToClipboard(text);
    setStatus(ok ? 'copied' : 'error');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), FEEDBACK_MS);
  };

  const message =
    status === 'copied' ? 'Copiado!' : status === 'error' ? 'Não foi possível copiar' : '';

  return (
    <>
      <button
        type="button"
        className={['docs-copy', className].filter(Boolean).join(' ')}
        data-status={status}
        aria-label={label}
        onClick={handleClick}
      >
        {status === 'copied' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        <span aria-hidden="true">{status === 'copied' ? 'Copiado!' : 'Copiar'}</span>
      </button>
      <span className="sk-visually-hidden" role="status">
        {message}
      </span>
    </>
  );
}
