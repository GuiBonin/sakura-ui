import { Badge, Button, useTheme, type ThemeMode } from '@guibonin/sakura-ui';
import { CodeBlock } from '../docs-kit/CodeBlock';
import { useDocumentTitle } from '../docs-kit/useDocumentTitle';

const palette = [
  { name: 'Preto carvão', token: '--sk-charcoal', hex: '#151218' },
  { name: 'Rosa Sakura', token: '--sk-sakura', hex: '#D88CA5' },
  { name: 'Rosa suave', token: '--sk-sakura-soft', hex: '#E8B4C8' },
  { name: 'Violeta', token: '--sk-violet', hex: '#9265B5' },
  { name: 'Roxo escuro', token: '--sk-plum', hex: '#51345F' },
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
          Ao trocar cores, confira o contraste entre texto e fundo. A própria biblioteca tem um
          teste que valida todos os pares dos dois temas.
        </p>
      </section>
    </article>
  );
}
