import {
  Badge,
  Button,
  ProgressBar,
  Spinner,
  useTheme,
  type BadgeTone,
  type ThemeMode,
} from '@guibonin/sakura-ui';
import { CodeBlock } from '../docs-kit/CodeBlock';
import { useDocumentTitle } from '../docs-kit/useDocumentTitle';

const palette = [
  { name: 'Preto carvão', token: '--sk-charcoal', hex: '#151218' },
  { name: 'Rosa Sakura', token: '--sk-sakura', hex: '#D88CA5' },
  { name: 'Rosa suave', token: '--sk-sakura-soft', hex: '#E8B4C8' },
  { name: 'Violeta', token: '--sk-violet', hex: '#9265B5' },
  { name: 'Roxo escuro', token: '--sk-plum', hex: '#51345F' },
];

/** Cores por função. Os swatches leem os tokens, então mudam junto com o tema. */
const tones: { tone: BadgeTone; label: string; use: string }[] = [
  { tone: 'primary', label: 'primary', use: 'Ação principal e marca.' },
  { tone: 'accent', label: 'accent', use: 'Destaque secundário, seleção, switch ligado.' },
  { tone: 'info', label: 'info', use: 'Avisos neutros: novidade, dica, atualização.' },
  { tone: 'success', label: 'success', use: 'Concluído, pago, ativo.' },
  { tone: 'warning', label: 'warning', use: 'Atenção sem bloquear: pendente, vencendo.' },
  { tone: 'danger', label: 'danger', use: 'Erro e ação destrutiva.' },
  { tone: 'neutral', label: 'neutral', use: 'Status discreto: rascunho, arquivado.' },
];

const modes: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
];

function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div className="docs-preview">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {modes.map((mode) => (
          <Button
            key={mode.value}
            size="sm"
            variant={theme === mode.value ? 'solid' : 'outline'}
            aria-pressed={theme === mode.value}
            onClick={() => setTheme(mode.value)}
          >
            {mode.label}
          </Button>
        ))}
        <span className="docs-muted">
          Aplicado agora: <Badge tone="accent">{resolvedTheme}</Badge>
        </span>
      </div>
    </div>
  );
}

export function Theming() {
  useDocumentTitle('Temas');
  return (
    <article className="docs-article">
      <header className="docs-article__header">
        <h1>Temas</h1>
        <p className="docs-lead">
          Tema claro e escuro prontos, guardados entre visitas e fáceis de personalizar com
          variáveis CSS.
        </p>
      </header>

      <section aria-labelledby="modo">
        <h2 id="modo">Claro, escuro ou sistema</h2>
        <p>
          O padrão é <code>system</code>, que segue a preferência do sistema operacional e muda
          junto com ela. A escolha da pessoa fica salva no <code>localStorage</code>.
        </p>
        <ThemeSwitcher />
        <CodeBlock
          code={`import { useTheme } from '@guibonin/sakura-ui';

function BotaoTema() {
  const { resolvedTheme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>Tema atual: {resolvedTheme}</button>;
}`}
        />
        <p>
          Para começar sempre no escuro, ou controlar o tema por conta própria, use as props do
          provider:
        </p>
        <CodeBlock
          code={`<SakuraProvider defaultTheme="dark" storageKey="meu-app-tema">
  <App />
</SakuraProvider>`}
        />
      </section>

      <section aria-labelledby="paleta">
        <h2 id="paleta">Paleta</h2>
        <ul className="docs-swatches">
          {palette.map((color) => (
            <li key={color.token} className="docs-swatch">
              <span className="docs-swatch__color" style={{ background: color.hex }} />
              <strong>{color.name}</strong>
              <code>{color.hex}</code>
              <code>{color.token}</code>
            </li>
          ))}
        </ul>
        <p>
          No tema claro o rosa Sakura não é usado como cor de texto. Sobre branco ele tem contraste
          de 2,4:1, abaixo do mínimo de 4,5:1. O botão principal usa texto carvão sobre rosa
          (7,6:1), e os destaques de texto usam o roxo escuro.
        </p>
      </section>

      <section aria-labelledby="funcoes">
        <h2 id="funcoes">Cores por função</h2>
        <p>
          Além da paleta da marca, cada situação tem um tom próprio. Badge, ProgressBar e Spinner
          aceitam a prop <code>tone</code> com esses nomes, e o Toast usa info, success, warning e
          danger.
        </p>
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th scope="col">Tom</th>
                <th scope="col">Exemplo</th>
                <th scope="col">Quando usar</th>
                <th scope="col">Tokens</th>
              </tr>
            </thead>
            <tbody>
              {tones.map(({ tone, label, use }) => (
                <tr key={tone}>
                  <th scope="row">
                    <code>{label}</code>
                  </th>
                  <td>
                    <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
                      <Badge tone={tone}>soft</Badge>
                      <Badge tone={tone} appearance="solid">
                        solid
                      </Badge>
                    </span>
                  </td>
                  <td>{use}</td>
                  <td>
                    {/* Um token por linha: o nome não quebra no meio. */}
                    <span style={{ display: 'grid', gap: 4, justifyItems: 'start' }}>
                      {['', '-fg', '-soft', '-soft-fg'].map((suffix) => (
                        <code key={suffix} style={{ whiteSpace: 'nowrap' }}>
                          {`--sk-${tone}${suffix}`}
                        </code>
                      ))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Spinner e barra de progresso são elementos gráficos e precisam de contraste de 3:1 com o
          fundo. O rosa Sakura sobre branco fica em 2,6:1, então no tema claro eles usam os tokens{' '}
          <code>--sk-indicator</code> (violeta) e <code>--sk-indicator-start</code> /{' '}
          <code>--sk-indicator-end</code> (gradiente vinho para violeta). No escuro, voltam ao rosa.
          Pelo mesmo motivo, o amarelo de warning em barras e ícones usa{' '}
          <code>--sk-warning-strong</code>.
        </p>
        <div className="docs-preview">
          <div style={{ display: 'grid', gap: 16, width: '100%', maxWidth: 360 }}>
            <ProgressBar aria-label="Exemplo com o gradiente padrão" value={64} />
            <ProgressBar aria-label="Exemplo com o tom warning" value={40} tone="warning" />
            <span style={{ display: 'flex', gap: 16 }}>
              <Spinner label="Exemplo do spinner padrão" />
              <Spinner tone="info" label="Exemplo do spinner info" />
            </span>
          </div>
        </div>
      </section>

      <section aria-labelledby="personalizar">
        <h2 id="personalizar">Personalizando</h2>
        <p>
          Os componentes usam só tokens semânticos (<code>--sk-primary</code>,{' '}
          <code>--sk-surface</code>, <code>--sk-fg</code>…). Sobrescreva no seu CSS, depois do
          import da Sakura UI:
        </p>
        <CodeBlock
          language="css"
          title="tema.css"
          code={`:root {
  --sk-primary: #f0a35e;
  --sk-primary-hover: #e8913f;
  --sk-primary-fg: #151218;
  --sk-radius-md: 0.25rem;
}

[data-theme='dark'] {
  --sk-bg: #0f0d12;
}`}
        />
        <p>
          Para trocar um tom inteiro, sobrescreva o grupo todo: a cor, o texto sobre ela e as
          versões soft. Por exemplo, um <code>info</code> verde-água:
        </p>
        <CodeBlock
          language="css"
          title="tema.css"
          code={`:root {
  --sk-info: #1d6f72;
  --sk-info-fg: #ffffff;
  --sk-info-soft: #e0f2f2;
  --sk-info-soft-fg: #134d4f;
}

[data-theme='dark'] {
  --sk-info: #7fd3d0;
  --sk-info-fg: #151218;
  --sk-info-soft: #16302f;
  --sk-info-soft-fg: #b5ebe8;
}`}
        />
        <p>
          Ao trocar cores, confira o contraste: 4,5:1 para texto (<code>--sk-info-fg</code> sobre{' '}
          <code>--sk-info</code>, <code>--sk-info-soft-fg</code> sobre <code>--sk-info-soft</code>)
          e 3:1 para indicadores sobre o fundo. A própria biblioteca tem um teste que valida esses
          pares nos dois temas.
        </p>
      </section>
    </article>
  );
}
