import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pencil } from 'lucide-react';
import { createRef } from 'react';
import { axeViolations } from '../../../test/axe';
import { useComponentFakeTimers } from '../../../test/timers';
import { Dropdown, type DropdownItem } from './Dropdown';

function setup(extra: Partial<React.ComponentProps<typeof Dropdown>> = {}) {
  const user = userEvent.setup();
  const handlers = { editar: vi.fn(), duplicar: vi.fn(), arquivar: vi.fn(), excluir: vi.fn() };
  const items: DropdownItem[] = [
    { type: 'label', label: 'Projeto' },
    { label: 'Editar', onSelect: handlers.editar, icon: <Pencil />, shortcut: 'E' },
    { label: 'Duplicar', onSelect: handlers.duplicar },
    { label: 'Desativado', disabled: true },
    { type: 'separator' },
    { label: 'Arquivar', onSelect: handlers.arquivar },
    { label: 'Excluir', onSelect: handlers.excluir, danger: true },
  ];
  render(
    <>
      <Dropdown trigger={<button>Ações</button>} items={items} {...extra} />
      <button>depois</button>
      <p>fora</p>
    </>,
  );
  return { user, handlers };
}

const trigger = () => screen.getByRole('button', { name: 'Ações' });
const item = (name: string) => screen.getByRole('menuitem', { name });

describe('Dropdown', () => {
  it('gatilho expõe aria-haspopup e aria-expanded', () => {
    setup();
    expect(trigger()).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).not.toHaveAttribute('aria-controls');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('abre no clique com foco no primeiro item habilitado', async () => {
    const { user } = setup();
    await user.click(trigger());
    const menu = screen.getByRole('menu');
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(trigger()).toHaveAttribute('aria-controls', menu.id);
    expect(menu).toHaveAccessibleName('Ações');
    expect(item('Editar')).toHaveFocus();
  });

  it('clicar no gatilho aberto fecha', async () => {
    const { user } = setup();
    await user.click(trigger());
    await user.click(trigger());
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it.each(['{Enter}', ' ', '{ArrowDown}'])('%s no gatilho abre no primeiro item', async (key) => {
    const { user } = setup();
    trigger().focus();
    await user.keyboard(key);
    expect(item('Editar')).toHaveFocus();
  });

  it('ArrowUp no gatilho abre no último item', async () => {
    const { user } = setup();
    trigger().focus();
    await user.keyboard('{ArrowUp}');
    expect(item('Excluir')).toHaveFocus();
  });

  it('setas circulam pulando desabilitados; Home e End vão às pontas', async () => {
    const { user } = setup();
    await user.click(trigger());
    await user.keyboard('{ArrowDown}');
    expect(item('Duplicar')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(item('Arquivar')).toHaveFocus();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(item('Editar')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(item('Excluir')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(item('Editar')).toHaveFocus();
    await user.keyboard('{End}');
    expect(item('Excluir')).toHaveFocus();
  });

  it('Enter executa a ação, fecha e devolve o foco ao gatilho', async () => {
    const { user, handlers } = setup();
    await user.click(trigger());
    await user.keyboard('{ArrowDown}{Enter}');
    expect(handlers.duplicar).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(trigger()).toHaveFocus();
  });

  it('Espaço também executa', async () => {
    const { user, handlers } = setup();
    await user.click(trigger());
    await user.keyboard(' ');
    expect(handlers.editar).toHaveBeenCalled();
  });

  it('clique executa a ação; item desabilitado não faz nada', async () => {
    const { user, handlers } = setup();
    await user.click(trigger());
    await user.click(item('Desativado'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(item('Desativado')).toHaveAttribute('aria-disabled', 'true');
    await user.click(item('Arquivar'));
    expect(handlers.arquivar).toHaveBeenCalled();
  });

  it('Escape fecha e devolve o foco', async () => {
    const { user, handlers } = setup();
    await user.click(trigger());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(trigger()).toHaveFocus();
    expect(handlers.editar).not.toHaveBeenCalled();
  });

  it('Tab fecha o menu', async () => {
    const { user } = setup();
    await user.click(trigger());
    await user.tab();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('clique fora fecha', async () => {
    const { user } = setup();
    await user.click(trigger());
    await user.click(screen.getByText('fora'));
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('typeahead foca o item pela letra e repetir a letra percorre', async () => {
    const { user } = setup();
    await user.click(trigger());
    await user.keyboard('a');
    expect(item('Arquivar')).toHaveFocus();
    await user.keyboard('e');
    expect(item('Arquivar')).toHaveFocus(); // "ae" não existe
  });

  it('typeahead reinicia após a pausa e cicla com a mesma letra', async () => {
    useComponentFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Dropdown
        trigger={<button>Ações</button>}
        items={[{ label: 'Editar' }, { label: 'Exportar' }, { label: 'Duplicar' }]}
      />,
    );
    await user.click(trigger());
    await user.keyboard('e');
    expect(item('Exportar')).toHaveFocus();
    await user.keyboard('e');
    expect(item('Editar')).toHaveFocus();
    act(() => vi.advanceTimersByTime(600));
    await user.keyboard('d');
    expect(item('Duplicar')).toHaveFocus();
    vi.useRealTimers();
  });

  it('passar o mouse move o item ativo, exceto em desabilitados', async () => {
    const { user } = setup();
    await user.click(trigger());
    fireEvent.pointerMove(item('Arquivar'));
    expect(item('Arquivar')).toHaveFocus();
    fireEvent.pointerMove(item('Desativado'));
    expect(item('Arquivar')).toHaveFocus();
  });

  it('renderiza rótulo, separador, ícone, atalho e item de perigo', async () => {
    const { user } = setup();
    await user.click(trigger());
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByText('Projeto')).toHaveClass('sk-dropdown__label');
    expect(screen.getByText('E')).toHaveAttribute('aria-hidden', 'true');
    expect(item('Excluir')).toHaveAttribute('data-danger', 'true');
  });

  it('usa aria-label próprio, preserva id, ref e handlers do gatilho', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    const onOpenChange = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    render(
      <Dropdown
        aria-label="Opções da linha"
        onOpenChange={onOpenChange}
        trigger={
          <button id="meu-gatilho" ref={ref} onClick={onClick} onKeyDown={onKeyDown}>
            Ações
          </button>
        }
        items={[{ label: 'Um' }]}
      />,
    );
    expect(ref.current).toBe(trigger());
    expect(trigger()).toHaveAttribute('id', 'meu-gatilho');
    await user.click(trigger());
    expect(screen.getByRole('menu')).toHaveAccessibleName('Opções da linha');
    expect(onClick).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await user.keyboard('{ArrowDown}');
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('respeita preventDefault nos handlers do gatilho', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        trigger={
          <button onClick={(e) => e.preventDefault()} onKeyDown={(e) => e.preventDefault()}>
            Ações
          </button>
        }
        items={[{ label: 'Um' }]}
      />,
    );
    await user.click(trigger());
    trigger().focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('menu sem itens habilitados abre sem quebrar', async () => {
    const user = userEvent.setup();
    render(<Dropdown trigger={<button>Ações</button>} items={[{ label: 'x', disabled: true }]} />);
    await user.click(trigger());
    await user.keyboard('{ArrowDown}{Home}{End}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('não renderiza nada quando o gatilho não é elemento', () => {
    const { container } = render(
      <Dropdown trigger={'x' as unknown as React.ReactElement} items={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('não tem violações de acessibilidade aberto', async () => {
    const { user } = setup();
    await user.click(trigger());
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
