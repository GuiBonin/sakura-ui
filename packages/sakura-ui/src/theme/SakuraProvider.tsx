import { MotionConfig } from 'framer-motion';
import { ThemeProvider, type ThemeProviderProps } from './ThemeProvider';

export interface SakuraProviderProps extends ThemeProviderProps {
  /**
   * Como as animações tratam a preferência de movimento reduzido.
   * `user` (padrão) segue o sistema, `always` sempre reduz, `never` ignora.
   */
  reducedMotion?: 'user' | 'always' | 'never';
}

/** Provider raiz da Sakura UI: tema e configuração de animação. */
export function SakuraProvider({
  children,
  reducedMotion = 'user',
  ...props
}: SakuraProviderProps) {
  return (
    <ThemeProvider {...props}>
      <MotionConfig reducedMotion={reducedMotion}>{children}</MotionConfig>
    </ThemeProvider>
  );
}
