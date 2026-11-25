import { SakuraProvider } from '@guibonin/sakura-ui';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { StrictMode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { axeViolations } from '../../../packages/sakura-ui/test/axe';
import { AppRoutes } from './App';
import { categories, components, getComponent } from './content/components';
import { examplePaths, getExample } from './content/examples';
import { initialValues } from './docs-kit/Playground';
import { CONTENT_SECURITY_POLICY, contentSecurityPolicy } from '../csp';

function renderAt(path: string) {
  return render(
    <SakuraProvider defaultTheme="light">
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </SakuraProvider>,
  );
}

const libExports = Object.keys(await import('@guibonin/sakura-ui'));

describe('conteúdo da documentação', () => {
  it('documenta os 17 componentes pedidos, cada um uma vez', () => {
    expect(components.map((c) => c.name).sort()).toEqual(
      [
        'Accordion',
        'Avatar',
        'Badge',
        'Button',
        'Card',
        'Checkbox',
        'Dropdown',
        'Input',
        'Modal',
        'Progress Bar',
        'Select',
        'Skeleton',
        'Spinner',
        'Switch',
        'Tabs',
        'Toast',
        'Tooltip',
      ].sort(),
    );
    expect(new Set(components.map((c) => c.slug)).size).toBe(components.length);
  });

  it('toda categoria tem componentes e todo componente tem categoria válida', () => {
    for (const category of categories) {
      expect(components.some((c) => c.category === category)).toBe(true);
    }
    for (const component of components) expect(categories).toContain(component.category);
  });

  it('todo exemplo referenciado existe e todo arquivo de exemplo é usado', () => {
    const referenced = components.flatMap((c) => c.examples.map((e) => e.path));
    expect([...referenced].sort()).toEqual([...examplePaths].sort());
    for (const path of referenced) {
      const { source } = getExample(path);
      expect(source).toContain("from '@guibonin/sakura-ui'");
    }
  });

  it('os arquivos em src/examples batem com o glob', () => {
    const dir = resolve(import.meta.dirname, 'examples');
    const files = readdirSync(dir, { recursive: true, encoding: 'utf8' })
      .filter((file) => file.endsWith('.tsx'))
      .map((file) => file.replace(/\\/g, '/').replace(/\.tsx$/, ''));
    expect(files.sort()).toEqual([...examplePaths].sort());
  });

  it('getExample falha com caminho inexistente', () => {
    expect(() => getExample('nada/Aqui')).toThrow(/Exemplo não encontrado/);
  });

  it('os imports citados existem na biblioteca', () => {
    for (const component of components) {
      for (const name of component.imports) expect(libExports).toContain(name);
    }
  });

  it('todo componente tem props e notas de acessibilidade', () => {
    for (const component of components) {
      expect(component.props.length).toBeGreaterThan(0);
      expect(component.a11y.length).toBeGreaterThan(0);
      expect(component.examples.length).toBeGreaterThan(0);
    }
  });

  it('código gerado pelos playgrounds usa o componente certo', () => {
    for (const component of components.filter((c) => c.playground)) {
      const code = component.playground!.code(initialValues(component.playground!.controls));
      expect(code.length).toBeGreaterThan(0);
      if (component.slug !== 'toast') expect(code).toContain(`<${component.imports[0]}`);
    }
    expect(getComponent('nao-existe')).toBeUndefined();
  });
});

describe('rotas', () => {
  it('página inicial tem título, chamadas e instalação copiável', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Componentes React que florescem em qualquer interface',
    );
    expect(screen.getByRole('link', { name: /Começar agora/ })).toHaveAttribute(
      'href',
      '/comecando',
    );
    expect(screen.getByText('npm install @guibonin/sakura-ui')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copiar comando de instalação' }),
    ).toBeInTheDocument();
    expect(document.title).toBe('Sakura UI');
  });

  it.each([
    ['/comecando', 'Começando'],
    ['/temas', 'Temas'],
    ['/acessibilidade', 'Acessibilidade'],
  ])('%s renderiza o guia', (path, title) => {
    renderAt(path);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(title);
    expect(document.title).toBe(`${title} · Sakura UI`);
  });

  it.each(components.map((c) => [c.slug, c.name]))(
    '/componentes/%s renderiza a página completa',
    (slug, name) => {
      renderAt(`/componentes/${slug}`);
      const main = screen.getByRole('main');
      expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent(name);
      expect(within(main).getByRole('heading', { name: 'Exemplos' })).toBeInTheDocument();
      expect(within(main).getByRole('heading', { name: 'Props' })).toBeInTheDocument();
      expect(within(main).getByRole('heading', { name: 'Acessibilidade' })).toBeInTheDocument();
      expect(within(main).getAllByRole('button', { name: 'Copiar código' }).length).toBeGreaterThan(
        1,
      );
      expect(document.title).toBe(`${name} · Sakura UI`);
    },
  );

  it.each(['/componentes/nao-existe', '/qualquer/coisa'])('%s mostra a página 404', (path) => {
    renderAt(path);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Página não encontrada');
    expect(screen.getByRole('link', { name: 'Voltar para o início' })).toBeInTheDocument();
  });
});

describe('navegação e layout', () => {
  it('o menu lateral leva às páginas e marca a página atual', async () => {
    const user = userEvent.setup();
    renderAt('/comecando');
    const sidebar = screen.getByRole('navigation', { name: 'Documentação' });
    await user.click(within(sidebar).getByRole('link', { name: 'Tooltip' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tooltip');
    expect(within(sidebar).getByRole('link', { name: 'Tooltip' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await waitFor(() => expect(screen.getByRole('main')).toHaveFocus());
  });

  it('botão de menu móvel abre e fecha o menu e fecha ao navegar', async () => {
    const user = userEvent.setup();
    renderAt('/temas');
    const toggle = screen.getByRole('button', { name: 'Abrir menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(document.getElementById('docs-sidebar')).toHaveAttribute('data-open', 'true');
    await user.click(screen.getByRole('link', { name: 'Badge' }));
    expect(document.getElementById('docs-sidebar')).not.toHaveAttribute('data-open');
  });

  it('a página inicial também tem o menu móvel com todas as páginas', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
    const sidebar = document.getElementById('docs-sidebar')!;
    expect(sidebar).toHaveAttribute('data-open', 'true');
    expect(sidebar).toHaveClass('docs-sidebar--mobile-only');
    await user.click(within(sidebar).getByRole('link', { name: 'Começando' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Começando');
  });

  it('em StrictMode, abrir uma página não rouba o foco para o conteúdo', async () => {
    render(
      <StrictMode>
        <SakuraProvider defaultTheme="light">
          <MemoryRouter initialEntries={['/temas']}>
            <AppRoutes />
          </MemoryRouter>
        </SakuraProvider>
      </StrictMode>,
    );
    await act(async () => {});
    expect(screen.getByRole('main')).not.toHaveFocus();
  });

  it('link de pular conteúdo leva o foco ao main sem mudar a rota', async () => {
    const user = userEvent.setup();
    renderAt('/comecando');
    await user.click(screen.getByRole('link', { name: 'Pular para o conteúdo' }));
    expect(screen.getByRole('main')).toHaveFocus();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Começando');
  });

  it('botão de tema alterna claro e escuro', async () => {
    const user = userEvent.setup();
    renderAt('/');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    await user.click(screen.getByRole('button', { name: 'Usar tema escuro' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    await user.click(screen.getByRole('button', { name: 'Usar tema claro' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('a página de temas troca o modo pelos botões', async () => {
    const user = userEvent.setup();
    renderAt('/temas');
    await user.click(screen.getByRole('button', { name: 'Escuro' }));
    expect(screen.getByRole('button', { name: 'Escuro' })).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('a página de temas lista os sete tons com os tokens de cada um', () => {
    renderAt('/temas');
    const table = screen.getByRole('table');
    const tones = ['primary', 'accent', 'info', 'success', 'warning', 'danger', 'neutral'];
    for (const tone of tones) {
      expect(within(table).getByRole('rowheader', { name: tone })).toBeInTheDocument();
      expect(table).toHaveTextContent(`--sk-${tone}-soft-fg`);
    }
    expect(within(table).getAllByRole('row')).toHaveLength(tones.length + 1);
  });

  it('a página de temas explica os tokens de indicador e mostra o exemplo de tema', () => {
    renderAt('/temas');
    const article = screen.getByRole('article');
    expect(article).toHaveTextContent('--sk-indicator');
    expect(article).toHaveTextContent('--sk-warning-strong');
    expect(article).toHaveTextContent('--sk-info: #1d6f72;');
    expect(screen.getAllByRole('progressbar')).toHaveLength(2);
  });

  it('o link do GitHub abre em nova aba com aviso', () => {
    renderAt('/');
    const link = screen.getAllByRole('link', { name: /GitHub/ })[0]!;
    expect(link).toHaveAttribute('href', 'https://github.com/GuiBonin/sakura-ui');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
    expect(link).toHaveAccessibleName(/abre em nova aba/);
  });
});

describe('demonstração da página inicial', () => {
  it('formulário valida e-mail e mostra notificação ao enviar', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const email = screen.getByRole('textbox', { name: 'E-mail' });
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(email).toHaveAccessibleDescription('Digite um e-mail válido.');
    await user.type(email, 'ana@exemplo.com');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(await screen.findByText('Conta criada!')).toBeInTheDocument();
    expect(email).toHaveValue('');
  });

  it('exemplo de modal dispara toast ao confirmar', async () => {
    const user = userEvent.setup();
    renderAt('/componentes/modal');
    await user.click(screen.getByRole('button', { name: 'Excluir projeto' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Excluir projeto?' });
    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }));
    expect(await screen.findByText('Projeto excluído')).toBeInTheDocument();
  });
});

describe('acessibilidade do site', () => {
  it.each(['/', '/comecando', '/temas', '/acessibilidade', '/componentes/select'])(
    '%s não tem violações do axe',
    async (path) => {
      renderAt(path);
      await act(async () => {});
      expect(await axeViolations(document.body)).toEqual([]);
    },
  );
});

describe('política de segurança de conteúdo', () => {
  it('bloqueia scripts de fora e inline, plugins e mudança de base', () => {
    expect(CONTENT_SECURITY_POLICY).toContain("script-src 'self'");
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/script-src[^;]*unsafe/);
    expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("base-uri 'self'");
    expect(CONTENT_SECURITY_POLICY).toContain("default-src 'self'");
  });

  it('o plugin só roda no build e injeta CSP e referrer no head', () => {
    const plugin = contentSecurityPolicy();
    expect(plugin.apply).toBe('build');
    const hook = plugin.transformIndexHtml as unknown as {
      handler: () => Array<{ attrs: Record<string, string> }>;
    };
    const tags = hook.handler();
    expect(tags[0]!.attrs).toEqual({
      'http-equiv': 'Content-Security-Policy',
      content: CONTENT_SECURITY_POLICY,
    });
    expect(tags[1]!.attrs).toEqual({
      name: 'referrer',
      content: 'strict-origin-when-cross-origin',
    });
  });
});
