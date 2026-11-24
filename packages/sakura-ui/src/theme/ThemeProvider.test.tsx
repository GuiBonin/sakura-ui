import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { useReducedMotionConfig } from 'framer-motion';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { PREFERS_DARK, PREFERS_REDUCED_MOTION, setMediaQuery } from '../../test/matchMedia';
import { Modal } from '../components/Modal/Modal';
import { SakuraProvider } from './SakuraProvider';
import { ThemeProvider, useTheme, type ThemeMode } from './ThemeProvider';

function ThemeProbe() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <p data-testid="theme">{theme}</p>
      <p data-testid="resolved">{resolvedTheme}</p>
      <button onClick={toggleTheme}>alternar</button>
      <button onClick={() => setTheme('system')}>sistema</button>
      <button onClick={() => setTheme('dark')}>escuro</button>
    </div>
  );
}

const html = () => document.documentElement;

describe('ThemeProvider', () => {
  it('usa system por padrão e aplica claro quando o sistema não prefere escuro', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('system');
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
    expect(html()).toHaveAttribute('data-theme', 'light');
    expect(html().style.colorScheme).toBe('light');
  });

  it('segue o sistema em modo system, inclusive quando a preferência muda', () => {
    setMediaQuery(PREFERS_DARK, true);
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(html()).toHaveAttribute('data-theme', 'dark');

    act(() => setMediaQuery(PREFERS_DARK, false));
    expect(html()).toHaveAttribute('data-theme', 'light');
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
  });

  it('respeita defaultTheme', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(html()).toHaveAttribute('data-theme', 'dark');
  });

  it('alterna o tema e persiste a escolha no localStorage', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeProbe />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'alternar' }));
    expect(html()).toHaveAttribute('data-theme', 'dark');
    expect(window.localStorage.getItem('sakura-ui-theme')).toBe('dark');

    await user.click(screen.getByRole('button', { name: 'alternar' }));
    expect(html()).toHaveAttribute('data-theme', 'light');
    expect(window.localStorage.getItem('sakura-ui-theme')).toBe('light');
  });

  it('volta para system quando pedido', async () => {
    const user = userEvent.setup();
    setMediaQuery(PREFERS_DARK, true);
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeProbe />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'sistema' }));
    expect(screen.getByTestId('theme')).toHaveTextContent('system');
    expect(html()).toHaveAttribute('data-theme', 'dark');
  });

  it('restaura a escolha salva, que tem prioridade sobre defaultTheme', () => {
    window.localStorage.setItem('sakura-ui-theme', 'dark');
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('ignora valor inválido salvo no storage', () => {
    window.localStorage.setItem('sakura-ui-theme', 'roxo');
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('usa a chave de storage personalizada', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider storageKey="meu-tema">
        <ThemeProbe />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'escuro' }));
    expect(window.localStorage.getItem('meu-tema')).toBe('dark');
    expect(window.localStorage.getItem('sakura-ui-theme')).toBeNull();
  });

  it('não persiste quando storageKey é false', async () => {
    const user = userEvent.setup();
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    render(
      <ThemeProvider storageKey={false}>
        <ThemeProbe />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'escuro' }));
    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });

  it('continua funcionando quando o localStorage lança erro', async () => {
    const user = userEvent.setup();
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeProbe />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'alternar' }));
    expect(html()).toHaveAttribute('data-theme', 'dark');
    getItem.mockRestore();
    setItem.mockRestore();
  });

  it('funciona controlado, chamando onThemeChange sem mudar sozinho', async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();
    render(
      <ThemeProvider theme="light" onThemeChange={onThemeChange}>
        <ThemeProbe />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'alternar' }));
    expect(onThemeChange).toHaveBeenCalledWith('dark');
    expect(html()).toHaveAttribute('data-theme', 'light');
  });

  it('aplica o novo tema quando o pai atualiza o valor controlado', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [theme, setTheme] = useState<ThemeMode>('light');
      return (
        <ThemeProvider theme={theme} onThemeChange={setTheme}>
          <ThemeProbe />
        </ThemeProvider>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole('button', { name: 'alternar' }));
    expect(html()).toHaveAttribute('data-theme', 'dark');
  });

  it('sincroniza com mudanças feitas em outra aba', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeProbe />
      </ThemeProvider>,
    );
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'sakura-ui-theme', newValue: 'dark' }),
      );
    });
    expect(html()).toHaveAttribute('data-theme', 'dark');

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'outra-chave', newValue: 'light' }));
    });
    expect(html()).toHaveAttribute('data-theme', 'dark');
  });

  it('useTheme fora do provider lança erro explicativo', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow(/SakuraProvider/);
    consoleError.mockRestore();
  });
});

describe('SakuraProvider', () => {
  it('fornece o tema para os filhos', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <SakuraProvider defaultTheme="dark">{children}</SakuraProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.resolvedTheme).toBe('dark');
    expect(html()).toHaveAttribute('data-theme', 'dark');
  });

  it.each([
    ['always', true],
    ['never', false],
  ] as const)('reducedMotion="%s" configura o Framer Motion', (mode, expected) => {
    const { result } = renderHook(() => useReducedMotionConfig(), {
      wrapper: ({ children }) => <SakuraProvider reducedMotion={mode}>{children}</SakuraProvider>,
    });
    expect(result.current).toBe(expected);
  });

  it('com movimento reduzido no sistema, overlays continuam abrindo e fechando', async () => {
    const user = userEvent.setup();
    setMediaQuery(PREFERS_REDUCED_MOTION, true);
    function App() {
      const [open, setOpen] = useState(true);
      return (
        <SakuraProvider>
          <Modal open={open} onClose={() => setOpen(false)} title="Calmo">
            texto
          </Modal>
        </SakuraProvider>
      );
    }
    render(<App />);
    expect(await screen.findByRole('dialog', { name: 'Calmo' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
