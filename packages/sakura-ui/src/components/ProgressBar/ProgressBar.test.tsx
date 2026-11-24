import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { axeViolations } from '../../../test/axe';
import { ProgressBar } from './ProgressBar';

const fill = () => document.querySelector('.sk-progress__fill') as HTMLElement;

describe('ProgressBar', () => {
  it('expõe role progressbar com valores e rótulo visível', () => {
    render(<ProgressBar value={40} label="Upload" showValue />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(fill().style.transform).toBe('scaleX(0.4)');
  });

  it('calcula a porcentagem com max personalizado', () => {
    render(<ProgressBar value={3} max={4} aria-label="Etapas" showValue />);
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '4');
  });

  it('limita valores fora do intervalo', () => {
    const { rerender } = render(<ProgressBar value={150} aria-label="p" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    rerender(<ProgressBar value={-5} aria-label="p" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('usa 100 quando max é inválido', () => {
    render(<ProgressBar value={50} max={0} aria-label="p" showValue />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('fica indeterminada sem value', () => {
    render(<ProgressBar aria-label="Carregando" showValue />);
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAttribute('aria-busy', 'true');
    expect(bar).toHaveAttribute('data-indeterminate', 'true');
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(fill().style.transform).toBe('');
  });

  it('trata NaN como indeterminada', () => {
    render(<ProgressBar value={Number.NaN} aria-label="p" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('data-indeterminate', 'true');
  });

  it('repassa valueText para aria-valuetext', () => {
    render(<ProgressBar value={3} max={10} valueText="3 de 10 arquivos" aria-label="Arquivos" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '3 de 10 arquivos');
  });

  it('aplica tom e tamanho', () => {
    const { container } = render(<ProgressBar value={1} tone="success" size="lg" aria-label="p" />);
    expect(container.firstElementChild).toHaveAttribute('data-tone', 'success');
    expect(container.firstElementChild).toHaveAttribute('data-size', 'lg');
  });

  it('ref aponta para o elemento progressbar e className vai no container', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<ProgressBar ref={ref} value={1} aria-label="p" className="x" />);
    expect(ref.current).toBe(screen.getByRole('progressbar'));
    expect(container.firstElementChild).toHaveClass('sk-progress', 'x');
  });

  it('não tem violações de acessibilidade', async () => {
    const { container } = render(
      <div>
        <ProgressBar value={30} label="Perfil" showValue />
        <ProgressBar aria-label="Sincronizando" />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
