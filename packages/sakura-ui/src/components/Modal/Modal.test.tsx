import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { axeViolations } from '../../../test/axe';
import { Modal, type ModalProps } from './Modal';

function Harness(props: Partial<ModalProps> & { initiallyOpen?: boolean }) {
  const { initiallyOpen = false, ...rest } = props;
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Excluir projeto"
        description="Essa ação não pode ser desfeita."
        footer={
          <>
            <button onClick={() => setOpen(false)}>Cancelar</button>
            <button>Excluir</button>
          </>
        }
        {...rest}
      >
        <p>Conteúdo</p>
      </Modal>
    </>
  );
}

const dialog = () => screen.getByRole('dialog');

describe('Modal', () => {
  it('não renderiza nada fechado', () => {
    render(<Harness />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('abre com role dialog, aria-modal, título e descrição', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    expect(dialog()).toHaveAttribute('aria-modal', 'true');
    expect(dialog()).toHaveAccessibleName('Excluir projeto');
    expect(dialog()).toHaveAccessibleDescription('Essa ação não pode ser desfeita.');
    expect(screen.getByRole('heading', { level: 2, name: 'Excluir projeto' })).toBeInTheDocument();
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });

  it('renderiza em portal no body', async () => {
    const { container } = render(<Harness initiallyOpen />);
    await screen.findByRole('dialog');
    expect(container).not.toContainElement(dialog());
    expect(document.body).toContainElement(dialog());
  });

  it('foca o primeiro elemento, prende o Tab e devolve o foco ao fechar', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Abrir' });
    await user.click(opener);
    const close = screen.getByRole('button', { name: 'Fechar' });
    expect(close).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Excluir' })).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Excluir' })).toHaveFocus();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });

  it('respeita initialFocus', async () => {
    function WithInitial() {
      const ref = useRef<HTMLButtonElement>(null);
      return (
        <Modal open onClose={() => {}} title="t" initialFocus={ref}>
          <button>a</button>
          <button ref={ref}>b</button>
        </Modal>
      );
    }
    render(<WithInitial />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'b' })).toHaveFocus());
  });

  it('fecha pelo botão X', async () => {
    const user = userEvent.setup();
    render(<Harness initiallyOpen />);
    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('fecha ao clicar no fundo, mas não ao clicar dentro', async () => {
    const user = userEvent.setup();
    render(<Harness initiallyOpen />);
    await user.click(screen.getByText('Conteúdo'));
    expect(dialog()).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('sk-modal-overlay'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closeOnOverlayClick=false e closeOnEsc=false mantêm aberto', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="t" closeOnOverlayClick={false} closeOnEsc={false}>
        x
      </Modal>,
    );
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByTestId('sk-modal-overlay'));
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('trava a rolagem do body enquanto aberto', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    expect(document.body.style.overflow).toBe('hidden');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(document.body.style.overflow).toBe(''));
  });

  it('com modais empilhados, Esc fecha só o de cima', async () => {
    const user = userEvent.setup();
    const closeOuter = vi.fn();
    const closeInner = vi.fn();
    render(
      <>
        <Modal open onClose={closeOuter} title="Fora">
          <button>fora</button>
        </Modal>
        <Modal open onClose={closeInner} title="Dentro">
          <button>dentro</button>
        </Modal>
      </>,
    );
    await screen.findByRole('dialog', { name: 'Dentro' });
    await user.keyboard('{Escape}');
    expect(closeInner).toHaveBeenCalledTimes(1);
    expect(closeOuter).not.toHaveBeenCalled();
  });

  it('esconde o botão de fechar e aceita rótulo, tamanho, classe e alertdialog', async () => {
    const { rerender } = render(
      <Modal open onClose={() => {}} title="t" hideCloseButton size="lg" className="extra">
        <button>ok</button>
      </Modal>,
    );
    await screen.findByRole('dialog');
    expect(screen.queryByRole('button', { name: 'Fechar' })).not.toBeInTheDocument();
    expect(dialog()).toHaveAttribute('data-size', 'lg');
    expect(dialog()).toHaveClass('sk-modal__dialog', 'extra');

    rerender(
      <Modal open onClose={() => {}} title="t" closeLabel="Close" role="alertdialog">
        x
      </Modal>,
    );
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('sem descrição não define aria-describedby', async () => {
    render(
      <Modal open onClose={() => {}} title="t">
        x
      </Modal>,
    );
    expect(await screen.findByRole('dialog')).not.toHaveAttribute('aria-describedby');
  });

  it('não tem violações de acessibilidade', async () => {
    render(<Harness initiallyOpen />);
    await screen.findByRole('dialog');
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
