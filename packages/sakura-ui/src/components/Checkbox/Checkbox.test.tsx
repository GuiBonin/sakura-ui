import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { axeViolations } from '../../../test/axe';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('é um checkbox nativo com rótulo clicável', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Aceito os termos" onCheckedChange={onCheckedChange} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Aceito os termos' });
    expect(checkbox).not.toBeChecked();

    await user.click(screen.getByText('Aceito os termos'));
    expect(checkbox).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it('alterna com Espaço', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Opção" />);
    await user.tab();
    expect(screen.getByRole('checkbox')).toHaveFocus();
    await user.keyboard(' ');
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('chama onChange nativo junto com onCheckedChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Opção" onChange={onChange} />);
    await user.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('controlado: segue o estado do pai', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [checked, setChecked] = useState(true);
      return <Checkbox label="Notificar" checked={checked} onCheckedChange={setChecked} />;
    }
    render(<Controlled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('defaultChecked funciona sem controle', () => {
    render(<Checkbox label="Opção" defaultChecked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('indeterminado é exposto como estado misto e atualiza', () => {
    const { rerender } = render(<Checkbox label="Todos" indeterminate />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
    expect(checkbox).toBePartiallyChecked();
    rerender(<Checkbox label="Todos" indeterminate={false} />);
    expect(checkbox.indeterminate).toBe(false);
  });

  it('desabilitado não muda', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Opção" disabled />);
    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('descrição vira aria-describedby, somando o externo', () => {
    render(
      <>
        <p id="ext">extra</p>
        <Checkbox label="Newsletter" description="Uma vez por semana" aria-describedby="ext" />
      </>,
    );
    expect(screen.getByRole('checkbox')).toHaveAccessibleDescription('extra Uma vez por semana');
  });

  it('envia o valor no formulário', () => {
    render(
      <form data-testid="form">
        <Checkbox label="Opção" name="termos" value="sim" defaultChecked />
      </form>,
    );
    const data = new FormData(screen.getByTestId('form') as HTMLFormElement);
    expect(data.get('termos')).toBe('sim');
  });

  it('repassa ref para o input e className para o wrapper', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(<Checkbox ref={ref} label="x" className="c" size="sm" />);
    expect(ref.current).toBe(screen.getByRole('checkbox'));
    expect(container.firstElementChild).toHaveClass('sk-checkbox', 'c');
    expect(container.firstElementChild).toHaveAttribute('data-size', 'sm');
  });

  it('não tem violações de acessibilidade', async () => {
    const { container } = render(
      <div>
        <Checkbox label="A" description="desc" />
        <Checkbox label="B" indeterminate />
        <Checkbox aria-label="C" />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
