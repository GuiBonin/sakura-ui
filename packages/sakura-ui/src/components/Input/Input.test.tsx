import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mail, Search } from 'lucide-react';
import { createRef, useState } from 'react';
import { axeViolations } from '../../../test/axe';
import { Input } from './Input';

describe('Input', () => {
  it('associa o rótulo ao campo', () => {
    render(<Input label="E-mail" />);
    expect(screen.getByLabelText('E-mail').tagName).toBe('INPUT');
  });

  it('usa o id recebido', () => {
    render(<Input id="email" label="E-mail" />);
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('id', 'email');
  });

  it('liga hint por aria-describedby', () => {
    render(<Input label="Senha" hint="Mínimo de 8 caracteres" />);
    const input = screen.getByLabelText('Senha');
    expect(input).toHaveAccessibleDescription('Mínimo de 8 caracteres');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('com erro marca aria-invalid e descreve hint e erro', () => {
    render(<Input label="Senha" hint="Mínimo de 8" error="Senha curta" />);
    const input = screen.getByLabelText('Senha');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Mínimo de 8 Senha curta');
    expect(input.closest('.sk-control')).toHaveAttribute('data-invalid', 'true');
  });

  it('preserva aria-describedby externo', () => {
    render(
      <>
        <p id="externo">Dica externa</p>
        <Input label="Nome" aria-describedby="externo" hint="interna" />
      </>,
    );
    expect(screen.getByLabelText('Nome')).toHaveAccessibleDescription('Dica externa interna');
  });

  it('aceita aria-invalid sem mensagem de erro', () => {
    render(<Input label="Nome" aria-invalid="true" />);
    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'true');
  });

  it('obrigatório: required no input e asterisco decorativo', () => {
    render(<Input label="Nome" required />);
    const input = screen.getByRole('textbox', { name: 'Nome' });
    expect(input).toBeRequired();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('não controlado: digita e chama onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input label="Nome" defaultValue="A" onChange={onChange} />);
    await user.type(screen.getByLabelText('Nome'), 'na');
    expect(screen.getByLabelText('Nome')).toHaveValue('Ana');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('controlado: reflete o estado do pai', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState('');
      return (
        <>
          <Input
            label="Busca"
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
          />
          <span data-testid="valor">{value}</span>
        </>
      );
    }
    render(<Controlled />);
    await user.type(screen.getByLabelText('Busca'), 'ab');
    expect(screen.getByLabelText('Busca')).toHaveValue('AB');
    expect(screen.getByTestId('valor')).toHaveTextContent('AB');
  });

  it('desabilitado não aceita digitação', async () => {
    const user = userEvent.setup();
    render(<Input label="Nome" disabled />);
    await user.type(screen.getByLabelText('Nome'), 'x');
    expect(screen.getByLabelText('Nome')).toHaveValue('');
    expect(screen.getByLabelText('Nome').closest('.sk-control')).toHaveAttribute(
      'data-disabled',
      'true',
    );
  });

  it('mostra ícones decorativos e aplica tamanho', () => {
    render(
      <Input
        label="Busca"
        size="lg"
        leftIcon={<Search data-testid="esq" />}
        rightIcon={<Mail data-testid="dir" />}
      />,
    );
    expect(screen.getByTestId('esq').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('dir').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByLabelText('Busca').closest('.sk-control')).toHaveAttribute(
      'data-size',
      'lg',
    );
  });

  it('repassa ref, className, wrapperClassName e props nativas', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Input
        ref={ref}
        aria-label="Telefone"
        type="tel"
        placeholder="(11) 99999-9999"
        className="campo"
        wrapperClassName="grupo"
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Telefone' });
    expect(ref.current).toBe(input);
    expect(input).toHaveClass('sk-input', 'campo');
    expect(input).toHaveAttribute('type', 'tel');
    expect(input.closest('.sk-field')).toHaveClass('grupo');
  });

  it('não tem violações de acessibilidade', async () => {
    const { container } = render(
      <div>
        <Input label="Nome" hint="Como no documento" required />
        <Input label="E-mail" error="E-mail inválido" />
        <Input aria-label="Busca" leftIcon={<Search />} />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
