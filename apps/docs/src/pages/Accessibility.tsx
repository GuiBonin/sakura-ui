import { useDocumentTitle } from '../docs-kit/useDocumentTitle';

const keyboard = [
  { component: 'Select', keys: '↑ ↓ Home End PageUp PageDown, letras, Enter, Espaço, Esc, Tab' },
  { component: 'Dropdown', keys: 'Enter, Espaço, ↑ ↓ Home End, letras, Esc, Tab' },
  { component: 'Tabs', keys: '← → (ou ↑ ↓ na vertical), Home, End' },
  { component: 'Accordion', keys: 'Enter, Espaço, ↑ ↓ Home End entre cabeçalhos' },
  { component: 'Modal', keys: 'Tab preso dentro do diálogo, Esc fecha' },
  { component: 'Tooltip', keys: 'Abre no foco, Esc fecha' },
  { component: 'Checkbox e Switch', keys: 'Espaço (Switch também aceita Enter)' },
];

export function Accessibility() {
  useDocumentTitle('Acessibilidade');
  return (
    <article className="docs-article">
      <header className="docs-article__header">
        <h1>Acessibilidade</h1>
        <p className="docs-lead">
          Os componentes seguem os padrões do WAI-ARIA Authoring Practices e as regras do WCAG 2.2
          nível AA.
        </p>
      </header>

      <section aria-labelledby="teclado">
        <h2 id="teclado">Teclado</h2>
        <p>Tudo que funciona com mouse funciona com teclado. Resumo das teclas:</p>
        <div className="docs-table-wrap">
          <table className="docs-table">
            <thead>
              <tr>
                <th scope="col">Componente</th>
                <th scope="col">Teclas</th>
              </tr>
            </thead>
            <tbody>
              {keyboard.map((row) => (
                <tr key={row.component}>
                  <th scope="row">{row.component}</th>
                  <td>{row.keys}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Em camadas, o Esc fecha uma de cada vez: com um Select aberto dentro de um Modal, o
          primeiro Esc fecha a lista e o segundo fecha o modal.
        </p>
      </section>

      <section aria-labelledby="movimento">
        <h2 id="movimento">Movimento reduzido</h2>
        <p>
          Quando o sistema pede menos movimento (<code>prefers-reduced-motion</code>), as transições
          ficam instantâneas, o Spinner pulsa em vez de girar, o Skeleton perde o brilho e as
          animações do Framer Motion deixam de usar deslocamento. As pétalas da página inicial ficam
          paradas.
        </p>
      </section>

      <section aria-labelledby="contraste">
        <h2 id="contraste">Contraste</h2>
        <p>
          Todo texto passa de 4,5:1 e bordas de campos e anel de foco passam de 3:1, nos dois temas.
          Isso é verificado por teste automatizado lendo o próprio arquivo de tokens.
        </p>
      </section>

      <section aria-labelledby="leitores">
        <h2 id="leitores">Leitores de tela</h2>
        <ul className="docs-list">
          <li>Campos ligam rótulo, ajuda e erro ao input por aria-describedby.</li>
          <li>Notificações usam regiões aria-live: erros são anunciados na hora.</li>
          <li>Ícones decorativos ficam ocultos; botões só com ícone exigem aria-label.</li>
          <li>Cada componente passa por checagem automática com axe-core nos testes.</li>
        </ul>
      </section>
    </article>
  );
}
