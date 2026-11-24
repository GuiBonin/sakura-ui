import { MotionConfig } from 'framer-motion';
import { ToastProvider, type ToastProviderProps } from '../components/Toast/Toast';
import { ThemeProvider, type ThemeProviderProps } from './ThemeProvider';

export interface SakuraProviderProps extends ThemeProviderProps {
  /**
   * Como as animações tratam a preferência de movimento reduzido.
   * `user` (padrão) segue o sistema, `always` sempre reduz, `never` ignora.
   */
  reducedMotion?: 'user' | 'always' | 'never';
  /** Configuração das notificações. Use `false` para não incluir o ToastProvider. */
  toast?: Omit<ToastProviderProps, 'children'> | false;
}

/** Provider raiz da Sakura UI: tema, configuração de animação e notificações. */
export function SakuraProvider({
  children,
  reducedMotion = 'user',
  toast = {},
  ...props
}: SakuraProviderProps) {
  return (
    <ThemeProvider {...props}>
      <MotionConfig reducedMotion={reducedMotion}>
        {toast === false ? children : <ToastProvider {...toast}>{children}</ToastProvider>}
      </MotionConfig>
    </ThemeProvider>
  );
}
