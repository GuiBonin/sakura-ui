import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Heart } from 'lucide-react';
import { createRef } from 'react';
import { axeViolations } from '../../../test/axe';
import { Button, type ButtonSize, type ButtonVariant } from './Button';

describe('Button', () => {
  it('renderiza um botão nativo com type="button" por padrão', () => {
    render(<Button>Salvar</Button>);
    const button = screen.getByRole('button', { name: 'Salvar' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-variant', 'solid');
    expect(button).toHaveAttribute('data-size', 'md');
  });

  it('aceita type="submit" e envia o formulário', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    render(
      <form onSubmit={(event) => onSubmit(event.nativeEvent as SubmitEvent)}>
        <Button type="submit">Enviar</Button>
      </form>,
    );
    await user.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it.each<ButtonVariant>(['solid', 'soft', 'outline', 'ghost', 'danger'])(
    'aplica a variante %s',
    (variant) => {
      render(<Button variant={variant}>x</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', variant);
    },
  );

  it.each<ButtonSize>(['sm', 'md', 'lg'])('aplica o tamanho %s', (size) => {
    render(<Button size={size}>x</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', size);
  });

  it('chama onClick e funciona por teclado (Enter e Espaço)', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Ok</Button>);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('desabilitado não dispara onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Ok
      </Button>,
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('em loading mostra spinner, marca aria-busy e bloqueia cliques sem perder o foco', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick} leftIcon={<Heart data-testid="icone" />}>
        Salvando
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Salvando' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    expect(button.querySelector('.sk-spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('icone')).not.toBeInTheDocument();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
    button.focus();
    expect(button).toHaveFocus();
  });

  it('loadingText substitui o nome acessível durante o carregamento', () => {
    const { rerender } = render(
      <Button loading loadingText="Enviando dados">
        Enviar
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveAccessibleName('Enviando dados');
    expect(screen.getByText('Enviar')).toBeVisible();

    rerender(<Button loadingText="Enviando dados">Enviar</Button>);
    expect(screen.getByRole('button')).toHaveAccessibleName('Enviar');
  });

  it('renderiza ícones à esquerda e à direita ocultos para leitores de tela', () => {
    render(
      <Button leftIcon={<Heart data-testid="esq" />} rightIcon={<Heart data-testid="dir" />}>
        Curtir
      </Button>,
    );
    expect(screen.getByTestId('esq').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('dir').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button')).toHaveAccessibleName('Curtir');
  });

  it('iconOnly usa aria-label como nome acessível', () => {
    render(
      <Button iconOnly aria-label="Favoritar">
        <Heart />
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Favoritar' });
    expect(button).toHaveAttribute('data-icon-only', 'true');
  });

  it('iconOnly em loading esconde o ícone e mantém o nome', () => {
    render(
      <Button iconOnly loading aria-label="Favoritar">
        <Heart data-testid="icone" />
      </Button>,
    );
    expect(screen.queryByTestId('icone')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Favoritar' })).toBeInTheDocument();
  });

  it('fullWidth, className, ref e props extras são repassados', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} fullWidth className="extra" data-testid="b" title="dica">
        x
      </Button>,
    );
    const button = screen.getByTestId('b');
    expect(ref.current).toBe(button);
    expect(button).toHaveClass('sk-button', 'extra');
    expect(button).toHaveAttribute('data-full-width', 'true');
    expect(button).toHaveAttribute('title', 'dica');
  });

  it('não tem violações de acessibilidade', async () => {
    const { container } = render(
      <div>
        <Button>Normal</Button>
        <Button loading>Carregando</Button>
        <Button iconOnly aria-label="Curtir">
          <Heart />
        </Button>
        <Button disabled>Desabilitado</Button>
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
