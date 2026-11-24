import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { axeViolations } from '../../../test/axe';
import { Accordion, type AccordionProps } from './Accordion';

function Faq(props: Partial<AccordionProps>) {
  return (
    <Accordion {...(props as AccordionProps)}>
      <Accordion.Item value="a" title="Como instalar?">
        npm install
      </Accordion.Item>
      <Accordion.Item value="b" title="Tem tema escuro?">
        Sim
      </Accordion.Item>
      <Accordion.Item value="c" title="Bloqueado" disabled>
        x
      </Accordion.Item>
      <Accordion.Item value="d" title="Licença?">
        MIT
      </Accordion.Item>
    </Accordion>
  );
}

const header = (name: string) => screen.getByRole('button', { name });
const panelOf = (name: string) =>
  document.getElementById(header(name).getAttribute('aria-controls')!)!;

describe('Accordion', () => {
  it('cabeçalhos são botões dentro de títulos, ligados às regiões', () => {
    render(<Faq />);
    const button = header('Como instalar?');
    expect(button.parentElement?.tagName).toBe('H3');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    const panel = panelOf('Como instalar?');
    expect(panel).toHaveAttribute('role', 'region');
    expect(panel).toHaveAttribute('aria-labelledby', button.id);
    expect(panel).toHaveAttribute('data-state', 'closed');
    expect(panel).toHaveAttribute('inert');
  });

  it('single: abrir um fecha o outro e é colapsável por padrão', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Faq onValueChange={onValueChange} />);
    await user.click(header('Como instalar?'));
    expect(header('Como instalar?')).toHaveAttribute('aria-expanded', 'true');
    expect(panelOf('Como instalar?')).not.toHaveAttribute('inert');
    expect(onValueChange).toHaveBeenLastCalledWith('a');

    await user.click(header('Tem tema escuro?'));
    expect(header('Como instalar?')).toHaveAttribute('aria-expanded', 'false');
    expect(header('Tem tema escuro?')).toHaveAttribute('aria-expanded', 'true');

    await user.click(header('Tem tema escuro?'));
    expect(header('Tem tema escuro?')).toHaveAttribute('aria-expanded', 'false');
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it('single com collapsible=false mantém um aberto', async () => {
    const user = userEvent.setup();
    render(<Faq defaultValue="a" collapsible={false} />);
    await user.click(header('Como instalar?'));
    expect(header('Como instalar?')).toHaveAttribute('aria-expanded', 'true');
  });

  it('multiple: vários abertos ao mesmo tempo', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Faq type="multiple" defaultValue={['a']} onValueChange={onValueChange} />);
    await user.click(header('Tem tema escuro?'));
    expect(header('Como instalar?')).toHaveAttribute('aria-expanded', 'true');
    expect(header('Tem tema escuro?')).toHaveAttribute('aria-expanded', 'true');
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b']);
    await user.click(header('Como instalar?'));
    expect(onValueChange).toHaveBeenLastCalledWith(['b']);
  });

  it('controlado segue o valor do pai', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<Faq value="a" onValueChange={onValueChange} />);
    await user.click(header('Licença?'));
    expect(onValueChange).toHaveBeenCalledWith('d');
    expect(header('Licença?')).toHaveAttribute('aria-expanded', 'false');
    rerender(<Faq value="d" onValueChange={onValueChange} />);
    expect(header('Licença?')).toHaveAttribute('aria-expanded', 'true');
  });

  it('teclado: Enter/Espaço alternam; setas, Home e End movem entre cabeçalhos', async () => {
    const user = userEvent.setup();
    render(<Faq />);
    await user.tab();
    expect(header('Como instalar?')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(header('Como instalar?')).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard(' ');
    expect(header('Como instalar?')).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard('{ArrowDown}');
    expect(header('Tem tema escuro?')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(header('Licença?')).toHaveFocus(); // pula o desabilitado
    await user.keyboard('{ArrowDown}');
    expect(header('Como instalar?')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(header('Licença?')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(header('Como instalar?')).toHaveFocus();
    await user.keyboard('{End}');
    expect(header('Licença?')).toHaveFocus();
  });

  it('ignora teclas vindas de dentro do conteúdo', async () => {
    const user = userEvent.setup();
    render(
      <Accordion defaultValue="a">
        <Accordion.Item value="a" title="A">
          <input aria-label="campo" />
        </Accordion.Item>
        <Accordion.Item value="b" title="B">
          b
        </Accordion.Item>
      </Accordion>,
    );
    await user.click(screen.getByLabelText('campo'));
    await user.keyboard('{ArrowDown}');
    expect(screen.getByLabelText('campo')).toHaveFocus();
  });

  it('item desabilitado não abre', async () => {
    const user = userEvent.setup();
    render(<Faq />);
    await user.click(header('Bloqueado'));
    expect(header('Bloqueado')).toBeDisabled();
    expect(header('Bloqueado')).toHaveAttribute('aria-expanded', 'false');
  });

  it('muda o nível do título e repassa ref, className e onKeyDown', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    const itemRef = createRef<HTMLDivElement>();
    const onKeyDown = vi.fn();
    render(
      <Accordion ref={ref} headingLevel={4} className="acc" onKeyDown={onKeyDown}>
        <Accordion.Item ref={itemRef} value="a" title="A" className="it">
          a
        </Accordion.Item>
      </Accordion>,
    );
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
    expect(ref.current).toHaveClass('sk-accordion', 'acc');
    expect(ref.current).not.toHaveAttribute('collapsible');
    expect(itemRef.current).toHaveClass('sk-accordion__item', 'it');
    await user.tab();
    await user.keyboard('x');
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('Item fora do Accordion lança erro', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Accordion.Item value="a" title="x" />)).toThrow(/dentro de <Accordion>/);
    consoleError.mockRestore();
  });

  it('não tem violações de acessibilidade', async () => {
    const { container } = render(<Faq defaultValue="a" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
