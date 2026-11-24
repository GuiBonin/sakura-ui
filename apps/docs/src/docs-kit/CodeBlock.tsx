import { Highlight, type PrismTheme } from 'prism-react-renderer';
import { CopyButton } from './CopyButton';

/** Tema de realce com a paleta Sakura sobre fundo carvão (igual nos dois temas). */
export const sakuraCodeTheme: PrismTheme = {
  plain: { color: '#f5eef3', backgroundColor: '#151218' },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: '#a598aa', fontStyle: 'italic' },
    },
    { types: ['punctuation', 'operator'], style: { color: '#c9bdcc' } },
    { types: ['keyword', 'boolean', 'important', 'atrule'], style: { color: '#e8b4c8' } },
    { types: ['tag', 'selector'], style: { color: '#f2a3bd' } },
    { types: ['attr-name', 'property', 'function'], style: { color: '#c9a6e6' } },
    { types: ['string', 'attr-value', 'char', 'url'], style: { color: '#9ee2bd' } },
    { types: ['number', 'constant', 'symbol'], style: { color: '#f5d68a' } },
    { types: ['class-name', 'maybe-class-name', 'builtin'], style: { color: '#f5d68a' } },
  ],
};

export interface CodeBlockProps {
  code: string;
  language?: 'tsx' | 'jsx' | 'bash' | 'css' | 'json' | 'typescript';
  /** Nome exibido no topo, como o arquivo. */
  title?: string;
  /** Esconde o botão de copiar. */
  noCopy?: boolean;
}

/** Bloco de código com realce de sintaxe e botão de copiar. */
export function CodeBlock({ code, language = 'tsx', title, noCopy = false }: CodeBlockProps) {
  const trimmed = code.trim();
  return (
    <div className="docs-code">
      <div className="docs-code__bar">
        <span className="docs-code__title">{title ?? language}</span>
        {!noCopy && <CopyButton text={trimmed} />}
      </div>
      <Highlight code={trimmed} language={language} theme={sakuraCodeTheme}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          // A área rola na horizontal; tabIndex deixa rolar pelo teclado.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          <pre className={`docs-code__pre ${className}`} style={style} tabIndex={0}>
            <code>
              {tokens.map((line, lineIndex) => (
                <div key={lineIndex} {...getLineProps({ line })}>
                  {line.map((token, tokenIndex) => (
                    <span key={tokenIndex} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
