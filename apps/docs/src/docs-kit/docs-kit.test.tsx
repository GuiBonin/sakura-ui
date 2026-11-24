import { SakuraProvider } from '@guibonin/sakura-ui';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  PREFERS_REDUCED_MOTION,
  setMediaQuery,
} from '../../../../packages/sakura-ui/test/matchMedia';
import { useComponentFakeTimers } from '../../../../packages/sakura-ui/test/timers';
import { copyToClipboard } from './clipboard';
import { CodeBlock } from './CodeBlock';
import { CopyButton } from './CopyButton';
import { toJsx } from './jsx';
import { Petals, petals } from './Petals';
import { Playground, initialValues, type Control } from './Playground';
import { PropsTable } from './PropsTable';

function mockClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn(writeText) },
  });
  return navigator.clipboard.writeText as ReturnType<typeof vi.fn>;
}

function removeClipboard() {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
}

function mockExecCommand(impl: () => boolean) {
  const fn = vi.fn(impl);
  Object.defineProperty(document, 'execCommand', { configurable: true, value: fn });
  return fn;
}

afterEach(() => {
  removeClipboard();
  // @ts-expect-error limpando o mock entre testes
  delete document.execCommand;
  vi.useRealTimers();
});

describe('copyToClipboard', () => {
  it('usa a Clipboard API quando disponível', async () => {
    const writeText = mockClipboard(() => Promise.resolve());
    await expect(copyToClipboard('npm i')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('npm i');
  });

  it('cai para execCommand quando a Clipboard API falha', async () => {
    mockClipboard(() => Promise.reject(new Error('negado')));
    const exec = mockExecCommand(() => true);
    await expect(copyToClipboard('texto')).resolves.toBe(true);
    expect(exec).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('cai para execCommand quando não há Clipboard API e devolve o foco', async () => {
    removeClipboard();
    mockExecCommand(() => true);
    const button = document.createElement('button');
    document.body.appendChild(button);
    button.focus();
    await expect(copyToClipboard('texto')).resolves.toBe(true);
    expect(button).toHaveFocus();
    button.remove();
  });

  it('devolve false quando nada funciona', async () => {
    removeClipboard();
    await expect(copyToClipboard('x')).resolves.toBe(false);
    mockExecCommand(() => {
      throw new Error('bloqueado');
    });
    await expect(copyToClipboard('x')).resolves.toBe(false);
  });
});

describe('CopyButton', () => {
  it('mostra "Copiado!", anuncia e volta ao normal depois de 2s', async () => {
    useComponentFakeTimers({ shouldAdvanceTime: true });
    mockClipboard(() => Promise.resolve());
    render(<CopyButton text="abc" />);
    const button = screen.getByRole('button', { name: 'Copiar código' });
    await act(async () => fireEvent.click(button));
    expect(button).toHaveAttribute('data-status', 'copied');
    expect(screen.getByRole('status')).toHaveTextContent('Copiado!');
    act(() => vi.advanceTimersByTime(2000));
    expect(button).toHaveAttribute('data-status', 'idle');
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('avisa quando não consegue copiar', async () => {
    removeClipboard();
    render(<CopyButton text="abc" label="Copiar comando" />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Copiar comando' })));
    expect(screen.getByRole('status')).toHaveTextContent('Não foi possível copiar');
  });
});

describe('toJsx', () => {
  it('gera tag com filhos e omite valores padrão, falsos e indefinidos', () => {
    expect(
      toJsx(
        'Button',
        { variant: 'soft', size: 'md', disabled: true, loading: false, hint: undefined },
        'Salvar',
        { size: 'md' },
      ),
    ).toBe('<Button variant="soft" disabled>Salvar</Button>');
  });

  it('gera tag autofechada, números, expressões e escapa aspas', () => {
    expect(toJsx('Input', { max: 5, options: { expr: 'cores' }, label: 'Diga "oi"' })).toBe(
      '<Input max={5} options={cores} label="Diga &quot;oi&quot;" />',
    );
    expect(toJsx('Spinner', {})).toBe('<Spinner />');
  });

  it('quebra as props em linhas quando a tag fica longa', () => {
    const code = toJsx('Input', {
      label: 'Endereço de e-mail corporativo',
      placeholder: 'nome.sobrenome@empresa.com.br',
      hint: 'Usado para login',
    });
    expect(code).toBe(
      '<Input\n  label="Endereço de e-mail corporativo"\n  placeholder="nome.sobrenome@empresa.com.br"\n  hint="Usado para login"\n/>',
    );
    expect(toJsx('Card', { label: 'x'.repeat(80) }, 'oi')).toBe(
      `<Card\n  label="${'x'.repeat(80)}"\n>oi</Card>`,
    );
  });
});

describe('CodeBlock', () => {
  it('mostra o código com realce, título e botão que copia o texto sem espaços sobrando', async () => {
    const writeText = mockClipboard(() => Promise.resolve());
    render(<CodeBlock code={'\n  const a = 1;\n'} title="exemplo.ts" />);
    expect(screen.getByText('exemplo.ts')).toBeInTheDocument();
    expect(document.querySelector('pre')).toHaveTextContent('const a = 1;');
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Copiar código' })));
    expect(writeText).toHaveBeenCalledWith('const a = 1;');
  });

  it('usa a linguagem como título e pode esconder o botão', () => {
    render(<CodeBlock code="npm i" language="bash" noCopy />);
    expect(screen.getByText('bash')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('Playground', () => {
  const controls: Control[] = [
    { type: 'select', prop: 'tone', label: 'tone', options: ['a', 'b'], default: 'a' },
    { type: 'boolean', prop: 'on', label: 'on', default: false },
    { type: 'text', prop: 'text', label: 'text', default: 'Olá' },
    { type: 'number', prop: 'n', label: 'n', default: 2, min: 0, max: 9 },
  ];

  it('initialValues pega os padrões', () => {
    expect(initialValues(controls)).toEqual({ tone: 'a', on: false, text: 'Olá', n: 2 });
  });

  it('cada controle atualiza a prévia e o código', async () => {
    const user = userEvent.setup();
    render(
      <SakuraProvider>
        <Playground
          controls={controls}
          render={(v) => <output data-testid="preview">{JSON.stringify(v)}</output>}
          code={(v) => `code:${v.tone}|${v.on}|${v.text}|${v.n}`}
        />
      </SakuraProvider>,
    );
    const preview = () => JSON.parse(screen.getByTestId('preview').textContent!);
    expect(screen.getByRole('heading', { name: 'Playground' })).toBeInTheDocument();
    expect(document.querySelector('pre')).toHaveTextContent('code:a|false|Olá|2');

    await user.click(screen.getByRole('combobox', { name: /tone/ }));
    await user.click(screen.getByRole('option', { name: 'b' }));
    await user.click(screen.getByRole('switch', { name: 'on' }));
    await user.clear(screen.getByRole('textbox', { name: 'text' }));
    await user.type(screen.getByRole('textbox', { name: 'text' }), 'Oi');
    await user.clear(screen.getByRole('spinbutton', { name: 'n' }));
    expect(preview().n).toBeUndefined();
    await user.type(screen.getByRole('spinbutton', { name: 'n' }), '7');

    expect(preview()).toEqual({ tone: 'b', on: true, text: 'Oi', n: 7 });
    expect(document.querySelector('pre')).toHaveTextContent('code:b|true|Oi|7');
  });

  it('o formulário de controles não recarrega a página', () => {
    render(
      <SakuraProvider>
        <Playground controls={[]} render={() => null} code={() => ''} />
      </SakuraProvider>,
    );
    const form = screen.getByRole('form', { name: 'Propriedades' });
    const event = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});

describe('PropsTable', () => {
  it('lista props com tipo, padrão e obrigatoriedade', () => {
    render(
      <PropsTable
        caption="Props do Teste"
        props={[
          { name: 'size', type: "'sm'", default: "'sm'", description: 'Tamanho.' },
          { name: 'title', type: 'string', required: true, description: 'Título.' },
        ]}
      />,
    );
    expect(screen.getByRole('table', { name: 'Props do Teste' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: /title.*obrigatória/ })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('Petals', () => {
  it('é decorativo e anima quando o sistema permite', () => {
    const { container } = render(<Petals />);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).not.toHaveAttribute('data-reduced');
    expect(root.querySelectorAll('.docs-petal')).toHaveLength(petals.length);
  });

  it('fica parado com movimento reduzido', () => {
    setMediaQuery(PREFERS_REDUCED_MOTION, true);
    const { container } = render(<Petals />);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute('data-reduced', 'true');
    const first = root.querySelector<HTMLElement>('.docs-petal')!;
    expect(first.style.top).not.toBe('-5%');
    expect(first.style.transform).toBe('');
  });

  it('gera pétalas determinísticas dentro da área', () => {
    for (const petal of petals) {
      expect(petal.left).toBeGreaterThanOrEqual(0);
      expect(petal.left).toBeLessThan(100);
      expect(petal.size).toBeGreaterThanOrEqual(10);
    }
  });
});
