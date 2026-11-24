import { Badge } from '@guibonin/sakura-ui';
import { useParams } from 'react-router-dom';
import { getComponent } from '../content/components';
import { getExample } from '../content/examples';
import type { ExampleDoc } from '../content/types';
import { CodeBlock } from '../docs-kit/CodeBlock';
import { Playground } from '../docs-kit/Playground';
import { PropsTable } from '../docs-kit/PropsTable';
import { useDocumentTitle } from '../docs-kit/useDocumentTitle';
import { NotFound } from './NotFound';

function Example({ example }: { example: ExampleDoc }) {
  const { Component, source } = getExample(example.path);
  return (
    <section className="docs-example">
      <h3>{example.title}</h3>
      {example.description && <p className="docs-muted">{example.description}</p>}
      <div className="docs-preview">
        <Component />
      </div>
      <CodeBlock code={source} title={`${example.path.split('/')[1]}.tsx`} />
    </section>
  );
}

export function ComponentPage() {
  const { slug = '' } = useParams();
  const doc = getComponent(slug);
  useDocumentTitle(doc?.name ?? 'Página não encontrada');
  if (!doc) return <NotFound />;

  return (
    <article className="docs-article">
      <header className="docs-article__header">
        <Badge tone="accent">{doc.category}</Badge>
        <h1>{doc.name}</h1>
        <p className="docs-lead">{doc.summary}</p>
      </header>

      <CodeBlock
        code={`import { ${doc.imports.join(', ')} } from '@guibonin/sakura-ui';`}
        title="Importação"
      />

      {doc.playground && <Playground key={doc.slug} {...doc.playground} />}

      <section aria-labelledby="exemplos">
        <h2 id="exemplos">Exemplos</h2>
        {doc.examples.map((example) => (
          <Example key={example.path} example={example} />
        ))}
      </section>

      <section aria-labelledby="props">
        <h2 id="props">Props</h2>
        <PropsTable props={doc.props} caption={`Props do ${doc.name}`} />
        {doc.extraProps?.map((table) => (
          <div key={table.title}>
            <h3>{table.title}</h3>
            <PropsTable props={table.props} caption={`Props de ${table.title}`} />
          </div>
        ))}
      </section>

      <section aria-labelledby="acessibilidade">
        <h2 id="acessibilidade">Acessibilidade</h2>
        <ul className="docs-list">
          {doc.a11y.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
