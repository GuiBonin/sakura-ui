import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { axeViolations } from '../../../test/axe';
import { Tabs, type TabsProps } from './Tabs';

function Example(props: Partial<TabsProps>) {
  return (
    <Tabs defaultValue="conta" {...props}>
      <Tabs.List aria-label="Configurações">
        <Tabs.Tab value="conta">Conta</Tabs.Tab>
        <Tabs.Tab value="senha">Senha</Tabs.Tab>
        <Tabs.Tab value="beta" disabled>
          Beta
        </Tabs.Tab>
        <Tabs.Tab value="avisos">Avisos</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="conta">Dados da conta</Tabs.Panel>
      <Tabs.Panel value="senha">Trocar senha</Tabs.Panel>
      <Tabs.Panel value="beta">Beta</Tabs.Panel>
      <Tabs.Panel value="avisos">Preferências de aviso</Tabs.Panel>
    </Tabs>
  );
}

const tab = (name: string) => screen.getByRole('tab', { name });

describe('Tabs', () => {
  it('liga abas e painéis com papéis e ids do APG', () => {
    render(<Example />);
    expect(screen.getByRole('tablist', { name: 'Configurações' })).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    );
    const conta = tab('Conta');
    expect(conta).toHaveAttribute('aria-selected', 'true');
    expect(conta).toHaveAttribute('tabindex', '0');
    expect(tab('Senha')).toHaveAttribute('tabindex', '-1');
    const panel = screen.getByRole('tabpanel', { name: 'Conta' });
    expect(panel).toHaveTextContent('Dados da conta');
    expect(conta).toHaveAttribute('aria-controls', panel.id);
    expect(screen.queryByText('Trocar senha')).not.toBeVisible();
  });

  it('clique troca de aba', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    await user.click(tab('Senha'));
    expect(tab('Senha')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Trocar senha')).toBeVisible();
    expect(onValueChange).toHaveBeenCalledWith('senha');
  });

  it('automática: setas movem o foco e ativam, pulando desabilitadas e circulando', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(tab('Conta')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(tab('Senha')).toHaveFocus();
    expect(tab('Senha')).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowRight}');
    expect(tab('Avisos')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(tab('Conta')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(tab('Avisos')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(tab('Conta')).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{End}');
    expect(tab('Avisos')).toHaveAttribute('aria-selected', 'true');
  });

  it('Tab a partir da aba vai para o painel ativo', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.tab();
    expect(screen.getByRole('tabpanel')).toHaveFocus();
  });

  it('manual: setas só movem o foco; Enter ativa', async () => {
    const user = userEvent.setup();
    render(<Example activation="manual" />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(tab('Senha')).toHaveFocus();
    expect(tab('Conta')).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Enter}');
    expect(tab('Senha')).toHaveAttribute('aria-selected', 'true');
  });

  it('vertical usa setas para cima e para baixo', async () => {
    const user = userEvent.setup();
    render(<Example orientation="vertical" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(tab('Conta')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(tab('Senha')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(tab('Conta')).toHaveFocus();
  });

  it('controlado só muda quando o pai atualiza', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<Example value="conta" onValueChange={onValueChange} />);
    await user.click(tab('Avisos'));
    expect(onValueChange).toHaveBeenCalledWith('avisos');
    expect(tab('Conta')).toHaveAttribute('aria-selected', 'true');
    rerender(<Example value="avisos" onValueChange={onValueChange} />);
    expect(tab('Avisos')).toHaveAttribute('aria-selected', 'true');
  });

  it('aba desabilitada não é selecionável', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(tab('Beta'));
    expect(tab('Beta')).toBeDisabled();
    expect(tab('Conta')).toHaveAttribute('aria-selected', 'true');
  });

  it('mostra o indicador só na aba ativa e aplica a variante', () => {
    const { container } = render(<Example variant="pills" />);
    const indicators = container.querySelectorAll('.sk-tabs__indicator');
    expect(indicators).toHaveLength(1);
    expect(tab('Conta')).toContainElement(indicators[0] as HTMLElement);
    expect(container.firstElementChild).toHaveAttribute('data-variant', 'pills');
  });

  it('respeita handlers do usuário', async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    render(
      <Tabs defaultValue="a">
        <Tabs.List aria-label="x" onKeyDown={onKeyDown}>
          <Tabs.Tab value="a">A</Tabs.Tab>
          <Tabs.Tab value="b" onClick={(e) => e.preventDefault()}>
            B
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">a</Tabs.Panel>
        <Tabs.Panel value="b">b</Tabs.Panel>
      </Tabs>,
    );
    await user.click(tab('B'));
    expect(tab('A')).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Escape}');
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('repassa refs e classes', () => {
    const refs = {
      root: createRef<HTMLDivElement>(),
      list: createRef<HTMLDivElement>(),
      tab: createRef<HTMLButtonElement>(),
      panel: createRef<HTMLDivElement>(),
    };
    render(
      <Tabs ref={refs.root} defaultValue="a" className="r">
        <Tabs.List ref={refs.list} aria-label="x" className="l">
          <Tabs.Tab ref={refs.tab} value="a" className="t">
            A
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel ref={refs.panel} value="a" className="p">
          a
        </Tabs.Panel>
      </Tabs>,
    );
    expect(refs.root.current).toHaveClass('sk-tabs', 'r');
    expect(refs.list.current).toHaveClass('sk-tabs__list', 'l');
    expect(refs.tab.current).toHaveClass('sk-tabs__tab', 't');
    expect(refs.panel.current).toHaveClass('sk-tabs__panel', 'p');
  });

  it.each(['List', 'Tab', 'Panel'] as const)('Tabs.%s fora de Tabs lança erro', (part) => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Component = Tabs[part] as React.ComponentType<{ value: string }>;
    expect(() => render(<Component value="a" />)).toThrow(new RegExp(`Tabs.${part}`));
    consoleError.mockRestore();
  });

  it('não tem violações de acessibilidade', async () => {
    const { container } = render(<Example />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
