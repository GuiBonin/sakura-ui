import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { axeViolations } from '../../../test/axe';
import { useComponentFakeTimers } from '../../../test/timers';
import { Modal } from '../Modal/Modal';
import { Tooltip } from './Tooltip';

// O AnimatePresence remove o nó alguns frames depois do exit. O vi.waitFor avança
// os timers falsos a cada tentativa, sem trocar para timers reais no meio do teste
// (o que perderia callbacks já agendados pelo Framer Motion).
async function expectGone(query: () => HTMLElement | null) {
  await vi.waitFor(() => expect(query()).not.toBeInTheDocument(), { timeout: 3000, interval: 20 });
}

describe('Tooltip', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('abre no foco na hora e liga aria-describedby', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Salvar alterações">
        <button>Salvar</button>
      </Tooltip>,
    );
    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('aria-describedby');
    await user.tab();
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('Salvar alterações');
    expect(button).toHaveAccessibleDescription('Salvar alterações');
    expect(document.body).toContainElement(tooltip);
  });

  it('fecha no blur', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="dica">
        <button>x</button>
      </Tooltip>,
    );
    await user.tab();
    await user.tab();
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('abre no hover depois do atraso e fecha ao sair', async () => {
    useComponentFakeTimers();
    render(
      <Tooltip content="dica" delay={300}>
        <button>x</button>
      </Tooltip>,
    );
    const button = screen.getByRole('button');
    fireEvent.pointerEnter(button, { pointerType: 'mouse' });
    act(() => vi.advanceTimersByTime(299));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.pointerLeave(button);
    act(() => vi.advanceTimersByTime(150));
    await expectGone(() => screen.queryByRole('tooltip'));
  });

  it('continua aberto quando o ponteiro vai para a própria dica', async () => {
    useComponentFakeTimers();
    render(
      <Tooltip content="dica" delay={0}>
        <button>x</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByRole('button'), { pointerType: 'mouse' });
    const tooltip = screen.getByRole('tooltip');
    fireEvent.pointerLeave(screen.getByRole('button'));
    fireEvent.pointerEnter(tooltip);
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.pointerLeave(tooltip);
    act(() => vi.advanceTimersByTime(150));
    await expectGone(() => screen.queryByRole('tooltip'));
  });

  it('não abre por toque', () => {
    useComponentFakeTimers();
    render(
      <Tooltip content="dica" delay={0}>
        <button>x</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByRole('button'), { pointerType: 'touch' });
    act(() => vi.advanceTimersByTime(10));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('fecha com Esc', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="dica">
        <button>x</button>
      </Tooltip>,
    );
    await user.tab();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('dentro de um Modal, Esc fecha só a dica e o segundo Esc fecha o modal', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Compartilhar">
        <Tooltip content="Copia o link">
          <button>Copiar</button>
        </Tooltip>
      </Modal>,
    );
    await screen.findByRole('dialog');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Copiar' })).toHaveFocus();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('desabilitado não abre e fecha se estava aberto', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Tooltip content="dica">
        <button>x</button>
      </Tooltip>,
    );
    await user.tab();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    rerender(
      <Tooltip content="dica" disabled>
        <button>x</button>
      </Tooltip>,
    );
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    await user.tab();
    await user.tab({ shift: true });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('preserva handlers, aria-describedby e ref do filho', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onPointerEnter = vi.fn();
    const onPointerLeave = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    render(
      <>
        <p id="extra">extra</p>
        <Tooltip content="dica">
          <button
            ref={ref}
            aria-describedby="extra"
            onFocus={onFocus}
            onBlur={onBlur}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
          >
            x
          </button>
        </Tooltip>
      </>,
    );
    const button = screen.getByRole('button');
    expect(ref.current).toBe(button);
    fireEvent.pointerEnter(button, { pointerType: 'mouse' });
    fireEvent.pointerLeave(button);
    await user.tab();
    expect(button).toHaveAccessibleDescription('extra dica');
    await user.tab();
    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
    expect(onPointerEnter).toHaveBeenCalled();
    expect(onPointerLeave).toHaveBeenCalled();
  });

  it('aplica o lado e a classe', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="dica" placement="bottom" className="t">
        <button>x</button>
      </Tooltip>,
    );
    await user.tab();
    expect(screen.getByRole('tooltip')).toHaveAttribute('data-side', 'bottom');
    expect(screen.getByRole('tooltip')).toHaveClass('sk-tooltip', 't');
  });

  it('renderiza filhos que não são elementos sem quebrar', () => {
    render(<Tooltip content="dica">{'texto solto' as unknown as React.ReactElement}</Tooltip>);
    expect(screen.getByText('texto solto')).toBeInTheDocument();
  });

  it('não tem violações de acessibilidade aberto', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Copiar link">
        <button>Copiar</button>
      </Tooltip>,
    );
    await user.tab();
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
