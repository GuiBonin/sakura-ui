import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { axeViolations } from '../../../test/axe';
import { Select, type SelectOption } from './Select';

const frutas: SelectOption[] = [
  { value: 'abacaxi', label: 'Abacaxi' },
  { value: 'banana', label: 'Banana' },
  { value: 'cereja', label: 'Cereja', disabled: true },
  { value: 'damasco', label: 'Damasco' },
  { value: 'amora', label: 'Amora', description: 'Fruta vermelha' },
];

const combobox = () => screen.getByRole('combobox');
const activeOption = () => {
  const id = combobox().getAttribute('aria-activedescendant');
  return id ? document.getElementById(id) : null;
};

async function setup(props: Partial<React.ComponentProps<typeof Select>> = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  const utils = render(
    <Select label="Fruta" options={frutas} onValueChange={onValueChange} {...props} />,
  );
  return { user, onValueChange, ...utils };
}

describe('Select', () => {
  it('renderiza combobox fechado com placeholder e rótulo', async () => {
    await setup();
    const trigger = combobox();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAccessibleName('Fruta Selecione uma opção');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('abre no clique, seleciona com o mouse e fecha', async () => {
    const { user, onValueChange } = await setup();
    await user.click(combobox());
    expect(combobox()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toHaveAccessibleName('Fruta');

    await user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onValueChange).toHaveBeenCalledWith('banana');
    expect(combobox()).toHaveAttribute('aria-expanded', 'false');
    expect(combobox()).toHaveAccessibleName('Fruta Banana');
    expect(combobox()).toHaveFocus();
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('clicar no gatilho aberto fecha a lista', async () => {
    const { user } = await setup();
    await user.click(combobox());
    await user.click(combobox());
    expect(combobox()).toHaveAttribute('aria-expanded', 'false');
  });

  it('ignora clique em opção desabilitada', async () => {
    const { user, onValueChange } = await setup();
    await user.click(combobox());
    const cereja = screen.getByRole('option', { name: 'Cereja' });
    expect(cereja).toHaveAttribute('aria-disabled', 'true');
    await user.click(cereja);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(combobox()).toHaveAttribute('aria-expanded', 'true');
  });

  it('marca a opção selecionada com aria-selected', async () => {
    const { user } = await setup({ defaultValue: 'damasco' });
    await user.click(combobox());
    expect(screen.getByRole('option', { name: 'Damasco' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  describe('teclado com a lista fechada', () => {
    it.each(['{ArrowDown}', '{Enter}', ' ', '{ArrowUp}'])(
      '%s abre na opção selecionada',
      async (key) => {
        const { user } = await setup({ defaultValue: 'damasco' });
        combobox().focus();
        await user.keyboard(key);
        expect(combobox()).toHaveAttribute('aria-expanded', 'true');
        expect(activeOption()).toHaveTextContent('Damasco');
      },
    );

    it('ArrowDown sem seleção abre na primeira opção habilitada', async () => {
      const { user } = await setup();
      combobox().focus();
      await user.keyboard('{ArrowDown}');
      expect(activeOption()).toHaveTextContent('Abacaxi');
    });

    it('Home e End abrem na primeira e na última', async () => {
      const { user } = await setup();
      combobox().focus();
      await user.keyboard('{End}');
      expect(activeOption()).toHaveTextContent('Amora');
      await user.keyboard('{Escape}{Home}');
      expect(activeOption()).toHaveTextContent('Abacaxi');
    });

    it('digitar uma letra abre na opção correspondente', async () => {
      const { user } = await setup();
      combobox().focus();
      await user.keyboard('d');
      expect(combobox()).toHaveAttribute('aria-expanded', 'true');
      expect(activeOption()).toHaveTextContent('Damasco');
    });

    it('letra sem correspondência abre na opção inicial', async () => {
      const { user } = await setup();
      combobox().focus();
      await user.keyboard('z');
      expect(activeOption()).toHaveTextContent('Abacaxi');
    });
  });

  describe('teclado com a lista aberta', () => {
    it('setas pulam opções desabilitadas e param nas pontas', async () => {
      const { user } = await setup();
      combobox().focus();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      expect(activeOption()).toHaveTextContent('Banana');
      await user.keyboard('{ArrowDown}');
      expect(activeOption()).toHaveTextContent('Damasco');
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
      expect(activeOption()).toHaveTextContent('Amora');
      await user.keyboard('{ArrowUp}{ArrowUp}');
      expect(activeOption()).toHaveTextContent('Banana');
      await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
      expect(activeOption()).toHaveTextContent('Abacaxi');
    });

    it('Home, End, PageUp e PageDown', async () => {
      const { user } = await setup();
      combobox().focus();
      await user.keyboard('{ArrowDown}{End}');
      expect(activeOption()).toHaveTextContent('Amora');
      await user.keyboard('{Home}');
      expect(activeOption()).toHaveTextContent('Abacaxi');
      await user.keyboard('{PageDown}');
      expect(activeOption()).toHaveTextContent('Amora');
      await user.keyboard('{PageUp}');
      expect(activeOption()).toHaveTextContent('Abacaxi');
    });

    it('Enter seleciona a opção ativa e fecha', async () => {
      const { user, onValueChange } = await setup();
      combobox().focus();
      await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
      expect(onValueChange).toHaveBeenCalledWith('banana');
      expect(combobox()).toHaveAttribute('aria-expanded', 'false');
    });

    it('Espaço seleciona a opção ativa', async () => {
      const { user, onValueChange } = await setup();
      combobox().focus();
      await user.keyboard('{ArrowDown}');
      await user.keyboard(' ');
      expect(onValueChange).toHaveBeenCalledWith('abacaxi');
    });

    it('Alt+ArrowUp seleciona e fecha', async () => {
      const { user, onValueChange } = await setup();
      combobox().focus();
      await user.keyboard('{ArrowDown}{ArrowDown}{Alt>}{ArrowUp}{/Alt}');
      expect(onValueChange).toHaveBeenCalledWith('banana');
      expect(combobox()).toHaveAttribute('aria-expanded', 'false');
    });

    it('Escape fecha sem selecionar', async () => {
      const { user, onValueChange } = await setup();
      combobox().focus();
      await user.keyboard('{ArrowDown}{ArrowDown}{Escape}');
      expect(onValueChange).not.toHaveBeenCalled();
      expect(combobox()).toHaveAttribute('aria-expanded', 'false');
      expect(combobox()).toHaveFocus();
    });

    it('Tab seleciona a opção ativa e segue o foco', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <>
          <Select label="Fruta" options={frutas} onValueChange={onValueChange} />
          <button>depois</button>
        </>,
      );
      combobox().focus();
      await user.keyboard('{ArrowDown}{ArrowDown}');
      await user.tab();
      expect(onValueChange).toHaveBeenCalledWith('banana');
      expect(screen.getByRole('button', { name: 'depois' })).toHaveFocus();
    });

    it('typeahead busca por prefixo e repetir a letra percorre as opções', async () => {
      const { user } = await setup();
      combobox().focus();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('a');
      expect(activeOption()).toHaveTextContent('Amora');
      await user.keyboard('a');
      expect(activeOption()).toHaveTextContent('Abacaxi');
    });

    it('typeahead com várias letras e reinício após a pausa', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<Select label="Fruta" options={frutas} />);
      combobox().focus();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('am');
      expect(activeOption()).toHaveTextContent('Amora');
      act(() => {
        vi.advanceTimersByTime(600);
      });
      await user.keyboard('b');
      expect(activeOption()).toHaveTextContent('Banana');
      vi.useRealTimers();
    });

    it('Espaço no meio do typeahead faz parte da busca em vez de selecionar', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Select
          label="Maçã"
          onValueChange={onValueChange}
          options={[
            { value: 'verde', label: 'Maçã verde' },
            { value: 'fuji', label: 'Maçã fuji' },
          ]}
        />,
      );
      combobox().focus();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('maçã f');
      expect(onValueChange).not.toHaveBeenCalled();
      expect(activeOption()).toHaveTextContent('Maçã fuji');
    });

    it('rola a opção ativa para dentro da área visível', async () => {
      const scrollIntoView = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoView;
      const { user } = await setup();
      combobox().focus();
      await user.keyboard('{ArrowDown}{ArrowDown}');
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
      // @ts-expect-error removendo o mock para os outros testes
      delete Element.prototype.scrollIntoView;
    });

    it('passar o mouse muda a opção ativa, mas não em desabilitadas', async () => {
      const { user } = await setup();
      await user.click(combobox());
      fireEvent.pointerMove(screen.getByRole('option', { name: 'Damasco' }));
      expect(activeOption()).toHaveTextContent('Damasco');
      fireEvent.pointerMove(screen.getByRole('option', { name: 'Cereja' }));
      expect(activeOption()).toHaveTextContent('Damasco');
    });
  });

  it('fecha ao clicar fora', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Select label="Fruta" options={frutas} />
        <p>fora</p>
      </>,
    );
    await user.click(combobox());
    await user.click(screen.getByText('fora'));
    expect(combobox()).toHaveAttribute('aria-expanded', 'false');
  });

  it('fecha quando o foco sai do componente', async () => {
    await setup();
    fireEvent.click(combobox());
    expect(combobox()).toHaveAttribute('aria-expanded', 'true');
    fireEvent.blur(combobox(), { relatedTarget: document.body });
    expect(combobox()).toHaveAttribute('aria-expanded', 'false');
  });

  it('controlado: mostra o valor do pai e avisa mudanças', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState<string | null>('banana');
      return (
        <>
          <Select label="Fruta" options={frutas} value={value} onValueChange={setValue} />
          <button onClick={() => setValue(null)}>limpar</button>
        </>
      );
    }
    render(<Controlled />);
    expect(combobox()).toHaveAccessibleName('Fruta Banana');
    await user.click(combobox());
    await user.click(screen.getByRole('option', { name: /Amora/ }));
    expect(combobox()).toHaveAccessibleName('Fruta Amora');
    await user.click(screen.getByRole('button', { name: 'limpar' }));
    expect(combobox()).toHaveAccessibleName('Fruta Selecione uma opção');
  });

  it('não chama onValueChange ao escolher a opção já selecionada', async () => {
    const { user, onValueChange } = await setup({ defaultValue: 'banana' });
    await user.click(combobox());
    await user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('desabilitado não abre', async () => {
    const { user } = await setup({ disabled: true });
    await user.click(combobox());
    expect(combobox()).toBeDisabled();
    expect(combobox()).toHaveAttribute('aria-expanded', 'false');
  });

  it('erro, hint e obrigatório', async () => {
    await setup({ hint: 'Escolha uma', error: 'Campo obrigatório', required: true });
    expect(combobox()).toHaveAttribute('aria-invalid', 'true');
    expect(combobox()).toHaveAttribute('aria-required', 'true');
    expect(combobox()).toHaveAccessibleDescription('Escolha uma Campo obrigatório');
  });

  it('placeholder personalizado e aria-label sem rótulo visível', async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Ordenar" placeholder="Ordenar por" options={frutas} />);
    expect(combobox()).toHaveAccessibleName('Ordenar');
    expect(combobox()).toHaveTextContent('Ordenar por');
    await user.click(combobox());
    expect(screen.getByRole('listbox')).toHaveAccessibleName('Ordenar');
  });

  it('envia o valor em formulário via input oculto', async () => {
    const user = userEvent.setup();
    render(
      <form data-testid="form">
        <Select label="Fruta" name="fruta" options={frutas} />
      </form>,
    );
    const form = screen.getByTestId('form') as HTMLFormElement;
    expect(new FormData(form).get('fruta')).toBe('');
    await user.click(combobox());
    await user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(new FormData(form).get('fruta')).toBe('banana');
  });

  it('mostra a descrição da opção', async () => {
    const { user } = await setup();
    await user.click(combobox());
    expect(screen.getByText('Fruta vermelha')).toBeInTheDocument();
  });

  it('respeita onKeyDown e onClick com preventDefault', async () => {
    const user = userEvent.setup();
    render(
      <Select
        label="Fruta"
        options={frutas}
        onKeyDown={(event) => event.preventDefault()}
        onClick={(event) => event.preventDefault()}
      />,
    );
    await user.click(combobox());
    expect(combobox()).toHaveAttribute('aria-expanded', 'false');
    combobox().focus();
    await user.keyboard('{ArrowDown}');
    expect(combobox()).toHaveAttribute('aria-expanded', 'false');
  });

  it('repassa ref, className, wrapperClassName e tamanho', () => {
    const ref = createRef<HTMLButtonElement>();
    const { container } = render(
      <Select ref={ref} label="x" options={frutas} className="g" wrapperClassName="w" size="sm" />,
    );
    expect(ref.current).toBe(combobox());
    expect(combobox()).toHaveClass('sk-select__trigger', 'g');
    expect(combobox()).toHaveAttribute('data-size', 'sm');
    expect(container.firstElementChild).toHaveClass('sk-select', 'w');
  });

  it('não tem violações de acessibilidade, fechado e aberto', async () => {
    const user = userEvent.setup();
    const { container } = render(<Select label="Fruta" options={frutas} hint="Uma só" />);
    expect(await axeViolations(container)).toEqual([]);
    await user.click(combobox());
    expect(await axeViolations(container)).toEqual([]);
  });
});
