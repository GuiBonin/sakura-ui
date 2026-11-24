import { render } from '@testing-library/react';
import { createRef } from 'react';
import { axeViolations } from '../../../test/axe';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('fica oculto para leitores de tela e anima por padrão', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstElementChild!;
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton).toHaveAttribute('data-variant', 'text');
    expect(skeleton).toHaveAttribute('data-animated', 'true');
  });

  it.each(['text', 'rect', 'circle'] as const)('aplica a variante %s', (variant) => {
    const { container } = render(<Skeleton variant={variant} />);
    expect(container.firstElementChild).toHaveAttribute('data-variant', variant);
  });

  it('aplica largura e altura', () => {
    const { container } = render(<Skeleton width={120} height="2rem" />);
    expect(container.firstElementChild).toHaveStyle({ width: '120px', height: '2rem' });
  });

  it('desliga a animação quando pedido', () => {
    const { container } = render(<Skeleton animated={false} />);
    expect(container.firstElementChild).not.toHaveAttribute('data-animated');
  });

  it('gera várias linhas com a última mais curta', () => {
    const { container } = render(<Skeleton lines={3} width="50%" />);
    const group = container.firstElementChild!;
    expect(group).toHaveClass('sk-skeleton-group');
    expect(group).toHaveAttribute('aria-hidden', 'true');
    expect(group).toHaveStyle({ width: '50%' });
    const lines = group.querySelectorAll('.sk-skeleton');
    expect(lines).toHaveLength(3);
    expect(lines[2]).toHaveStyle({ width: '60%' });
  });

  it('repassa ref e className', () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(<Skeleton ref={ref} className="x" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current).toHaveClass('sk-skeleton', 'x');
  });

  it('não tem violações de acessibilidade dentro de um container ocupado', async () => {
    const { container } = render(
      <div aria-busy="true">
        <Skeleton variant="circle" />
        <Skeleton lines={2} />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
