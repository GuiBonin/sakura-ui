import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { renderToString } from 'react-dom/server';
import { cx } from './cx';
import { getFocusable } from './focus';
import { Portal } from './Portal';
import { mergeRefs } from './refs';

describe('cx', () => {
  it('junta classes e ignora valores falsos', () => {
    const count: number = 0;
    expect(cx('a', false, null, undefined, '', 'b', count && 'c')).toBe('a b');
  });
});

describe('mergeRefs', () => {
  it('atribui o nó a refs de objeto e de função', () => {
    const objectRef = createRef<HTMLDivElement>();
    const fnRef = vi.fn();
    render(<div ref={mergeRefs(objectRef, fnRef, undefined)} data-testid="node" />);
    const node = screen.getByTestId('node');
    expect(objectRef.current).toBe(node);
    expect(fnRef).toHaveBeenCalledWith(node);
  });
});

describe('getFocusable', () => {
  it('lista só elementos focáveis, visíveis para leitores e habilitados', () => {
    render(
      <div data-testid="root">
        <button>a</button>
        <button disabled>b</button>
        <a href="#x">c</a>
        <input type="hidden" />
        <input aria-label="d" />
        <div role="button" tabIndex={0}>
          e
        </div>
        <div tabIndex={-1}>f</div>
        <div aria-hidden="true">
          <button>g</button>
        </div>
      </div>,
    );
    const labels = getFocusable(screen.getByTestId('root')).map(
      (element) => element.textContent || element.getAttribute('aria-label'),
    );
    expect(labels).toEqual(['a', 'c', 'd', 'e']);
  });
});

describe('Portal', () => {
  it('renderiza o conteúdo no body por padrão', () => {
    const { container } = render(
      <Portal>
        <p>no portal</p>
      </Portal>,
    );
    expect(container).not.toHaveTextContent('no portal');
    expect(document.body).toHaveTextContent('no portal');
  });

  it('renderiza em um container personalizado', () => {
    const target = document.createElement('section');
    document.body.appendChild(target);
    render(
      <Portal container={target}>
        <p>aqui</p>
      </Portal>,
    );
    expect(target).toHaveTextContent('aqui');
    target.remove();
  });

  it('não renderiza nada no servidor', () => {
    expect(renderToString(<Portal>conteúdo</Portal>)).toBe('');
  });
});
