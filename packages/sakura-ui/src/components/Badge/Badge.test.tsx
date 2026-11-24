import { render, screen } from '@testing-library/react';
import { Check } from 'lucide-react';
import { createRef } from 'react';
import { axeViolations } from '../../../test/axe';
import { Badge, type BadgeAppearance, type BadgeTone } from './Badge';

describe('Badge', () => {
  it('renderiza com padrões neutral, soft e md', () => {
    render(<Badge>Novo</Badge>);
    const badge = screen.getByText('Novo');
    expect(badge).toHaveAttribute('data-tone', 'neutral');
    expect(badge).toHaveAttribute('data-appearance', 'soft');
    expect(badge).toHaveAttribute('data-size', 'md');
  });

  it.each<BadgeTone>(['neutral', 'primary', 'accent', 'success', 'warning', 'danger'])(
    'aplica o tom %s',
    (tone) => {
      render(<Badge tone={tone}>x</Badge>);
      expect(screen.getByText('x')).toHaveAttribute('data-tone', tone);
    },
  );

  it.each<BadgeAppearance>(['soft', 'solid', 'outline'])('aplica a aparência %s', (appearance) => {
    render(<Badge appearance={appearance}>x</Badge>);
    expect(screen.getByText('x')).toHaveAttribute('data-appearance', appearance);
  });

  it('mostra ponto e ícone decorativos', () => {
    const { container } = render(
      <Badge dot icon={<Check data-testid="icone" />} size="sm">
        Pago
      </Badge>,
    );
    expect(container.querySelector('.sk-badge__dot')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('icone').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Pago')).toHaveAttribute('data-size', 'sm');
  });

  it('repassa ref, className e props', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Badge ref={ref} className="x" title="t">
        b
      </Badge>,
    );
    expect(ref.current).toBe(screen.getByText('b'));
    expect(screen.getByText('b')).toHaveClass('sk-badge', 'x');
    expect(screen.getByText('b')).toHaveAttribute('title', 't');
  });

  it('não tem violações de acessibilidade', async () => {
    const { container } = render(
      <Badge dot tone="success">
        Ativo
      </Badge>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
