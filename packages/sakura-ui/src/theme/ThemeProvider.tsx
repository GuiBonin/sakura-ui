import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  /** Escolha atual, que pode ser `system`. */
  theme: ThemeMode;
  /** Tema efetivamente aplicado. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  /** Alterna entre claro e escuro a partir do tema aplicado. */
  toggleTheme: () => void;
}

export interface ThemeProviderProps {
  children: ReactNode;
  /** Tema controlado. Quando definido, `onThemeChange` deve atualizá-lo. */
  theme?: ThemeMode;
  /** Tema inicial quando não há escolha salva. Padrão: `system`. */
  defaultTheme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
  /** Chave no localStorage. Use `false` para não persistir. Padrão: `sakura-ui-theme`. */
  storageKey?: string | false;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DARK_QUERY = '(prefers-color-scheme: dark)';
const MODES: readonly ThemeMode[] = ['light', 'dark', 'system'];

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (MODES as readonly string[]).includes(value);
}

function readStorage(key: string | false): ThemeMode | null {
  if (!key || typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(key);
    return isThemeMode(value) ? value : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string | false, value: ThemeMode) {
  if (!key) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage indisponível (modo privado, bloqueado): o tema vale só para esta sessão.
  }
}

export function ThemeProvider({
  children,
  theme: controlledTheme,
  defaultTheme = 'system',
  onThemeChange,
  storageKey = 'sakura-ui-theme',
}: ThemeProviderProps) {
  const [internalTheme, setInternalTheme] = useState<ThemeMode>(
    () => readStorage(storageKey) ?? defaultTheme,
  );
  const theme = controlledTheme ?? internalTheme;
  const prefersDark = useMediaQuery(DARK_QUERY);
  const resolvedTheme: ResolvedTheme =
    theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;

  const setTheme = useCallback(
    (next: ThemeMode) => {
      if (controlledTheme === undefined) setInternalTheme(next);
      writeStorage(storageKey, next);
      onThemeChange?.(next);
    },
    [controlledTheme, onThemeChange, storageKey],
  );

  const toggleTheme = useCallback(
    () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
    [resolvedTheme, setTheme],
  );

  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  // Mantém abas abertas sincronizadas quando o tema muda em outra aba.
  useEffect(() => {
    if (!storageKey || controlledTheme !== undefined) return;
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey && isThemeMode(event.newValue)) {
        setInternalTheme(event.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey, controlledTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Lê e altera o tema. Precisa estar dentro de `SakuraProvider` ou `ThemeProvider`. */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme precisa ser usado dentro de <SakuraProvider> ou <ThemeProvider>.');
  }
  return context;
}
