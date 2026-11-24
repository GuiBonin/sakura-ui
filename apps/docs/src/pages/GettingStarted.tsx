import { Link } from 'react-router-dom';
import { CodeBlock } from '../docs-kit/CodeBlock';
import { useDocumentTitle } from '../docs-kit/useDocumentTitle';

export function GettingStarted() {
  useDocumentTitle('Começando');
  return (
    <article className="docs-article">
      <header className="docs-article__header">
        <h1>Começando</h1>
        <p className="docs-lead">Três passos para usar a Sakura UI num projeto React.</p>
      </header>

      <section aria-labelledby="instalar">
        <h2 id="instalar">1. Instale o pacote</h2>
        <p>Funciona com React 18 ou 19. Framer Motion e Lucide já vêm como dependências.</p>
        <CodeBlock language="bash" title="Terminal" code="npm install @guibonin/sakura-ui" />
      </section>

      <section aria-labelledby="estilos">
        <h2 id="estilos">2. Importe os estilos uma vez</h2>
        <p>
          No arquivo de entrada da aplicação (por exemplo, <code>main.tsx</code>). O CSS traz os
          tokens dos dois temas e o estilo de todos os componentes, com classes prefixadas por{' '}
          <code>sk-</code> para não conflitar com as suas.
        </p>
        <CodeBlock title="main.tsx" code={`import '@guibonin/sakura-ui/styles.css';`} />
      </section>

      <section aria-labelledby="provider">
        <h2 id="provider">3. Envolva a aplicação com o SakuraProvider</h2>
        <p>
          Ele cuida do tema claro e escuro, configura as animações para respeitar o movimento
          reduzido do sistema e habilita as notificações (<code>useToast</code>).
        </p>
        <CodeBlock
          title="App.tsx"
          code={`import { Button, SakuraProvider, useToast } from '@guibonin/sakura-ui';

function Salvar() {
  const { toast } = useToast();
  return <Button onClick={() => toast({ title: 'Salvo!', tone: 'success' })}>Salvar</Button>;
}

export function App() {
  return (
    <SakuraProvider>
      <Salvar />
    </SakuraProvider>
  );
}`}
        />
      </section>

      <section aria-labelledby="next">
        <h2 id="next">Próximos passos</h2>
        <ul className="docs-list">
          <li>
            <Link to="/temas">Personalize o tema</Link> trocando os tokens de cor.
          </li>
          <li>
            Veja como cada componente lida com teclado e leitores de tela em{' '}
            <Link to="/acessibilidade">Acessibilidade</Link>.
          </li>
          <li>
            Explore os <Link to="/componentes/button">componentes</Link> com playground e código
            pronto para copiar.
          </li>
        </ul>
      </section>
    </article>
  );
}
