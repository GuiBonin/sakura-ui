import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { axeViolations } from '../../../test/axe';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('anuncia "Carregando" com role status', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
  });

  it('aceita rótulo personalizado', () => {
    render(<Spinner label="Buscando pedidos" />);
    expect(screen.getByRole('status')).toHaveTextContent('Buscando pedidos');
  });

  it.each(['sm', 'md', 'lg'] as const)('aplica o tamanho %s', (size) => {
    render(<Spinner size={size} />);
    expect(screen.getByRole('status')).toHaveAttribute('data-size', size);
  });

  it('decorativo fica oculto para leitores de tela', () => {
    const { container } = render(<Spinner decorative />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    expect(container).not.toHaveTextContent('Carregando');
  });

  it('repassa ref, className e props', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} className="x" data-testid="s" />);
    expect(ref.current).toBe(screen.getByTestId('s'));
    expect(screen.getByTestId('s')).toHaveClass('sk-spinner', 'x');
  });

  it('não tem violações de acessibilidade', async () => {
    const { container } = render(<Spinner />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
