import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { PREFERS_REDUCED_MOTION, setMediaQuery } from '../../test/matchMedia';
import { useClickOutside } from './useClickOutside';
import { useControllableState } from './useControllableState';
import { useEscape } from './useEscape';
import { useFocusTrap } from './useFocusTrap';
import { useMediaQuery, usePrefersReducedMotion } from './useMediaQuery';
import { useScrollLock } from './useScrollLock';

describe('useControllableState', () => {
  it('não controlado: começa no defaultValue e atualiza', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));
    expect(result.current[0]).toBe(1);
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('aceita função atualizadora', () => {
    const { result } = renderHook(() => useControllableState({ defaultValue: 1 }));
    act(() => result.current[1]((previous) => previous + 10));
    expect(result.current[0]).toBe(11);
  });

  it('não chama onChange quando o valor não muda', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 'a', onChange }));
    act(() => result.current[1]('a'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('controlado: mantém o valor recebido e só avisa o pai', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useControllableState({ value, defaultValue: 0, onChange }),
      { initialProps: { value: 5 } },
    );
    act(() => result.current[1](6));
    expect(onChange).toHaveBeenCalledWith(6);
    expect(result.current[0]).toBe(5);
    rerender({ value: 6 });
    expect(result.current[0]).toBe(6);
  });
});

describe('useMediaQuery e usePrefersReducedMotion', () => {
  it('reflete a media query e reage a mudanças', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 600px)'));
    expect(result.current).toBe(false);
    act(() => setMediaQuery('(min-width: 600px)', true));
    expect(result.current).toBe(true);
  });

  it('detecta preferência por movimento reduzido', () => {
    setMediaQuery(PREFERS_REDUCED_MOTION, true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('devolve false quando matchMedia não existe', () => {
    const original = window.matchMedia;
    // @ts-expect-error simulando ambiente sem matchMedia
    delete window.matchMedia;
    const { result } = renderHook(() => useMediaQuery('(min-width: 1px)'));
    expect(result.current).toBe(false);
    window.matchMedia = original;
  });
});

describe('useEscape', () => {
  it('chama o handler com Esc e ignora outras teclas', () => {
    const handler = vi.fn();
    renderHook(() => useEscape(handler));
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(handler).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('não chama quando inativo', () => {
    const handler = vi.fn();
    renderHook(() => useEscape(handler, false));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('usa sempre o handler mais recente', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ handler }) => useEscape(handler), {
      initialProps: { handler: first },
    });
    rerender({ handler: second });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalled();
  });
});

describe('useClickOutside', () => {
  function Box({ onOutside, active = true }: { onOutside: () => void; active?: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    useClickOutside([ref], onOutside, active);
    return (
      <div>
        <div ref={ref}>
          <span>dentro</span>
        </div>
        <span>fora</span>
      </div>
    );
  }

  it('dispara só para cliques fora', () => {
    const onOutside = vi.fn();
    render(<Box onOutside={onOutside} />);
    fireEvent.pointerDown(screen.getByText('dentro'));
    expect(onOutside).not.toHaveBeenCalled();
    fireEvent.pointerDown(screen.getByText('fora'));
    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  it('não dispara quando inativo', () => {
    const onOutside = vi.fn();
    render(<Box onOutside={onOutside} active={false} />);
    fireEvent.pointerDown(screen.getByText('fora'));
    expect(onOutside).not.toHaveBeenCalled();
  });
});

describe('useFocusTrap', () => {
  function Trap({ withInitial = false }: { withInitial?: boolean }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const initial = useRef<HTMLButtonElement>(null);
    useFocusTrap(ref, open, withInitial ? { initialFocus: initial } : {});
    return (
      <div>
        <button onClick={() => setOpen(true)}>abrir</button>
        {open && (
          <div ref={ref} tabIndex={-1}>
            <button>primeiro</button>
            <button ref={initial}>segundo</button>
            <button onClick={() => setOpen(false)}>fechar</button>
          </div>
        )}
      </div>
    );
  }

  it('foca o primeiro elemento, circula com Tab e Shift+Tab e devolve o foco', async () => {
    const user = userEvent.setup();
    render(<Trap />);
    const opener = screen.getByRole('button', { name: 'abrir' });
    await user.click(opener);
    expect(screen.getByRole('button', { name: 'primeiro' })).toHaveFocus();

    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'fechar' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'primeiro' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'fechar' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'fechar' }));
    expect(opener).toHaveFocus();
  });

  it('respeita initialFocus', async () => {
    const user = userEvent.setup();
    render(<Trap withInitial />);
    await user.click(screen.getByRole('button', { name: 'abrir' }));
    expect(screen.getByRole('button', { name: 'segundo' })).toHaveFocus();
  });

  it('foca o container quando não há elementos focáveis', () => {
    function Empty() {
      const ref = useRef<HTMLDivElement>(null);
      useFocusTrap(ref, true);
      return (
        <div ref={ref} tabIndex={-1} data-testid="box">
          texto
        </div>
      );
    }
    render(<Empty />);
    const box = screen.getByTestId('box');
    expect(box).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(box).toHaveFocus();
  });
});

describe('useScrollLock', () => {
  it('trava o body e libera só quando o último overlay fecha', () => {
    document.body.style.overflow = 'auto';
    const first = renderHook(({ active }) => useScrollLock(active), {
      initialProps: { active: true },
    });
    const second = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');

    first.rerender({ active: false });
    expect(document.body.style.overflow).toBe('hidden');

    second.unmount();
    expect(document.body.style.overflow).toBe('auto');
    first.unmount();
    document.body.style.overflow = '';
  });
});
