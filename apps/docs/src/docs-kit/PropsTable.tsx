export interface PropDoc {
  name: string;
  type: string;
  default?: string;
  description: string;
  required?: boolean;
}

/** Tabela de props. Em telas estreitas rola na horizontal. */
export function PropsTable({ props, caption }: { props: PropDoc[]; caption: string }) {
  return (
    // Região rolável: precisa de foco para quem usa teclado.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div className="docs-table-wrap" tabIndex={0} role="region" aria-label={caption}>
      <table className="docs-table">
        <caption className="sk-visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Tipo</th>
            <th scope="col">Padrão</th>
            <th scope="col">Descrição</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name}>
              <th scope="row">
                <code>{prop.name}</code>
                {prop.required && <span className="docs-required"> (obrigatória)</span>}
              </th>
              <td>
                <code>{prop.type}</code>
              </td>
              <td>{prop.default ? <code>{prop.default}</code> : '—'}</td>
              <td>{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
