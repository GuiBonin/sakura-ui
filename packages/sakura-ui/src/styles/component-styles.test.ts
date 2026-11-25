import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/*
 * O jsdom não aplica as folhas de estilo dos componentes, então as regras
 * visuais que corrigem contraste, estados e áreas de clique são conferidas
 * lendo o CSS. A aparência real é conferida nas capturas do site.
 */
// A quebra de linha inicial deixa a primeira regra do arquivo igual às outras.
const css = (component: string) =>
  `\n${readFileSync(resolve(import.meta.dirname, `../components/${component}/${component}.css`), 'utf8')}`;

/** Corpos de todas as regras com exatamente esse seletor, na ordem do arquivo. */
function rules(source: string, selector: string): string[] {
  const bodies: string[] = [];
  let from = 0;
  while (true) {
    const start = source.indexOf(`\n${selector} {`, from);
    if (start === -1) return bodies;
    const open = source.indexOf('{', start);
    const close = source.indexOf('}', open);
    bodies.push(source.slice(open + 1, close));
    from = close;
  }
}

/** Corpo da primeira regra com o seletor exato. */
function rule(source: string, selector: string): string {
  const [body] = rules(source, selector);
  if (body === undefined) throw new Error(`Regra "${selector}" não encontrada`);
  return body;
}

describe('Spinner', () => {
  const spinner = css('Spinner');

  it('usa o token de indicador, não o rosa direto', () => {
    expect(rule(spinner, '.sk-spinner')).toContain('color: var(--sk-indicator)');
  });

  it.each([
    ['accent', '--sk-accent'],
    ['info', '--sk-info'],
    ['success', '--sk-success'],
    ['warning', '--sk-warning-strong'],
    ['danger', '--sk-danger'],
    ['neutral', '--sk-neutral'],
  ])('o tom %s usa %s', (tone, token) => {
    expect(rule(spinner, `.sk-spinner[data-tone='${tone}']`)).toContain(`var(${token})`);
  });

  it('o tom current herda a cor do texto', () => {
    expect(rule(spinner, ".sk-spinner[data-tone='current']")).toContain('color: currentColor');
  });
});

describe('ProgressBar', () => {
  const progress = css('ProgressBar');

  it('o gradiente padrão usa os tokens de indicador', () => {
    expect(rule(progress, '.sk-progress')).toContain(
      'linear-gradient(90deg, var(--sk-indicator-start), var(--sk-indicator-end))',
    );
  });

  it.each([
    ['info', '--sk-info'],
    ['warning', '--sk-warning-strong'],
    ['neutral', '--sk-neutral'],
  ])('o tom %s usa %s', (tone, token) => {
    expect(rule(progress, `.sk-progress[data-tone='${tone}']`)).toContain(`var(${token})`);
  });
});

describe('Button', () => {
  const button = css('Button');

  it('danger tem cor própria ao ser pressionado', () => {
    expect(rule(button, ".sk-button[data-variant='danger']")).toContain(
      '--sk-button-bg-active: var(--sk-danger-active)',
    );
  });

  it('desabilitado não baixa a opacidade do botão inteiro', () => {
    const bodies = rules(button, '.sk-button:disabled');
    expect(bodies.length).toBeGreaterThan(0);
    for (const body of bodies) expect(body).not.toContain('opacity');
  });

  it('desabilitado usa superfície e texto atenuado, depois das variantes', () => {
    const disabled = button.lastIndexOf('\n.sk-button:disabled {');
    const lastVariant = button.lastIndexOf("\n.sk-button[data-variant='danger'] {");
    expect(disabled).toBeGreaterThan(lastVariant);
    const body = rules(button, '.sk-button:disabled').at(-1)!;
    expect(body).toContain('--sk-button-bg: var(--sk-surface-2)');
    expect(body).toContain('--sk-button-fg: var(--sk-fg-muted)');
  });

  it('ghost desabilitado continua sem fundo', () => {
    expect(rule(button, ".sk-button[data-variant='ghost']:disabled")).toContain(
      '--sk-button-bg: transparent',
    );
  });
});

describe('Switch', () => {
  const switchCss = css('Switch');

  it('desabilitado atenua só a trilha, não o rótulo', () => {
    expect(rules(switchCss, '.sk-switch[data-disabled]')).toEqual([]);
    expect(rule(switchCss, '.sk-switch[data-disabled] .sk-switch__track')).toContain('opacity');
    expect(rule(switchCss, '.sk-switch[data-disabled] .sk-switch__label')).toContain(
      'color: var(--sk-fg-muted)',
    );
  });

  it('desligado tem hover na borda', () => {
    expect(rule(switchCss, ".sk-switch__track[data-state='off']:hover:not(:disabled)")).toContain(
      'border-color: var(--sk-accent)',
    );
  });
});

describe('botões de fechar', () => {
  it.each([
    ['Modal', '.sk-modal__close'],
    ['Toast', '.sk-toast__close'],
  ])('%s tem área de clique de 40px', (component, selector) => {
    const body = rule(css(component), selector);
    expect(body).toContain('width: 2.5rem');
    expect(body).toContain('height: 2.5rem');
  });
});

describe('Toast', () => {
  const toast = css('Toast');

  it('o tom info usa a cor info, não o violeta de destaque', () => {
    expect(rule(toast, '.sk-toast')).toContain('--sk-toast-accent: var(--sk-info)');
  });

  it('o tom warning usa o amarelo escuro na borda', () => {
    expect(rule(toast, ".sk-toast[data-tone='warning']")).toContain('var(--sk-warning-strong)');
  });
});

describe('Badge', () => {
  const badge = css('Badge');

  it('o tom neutral usa os tokens neutral', () => {
    const body = rule(badge, '.sk-badge');
    expect(body).toContain('--sk-badge-solid: var(--sk-neutral)');
    expect(body).toContain('--sk-badge-soft: var(--sk-neutral-soft)');
  });

  it('tem o tom info', () => {
    expect(rule(badge, ".sk-badge[data-tone='info']")).toContain('var(--sk-info-soft)');
  });
});

describe('Card e Field', () => {
  it('cartão interativo mostra anel de foco', () => {
    expect(rule(css('Card'), '.sk-card[data-interactive]:focus-visible')).toContain(
      'outline: 2px solid var(--sk-ring)',
    );
  });

  it('campo pequeno usa o mesmo raio do botão pequeno', () => {
    expect(rule(css('Field'), ".sk-control[data-size='sm']")).toContain(
      'border-radius: var(--sk-radius-sm)',
    );
    expect(rule(css('Button'), ".sk-button[data-size='sm']")).toContain(
      'border-radius: var(--sk-radius-sm)',
    );
  });
});
