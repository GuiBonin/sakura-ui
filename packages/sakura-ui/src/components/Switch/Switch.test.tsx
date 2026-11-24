import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { axeViolations } from '../../../test/axe';
import { Switch } from './Switch';

describe('Switch', () => {
  it('expõe role switch com aria-checked e alterna no clique', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="Modo escuro" onCheckedChange={onCheckedChange} />);
    const toggle = screen.getByRole('switch', { name: 'Modo escuro' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(toggle).toHaveAttribute('data-state', 'off');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toHaveAttribute('data-state', 'on');
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('o rótulo também alterna', async () => {
    const user = userEvent.setup();
    render(<Switch label="Wi-Fi" />);
    await user.click(screen.getByText('Wi-Fi'));
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('alterna com Espaço e Enter', async () => {
    const user = userEvent.setup();
    render(<Switch label="Som" />);
    await user.tab();
    await user.keyboard(' ');
    expect(screen.getByRole('switch')).toBeChecked();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('defaultChecked começa ligado', () => {
    render(<Switch label="x" defaultChecked />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('controlado só muda quando o pai atualiza', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <Switch label="x" checked={false} onCheckedChange={onCheckedChange} />,
    );
    await user.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('switch')).not.toBeChecked();
    rerender(<Switch label="x" checked onCheckedChange={onCheckedChange} />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('funciona com estado do pai', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [on, setOn] = useState(false);
      return <Switch label="x" checked={on} onCheckedChange={setOn} />;
    }
    render(<Controlled />);
    await user.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('onClick com preventDefault impede a troca', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(<Switch label="x" onClick={onClick} />);
    await user.click(screen.getByRole('switch'));
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('desabilitado não alterna', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="x" disabled onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('descrição vira aria-describedby', () => {
    render(<Switch label="Backup" description="Todo dia às 3h" />);
    expect(screen.getByRole('switch')).toHaveAccessibleDescription('Todo dia às 3h');
  });

  it('envia o valor no formulário só quando ligado', async () => {
    const user = userEvent.setup();
    render(
      <form data-testid="form">
        <Switch label="Avisos" name="avisos" value="sim" />
      </form>,
    );
    const form = screen.getByTestId('form') as HTMLFormElement;
    expect(new FormData(form).get('avisos')).toBeNull();
    await user.click(screen.getByRole('switch'));
    expect(new FormData(form).get('avisos')).toBe('sim');
  });

  it('não envia o formulário ao ser clicado', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    render(
      <form onSubmit={(event) => onSubmit(event.nativeEvent)}>
        <Switch label="x" />
      </form>,
    );
    await user.click(screen.getByRole('switch'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('repassa ref para o botão e className para o wrapper', () => {
    const ref = createRef<HTMLButtonElement>();
    const { container } = render(<Switch ref={ref} label="x" className="s" size="sm" />);
    expect(ref.current).toBe(screen.getByRole('switch'));
    expect(container.firstElementChild).toHaveClass('sk-switch', 's');
    expect(container.firstElementChild).toHaveAttribute('data-size', 'sm');
  });

  it('não tem violações de acessibilidade', async () => {
    const { container } = render(
      <div>
        <Switch label="A" description="desc" />
        <Switch aria-label="B" defaultChecked />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
