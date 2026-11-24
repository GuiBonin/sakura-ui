import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { axeViolations } from '../../../test/axe';
import { Avatar, getInitials } from './Avatar';

describe('getInitials', () => {
  it.each([
    ['Guilherme Bonin', 'GB'],
    ['ana maria da silva', 'AS'],
    ['  Lia  ', 'L'],
    ['', ''],
  ])('"%s" vira "%s"', (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});

describe('Avatar', () => {
  it('mostra a imagem com nome acessível vindo de name', () => {
    const { container } = render(<Avatar src="/foto.png" name="Ana Lima" />);
    expect(screen.getByRole('img', { name: 'Ana Lima' })).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', '/foto.png');
  });

  it('alt tem prioridade sobre name', () => {
    render(<Avatar src="/foto.png" name="Ana Lima" alt="Foto da Ana" />);
    expect(screen.getByRole('img', { name: 'Foto da Ana' })).toBeInTheDocument();
  });

  it('cai para as iniciais quando a imagem falha', () => {
    const { container } = render(<Avatar src="/quebrada.png" name="Ana Lima" />);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('volta a tentar quando src muda depois de uma falha', () => {
    const { container, rerender } = render(<Avatar src="/quebrada.png" name="Ana" />);
    fireEvent.error(container.querySelector('img')!);
    rerender(<Avatar src="/nova.png" name="Ana" />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/nova.png');
  });

  it('sem imagem e sem nome mostra ícone e rótulo genérico', () => {
    const { container } = render(<Avatar />);
    expect(screen.getByRole('img', { name: 'Avatar' })).toBeInTheDocument();
    expect(container.querySelector('.sk-avatar__icon')).toBeInTheDocument();
  });

  it('inclui o status no nome acessível', () => {
    const { container } = render(<Avatar name="Rui" status="busy" />);
    expect(screen.getByRole('img', { name: 'Rui, ocupado' })).toBeInTheDocument();
    expect(container.querySelector('.sk-avatar__status')).toHaveAttribute('data-status', 'busy');
  });

  it('aplica tamanho e formato', () => {
    render(<Avatar name="Rui" size="xl" shape="square" />);
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('data-size', 'xl');
    expect(avatar).toHaveAttribute('data-shape', 'square');
  });

  it('repassa ref e className', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} name="Rui" className="x" />);
    expect(ref.current).toBe(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveClass('sk-avatar', 'x');
  });

  it('não tem violações de acessibilidade', async () => {
    const { container } = render(
      <div>
        <Avatar src="/a.png" name="Ana" status="online" />
        <Avatar name="Rui" />
        <Avatar />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
