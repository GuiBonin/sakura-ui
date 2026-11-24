import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { axeViolations } from '../../../test/axe';
import { Card, CardBody, CardFooter, CardHeader } from './Card';

describe('Card', () => {
  it('compõe header, body e footer', () => {
    render(
      <Card data-testid="card">
        <Card.Header title="Plano Pro" description="Para equipes" action={<button>Menu</button>} />
        <Card.Body>Conteúdo</Card.Body>
        <Card.Footer>
          <button>Assinar</button>
        </Card.Footer>
      </Card>,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Plano Pro' })).toBeInTheDocument();
    expect(screen.getByText('Para equipes')).toHaveClass('sk-card__description');
    expect(screen.getByRole('button', { name: 'Menu' }).parentElement).toHaveClass(
      'sk-card__action',
    );
    expect(screen.getByText('Conteúdo')).toHaveClass('sk-card__body');
    expect(screen.getByRole('button', { name: 'Assinar' }).parentElement).toHaveClass(
      'sk-card__footer',
    );
  });

  it('expõe os subcomponentes também como exports nomeados', () => {
    expect(Card.Header).toBe(CardHeader);
    expect(Card.Body).toBe(CardBody);
    expect(Card.Footer).toBe(CardFooter);
  });

  it('usa padrões elevated e padding md', () => {
    render(<Card data-testid="card" />);
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('data-variant', 'elevated');
    expect(card).toHaveAttribute('data-padding', 'md');
    expect(card).not.toHaveAttribute('data-interactive');
  });

  it.each(['elevated', 'outlined', 'filled'] as const)('aplica a variante %s', (variant) => {
    render(<Card data-testid="card" variant={variant} />);
    expect(screen.getByTestId('card')).toHaveAttribute('data-variant', variant);
  });

  it('marca o card interativo e o padding', () => {
    render(<Card data-testid="card" interactive padding="lg" />);
    expect(screen.getByTestId('card')).toHaveAttribute('data-interactive', 'true');
    expect(screen.getByTestId('card')).toHaveAttribute('data-padding', 'lg');
  });

  it('permite mudar o nível do título e colocar conteúdo livre no header', () => {
    render(
      <Card.Header title="Título" headingLevel={2}>
        <span>extra</span>
      </Card.Header>,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Título');
    expect(screen.getByText('extra')).toBeInTheDocument();
  });

  it('repassa refs e classes em todas as partes', () => {
    const refs = {
      root: createRef<HTMLDivElement>(),
      header: createRef<HTMLDivElement>(),
      body: createRef<HTMLDivElement>(),
      footer: createRef<HTMLDivElement>(),
    };
    render(
      <Card ref={refs.root} className="r">
        <Card.Header ref={refs.header} className="h" />
        <Card.Body ref={refs.body} className="b" />
        <Card.Footer ref={refs.footer} className="f" />
      </Card>,
    );
    expect(refs.root.current).toHaveClass('sk-card', 'r');
    expect(refs.header.current).toHaveClass('sk-card__header', 'h');
    expect(refs.body.current).toHaveClass('sk-card__body', 'b');
    expect(refs.footer.current).toHaveClass('sk-card__footer', 'f');
  });

  it('não tem violações de acessibilidade', async () => {
    const { container } = render(
      <Card>
        <Card.Header title="Resumo" description="Últimos 30 dias" />
        <Card.Body>Texto</Card.Body>
      </Card>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
