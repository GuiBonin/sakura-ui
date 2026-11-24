import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { axeViolations } from '../../../test/axe';
import { useComponentFakeTimers } from '../../../test/timers';
import { SakuraProvider } from '../../theme/SakuraProvider';
import { ToastProvider, useToast, type ToastOptions, type ToastProviderProps } from './Toast';

function Trigger({ options }: { options: ToastOptions }) {
  const { toast, dismissAll } = useToast();
  return (
    <>
      <button onClick={() => toast(options)}>disparar</button>
      <button onClick={dismissAll}>limpar</button>
    </>
  );
}

function renderWithToast(options: ToastOptions, props: Partial<ToastProviderProps> = {}) {
  return render(
    <ToastProvider {...props}>
      <Trigger options={options} />
    </ToastProvider>,
  );
}

const fire = () => fireEvent.click(screen.getByRole('button', { name: 'disparar' }));
const politeRegion = () => document.querySelector('[aria-live="polite"]')!;
const assertiveRegion = () => document.querySelector('[aria-live="assertive"]')!;

// O AnimatePresence remove o nó alguns frames depois do exit. O vi.waitFor avança
// os timers falsos a cada tentativa, sem trocar para timers reais no meio do teste
// (o que perderia callbacks já agendados pelo Framer Motion).
async function expectGone(query: () => HTMLElement | null) {
  await vi.waitFor(() => expect(query()).not.toBeInTheDocument(), { timeout: 3000, interval: 20 });
}

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('mostra título e descrição dentro da região polite', () => {
    renderWithToast({ title: 'Salvo', description: 'Tudo certo' });
    fire();
    expect(politeRegion()).toHaveTextContent('SalvoTudo certo');
    expect(screen.getByRole('region', { name: 'Notificações' })).toBeInTheDocument();
  });

  it('erros vão para a região assertive', () => {
    renderWithToast({ title: 'Falhou', tone: 'danger' });
    fire();
    expect(assertiveRegion()).toHaveTextContent('Falhou');
    expect(politeRegion()).not.toHaveTextContent('Falhou');
  });

  it.each(['info', 'success', 'warning', 'danger'] as const)('aplica o tom %s', (tone) => {
    renderWithToast({ title: 'x', tone });
    fire();
    expect(document.querySelector('.sk-toast')).toHaveAttribute('data-tone', tone);
  });

  it('some sozinho depois da duração', async () => {
    useComponentFakeTimers();
    renderWithToast({ title: 'Some', duration: 1000 });
    fire();
    act(() => vi.advanceTimersByTime(999));
    expect(screen.getByText('Some')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    await expectGone(() => screen.queryByText('Some'));
  });

  it('usa a duração padrão do provider', async () => {
    useComponentFakeTimers();
    renderWithToast({ title: 'Padrão' }, { duration: 2000 });
    fire();
    act(() => vi.advanceTimersByTime(1999));
    expect(screen.getByText('Padrão')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    await expectGone(() => screen.queryByText('Padrão'));
  });

  it('pausa enquanto o ponteiro está em cima e retoma com o tempo restante', async () => {
    useComponentFakeTimers();
    renderWithToast({ title: 'Pausa', duration: 1000 });
    fire();
    const toast = document.querySelector('.sk-toast')!;
    act(() => vi.advanceTimersByTime(600));
    fireEvent.pointerEnter(toast);
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText('Pausa')).toBeInTheDocument();
    fireEvent.pointerLeave(toast);
    act(() => vi.advanceTimersByTime(399));
    expect(screen.getByText('Pausa')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    await expectGone(() => screen.queryByText('Pausa'));
  });

  it('pausa com foco dentro e retoma quando o foco sai', async () => {
    useComponentFakeTimers();
    renderWithToast({ title: 'Foco', duration: 1000 });
    fire();
    const close = screen.getByRole('button', { name: 'Fechar notificação' });
    fireEvent.focus(close);
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText('Foco')).toBeInTheDocument();
    fireEvent.blur(close, { relatedTarget: document.body });
    act(() => vi.advanceTimersByTime(1000));
    await expectGone(() => screen.queryByText('Foco'));
  });

  it('duration Infinity não fecha sozinho', () => {
    useComponentFakeTimers();
    renderWithToast({ title: 'Fica', duration: Infinity });
    fire();
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText('Fica')).toBeInTheDocument();
  });

  it('fecha pelo botão', async () => {
    const user = userEvent.setup();
    renderWithToast({ title: 'Fechar' });
    fire();
    await user.click(screen.getByRole('button', { name: 'Fechar notificação' }));
    await waitFor(() => expect(screen.queryByText('Fechar')).not.toBeInTheDocument());
  });

  it('ação executa o callback e fecha', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithToast({ title: 'Excluído', action: { label: 'Desfazer', onClick } });
    fire();
    await user.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(onClick).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText('Excluído')).not.toBeInTheDocument());
  });

  it('respeita o limite removendo as mais antigas', () => {
    function Many() {
      const { toast } = useToast();
      return (
        <button onClick={() => [1, 2, 3].forEach((n) => toast({ title: `T${n}` }))}>muitos</button>
      );
    }
    render(
      <ToastProvider limit={2}>
        <Many />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'muitos' }));
    expect(screen.queryByText('T1')).not.toBeInTheDocument();
    expect(screen.getByText('T2')).toBeInTheDocument();
    expect(screen.getByText('T3')).toBeInTheDocument();
  });

  it('mesmo id substitui em vez de duplicar', () => {
    function Same() {
      const { toast } = useToast();
      return (
        <>
          <button onClick={() => toast({ id: 'sync', title: 'Sincronizando' })}>a</button>
          <button onClick={() => toast({ id: 'sync', title: 'Sincronizado' })}>b</button>
        </>
      );
    }
    render(
      <ToastProvider>
        <Same />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'a' }));
    fireEvent.click(screen.getByRole('button', { name: 'b' }));
    expect(screen.queryByText('Sincronizando')).not.toBeInTheDocument();
    expect(document.querySelectorAll('.sk-toast')).toHaveLength(1);
  });

  it('dismiss por id e dismissAll', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ToastProvider>{children}</ToastProvider>
    );
    const { result } = renderHook(() => useToast(), { wrapper });
    let id = '';
    act(() => {
      id = result.current.toast({ title: 'A' });
      result.current.toast({ title: 'B' });
    });
    expect(id).toMatch(/^sk-toast-/);
    act(() => result.current.dismiss(id));
    await waitFor(() => expect(screen.queryByText('A')).not.toBeInTheDocument());
    expect(screen.getByText('B')).toBeInTheDocument();
    act(() => result.current.dismissAll());
    await waitFor(() => expect(screen.queryByText('B')).not.toBeInTheDocument());
  });

  it('aceita posição, rótulos e mostra as do topo mais novas primeiro', () => {
    function Two() {
      const { toast } = useToast();
      return (
        <button
          onClick={() => {
            toast({ title: 'primeira' });
            toast({ title: 'segunda' });
          }}
        >
          dois
        </button>
      );
    }
    render(
      <ToastProvider position="top-center" label="Avisos" closeLabel="Dispensar">
        <Two />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'dois' }));
    const viewport = screen.getByRole('region', { name: 'Avisos' });
    expect(viewport).toHaveAttribute('data-position', 'top-center');
    expect(screen.getAllByRole('button', { name: 'Dispensar' })).toHaveLength(2);
    const titles = Array.from(document.querySelectorAll('.sk-toast__title')).map(
      (el) => el.textContent,
    );
    expect(titles).toEqual(['segunda', 'primeira']);
  });

  it('useToast fora do provider lança erro', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useToast())).toThrow(/ToastProvider/);
    consoleError.mockRestore();
  });

  it('SakuraProvider já inclui o ToastProvider, e toast={false} remove', () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: ({ children }) => <SakuraProvider>{children}</SakuraProvider>,
    });
    expect(typeof result.current.toast).toBe('function');

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      renderHook(() => useToast(), {
        wrapper: ({ children }) => <SakuraProvider toast={false}>{children}</SakuraProvider>,
      }),
    ).toThrow();
    consoleError.mockRestore();
  });

  it('não tem violações de acessibilidade', async () => {
    renderWithToast({
      title: 'Salvo',
      description: 'ok',
      action: { label: 'Ver', onClick: () => {} },
    });
    fire();
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
